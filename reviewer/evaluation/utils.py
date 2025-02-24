import re

def get_all_paths(node):
    def dfs(current_node, path, paths):
        path.append(current_node)
        if 'children' not in current_node or not current_node['children']:
            paths.append(path[:])
        else:
            for child in current_node['children']:
                dfs(child, path, paths)
        path.pop()

    paths = []
    dfs(node, [], paths)
    return paths

def get_actions_from_path(path):
    actions = []
    for event in path:
        if 'action' in event and event['action'] != None:
            actions.append(event['action'])
    return actions

def get_action_types_from_path(path):
    actions = get_actions_from_path(path)
    action_types = [action.split(' ')[0] for action in actions]
    return action_types

def get_paths_with_submissions(node):
    paths = get_all_paths(node)
    action_types = [get_action_types_from_path(path) for path in paths]
    paths_with_submissions = []
    for action_type, path in zip(action_types, paths):
        if action_type[-1].startswith('submit'):
            paths_with_submissions.append(path)

    return paths_with_submissions

def get_patches_without_submissions(node):
    paths = get_all_paths(node)
    action_types = [get_action_types_from_path(path) for path in paths]
    paths_without_submissions = []
    for action_type, path in zip(action_types, paths):
        if not action_type[-1].startswith('submit'):
            paths_without_submissions.append(path)

    return paths_without_submissions

def get_all_pathches(node):
    submissions = get_paths_with_submissions(node)
    patches = [submission[-1]['content'] for submission in submissions]
    return patches

def is_accepted(patch):
    if "instances resolved: 0" in patch['output'].lower():
        cur_resolved = 0
    elif "instances resolved: 1" in patch['output'].lower():
        cur_resolved = 1
    else:
        cur_resolved = 2

    if "instances unresolved: 0" in patch['output'].lower():
        cur_unresolved = 0
    elif "instances unresolved: 1" in patch['output'].lower():
        cur_unresolved = 1
    else:
        cur_unresolved = 2

    if (cur_resolved == 0 and cur_unresolved == 0) or cur_resolved == 2 or cur_unresolved == 2:
        return False

    if cur_resolved == 0:
        return False
    else:
        return True

def get_all_accepted_paths(node, evaluation_results, issue):
    paths = get_paths_with_submissions(node)
    accepted_patches = {}
    for evaluation_patch in evaluation_results:
        if evaluation_patch['content'] not in accepted_patches or not accepted_patches[evaluation_patch['content']]:
            if is_accepted(evaluation_patch):
                accepted_patches[evaluation_patch['content']] = True
            else:
                accepted_patches[evaluation_patch['content']] = False

    accepted_paths = []
    for path in paths:
        cur_patch = path[-1]['content'].split('(Open file:')[0]
        if cur_patch in accepted_patches and accepted_patches[cur_patch]:
            accepted_paths.append(path)
        elif cur_patch not in accepted_patches:
            print('Error: patch not found in evaluation results', issue)

    return accepted_paths

def get_all_rejected_paths(node, evaluation_results, issue):
    paths = get_paths_with_submissions(node)
    rejected_patches = {}
    
    # First pass: collect all rejected patches
    for evaluation_patch in evaluation_results:
        if evaluation_patch['content'] not in rejected_patches or not rejected_patches[evaluation_patch['content']]:
            if is_accepted(evaluation_patch):
                rejected_patches[evaluation_patch['content']] = False
            else:
                rejected_patches[evaluation_patch['content']] = True
    
    # Second pass: collect paths with rejected patches
    rejected_paths = []
    for path in paths:
        cur_patch = path[-1]['content'].split('(Open file:')[0]
        if cur_patch in rejected_patches and rejected_patches[cur_patch]:
            rejected_paths.append(path)
        elif cur_patch not in rejected_patches:
            print('Error: patch not found in evaluation results', issue)
            
    return rejected_paths

def get_all_accepted_patches(node, evaluation_results):
    paths = get_all_accepted_paths(node, evaluation_results)
    accepted_patches = [path[-1] for path in paths]
    # remove the open file part
    for patch in accepted_patches:
        patch['content'] = patch['content'].split('(Open file:')[0]

    return accepted_patches

def remove_index_lines(patch):
    """
    Removes lines that start with 'index' from a given git patch string.

    :param patch: The git patch as a string
    :return: The modified patch without 'index' lines
    """
    lines = patch.splitlines()
    cleaned_patch = "\n".join(line for line in lines if not line.startswith("index"))
    return cleaned_patch


def clean_patch(patch):
    """
    Removes the line number markers (like @@ -309,8 +309,9 @@) from a given git patch string
    while keeping the rest of the content intact.
    
    :param patch: The git patch as a string
    :return: The modified patch without the line number markers
    """
    lines = patch.splitlines()
    # Regex to match the @@ -xxx,xxx +xxx,xxx @@ pattern
    cleaned_patch = "\n".join(re.sub(r'@@.*@@', '', line) for line in lines)
    return cleaned_patch


def remove_comments_and_strings_from_patch(patch_text):
    lines = patch_text.split('\n')
    in_string = None  # Tracks if we're inside a triple-quoted string
    processed_lines = []
    skip_line = False  # Flag to skip lines within triple-quoted strings

    i = 0
    while i < len(lines):
        line = lines[i]
        if in_string:
            # We are inside a triple-quoted string
            if line.strip().endswith(in_string):
                in_string = None  # Exiting the triple-quoted string
            # Skip this line
            i += 1
            continue
        elif line.startswith('+') and not line.startswith('+++'):
            code_line = line[1:].lstrip()
            # Check if the line starts with a triple-quoted string
            if code_line.startswith("'''") or code_line.startswith('"""'):
                in_string = code_line[:3]
                # Check if the triple-quoted string ends on the same line
                if code_line.endswith(in_string) and len(code_line) > 3:
                    in_string = None  # Triple-quoted string ends on the same line
                # Skip this line
                i += 1
                continue
            else:
                # Remove comments from this line
                new_code_line = remove_comments_from_code_line(code_line)
                if new_code_line.strip() == '':
                    # If line is empty after removing comments, skip it
                    i += 1
                    continue
                # Reconstruct the line with '+'
                processed_line = '+' + (' ' + new_code_line if new_code_line else '')
                processed_lines.append(processed_line)
        else:
            # Keep the line as is
            processed_lines.append(line)
        i += 1
    return '\n'.join(processed_lines)

def remove_comments_from_code_line(line):
    code = ''
    in_string = None
    i = 0
    n = len(line)
    while i < n:
        c = line[i]
        if in_string:
            code += c
            if c == in_string and line[i-1] != '\\':
                in_string = None
            i +=1
        else:
            if c == '"' or c == "'":
                in_string = c
                code += c
                i +=1
            elif c == '#':
                # Start of comment
                break
            else:
                code += c
                i +=1
    return code.rstrip()