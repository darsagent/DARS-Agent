import * as React from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import BaseButton, { ButtonProps } from "@mui/material/Button";
import { Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { grey } from "@mui/material/colors";

//icon
import CloseIcon from "@mui/icons-material/Close";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import ArrowCircleDownOutlinedIcon from "@mui/icons-material/ArrowCircleDownOutlined";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

//constants
import { ActionType } from "@/components/constants";

//types
import { OnAction } from "@/components/types";

const Button = styled(BaseButton)<ButtonProps>(({ theme }) => ({
  color: theme.palette.getContrastText(grey[50]),
  borderColor: grey[400],
  backgroundColor: grey[50],
  "&:hover": {
    backgroundColor: grey[200],
    borderColor: grey[900],
  },
}));

export const ActionMenu = ({
  onAction,
  isBranchNode,
}: {
  onAction: OnAction;
  isBranchNode?: boolean;
}) => (
  <Box className="flex gap-2">
    <Button
      size="small"
      variant="outlined"
      onClick={() => onAction({ type: ActionType.OPEN_PARENT_NODE })}
      className="actionButton"
      startIcon={<ArrowCircleUpOutlinedIcon />}
    >
      <Typography variant="caption">Parent</Typography>
    </Button>
    {isBranchNode ? (
      <>
        <Button
          variant="outlined"
          onClick={() =>
            onAction({
              type: ActionType.OPEN_LEFT_CHILD,
            })
          }
          className="actionButton"
          startIcon={<ArrowCircleLeftOutlinedIcon />}
          size="small"
        >
          <Typography variant="caption">Left Branch</Typography>
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() =>
            onAction({
              type: ActionType.OPEN_RIGHT_CHILD,
            })
          }
          className="actionButton"
          startIcon={<ArrowCircleRightOutlinedIcon />}
        >
          <Typography variant="caption">Right Branch</Typography>
        </Button>
      </>
    ) : (
      <Button
        variant="outlined"
        onClick={() => onAction({ type: ActionType.OPEN_CHILD_NODE })}
        className="actionButton"
        startIcon={<ArrowCircleDownOutlinedIcon />}
        size="small"
      >
        <Typography variant="caption">Child</Typography>
      </Button>
    )}
    <Divider orientation="vertical" flexItem />
    <Button
      variant="outlined"
      onClick={() => onAction({ type: ActionType.CLOSE_MODAL })}
      className="actionButton"
      size="small"
    >
      <CloseIcon />
    </Button>
  </Box>
);
