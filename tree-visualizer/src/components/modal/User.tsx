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
import { Action } from "../types";

export const UserModal = ({
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

  const onSearchActionChange = React.useCallback((e: React.ChangeEvent) => {
    setActionQuery(e.target?.value);
  }, []);
  const onSearchContentChange = React.useCallback((e: React.ChangeEvent) => {
    setContentQuery(e.target?.value);
  }, []);

  return (
    <Modal
      open={open}
      onAction={onAction}
      nodeType={NodeType.USER}
      isBranchNode={entity?.childrenIds.length > 1 ? true : false}
      isRootNode={!entity?.parentId}
      isEndNode={!entity?.childrenIds?.length}
    >
      <div
        className="flex justify-center bg-gray-100 w-full"
        style={{ height: "500px" }}
      >
        <div className="flex flex-col pb-8 bg-gray-100 no-scrollbar overflow-scroll">
          <div className="flex px-4 items-center justify-between sticky top-0 bg-gray-100 py-2 ">
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Previous actions ({filteredActions?.length ?? 0})
            </Typography>
            <div>
              <SearchBar
                placeholder="search actions"
                onChange={onSearchActionChange}
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
          <div className="flex flex-col gap-2 sticky top-0 py-2 bg-white">
            <div className="flex justify-between items-center">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Observation
              </Typography>
              <div className="pr-2">
                <SearchBar
                  placeholder="search content"
                  onChange={onSearchContentChange}
                />
              </div>
            </div>
            <Divider flexItem />
          </div>

          <div className=" pl-4 mt-4" style={{ width: "576px" }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {highlightMarkdown(entity?.content, searchContentQuery)}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </Modal>
  );
};
