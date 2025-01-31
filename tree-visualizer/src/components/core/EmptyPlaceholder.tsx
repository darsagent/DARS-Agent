import { ReactElement } from "react";
import DataObjectIcon from "@mui/icons-material/DataObject";
import { grey } from "@mui/material/colors";

export const EmptyPlaceholder = ({
  text,
  icon,
}: {
  text?: string;
  icon?: ReactElement;
}) => (
  <div className="flex flex-col gap-3 w-full justify-center items-center">
    {icon ?? (
      <DataObjectIcon
        sx={{
          color: grey[500],
          fontSize: 52,
          p: 1,
          borderRadius: "50%",
          backgroundColor: grey[300],
        }}
      />
    )}
    <div className="font-bold text-2xl text-gray-400">{text ?? "Empty"} </div>
  </div>
);
