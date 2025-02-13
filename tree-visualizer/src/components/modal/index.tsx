import * as React from "react";

//Components
import { AssistantModal } from "./Assistant";
import { UserModal } from "./User";
import { DemoModal } from "./Demo";
import { SystemModal } from "./System";
import { ProblemStatementModal } from "./ProblemStatement";

//Hooks
import { useEntity } from "@/context/EntityContext";

//Constants
import { NodeType } from "../constants";

//Types
import { OnAction, StringAnyMap } from "../types";

export const Modal = ({
  open,
  onAction,
  entityId,
}: {
  open: boolean;
  onAction: OnAction;
  entityId: string | null;
}) => {
  const entity = useEntity(entityId) as StringAnyMap | null;

  if (!entity) return null;

  switch (entity.role) {
    case NodeType.ASSISTANT:
      return <AssistantModal open={open} entity={entity} onAction={onAction} />;
    case NodeType.USER:
      return <UserModal open={open} entity={entity} onAction={onAction} />;
    case NodeType.DEMO:
      return <DemoModal open={open} entity={entity} onAction={onAction} />;
    case NodeType.SYSTEM:
      return <SystemModal open={open} entity={entity} onAction={onAction} />;
    case NodeType.PS:
      return (
        <ProblemStatementModal
          open={open}
          entity={entity}
          onAction={onAction}
        />
      );
  }
};
