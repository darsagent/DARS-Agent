import { StringAnyMap } from "../types";
import InfoIcon from "@mui/icons-material/Info";
import { Panel} from "@xyflow/react";
import { Tooltip } from "@mui/material";

export const InfoPanel=({graphInfo}:{graphInfo:StringAnyMap})=>(<Panel position="top-left">
    <div className="flex flex-col gap-3  p-4 bg-white border rounded-xl shadow-xl">
      <div className="flex gap-4">
        <div className="flex gap-1 items-center">
          <Tooltip title="Green + Red Leaf Nodes">
            <InfoIcon sx={{ fontSize: 15 }} />
          </Tooltip>
          Total Patches Submitted:
        </div>
        <div>{graphInfo.patchesCount}</div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-1 items-center">
          <Tooltip title="Number of Branches">
            <InfoIcon sx={{ fontSize: 18 }} />
          </Tooltip>
          Total Paths Explored:
        </div>
        <div>{graphInfo.pathCount}</div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-1 items-center">
          <Tooltip title="Number of Green Leaf Nodes">
            <InfoIcon sx={{ fontSize: 15 }} />
          </Tooltip>
          Total Accepted Patches:
        </div>
        <div>{graphInfo.acceptedPatches}</div>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-1 items-center">
          <Tooltip title="Number of Assistant Nodes">
            <InfoIcon sx={{ fontSize: 15 }} />
          </Tooltip>
          Total Iterations:
        </div>
        <div>{graphInfo.iterations}</div>
      </div>
    </div>
  </Panel>)