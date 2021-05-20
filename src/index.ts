import { $, MiniQuery } from "./mquery";
import "./style.css";

export class SonjReview {

    private wrapper: MiniQuery;

    private childrenWrapper: MiniQuery;

    constructor(private data: any, private rootName: string) {

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
    }

    toggleExpand() {
        const expandedClassName = "prop-expanded";
        if (this.wrapper.hasClass(expandedClassName)) {
            this.wrapper.removeClass(expandedClassName);
            this.childrenWrapper.clear();
        }
        else {
            this.wrapper.addClass(expandedClassName);
            Object.keys(this.data).forEach(propName => new SonjReview(this.data[propName], propName).render(this.childrenWrapper.elem));
        }
    }
}

