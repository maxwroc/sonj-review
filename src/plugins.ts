
import { JsonViewer } from "./index"
import { expandAll } from "./plugins/expand-all"
import { search } from "./plugins/search"

export interface IPlugin {
    /**
     * Called when node is rendered
     * @param node 
     */
    afterRender?: { (node: JsonViewer): void };

    /**
     * Called when node is initialized
     */
    nodeInit?: { (node: JsonViewer): void };

    beforeRenderProperties?: { (node: JsonViewer, properties: string[]): string[] };

    afterRenderProperties?: { (node: JsonViewer, properties: string[]): string[] };
}

export {
    expandAll,
    search,
}