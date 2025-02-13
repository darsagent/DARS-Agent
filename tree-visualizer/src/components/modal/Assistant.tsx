import * as React from "react";
import Typography from "@mui/material/Typography";
import Modal from "./BaseModal";
import { OnAction, StringAnyMap } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Divider from "@mui/material/Divider";
import "./styles.css";
import { EmptyPlaceholder } from "@/components/core/EmptyPlaceholder";
import rehypeRaw from "rehype-raw";
import { SearchBar } from "../core/SearchBar";

//utils
import { highlightMarkdown, highlightText } from "../utils/searchUtils";

//Constants
import { NodeType } from "../constants";

//Types
import { Action } from "@/components/types";
import { ListMenu } from "../core/ListMenu";

export const AssistantModal = ({
  open,
  onAction: _onAction,
  entity,
}: {
  open: boolean;
  onAction: OnAction;
  className?: string;
  entity: StringAnyMap | null;
}) => {
  const [searchActionQuery, setActionQuery] = React.useState<
    string | undefined
  >();
  const [searchContentQuery, setContentQuery] = React.useState<
    string | undefined
  >();
  const [candidateValue, setCandidateValue] = React.useState<string>("" + -1);
  const [candidateAction, setCandidateAction] = React.useState<string>(
    entity?.action
  );
  const [candidateThought, setCandidateThought] = React.useState<string>(
    entity?.content
  );

  const filteredActions = React.useMemo(
    () => entity?.prevActions?.filter((a: string | null) => a),
    [entity?.prevActions]
  );

  const prevActionsEl = React.useMemo(
    () =>
      filteredActions?.map((action: string, id: number) => (
        <li key={id}>{highlightText(action, searchActionQuery)}</li>
      )),
    [filteredActions, searchActionQuery]
  );

  const onAction = React.useCallback(
    (action: Action) => _onAction({ ...action, payload: { ...entity } }),
    [entity, _onAction]
  );

  const onSearchActionChange = React.useCallback(
    (e: { target: { value: string } }) => {
      setActionQuery(e.target?.value);
    },
    []
  );
  const onSearchContentChange = React.useCallback(
    (e: { target: { value: string } }) => {
      setContentQuery(e.target?.value);
    },
    []
  );

  const expansionCandidates = entity?.expansionCandidates;
  const numCandidates = expansionCandidates?.length;

  const handleCandidateChange = React.useCallback(
    (event: { target: { value: string } }) => {
      if (!numCandidates) {
        return;
      }

      if (event.target.value == "-1") {
        setCandidateAction(entity?.action);
        setCandidateValue("" + -1);
        setCandidateThought(entity?.content);
      } else {
        const action = expansionCandidates[event.target.value][1];
        const thought = expansionCandidates[event.target.value][0];
        setCandidateAction(action);
        setCandidateThought(thought);
        setCandidateValue(event.target.value);
      }
    },
    [numCandidates, entity?.content, entity?.action, expansionCandidates]
  );
  return (
    <Modal
      open={open}
      onAction={onAction}
      nodeType={NodeType.ASSISTANT}
      isBranchNode={entity?.childrenIds.length > 1 ? true : false}
      isRootNode={!entity?.parentId}
      isEndNode={!entity?.childrenIds?.length}
    >
      <div
        className="flex justify-center bg-gray-100 w-full"
        style={{ height: "600px" }}
      >
        <div
          className="flex flex-col pb-8 bg-gray-100 no-scrollbar overflow-scroll"
          style={{ width: "500px" }}
        >
          <div className="flex px-4 w-full items-center justify-between sticky top-0 bg-gray-100 py-2 ">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Previous actions ({filteredActions?.length ?? 0})
            </Typography>
            <div>
              <SearchBar
                placeholder="search actions"
                onChange={
                  onSearchActionChange as unknown as React.ChangeEventHandler
                }
              />
            </div>
          </div>
          <div
            className="mx-2 px-4 pt-4 flex justify-begin bg-grey-900 flex-1"
            style={{ width: "476px" }}
          >
            {filteredActions?.length > 0 ? (
              <ul
                className="flex flex-col items-start gap-4 pl-6 "
                style={{ listStyle: "solid" }}
              >
                {...prevActionsEl}
              </ul>
            ) : (
              <EmptyPlaceholder />
            )}
          </div>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="pb-2 pl-2 pb-8  overflow-y-scroll bg-white">
          <div className="sticky top-0 py-2 bg-white">
            <div className="flex justify-between items-center pb-4">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Action
              </Typography>
              <div className="flex items-center gap-1 pr-2">
                {numCandidates ? (
                  <ListMenu
                    value={candidateValue}
                    handleChange={handleCandidateChange}
                    optionsLength={numCandidates}
                  />
                ) : null}
                <SearchBar
                  placeholder="search content"
                  onChange={
                    onSearchContentChange as unknown as React.ChangeEventHandler
                  }
                />
              </div>
            </div>

            <div
              className=" ml-2 px-2 mr-4 py-2 mb-4 border border-black rounded-lg font-mono overflow-y-scroll no-scrollbar bg-gray-200 text-gray-600"
              style={{ maxHeight: "160px", width: "550px" }}
            >
              {highlightText(candidateAction, searchContentQuery)}
            </div>
            <div className="pt-6">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Thought
              </Typography>
            </div>

            <Divider flexItem />
          </div>

          <div className=" pl-4 h-full" style={{ maxWidth: "576px" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {highlightMarkdown(candidateThought, searchContentQuery)}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </Modal>
  );
};
