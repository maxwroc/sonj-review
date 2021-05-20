import { IPlugin } from "./plugins";
import { MiniQuery, $ } from "./mquery";

export class JsonViewer {

    public wrapper: MiniQuery;

    public childrenWrapper: MiniQuery;

    public rootName: string;

    constructor(public data: any, public path: string, public plugins: IPlugin[]) {
        this.rootName = path.split("/").pop() as string;
        this.plugins.forEach(p => p.init?.call(null, this));
    }

    render(container: HTMLElement | string) {
        if (typeof(container) == "string") {
            container = document.getElementById(container) as HTMLElement;
        }

        const wrapper = $("div").addClass("prop-wrapper");
        const header = $("div")
            .addClass("prop-header")
            .appendTo(wrapper)
            .append($("span").text(this.rootName).addClass("prop-name"));

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

        this.plugins.forEach(p => p.render?.call(null, this))
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

            const blockRendering = this.plugins.some(p => p.beforeRenderProperties?.call(null, this));

            if (!blockRendering) {
                this.renderProperties(this.childrenWrapper, Object.keys(this.data));
            }
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

    private getPropertyGroupsToRender() {
        let groups: string[][] = [];
        groups.push(Object.keys(this.data));
        //this.plugins.forEach(p => p.)
    }
}