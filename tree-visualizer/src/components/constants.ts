export enum ActionType {
  OPEN_MODAL = "OPEN_MODAL",
  CLOSE_MODAL = "CLOSE_MODAL",
  OPEN_PARENT_NODE = "OPEN_PARENT_NODE",
  OPEN_CHILD_NODE = "OPEN_CHILD_NODE",
  OPEN_RIGHT_CHILD = "OPEN_RIGHT_CHILD",
  OPEN_LEFT_CHILD = "OPEN_LEFT_CHILD",
}

export enum NodeType {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
  DEMO = "demo",
  PS = "problemStatement",
  NEXT_STEP = "nextStep",
}

export enum Theme {
  DARK = "dark",
  LIGHT = "light",
}
