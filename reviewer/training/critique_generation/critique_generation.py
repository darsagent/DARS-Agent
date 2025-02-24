import re
import os
import json
import logging
import asyncio
import pandas as pd
import nest_asyncio
from tqdm import tqdm
from asyncio import Semaphore
from litellm import completion
from concurrent.futures import ThreadPoolExecutor

logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('LiteLLM').setLevel(logging.WARNING)

nest_asyncio.apply()

def evaluate(x):
    try:
        return eval(x)
    except:
        return x

def get_tests(test_status, tests):
    if not test_status or not tests:
        return "All tests are PASSED"

    filtered_test_status = {i:j for i,j in test_status.items() if i in tests}
    filtered_test_status_list = [(i, j) for i, j in filtered_test_status.items()]
    
    if len(filtered_test_status_list) > 20:
        failing_tests = [(i, j) for i, j in filtered_test_status_list if j != "PASSED"]
        passing_tests = [(i, j) for i, j in filtered_test_status_list if j == "PASSED"]
        
        if len(failing_tests) >= 20:
            filtered_test_status_list = failing_tests[:20]
        else:
            filtered_test_status_list = failing_tests
            remaining_slots = 20 - len(failing_tests)
            if remaining_slots > 0:
                filtered_test_status_list.extend(passing_tests[:remaining_slots])
    
    filtered_test_status_str = "\n".join([f"{i}: {j}" for i, j in filtered_test_status_list])
    return filtered_test_status_str

def get_analysis_message(bug_fixing, new_issues):
    if bug_fixing == 0:
        bug_fixing_analysis = "The changes made in this patch are incorrect and fail to address the reported issue."
    elif bug_fixing == 1:
        bug_fixing_analysis = "The changes are partially correct. While they address the issue to some extent, they overlook critical corner cases."
    elif bug_fixing == 2:
        bug_fixing_analysis = "The changes made in this patch are correct and comprehensively resolve the reported issue."

    if new_issues == 0:
        regression_bug_analysis = "This patch introduces multiple regression bugs, potentially impacting other functionalities."
    elif new_issues == 1:
        regression_bug_analysis = "This patch introduces a few regression bugs, which require additional attention."
    elif new_issues == 2:
        regression_bug_analysis = "This patch does not introduce any regression bugs."

    message = f"""
<patch_analysis>
  <bug_fixing_analysis>
    {bug_fixing_analysis}
    <score>{bug_fixing}</score>
  </bug_fixing_analysis>
  <regression_risk_analysis>
    {regression_bug_analysis}
    <score>{new_issues}</score>
  </regression_risk_analysis>
</patch_analysis>
    """
    return message.strip()

def get_prompt(row, is_ground_truth=False):
    if is_ground_truth:
        status = 'Resolved'
        patch = row['patch']
        template = prompt_template_gt
    else:
        status = 'Resolved' if row['target'] == 1 else 'Unresolved'
        patch = row['generated_patch']
        template = prompt_template_generated
        
    return template.format(
        patch=patch,
        issue=row['problem_statement'],
        status=status,
        bug_fixing_tests=row['f2p_status'],
        regression_risk_tests=row['p2p_status']
    )

async def process_single_issue(index, issue, sem, prompt, completion, thread_pool):
    async with sem:
        messages = [
            {
                "role": "user",
                "content": prompt
            }
        ]
        model_params = {
            "model": "azure/gpt-4o",
            "messages": messages,
            "temperature": 0.0,
            "top_p": 0.95,
        }
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                thread_pool,
                lambda: completion(**model_params)
            )
            content = response.choices[0].message.content
            return index, content
        except Exception as e:
            print(f"Error processing issue {issue}: {str(e)}")
            return index, None

async def process_region_chunk(df_chunk, region_base, region_key, is_ground_truth=False):
    os.environ['AZURE_API_BASE'] = region_base
    os.environ['AZURE_API_KEY'] = region_key
    
    df_chunk = df_chunk.copy()
    sem = Semaphore(16)
    thread_pool = ThreadPoolExecutor(max_workers=8)
    tasks = []
    
    result_column = 'critique_result_gt' if is_ground_truth else 'critique_result'
    if result_column not in df_chunk.columns:
        df_chunk[result_column] = None
    
    for idx, row in df_chunk.iterrows():
        prompt = get_prompt(row, is_ground_truth)
        task = process_single_issue(idx, row['instance_id'], sem, prompt, completion, thread_pool)
        tasks.append(task)
    
    try:
        for future in tqdm(asyncio.as_completed(tasks), total=len(tasks), desc=f"Processing {region_base}"):
            idx, result = await future
            if result is not None:
                df_chunk.at[idx, result_column] = result
    finally:
        thread_pool.shutdown(wait=True)
    
    return df_chunk

