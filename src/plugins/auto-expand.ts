import { IPlugin } from "../plugins";

/**
 * Plugin for auto-expanding nodes
 * @param depth Maxmal depth to expand nodes
 * @returns 
 */
export const autoExpand = (depth?: number): IPlugin => {
    return {
        afterRender: context => {
            if (depth && (context.node.path.split("/").length - 1 >= depth)) {
                return;
            }

            context.node.toggleExpand(true/*forceExpand*/);
        }
    }
}