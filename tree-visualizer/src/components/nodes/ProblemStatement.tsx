import { memo, useState, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import { Modal } from "@/components/modal";
import { ActionType } from "../constants";

//types
import { Action, StringAnyMap } from "../types";

const ProblemStatement = memo(
  ({ data, isConnectable }: { data: StringAnyMap; isConnectable: boolean }) => {
    const [isOpen, setOpen] = useState<boolean>(false);

    const [currentId, setEntityId] = useState(null);

    const handleOpen = useCallback(() => {
      setEntityId(data.additional.entityId);
      setOpen(true);
    }, [data.additional.entityId]);

    const onAction = useCallback(
      (action: Action) => {
        switch (action.type) {
          case ActionType.CLOSE_MODAL:
            setEntityId(null);
            setOpen(false);
            return;
          case ActionType.OPEN_MODAL:
            handleOpen();
            return;
          case ActionType.OPEN_PARENT_NODE:
            const parentId = action?.payload?.parentId;
            setEntityId(parentId);
            return;
          case ActionType.OPEN_CHILD_NODE:
          case ActionType.OPEN_LEFT_CHILD:
            const childId = action?.payload?.childrenIds?.[0]?.id;
            setEntityId(childId);
            return;
          case ActionType.OPEN_RIGHT_CHILD:
            const nextChildId = action?.payload?.childrenIds?.[1]?.id;
            setEntityId(nextChildId);
            return;
          default:
            return;
        }
      },
      [handleOpen]
    );

    return (
      <div
        className={`border flex items-center justify-center shadow-2xl solid border-2 border-slate-500  ${
          data.isHighlighted ? "bg-slate-500" : "bg-slate-200"
        }`}
        style={{
          borderRadius: 100,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="a"
          isConnectable={isConnectable}
        />
        <div
          onClick={handleOpen}
          className="flex items-center justify-center px-8 py-2 font-bold text-3xl"
          style={{ height: "100px", width: "600px" }}
        >
          {data?.label}
        </div>
        <Modal open={isOpen} onAction={onAction} entityId={currentId} />

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

ProblemStatement.displayName = "ProblemStatement";

export { ProblemStatement };
