import * as React from "react";
import Modal from "@mui/material/Modal";
import { ActionMenu } from "./ActionMenu";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";

//constants
import { ActionType, NodeType } from "@/components/constants";

//types
import { OnAction } from "@/components/types";

const style = {
  top: "450px",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1100,
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: "12px",
  divShadow: 24,
};

const BaseModal = ({
  open,
  onAction,
  isBranchNode = false,
  isRootNode = false,
  isEndNode = false,
  children,
  nodeType,
}: {
  open: boolean;
  onAction: OnAction;
  isBranchNode?: boolean;
  isRootNode?: boolean;
  isEndNode?: boolean;
  children?: React.ReactElement;
  nodeType: NodeType;
}) => {
  const nodeHeading = React.useMemo(() => {
    switch (nodeType) {
      case NodeType.ASSISTANT:
        return "Assistant Node";
      case NodeType.USER:
        return "User Node";
      case NodeType.DEMO:
        return "Demo Node";
      case NodeType.SYSTEM:
        return "System Node";
      case NodeType.PS:
        return "Problem Statement";
    }
  }, [nodeType]);
  return (
    <Modal
      open={open}
      onClose={() => onAction({ type: ActionType.CLOSE_MODAL })}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div className="absolute flex flex-col justify-between" style={style}>
        <div
          className={`flex justify-between items-center px-4 py-2 ${
            nodeType == NodeType.USER ? "bg-blue-50" : ""
          }
            ${nodeType == NodeType.ASSISTANT ? "bg-fuchsia-50" : ""}
                        ${
                          nodeType == NodeType.DEMO ||
                          nodeType == NodeType.SYSTEM ||
                          nodeType == NodeType.PS
                            ? "bg-emerald-100"
                            : ""
                        }`}
          style={{ borderRadius: "12px 12px 0 0" }}
        >
          <div className="flex gap-4 max-w-128">
            <Typography variant="h4" noWrap>
              {nodeHeading}
            </Typography>
            {isBranchNode ? (
              <div className="px-2 py-1 border solid rounded-2xl bg-red-500 flex items-center justify-center whitespace-nowrap">
                Branch Node
              </div>
            ) : null}
            {isRootNode ? (
              <div className="px-2 py-1 border solid rounded-2xl bg-blue-500 flex items-center justify-center whitespace-nowrap">
                Root Node
              </div>
            ) : null}
            {isEndNode ? (
              <div className="px-2 py-1 border solid rounded-2xl bg-green-500 flex items-center justify-center whitespace-nowrap">
                Result Node
              </div>
            ) : null}
          </div>
          <div className=""></div>
          <ActionMenu onAction={onAction} isBranchNode={isBranchNode} />
        </div>
        <Divider />
        <div
          className="overflow-hidden"
          style={{ borderRadius: "0 0 12px 12px" }}
        >
          {children}
        </div>
      </div>
    </Modal>
  );
};

export default BaseModal;