prompt_template_generated = '''You are an expert software engineer tasked with evaluating a proposed patch for a GitHub issue. Your goal is to provide a concise, insightful critique of the patch and assess its effectiveness. Please follow these steps:

1. Examine the proposed patch:

<patch>
{patch}
</patch>

2. Review the GitHub issue:

<github_issue>
{issue}
</github_issue>

3. Consider the status of the patch:

<patch_status>
{status}
</patch_status>

4. Evaluate the patch based on two criteria:

   a. Bug Fixing Score (0-2):
      0: Incorrect changes that won't fix the issue
      1: Partially correct changes (might fix the issue but misses corner cases)
      2: Correct changes that will fully fix the issue

   b. Regression Risk (Score 0-2):
      0: High risk of introducing multiple regression bugs
      1: Moderate risk of introducing a few regression bugs
      2: Low risk of introducing any regression bugs

5. Review the test results:

   Bug fixing tests:
   <bug_fixing_tests>
   {bug_fixing_tests}
   </bug_fixing_tests>

   Regression risk tests:
   <regression_risk_tests>
   {regression_risk_tests}
   </regression_risk_tests>

6. Analyze the patch:
   Wrap your evaluation in <evaluation> tags. Consider:
   - Extract and quote relevant parts of the patch and GitHub issue.
   - What the solution is doing
   - Why it will or won't solve the issue
   - List potential risks and benefits of implementing this patch
   After your analysis, condense your findings into key points for the critique. Keep your analysis short as well.

7. Provide a concise critique of the patch:
   In <critique> tags, write a short, crisp summary of your evaluation. Focus on the most important aspects of the patch's effectiveness and potential impact. Keep your critique under 100 words.
   If status is solved, critique should be positive. If status is not solved, critique should be negative.

Example output structure:

<evaluation>
[Your analysis of the patch, considering all aspects mentioned above]
</evaluation>

<critique>
[A concise, under-100-word critique summarizing the key points of your evaluation]
</critique>

Remember: Do not mention specific test names in your critique. Keep your language clear, concise, and focused on the most critical aspects of the patch evaluation.
Before writing the critique enact like you don't know the actual status and you don't know which tests are failing or passing. This information is given to you to help you write better critiques.
'''

prompt_template_gt = '''You are an expert software engineer tasked with evaluating a proposed patch for a GitHub issue. Your goal is to provide a concise, insightful critique of the patch and assess its effectiveness. Please follow these steps:

1. Examine the proposed patch:

<patch>
{patch}
</patch>

2. Review the GitHub issue:

<github_issue>
{issue}
</github_issue>

3. Consider the status of the patch:

<patch_status>
{status}
</patch_status>

4. Evaluate the patch based on two criteria:

   a. Bug Fixing Score (0-2):
      0: Incorrect changes that won't fix the issue
      1: Partially correct changes (might fix the issue but misses corner cases)
      2: Correct changes that will fully fix the issue

   b. Regression Risk (Score 0-2):
      0: High risk of introducing multiple regression bugs
      1: Moderate risk of introducing a few regression bugs
      2: Low risk of introducing any regression bugs

5. Review the test results:

   Bug fixing tests:
   <bug_fixing_tests>
   {bug_fixing_tests}
   </bug_fixing_tests>

   Regression risk tests:
   <regression_risk_tests>
   {regression_risk_tests}
   </regression_risk_tests>

6. Analyze the patch:
   Wrap your evaluation in <evaluation> tags. Consider:
   - Extract and quote relevant parts of the patch and GitHub issue.
   - What the solution is doing
   - Why it will or won't solve the issue
   - List potential risks and benefits of implementing this patch
   After your analysis, condense your findings into key points for the critique. Keep your analysis short as well.

7. Provide a concise critique of the patch:
   In <critique> tags, write a short, crisp summary of your evaluation. Focus on the most important aspects of the patch's effectiveness and potential impact. Keep your critique under 100 words.
   If status is solved, critique should be positive. If status is not solved, critique should be negative.

Example output structure:

<evaluation>
[Your analysis of the patch, considering all aspects mentioned above]
</evaluation>

<critique>
[A concise, under-100-word critique summarizing the key points of your evaluation]
</critique>

Remember: Do not mention specific test names in your critique. Keep your language clear, concise, and focused on the most critical aspects of the patch evaluation.
Before writing the critique enact like you don't know the actual status and you don't know which tests are failing or passing. This information is given to you to help you write better critiques.
Try not to mention explicitly about tests and focus more on solution.
'''