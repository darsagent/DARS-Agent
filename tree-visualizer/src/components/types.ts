import type { ActionType } from "./constants";

export type StringAnyMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type Action = { type: ActionType; payload?: StringAnyMap };

export type OnAction = (action: Action) => void;
