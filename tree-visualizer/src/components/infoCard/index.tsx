import { User } from "./User";
import { Assistant } from "./Assistant";

//Constants
import { NodeType } from "@/app/graph/constants";

export const nodeTypes = {
  [NodeType.USER]: User,
  [NodeType.ASSISTANT]: Assistant,
};
