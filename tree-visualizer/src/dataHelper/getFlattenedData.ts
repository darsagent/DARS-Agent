import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import path from "path";

// Types
import { StringAnyMap } from "@/components/types";

const hashString = (str: string) =>
  crypto.createHash("sha256").update(str).digest("hex");

const extractPatch = (content: string) => {
  if (content.includes("\ndiff --git")) {
    return content.split("(Open file:")[0].trim();
  }
  return "";
};

const getInfo = (finalData: StringAnyMap) => {
  const patchesCount = Object.values(finalData).filter(
    (entity) => entity.role == "user" && entity.isTerminal
  ).length;

  const acceptedPatches = Object.values(finalData).filter(
    (entity) => entity.isAcceptedTerminal
  ).length;

  const iterations = Object.values(finalData).filter(
    (entity) => entity.role == "assistant"
  ).length;

  const pathCount =
    Object.values(finalData).filter((entity) => entity.childrenIds.length > 1)
      .length + 1;

  return {
    patchesCount,
    acceptedPatches,
    iterations,
    pathCount,
  };
};

const getStatement = (str: string) => {
  if (!str) return "No <pr_description> tag found";

  const match = str.match(/<pr_description>([\s\S]*?)<\/pr_description>/);
  const extractedText = match ? match[1].trim() : null;

  return extractedText;
};

export const getFlattenedData = (data: StringAnyMap) => {
  const rootFilePath = process.env.ROOT_INPUT_FILE; // Get from .env
  const fileName = rootFilePath
    ? path
        .basename(rootFilePath)
        .replace(/\.prev\.root$/, "")
        .toUpperCase()
    : "Unknown File Name";

  const { inputData, evalResults } = data;
  const successTerminalNodes = evalResults?.filter(
    (evalNode: StringAnyMap) => evalNode.status == "success"
  );

  const hashSetForTerminalNodes = successTerminalNodes.map(
    (node: StringAnyMap) => hashString(node.content.trim())
  );

  const system = inputData?.root;
  const demo = system?.children?.[0];
  const root = demo?.children?.[0];

  const problemStatement = getStatement(root.content);
  if (!root) return data;

  const adaptedData = new Map();

  adaptedData.set("problemStatement", {
    id: "problemStatement",
    parentId: null,
    role: "problemStatement",
    content: problemStatement,
    fileName,
    childrenIds: [{ id: "system" }],
  });
  adaptedData.set("system", {
    id: "system",
    parentId: "problemStatement",
    role: "system",
    content: system.content,
    childrenIds: [{ id: "demo" }],
  });

  adaptedData.set("demo", {
    id: "demo",
    parentId: "system",
    role: "demo",
    content: demo.content,
    childrenIds: [{ id: "root" }],
  });

  const stack = [
    {
      id: "root",
      parentId: "demo",
      role: root.role,
      content: root.content,
      thought: root.thought,
      action: root.action,
      prevActions: [] as string[],
      isTerminal: root.is_terminal,
      depth: root._depth,
      children: root.children,
      isAcceptedTerminal: false,
      traversalSequence: root.node_id,
      expansionHistory: root.expansion_history,
      expansionCandidates: root.expansion_candidates,
      actionExpansionLimit: root._action_expansion_limit,
    },
  ];

  while (stack.length > 0) {
    const node = stack.pop();

    const childrenIds = [] as Array<StringAnyMap>;

    if (node?.children) {
      node.children.forEach((child: StringAnyMap) => {
        const childId = uuidv4();
        const isAcceptedTerminal = child.is_terminal
          ? hashSetForTerminalNodes.includes(
              hashString(extractPatch(child.content.trim()))
            )
          : false;

        stack.push({
          id: childId,
          parentId: node?.id,
          role: child.role,
          content: child.content,
          thought: child.thought,
          action: child.action,
          traversalSequence: child.node_id,
          isTerminal: child.is_terminal,
          depth: child._depth,
          children: child.children,
          prevActions: [node.action, ...node.prevActions],
          //checks if its a terminal node and is the content-hash in eval set
          isAcceptedTerminal,
          expansionCandidates: child.expansion_candidates,
          expansionHistory: child.expansion_history,
          actionExpansionLimit: child._action_expansion_limit,
        });
        childrenIds.push({ id: childId });
      });
      adaptedData.set(node.id, { ...node, childrenIds, children: [] });
    }
  }
  const finalData = Object.fromEntries(adaptedData);
  const graphInfo = getInfo(finalData);

  return { adaptedData: finalData, graphInfo };
};
