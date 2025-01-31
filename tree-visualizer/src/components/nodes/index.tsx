import { User } from "./User";
import { Assistant } from "./Assistant";
import { Demo } from "./Demo";
import { System } from "./System";
import { ProblemStatement } from "./ProblemStatement";
import { NextStep } from "./NextStep";
//Constants
import { NodeType } from "@/components/constants";

export const nodeTypes = {
  [NodeType.USER]: User,
  [NodeType.ASSISTANT]: Assistant,
  [NodeType.SYSTEM]: System,
  [NodeType.DEMO]: Demo,
  [NodeType.PS]: ProblemStatement,
  [NodeType.NEXT_STEP]: NextStep,
};
