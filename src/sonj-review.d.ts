
declare module SonjReview {

    export var JsonViewer: IJsonViewerConstructor;

    export var plugins: { 
        autoExpand: IAutoExpandPluginInitializer;
        search: ISearchPluginInitializer;
        propertyGroups: IPropertyGroupsPluginInitializer;
        propertyTeaser: ITeaserPluginInitializer;
        truncate: ITruncatePluginInitializer,
        propertyMenu: IPropertyMenuPluginInitializer;
        [name: string]: IPluginInitializer;
    };
    
    interface IJsonViewerConstructor {
        /**
         * Initializes JsonViewer class
         * @param data Object to display as JSON
         * @param rootNodeName Name of the root node
         * @param plugins List of the plugins
         */
         new(data: any, rootNodeName: string, plugins: IPlugin[]): IJsonViever;
    }

    interface IJsonViever {         
        /**
         * Main wrapper for this node
         */
        wrapper: IMiniQuery;

        /**
         * Wrapper for all children
         */
        childrenWrapper: IMiniQuery;

        /**
         * Name of the node (property name)
         */
        nodeName: string;

        /**
         * Header node containing name and value (if it's not expandable node)
         */
        header: IMiniQuery;

        /**
         * Whether node is expandable
         */
        isExpandable: boolean;

        data: any;
        
        path: string;
        
        plugins: SonjReview.IPlugin[];

        /**
         * Plugin context data
         */
        pluginContext: { [key: number]: IPluginContext };

        /**
         * Renders node
         * @param container Container in which node should be rendered
         */
        render(container: HTMLElement | string): void;

        /**
         * Shows or hides node properties/children
         * @param expand Whether to force expand/collapse
         */
        toggleExpand(expand?: boolean): void;

        /**
         * Renders node properties
         * @param conatiner Container in which properties will be added
         * @param propsToRender List of properties to render
         */
        renderProperties(conatiner: IMiniQuery, propsToRender: string[]): void;
    }


    interface IMiniQuery {
        elem: HTMLElement; 

        attr(name: string, value: string): IMiniQuery;

        appendTo(target: IMiniQuery): IMiniQuery;

        append(child: IMiniQuery | IMiniQuery[]): IMiniQuery;

        on(eventName: string, handler: (evt: Event) => void): IMiniQuery;

        text(input: string): IMiniQuery;

        addClass(...input: string[]): IMiniQuery;

        removeClass(input: string): IMiniQuery;

        hasClass(input: string): boolean;

        empty(): IMiniQuery;

        remove(): void;
    }

    interface IPluginInitializer {
        (...params: any[]): IPlugin;
    }

    interface IPlugin {
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

    interface IPluginContext {
        node: IJsonViever;
        [key: string]: any;
    }

    interface INameValuePair {
        name: string;
        value: any;
    }

    /** PLUGIN INTERFACES */

    interface ISearchPluginInitializer {
        (data: any): ISearchPlugin;
    }
    interface ISearchPlugin extends IPlugin {
        query: (searchString: string) => Promise<string[]>;
    }

    interface ITeaserPluginInitializer {
        (options: ITeaserOptions): IPlugin;
    }
    interface ITeaserOptions {
        /**
         * Properties which values will be displayed
         */
        properties?: ITeaserPropertiesOptions;
    
        /**
         * Whether to show counts (of array elements )
         */
        showCounts?: boolean;
    }
    interface ITeaserPropertiesOptions {
        /**
         * Names of properties to show
         */
        names: string[];
    
        /**
         * Maximum number of properties to show
         */
        maxCount?: number;
    
        /**
         * Whether to print property names next to values
         */
        printNames?: boolean;
    }
    
    interface IPropertyMenuPluginInitializer {
        (menuItems?: IPropertyMenuItem[]): IPlugin
    }
    interface IPropertyMenuItem {
        text: string;
        isDisabled?: (context: SonjReview.IPluginContext) => boolean;
        isHidden?: (context: SonjReview.IPluginContext) => boolean;
        onClick: (context: SonjReview.IPluginContext) => void;
    }

    interface IPropertyGroupsPluginInitializer {
        (maxPropertiesCount: number): IPlugin
    }

    interface IAutoExpandPluginInitializer {
        (depth?: number): IPlugin
    }

    interface ITruncatePluginInitializer {
        (options: ITruncateOptions): IPlugin
    }
    
    interface ITruncateOptions {
        /**
         * Maximum length of node name
         */
        maxNameLength?: number;

        /**
         * Maximum length of node value
         */
        maxValueLength?: number;

        /**
         * Whether to show length (on hover) when truncated
         */
        showLength?: boolean;

        /**
         * Whether to make length info button clickable
         */
        enableShowFull?: boolean | string;
    }
}