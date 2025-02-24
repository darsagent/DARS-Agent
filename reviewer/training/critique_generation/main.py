import os
import asyncio
import pandas as pd
from critique_generation import process_region_chunk, evaluate, get_analysis_message, get_tests, get_prompt

# Azure region configurations
REGIONS = [
    {
        'base': '',
        'key': ''
    },
]

async def process_dataset(input_file, output_file, is_ground_truth=False):
    # Read and preprocess the data
    df = pd.read_csv(input_file)

    # Apply preprocessing
    df['patch_analysis'] = df.apply(lambda x: get_analysis_message(x['bug_fixing'], x['new_issues']), axis=1)
    df['test_status'] = df['test_status'].apply(evaluate)
    df['PASS_TO_PASS'] = df['PASS_TO_PASS'].apply(evaluate)
    df['FAIL_TO_PASS'] = df['FAIL_TO_PASS'].apply(evaluate)
    df['p2p_status'] = df.apply(lambda x: get_tests(x['test_status'], x['PASS_TO_PASS']), axis=1)
    df['f2p_status'] = df.apply(lambda x: get_tests(x['test_status'], x['FAIL_TO_PASS']), axis=1)
    df['prompt'] = df.apply(lambda x: get_prompt(x, is_ground_truth), axis=1)

    # Split the DataFrame into chunks for each region
    chunk_size = len(df) // len(REGIONS)
    df_chunks = [df[i:i + chunk_size] for i in range(0, len(df), chunk_size)]

    # If there are any remaining rows, add them to the last chunk
    if len(df_chunks) > len(REGIONS):
        df_chunks[-2] = pd.concat([df_chunks[-2], df_chunks[-1]])
        df_chunks.pop()

    # Process chunks in parallel
    tasks = []
    for chunk, region in zip(df_chunks, REGIONS):
        task = process_region_chunk(chunk, region['base'], region['key'], is_ground_truth)
        tasks.append(task)

    # Wait for all chunks to complete
    results = await asyncio.gather(*tasks)

    # Combine results
    final_df = pd.concat(results, axis=0)
    final_df = final_df.sort_index()  # Restore original order

    # Save results
    final_df.to_csv(output_file, index=False)
    print(f"Processing completed for {'ground truth' if is_ground_truth else 'generated'} patches!")
    return final_df

async def main():
    # Process generated patches
    await process_dataset(
        input_file='reward_data/final_reward_model_train_before_aug_2.csv',
        output_file='reward_data/after_critique_generation_2.csv',
        is_ground_truth=False
    )

    # Process ground truth patches
    await process_dataset(
        input_file='reward_data/after_critique_generation_1.csv',
        output_file='reward_data/after_critique_generation_1_gt.csv',
        is_ground_truth=True
    )
    print("All processing completed!")

if __name__ == "__main__":
    asyncio.run(main())