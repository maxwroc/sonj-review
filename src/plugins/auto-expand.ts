import { IPlugin } from "../plugins";

export const autoExpand = (depth?: number): IPlugin => {
    return {
        afterRender: node => {
            if (depth && (node.path.split("/").length - 1 >= depth)) {
                return;
            }

            node.toggleExpand(true/*forceExpand*/);
        }
    }
}