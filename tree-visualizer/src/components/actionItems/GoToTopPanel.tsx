import { Panel, useReactFlow } from "@xyflow/react"
import { useCallback } from "react";


export const GoToTopPanel=()=>{
    const {setViewport}=useReactFlow();
    const goToTopNode=useCallback(()=>{
        setViewport({x: 800, y: 500, zoom: 0.75 },{duration:500})
    },[]);

    return (<Panel position="bottom-left"><button className="p-4 bg-white border border-gray-300 hover:bg-indigo-100 rounded-3xl shadow-2xl" onClick={goToTopNode}>
        Reset View</button></Panel>)
}
