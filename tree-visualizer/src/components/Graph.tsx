"use client";

import { useCallback, useState, useEffect } from "react";

//Components
import {
  ReactFlowStyled,
  MiniMapStyled,
  ControlsStyled,
} from "@/components/styledComponents/Controls";
import {
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
} from "@xyflow/react";
// import DarkModeIcon from "@mui/icons-material/DarkMode";
// import LightModeIcon from "@mui/icons-material/LightMode";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { GoToTopPanel } from "./actionItems/GoToTopPanel";
import { InfoPanel } from "./actionItems/InfoPanel";
import { AllowedExpansionPanel } from "./actionItems/AllowedExpansionPanel";

//Providers
import { ThemeProvider } from "styled-components";
import { EntityProvider, useCombinationData } from "@/context/EntityContext";

//utils
import { nodeTypes } from "@/components/nodes";
import { checkQueryInText } from "@/components/utils/searchUtils";

//Types
import { BackgroundVariant, Node } from "@xyflow/react";

//Constants
import { NodeType, Theme } from "./constants";

//Styles
import "@xyflow/react/dist/style.css";
import { lightTheme, darkTheme } from "@/components/styles";
import { StringAnyMap } from "./types";
import { createNodesAndEdges } from "./utils/createNodesAndEdges";
import { Divider } from "@mui/material";

const nodeColor = (node: Node) => {
  switch (node.type) {
    case NodeType.USER:
      return "#6ede87";
    case NodeType.ASSISTANT:
      return "#6865A5";
    default:
      return "#ff0072";
  }
};

const Graph = ({}: {
  theme: Theme;
  toggleTheme: () => void;
}) => {
  const { data, graphInfo } = useCombinationData() as StringAnyMap;
  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.setViewport({ x: 800, y: 500, zoom: 0.75 }); // Adjust padding for better fit
  };
  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges({
    data,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges,] = useEdgesState(initialEdges);
  
  // 🔄 Update nodes & edges when new data comes in
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges({ data });
    setNodes(newNodes);
    setEdges(newEdges);
  }, [data]);
  
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getHighlightedNodes = useCallback(
    (query: string): Node[] => {
      return nodes.map((node) => {
        if (!query || !query.trim() || query.trim() == "")
          return {
            ...node,
            data: {
              ...node.data,
              isHighlighted: false,
            },
          };

        const additional = node?.data?.additional as StringAnyMap;
        const entityId = additional?.entityId;

        // check for transition nodes
        if (!entityId) return node;

        if (checkQueryInText(data[entityId]?.content, query)) {
          return {
            ...node,
            data: {
              ...node.data,
              isHighlighted: true,
            },
          };
        } else {
          return {
            ...node,
            data: {
              ...node.data,
              isHighlighted: false,
            },
          };
        }
      });
    },
    [nodes, data]
  );

  const onSearchChange = useCallback((e:{target:{value:string}}) => {
    setSearchQuery(() => e.target.value);
  }, []);
  const onSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setNodes(getHighlightedNodes(searchQuery));
      }
    },
    [searchQuery, getHighlightedNodes, setNodes]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlowStyled
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onInit={onInit}
        selectionOnDrag
        panOnScroll
        fitView
      >
        <ControlsStyled position="top-center" orientation="horizontal">
{/*           <button
            onClick={toggleTheme}
            className="bg-sky-900 dark:bg-mint-500 !important"
          >
            {theme == Theme.DARK ? <LightModeIcon /> : <DarkModeIcon />}
          </button> */}
          <Divider orientation="vertical" flexItem />
          <input
            className="px-4"
            value={searchQuery}
            placeholder="search globally"
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
          />
          <button
            onClick={() => {
              setNodes(getHighlightedNodes(searchQuery));
            }}
          >
            <SearchIcon />
          </button>
          <button
            onClick={() => {
              setSearchQuery(() => "");
              setNodes(getHighlightedNodes(""));
            }}
          >
            <ClearIcon />
          </button>
        </ControlsStyled>
        <MiniMapStyled nodeColor={nodeColor} zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <InfoPanel graphInfo={graphInfo} />
        <GoToTopPanel />
        <AllowedExpansionPanel />
      </ReactFlowStyled>
    </div>
  );
};

const GraphContainer = ({ data }: { data: StringAnyMap }) => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  const toggleTheme = useCallback(() => {
    setTheme((th) => (th === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  }, []);
  return (
    <ThemeProvider theme={theme === Theme.LIGHT ? lightTheme : darkTheme}>
      <EntityProvider data={data}>
        <Graph theme={theme} toggleTheme={toggleTheme} />
      </EntityProvider>
    </ThemeProvider>
  );
};

export { GraphContainer as Graph };
