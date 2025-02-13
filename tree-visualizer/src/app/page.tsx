//Components
import { Graph } from "@/components/Graph";

//Provider
import { EntityProvider } from "@/context/EntityContext";

//helpers
import { fetchData } from "@/dataHelper/fetchData";
import { getFlattenedData } from "@/dataHelper/getFlattenedData";

//Styles
import "@xyflow/react/dist/style.css";

export default async function Home({
  searchParams,
}: Readonly<{ searchParams: { combination?: string } }>) {
  //get the combination from the query params
  const combination = searchParams.combination ?? "append_create_edit_submit";

  //server side data fetching
  const data = await fetchData(combination);

  const { adaptedData, graphInfo } = getFlattenedData(data);

  return (
    <EntityProvider data={adaptedData}>
      <div className="flex items-center justify-center">
        <Graph data={adaptedData} graphInfo={graphInfo} />
      </div>
    </EntityProvider>
  );
}
