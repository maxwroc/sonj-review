import { IPlugin } from "./plugins";
import { MiniQuery, $ } from "./mquery";

export class JsonViewer {

    public wrapper: MiniQuery;

    public childrenWrapper: MiniQuery;

    public nodeName: string;

    constructor(public data: any, public path: string, public plugins: IPlugin[]) {
        this.nodeName = path.split("/").pop() as string;
        this.plugins.forEach(p => p.nodeInit?.call(null, this));
    }

    render(container: HTMLElement | string) {
        if (typeof(container) == "string") {
            container = document.getElementById(container) as HTMLElement;
        }

        const wrapper = $("div").addClass("prop-wrapper");
        const header = $("div")
            .addClass("prop-header")
            .appendTo(wrapper)
            .append($("span").text(this.nodeName).addClass("prop-name"));

        switch (typeof(this.data)) {
            case "bigint":
            case "boolean":
            case "number":
            case "string":
                header
                    .append($("span").text(":").addClass("prop-separator"))
                    .append($("span").addClass("prop-value", "prop-type-" + typeof(this.data)).text(this.data as string));
                break;
            case "object":
                this.childrenWrapper = $("div").addClass("prop-children");
                header
                    .append($("span").addClass("prop-expand")).on("click", () => this.toggleExpand());
                wrapper
                    .append(this.childrenWrapper);
                break;
            default:
                throw "Type not supported";
        }

        this.wrapper = wrapper;

        // update DOM only once at the end
        container.appendChild(this.wrapper.elem);

        this.plugins.forEach(p => p.afterRender?.call(null, this))
    }

    toggleExpand(expand?: boolean) {
        if (!this.childrenWrapper) {
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
                .forEach(p => propsToRender = p.beforeRenderProperties!(this, propsToRender));

            this.renderProperties(this.childrenWrapper, propsToRender);

            this.plugins.forEach(p => p.afterRenderProperties?.call(null, this, propsToRender));
        }
        else {
            this.wrapper.removeClass(expandedClassName);
            this.childrenWrapper.empty();
        }
    }

    renderProperties(conatiner: MiniQuery, propsToRender: string[]) {
        propsToRender.forEach(propName => 
            new JsonViewer(this.data[propName], this.path + "/" + propName, this.plugins).render(conatiner.elem));
    }
}