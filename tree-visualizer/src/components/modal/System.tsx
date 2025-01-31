import * as React from "react";
import Typography from "@mui/material/Typography";
import Modal from "./BaseModal";
import { OnAction, StringAnyMap } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Divider from "@mui/material/Divider";
import "./styles.css";
import rehypeRaw from "rehype-raw";
import { SearchBar } from "../core/SearchBar";

//utils
import { highlightMarkdown } from "../utils/searchUtils";

//Constants
import { NodeType } from "../constants";

//Types
import { Action } from "@/components/types";

export const SystemModal = ({
  open,
  onAction: _onAction,
  entity,
}: {
  open: boolean;
  onAction: OnAction;
  className?: string;
  entity: StringAnyMap | null;
}) => {
  const [searchQuery, setQuery] = React.useState<string | undefined>();

  const onAction = React.useCallback(
    (action: Action) => _onAction({ ...action, payload: { ...entity } }),
    [entity, _onAction]
  );

  const onSearchChange = React.useCallback((e: React.ChangeEvent) => {
    setQuery(e.target?.value);
  }, []);

  return (
    <Modal
      open={open}
      onAction={onAction}
      nodeType={NodeType.SYSTEM}
      isBranchNode={entity?.childrenIds.length > 1 ? true : false}
      isRootNode={!entity?.parentId}
      isEndNode={!entity?.childrenIds?.length}
    >
      <div className="flex justify-between" style={{ height: "600px" }}>
        <div className="pb-2 pl-2 pb-8  overflow-y-scroll bg-white">
          <div className="sticky top-0 py-2 bg-white">
            <div className="flex justify-between items-center pb-1">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Action
              </Typography>
              <div className="flex items-center gap-1 pr-2">
                <SearchBar
                  placeholder="search content"
                  onChange={onSearchChange}
                />
              </div>
            </div>
            <Divider flexItem />
            <div className="pl-6 text-gray-500 pt-4 text-xl">
              This is an initial prompt given to the system
            </div>
            <div className="pt-6">
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Content
              </Typography>
            </div>

            <Divider flexItem />
          </div>

          <div
            className=" pl-8 h-128 overflow-x-scroll no-scrollbar"
            style={{
              maxWidth: "1100px",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {highlightMarkdown(entity?.content, searchQuery)}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </Modal>
  );
};
