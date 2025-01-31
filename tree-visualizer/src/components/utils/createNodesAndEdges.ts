import { NodeType } from "../constants";
import { StringAnyMap } from "../types";
import { v4 as uuidv4 } from "uuid";
import { Edge, Node } from "@xyflow/react";

// {
//     id: "1",
//     position: { x: 0, y: 0 },
//     data: { label: "1" },
//     type: NodeType.USER,
//   },

// { id: "e1-2", source: "1", target: "2" },

const X_OFFSET = 200;
const Y_OFFSET = 100;

export const createNodesAndEdges = ({
  data,
}: {
  data: StringAnyMap;
}): { nodes: Node[]; edges: Edge[] } => {
  const nodes = [] as Node[],
    edges = [] as Edge[];

  nodes.push({
    id: "problemStatement",
    data: {
      label: data["problemStatement"]?.fileName,
      additional: {
        entityId: "problemStatement",
      },
      isHighlighted: false,
    },
    position: { x: -X_OFFSET, y: -4 * Y_OFFSET },
    type: NodeType.PS,
  });

  nodes.push({
    id: "system",
    data: {
      label: "System Node",
      additional: {
        entityId: "system",
      },
      isHighlighted: false,
    },
    position: { x: 0, y: -2 * Y_OFFSET },
    type: NodeType.SYSTEM,
  });

  nodes.push({
    id: "demo",
    data: {
      label: "Demo Node",
      additional: {
        entityId: "demo",
      },
      isHighlighted: false,
    },
    position: { x: 0, y: -Y_OFFSET },
    type: NodeType.DEMO,
  });

  edges.push({ id: uuidv4(), source: "problemStatement", target: "system" });
  edges.push({ id: uuidv4(), source: "system", target: "demo" });
  edges.push({ id: uuidv4(), source: "demo", target: "root" });

  let nextStepCounter = 0;
  const sortedNodeIds = Object.values(data)
    .filter((node) => node?.traversalSequence)
    .sort((a, b) => a.traversalSequence - b.traversalSequence);

  function getNextStepNode(nodeId: string) {
    const presentId = sortedNodeIds.findIndex((e) => e.id == nodeId);
    if (presentId != -1 && presentId != sortedNodeIds.length) {
      return sortedNodeIds[presentId + 1];
    }
    return null;
  }

  function recur(node: StringAnyMap) {
    const { id: nodeId, x, y } = node;
    const nodeData = data[nodeId];
    nodes.push({
      id: nodeId,
      data: {
        label: nodeData.action,
        additional: {
          entityId: nodeId,
          isTerminal: nodeData.isTerminal,
          isAcceptedTerminal: nodeData.isAcceptedTerminal,
          traversalSequence: nodeData.traversalSequence,
        },
        isHighlighted: false,
      },
      position: { x, y },
      type: nodeData.role == NodeType.USER ? NodeType.USER : NodeType.ASSISTANT,
    });

    if (nodeData.parentId != null) {
      edges.push({ id: uuidv4(), source: nodeData.parentId, target: nodeId });
    }

    const leftId = nodeData?.childrenIds?.[0]?.id;
    //keeps the x for left branch and parent as same
    const leftX = (
      leftId
        ? recur({
            id: leftId,
            x,
            y: y + Y_OFFSET,
          })
        : x
    ) as number;

    let rightX = 0;

    //increase the x for right bracnh by 100
    if (nodeData?.childrenIds?.length > 1) {
      rightX = recur({
        id: nodeData?.childrenIds?.[1]?.id,
        x: leftX + X_OFFSET,
        y: y + Y_OFFSET,
      });
    }

    //transitionNode
    if (!leftId) {
      const jumpNodeId = `NEXT_STEP${nextStepCounter}`;
      nodes.push({
        id: jumpNodeId,
        data: {
          label: "Next",
          nextStepId: getNextStepNode(nodeId)?.id,
        },
        position: { x: leftX, y: y + Y_OFFSET },
        type: NodeType.NEXT_STEP,
      });
      edges.push({ id: uuidv4(), source: nodeId, target: jumpNodeId });
      nextStepCounter++;
    }
    //return the max X in a branch
    return Math.max(leftX, rightX);
  }

  recur({ id: "root", x: 0, y: 0 });

  return { nodes, edges };
};
