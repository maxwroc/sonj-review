import { JsonViewer } from "../index";
import { IPlugin } from "../plugins";

export const expandAll = (): IPlugin => {
    return {
        render: (node: JsonViewer) => {
            node.toggleExpand(true);
        }
    }
}