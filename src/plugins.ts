
import { JsonViewer } from "./index"
import { autoExpand } from "./plugins/auto-expand"
import { propertyGroups } from "./plugins/property-groups"
import { propertyTeaser } from "./plugins/property-teaser"
import { search } from "./plugins/search"
import { $ } from "./mquery"

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

    /**
     * Called after expanding/collapsing node
     */
    afterToggleExpand?: { (node: JsonViewer, expanded: boolean): void };
}

export {
    autoExpand,
    search,
    propertyGroups,
    propertyTeaser,
}