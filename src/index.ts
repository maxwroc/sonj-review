import "./style.css";

const ce = (tagName: string, appendTo?: HTMLElement) => {
    const elem = document.createElement(tagName);
    appendTo && appendTo.appendChild(elem);
    return elem;
}

const simpleTypes = ["boolean", "number", "string"];

const nameElement = (name: string) => {
    const elem = document.createElement("DIV");

}

class MiniQuery {

    public elem: HTMLElement; 

    constructor(input: string) {
        this.elem = document.createElement(input);
    }

    appendTo(target: MiniQuery) {
        target.elem.appendChild(this.elem);
        return this;
    }

    append(child: MiniQuery) {
        this.elem.appendChild(child.elem);
        return this;
    }

    on(eventName: string, handler: (evt: Event) => void) {
        this.elem.addEventListener(eventName, handler);
        return this;
    }

    text(input: string) {
        this.elem.textContent = input;
        return this;
    }

    addClass(...input: string[]) {
        input.forEach(c => this.elem.classList.add(c));
        return this;
    }

    removeClass(input: string) {
        this.elem.classList.remove(input);
        return this;
    }

    hasClass(input: string): boolean {
        return this.elem.classList.contains(input);
    }

    clear() {
        this.elem.innerHTML = "";
    }
}

const $ = (input: string) => new MiniQuery(input);

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

    private renderSimpleType() {

    }

    private renderObjectProperties() {
        
    }
}

