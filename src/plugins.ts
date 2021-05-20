
import { JsonViewer } from "./index"
import { expandAll } from "./plugins/expand-all"
import { search } from "./plugins/search"

export interface IPlugin {
    /**
     * Called when node is rendered
     * @param node 
     */
    render?: { (node: JsonViewer): void };

    /**
     * Called when node is initialized
     */
    init?: { (node: JsonViewer): void };

    beforeRenderProperties?: { (node: JsonViewer): boolean };
}

export {
    expandAll,
    search,
}