import { INameValuePair, IPlugin, IPluginContext } from "./plugins";
import { MiniQuery, $ } from "./mquery";

// TODO: this can break if object key/property contains slash
const pathSeparator = "/";

export class JsonViewer {

    /**
     * Main wrapper for this node
     */
    public wrapper: MiniQuery;

    /**
     * Wrapper for all children
     */
    public childrenWrapper: MiniQuery;

    /**
     * Name of the node (property name)
     */
    public nodeName: string;

    /**
     * Header node containing name and value (if it's not expandable node)
     */
    public header: MiniQuery;

    /**
     * Whether node is expandable
     */
    public isExpandable: boolean;

    /**
     * Plugin context data
     */
    public pluginContext: { [key: number]: IPluginContext } = {};

    /**
     * Constructor
     * @param data Node value
     * @param path Node path (with name in the last chunk/part)
     * @param plugins Collection of plugins
     */
    constructor(public data: any, public path: string, public plugins: IPlugin[]) {
        this.nodeName = path.split(pathSeparator).pop() as string;

        switch (typeof(data)) {
            case "bigint":
            case "boolean":
            case "number":
            case "string":
            case "undefined":
                this.isExpandable = false;
                break;
            case "object":
                this.isExpandable = data != null;
                break;
            default:
                throw "Type not supported";
        }
        
        this.plugins.forEach((p, i) => {
            this.pluginContext[i] = { node: this };
            p.nodeInit?.call(p, this.pluginContext[i]);
        });
    }

    /**
     * Renders node
     * @param container Container in which node should be rendered
     */
    render(container: HTMLElement | string) {
        if (typeof(container) == "string") {
            container = document.getElementById(container) as HTMLElement;
        }

        const wrapper = $("div").addClass("prop-wrapper");

        const dataToRender: INameValuePair = {
            name: this.nodeName,
            value: this.data,
        }

        this.plugins.forEach((p, i) => p.beforeRender?.call(p, this.pluginContext[i], dataToRender));

        this.header = $("div")
            .addClass("prop-header")
            .appendTo(wrapper)
            .append($("span").text(dataToRender.name).addClass("prop-name"));

        if (this.isExpandable) {
            this.childrenWrapper = $("div").addClass("prop-children");
            this.header
                .append($("span").addClass("prop-expand")).on("click", () => this.toggleExpand());
            wrapper
                .append(this.childrenWrapper);
        }
        else {
            const textValue = dataToRender.value === undefined ? "undefined" : (dataToRender.value === null ? "null" : dataToRender.value.toString());
            this.header
                .append($("span").text(":").addClass("prop-separator"))
                .append($("span").addClass("prop-value", "prop-type-" + typeof(dataToRender.value)).text(textValue));
        }

        this.wrapper = wrapper;

        // update DOM only once at the end
        container.appendChild(this.wrapper.elem);

        this.plugins.forEach((p, i) => p.afterRender?.call(p, this.pluginContext[i]))
    }

    /**
     * Shows or hides node properties/children
     * @param expand Whether to force expand/collapse
     */
    toggleExpand(expand?: boolean): void {
        if (!this.isExpandable) {
            return;
        }

        const expandedClassName = "prop-expanded";

        const currentlyExpanded = this.wrapper.hasClass(expandedClassName);
        expand = expand === undefined ? !currentlyExpanded : expand;

        if (expand == currentlyExpanded) {
            return;
        }

        if (expand) {
            this.wrapper.addClass(expandedClassName);

            let propsToRender = Object.keys(this.data);

            this.plugins
                .filter(p => p.beforeRenderProperties)
                .forEach((p, i) => propsToRender = p.beforeRenderProperties!(this.pluginContext[i], propsToRender));

            this.renderProperties(this.childrenWrapper, propsToRender);

            this.plugins.forEach((p, i) => p.afterRenderProperties?.call(p, this.pluginContext[i], propsToRender));
        }
        else {
            this.wrapper.removeClass(expandedClassName);
            this.childrenWrapper.empty();
        }

        this.plugins.forEach((p, i) => p.afterToggleExpand?.call(p, this.pluginContext[i], !!expand));
    }

    /**
     * Renders node properties
     * @param conatiner Container in which properties will be added
     * @param propsToRender List of properties to render
     */
    renderProperties(conatiner: MiniQuery, propsToRender: string[]) {
        propsToRender.forEach(propName => 
            new JsonViewer(this.data[propName], this.path + pathSeparator + propName, this.plugins).render(conatiner.elem));
    }
}