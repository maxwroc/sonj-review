
import { JsonViewer } from "./index"
import { expandAll } from "./plugins/expand-all"
import { propertyGroups } from "./plugins/property-groups"
import { search } from "./plugins/search"

export interface IPlugin {
    /**
     * Called when node is initialized
     * @param node Node for which event is triggered
     */
    nodeInit?: { (node: JsonViewer): void };

    /**
     * Called when node is rendered
     * @param node Node for which event is triggered
     */
    afterRender?: { (node: JsonViewer): void };

    /**
     * Called before rendering properties
     * @param node Node for which event is triggered
     * @param propertiesToRender Properties to render
     * @returns Properties to render
     */
    beforeRenderProperties?: { (node: JsonViewer, propertiesToRender: string[]): string[] };

    /**
     * Called after properties were rendered
     * @param node Node for which event is triggered
     * @param renderedProperties Rendered properties
     */
    afterRenderProperties?: { (node: JsonViewer, renderedProperties: string[]): void };
}

export {
    expandAll,
    search,
    propertyGroups,
}