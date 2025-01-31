import { User } from "./User";
import { Assistant } from "./Assistant";

//Constants
import { NodeType } from "@/components/constants";

export const nodeTypes = {
  [NodeType.USER]: User,
  [NodeType.ASSISTANT]: Assistant,
};
