import { memo, useCallback } from "react";
import { Handle, Node, Position, useNodes, useReactFlow } from "@xyflow/react";
import SkipNextOutlinedIcon from "@mui/icons-material/SkipNextOutlined";

//types
import { StringAnyMap } from "../types";

const NextStep = memo(
  ({ data, isConnectable }: { data: StringAnyMap; isConnectable: boolean }) => {
    const { setCenter } = useReactFlow();
    const nodes = useNodes();
    const focusOnNode = useCallback(() => {
      const node = nodes.find((n: Node) => n.id === data?.nextStepId);
      if (node) {
        setCenter(node.position.x, node.position.y, {
          zoom: 1.5,
          duration: 900,
        });
      }
    }, [data?.nextStepId, setCenter, nodes]);

    return (
      <div className="border flex items-center justify-center rounded-2xl shadow-2xl solid border-2 border-yellow-600 bg-yellow-400">
        <Handle
          type="target"
          position={Position.Top}
          id="a"
          isConnectable={isConnectable}
        />
        <div onClick={focusOnNode} className="p-4">
          <SkipNextOutlinedIcon fontSize="small" />
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="b"
          isConnectable={isConnectable}
        />
      </div>
    );
  }
);

NextStep.displayName = "NextStep";

export { NextStep };
