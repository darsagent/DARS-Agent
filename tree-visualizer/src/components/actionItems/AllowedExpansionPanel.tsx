import { useEffect } from "react";
import { Panel } from "@xyflow/react";
import { Divider } from "@mui/material";
import { useCombination } from "@/context/EntityContext";
import Switch from "@mui/material/Switch";
import InfoIcon from "@mui/icons-material/Info";
import { Tooltip } from "@mui/material";

enum EXPANSION_TYPES {
  EDIT = "edit",
  APPEND = "append",
  CREATE = "create",
  SUBMIT = "submit",
}

export const AllowedExpansionPanel = () => {
  const {
    combination: expansionCombination,
    setCombination: setExpCombination,
  } = useCombination();

  // Load state from localStorage on mount
  useEffect(() => {
    const savedCombination = localStorage.getItem("selectedCombination");
    if (savedCombination) {
      setExpCombination(savedCombination);
    }
  }, []);

  const updateCombination = (direction: string) => {
    const combinationsState = new Set(
      expansionCombination.split("_").filter(Boolean)
    );

    if (combinationsState.has(direction)) {
      combinationsState.delete(direction);
    } else {
      combinationsState.add(direction);
    }

    const newCombination = Array.from(combinationsState).sort().join("_");
    setExpCombination(newCombination);

    // Save to localStorage
    localStorage.setItem("selectedCombination", newCombination);
  };

  return (
    <Panel position="top-right">
      <div className="flex flex-col gap-1  pt-2 px-2 bg-white border rounded-xl shadow-xl">
        <div className="pt-1 px-2 font-bold flex gap-1 justify-center">
          ALLOWED EXPANSIONS
          <Tooltip title="Considers following actions for expansion">
            <InfoIcon sx={{ fontSize: 15 }} />
          </Tooltip>
        </div>
        <Divider flexItem />
        <div className="grid grid-cols-2 pb-2 gap-1">
          <div className="flex justify-between items-center">
            Append
            <Switch
              checked={expansionCombination.includes(EXPANSION_TYPES.APPEND)}
              onChange={() => updateCombination(EXPANSION_TYPES.APPEND)}
            />
          </div>

          <div className="flex justify-between items-center">
            Create
            <Switch
              checked={expansionCombination.includes(EXPANSION_TYPES.CREATE)}
              onChange={() => updateCombination(EXPANSION_TYPES.CREATE)}
            />
          </div>

          <div className="flex justify-between items-center">
            Edit
            <Switch
              checked={expansionCombination.includes(EXPANSION_TYPES.EDIT)}
              onChange={() => updateCombination(EXPANSION_TYPES.EDIT)}
            />
          </div>
          <div className="flex justify-between items-center">
            Submit
            <Switch
              checked={expansionCombination.includes(EXPANSION_TYPES.SUBMIT)}
              onChange={() => updateCombination(EXPANSION_TYPES.SUBMIT)}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
};
