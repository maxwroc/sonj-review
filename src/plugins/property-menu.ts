import { IPlugin, IPluginContext } from "../plugins";
import { injectCss } from "../helpers";
import { $, MiniQuery } from "../mquery";
import { JsonViewer } from "../json-viwer";

/**
 * Plugin for auto-expanding nodes
 * @param depth Maxmal depth to expand nodes
 * @returns 
 */
export const propertyMenu = (): IPlugin => {

    injectCss("propertyMenu", cssCode);

    return new PropertyMenu();
}

class PropertyMenu implements IPlugin {

    private activeMenu: MiniQuery | undefined;

    private rootNode: JsonViewer;

    private menuItems: IPropertyMenuItem[] = [];

    constructor() {
        document.body.addEventListener("click", () => this.closeActiveMenu());

        this.menuItems.push(copyValue);
        this.menuItems.push(copyFormattedValue);
    }

    nodeInit(context: IPluginContext) {
        if (this.rootNode == null) {
            // the first one is the root one
            this.rootNode = context.node;
        }
    }

    afterRender(context: IPluginContext) {
        const btn = $("span")
            .text("...")
            .addClass("prop-menu-button");

        const menuWrapper = $("div")
            .addClass("prop-menu-wrapper")
            .append(btn)
            .appendTo(context.node.header);

        btn.on("click", evt => this.onButtonClick(evt as MouseEvent, menuWrapper, context));
    }

    private closeActiveMenu() {
        if (!this.activeMenu) {
            return;
        }

        this.activeMenu.elem.parentElement?.classList.remove("prop-menu-open");
        this.activeMenu.remove();
        this.activeMenu = undefined;
    }

    private onButtonClick(evt: MouseEvent, wrapper: MiniQuery, context: IPluginContext) {
        evt.stopPropagation();

        this.closeActiveMenu();

        this.activeMenu = $("div").addClass("prop-menu");

        this.menuItems.forEach(item => {
            if (!item.isVisible(context)) {
                return;
            }

            const isEnabled = item.isEnabled(context);
            $("div")
                .text(item.text)
                .addClass("prop-menu-item", isEnabled ? "enabled" : "disabled")
                .on("click", evt => {
                    item.onClick(context);
                    evt.stopPropagation();
                    isEnabled && this.closeActiveMenu();
                })
                .appendTo(this.activeMenu!)
            });

        this.activeMenu.appendTo(wrapper);

        wrapper.addClass("prop-menu-open");

        this.adjustPosition();
    }

    private adjustPosition() {
        const menuElem = this.activeMenu!.elem;

        const containerRect = this.rootNode.wrapper.elem.parentElement!.getBoundingClientRect();
        const menuRect = menuElem.getBoundingClientRect();

        let style = "";
        if (menuRect.right >= containerRect.right) {
            style += "left: auto; right: 0;"
        }

        if (menuRect.bottom >= containerRect.bottom) {
            style += `bottom: ${menuRect.top - menuElem.parentElement!.getBoundingClientRect().top}px;`
        }

        if (style != "") {
            this.activeMenu!.attr("style", style);
        }
    }
}


const copyValue: IPropertyMenuItem = {
    text: "Copy value",
    isEnabled: context => true,
    isVisible: context => true,
    onClick: context => {
        navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data) : context.node.data);
    }
}

const copyFormattedValue: IPropertyMenuItem = {
    text: "Copy formatted JSON",
    isEnabled: context => true,
    isVisible: context => context.node.isExpandable,
    onClick: context => {
        navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data, null, 2) : context.node.data);
    }
}

interface IPropertyMenuItem {
    text: string;
    isEnabled: (context: IPluginContext) => boolean;
    isVisible: (context: IPluginContext) => boolean;
    onClick: (context: IPluginContext) => void;
}


const cssCode = `
* {
    --soji-prop-menu-background: #fff;
    --soji-prop-menu-border: #b1b1b1;
    --soji-prop-menu-active: #dcdcdc;
}
.prop-menu-wrapper {
    display: inline-block;
    position: relative;
    margin-left: 5px;
}
.prop-menu-button {
    border-radius: 5px;
    padding: 0 5px;
    opacity: 0;
    transition: opacity 0.5s;
    cursor: pointer;
}
.prop-header:hover .prop-menu-button {
    opacity: 1;
}
.prop-header .prop-menu-button:hover,
.prop-menu-open .prop-menu-button {
    border: 1px solid var(--soji-prop-menu-border);
    background-color: var(--soji-prop-menu-active);
    opacity: 1;
}
.prop-menu {
    position: absolute;
    z-index: 1000;
    border-radius: 5px;
    overflow: hidden;
    background-color: var(--soji-prop-menu-background);
    border: 1px solid var(--soji-prop-menu-border);
}
.prop-menu-item {
    padding: 2px 5px;
}
.prop-menu-item.enabled:hover {
    background-color: var(--soji-prop-menu-active);
    color: black;
    cursor: pointer;
}
`;