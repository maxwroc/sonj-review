
import { JsonViewer } from "./index"
import { autoExpand } from "./plugins/auto-expand"
import { propertyGroups } from "./plugins/property-groups"
import { propertyTeaser } from "./plugins/property-teaser"
import { search } from "./plugins/search"
import { truncate } from "./plugins/truncate"

export interface IPlugin {
    /**
     * Called when node is initialized
     * @param node Node for which event is triggered
     */
    nodeInit?: { (context: IPluginContext): void };

    /**
     * Called before node is rendered
     * @param node Node for which event is triggered
     * @param nodeNameValue Node name and it's value to render (can be modified in the plugin)
     */
    beforeRender?: { (context: IPluginContext, nodeNameValue: INameValuePair): void }

    /**
     * Called when node is rendered
     * @param node Node for which event is triggered
     */
    afterRender?: { (context: IPluginContext): void };

    /**
     * Called before rendering properties
     * @param node Node for which event is triggered
     * @param propertiesToRender Properties to render
     * @returns Properties to render
     */
    beforeRenderProperties?: { (context: IPluginContext, propertiesToRender: string[]): string[] };

    /**
     * Called after properties were rendered
     * @param node Node for which event is triggered
     * @param renderedProperties Rendered properties
     */
    afterRenderProperties?: { (context: IPluginContext, renderedProperties: string[]): void };

    /**
     * Called after expanding/collapsing node
     */
    afterToggleExpand?: { (context: IPluginContext, expanded: boolean): void };
}

export interface INameValuePair {
    name: string;
    value: any;
}

export {
    autoExpand,
    search,
    propertyGroups,
    propertyTeaser,
    truncate,
}

export interface IPluginContext {
    node: JsonViewer;
    [key: string]: any;
}