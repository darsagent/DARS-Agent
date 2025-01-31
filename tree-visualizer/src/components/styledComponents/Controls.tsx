//Providers
import styled from "styled-components";

//Components
import { ReactFlow, MiniMap, Controls } from "@xyflow/react";

const ReactFlowStyled = styled(ReactFlow)`
  background-color: ${(props) => props.theme.bg};
`;
const ControlsStyled = styled(Controls)`
  background: white;
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 2px;
  padding-bottom: 2px;
  border-radius: 10px;
  box-shadow: ${(props) =>
    props.theme.isDarkMode
      ? "0px 4px 10px rgba(0, 0, 0, 0.6)" /* Dark mode: deeper shadow */
      : "0px 4px 10px rgba(0, 0, 0, 0.2)"}; /* Light mode: softer shadow */

  button {
    background-color: ${(props) => props.theme.controlsBg};
    color: ${(props) => props.theme.controlsColor};
    border: 0;
    border-radius: 10px;
    margin: 5px;
    height: 45px;
    width: 45px;
    &:hover {
      background: ${(props) =>
        props.theme.isDarkMode ? "white" : "rgb(233, 239, 255)"};
      border-color: ${(props) =>
        props.theme.isDarkMode ? "white" : "rgb(25, 0, 255)"};
    }
    path {
      fill: currentColor;
    }
  }

  div {
    background: ${(props) => (props.theme.isDarkMode ? "white" : "black")};
    margin: 4px;
  }
  div,
  input {
    transition: width 0.5s ease-in-out;
  }

  input {
    background-color: ${(props) => props.theme.controlsBg};
    color: ${(props) => props.theme.controlsColor};
    border-bottom: 1px solid ${(props) => props.theme.controlsBorder};
    width: 150px;
    border: 1px solid
      ${(props) =>
        props.theme.isDarkMode ? "rgb(124, 24, 24)" : "rgb(139, 151, 217)"};
    border-radius: 4px;
    padding-left: 6px;
    margin-top: 4px;
    margin-bottom: 4px;
    margin-left: 10px;

    &:hover {
      border-color: ${(props) =>
        props.theme.isDarkMode ? "white" : "rgb(25, 0, 255)"};
    }

    &:focus {
      width: 300px;
      border-color: ${(props) => (props.theme.isDarkMode ? "white" : "black")};
    }
  }
`;
const MiniMapStyled = styled(MiniMap)`
  background-color: ${(props) => props.theme.bg};

  .react-flow__minimap-mask {
    fill: ${(props) => props.theme.minimapMaskBg};
  }

  .react-flow__minimap-node {
    fill: ${(props) => props.theme.nodeBg};
    stroke: none;
  }
`;
export { MiniMapStyled, ControlsStyled, ReactFlowStyled };
