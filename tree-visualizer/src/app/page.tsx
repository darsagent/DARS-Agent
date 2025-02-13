//Components
import { Graph } from "@/components/Graph";

//helpers
import { fetchData } from "@/dataHelper/fetchData";
import { getFlattenedData } from "@/dataHelper/getFlattenedData";

//Styles
import "@xyflow/react/dist/style.css";

const COMBINATIONS = [
  "append",
  "append_create",
  "append_edit",
  "append_submit",
  "append_create_edit",
  "append_create_submit",
  "append_edit_submit",
  "append_create_edit_submit",
  "create",
  "create_edit",
  "create_submit",
  "create_edit_submit",
  "edit",
  "edit_submit",
  "submit",
  "none",
];
export default async function Home() {
  // staticalyy generated site so generating all possible combinations data

  // Fetch data for all combinations parelley
  const combinationVsDataArray = await Promise.all(
    COMBINATIONS.map(async (combination) => {
      const data = await fetchData(combination);
      const { adaptedData, graphInfo } = getFlattenedData(data);
      return { combination, data: adaptedData, graphInfo };
    })
  );

  // Convert the array to an object
  const combinationDataMap = combinationVsDataArray.reduce(
    (
      acc: { [key: string]: { data: any; graphInfo: any } },
      { combination, data, graphInfo }
    ) => {
      acc[combination] = { data, graphInfo };
      return acc;
    },
    {}
  );

  return (
    <div className="flex items-center justify-center">
      <Graph data={combinationDataMap} />
    </div>
  );
}
