"use client";

import { useCallback, useState } from "react";

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
  Panel,
} from "@xyflow/react";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

//Providers
import { ThemeProvider } from "styled-components";

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
import { Divider, Tooltip } from "@mui/material";

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

const Graph = ({
  theme,
  toggleTheme,
  data,
  graphInfo,
}: {
  theme: Theme;
  toggleTheme: () => void;
  data: StringAnyMap;
  graphInfo: StringAnyMap;
}) => {
  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstance.setViewport({ x: 800, y: 500, zoom: 0.75 }); // Adjust padding for better fit
  };
  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges({
    data,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, ,] = useEdgesState(initialEdges);

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

        const { entityId } = node?.data?.additional as StringAnyMap;

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

  const onSearchChange = useCallback((e:{target:{value:any}}) => {
    setSearchQuery(() => e.target.value);
  }, []);

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
          <button
            onClick={toggleTheme}
            className="bg-sky-900 dark:bg-mint-500 !important"
          >
            {theme == Theme.DARK ? <LightModeIcon /> : <DarkModeIcon />}
          </button>
          <Divider orientation="vertical" flexItem />
          <input
            className="px-4"
            value={searchQuery}
            placeholder="search globally"
            onChange={onSearchChange}
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
        <Panel position="top-left">
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
        </Panel>
      </ReactFlowStyled>
    </div>
  );
};

const GraphContainer = ({
  data,
  graphInfo,
}: {
  data: StringAnyMap;
  graphInfo: StringAnyMap;
}) => {
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);

  const toggleTheme = useCallback(() => {
    setTheme((th) => (th === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  }, []);
  return (
    <ThemeProvider theme={theme === Theme.LIGHT ? lightTheme : darkTheme}>
      <Graph
        data={data}
        graphInfo={graphInfo}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </ThemeProvider>
  );
};

export { GraphContainer as Graph };
