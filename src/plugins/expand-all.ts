import { JsonViewer } from "../index";
import { IPlugin } from "../plugins";

export const expandAll = (): IPlugin => {
    return {
        afterRender: (node: JsonViewer) => {
            node.toggleExpand(true);
        }
    }
}