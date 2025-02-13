import { useEffect } from "react";
import { Panel } from "@xyflow/react";
import { Divider } from "@mui/material";
import { useCombination } from "@/context/EntityContext";

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
        <div className="pt-1 px-2 font-bold">Allowed expansions</div>
        <Divider flexItem />
        <div className="grid grid-cols-2 py-2 gap-1">
          <button
            className={`border-2 py-2 rounded-md border-double ${
              expansionCombination.includes(EXPANSION_TYPES.APPEND)
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-300 hover:bg-gray-200"
            }`}
            onClick={() => updateCombination(EXPANSION_TYPES.APPEND)}
          >
            append
          </button>
          <button
            className={`border-2 py-2 rounded-md border-double ${
              expansionCombination.includes(EXPANSION_TYPES.CREATE)
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-300 hover:bg-gray-200"
            }`}
            onClick={() => updateCombination(EXPANSION_TYPES.CREATE)}
          >
            create
          </button>
          <button
            className={`border-2 py-2 rounded-md border-double ${
              expansionCombination.includes(EXPANSION_TYPES.EDIT)
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-300 hover:bg-gray-200"
            }`}
            onClick={() => updateCombination(EXPANSION_TYPES.EDIT)}
          >
            edit
          </button>
          <button
            className={`border-2 py-2 rounded-md border-double ${
              expansionCombination.includes(EXPANSION_TYPES.SUBMIT)
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-300 hover:bg-gray-200"
            }`}
            onClick={() => updateCombination(EXPANSION_TYPES.SUBMIT)}
          >
            submit
          </button>
        </div>
      </div>
    </Panel>
  );
};
