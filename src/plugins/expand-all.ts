import { IPlugin } from "../plugins";

export const expandAll = (): IPlugin => {
    return {
        afterRender: node => {
            node.toggleExpand(true/*forceExpand*/);
        }
    }
}