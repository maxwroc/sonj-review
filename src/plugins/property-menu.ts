import { IPlugin, IPluginContext } from "../plugins";
import { injectCss } from "../helpers";
import { $, MiniQuery } from "../mquery";

/**
 * Plugin for auto-expanding nodes
 * @param depth Maxmal depth to expand nodes
 * @returns 
 */
export const propertyMenu = (): IPlugin => {

    injectCss("propertyMenu", cssCode);

    return new PropertyMenu();
}

const cssCode = `
* {
    --soji-prop-menu-background: #fff;
    --soji-prop-menu-border: #727272;
    --soji-prop-menu-active: #dcdcdc;
}
.prop-menu-wrapper {
    display: inline-block;
    position: relative;
}
.prop-menu-button {
    border-radius: 5px;
    padding: 0 5px;
    margin: 0 5px;
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
    left: 5px;
    position: absolute;
    z-index: 1000;
    border-radius: 5px;
    overflow: hidden;
    background-color: var(--soji-prop-menu-background);
    border: 1px solid var(--soji-prop-menu-border);
}
.prop-menu-item {
    padding: 0 5px;
}
.prop-menu-item.enabled:hover {
    background-color: var(--soji-prop-menu-active);
    color: black;
    cursor: pointer;
}
`;

class PropertyMenu {

    private activeMenu: MiniQuery | undefined;

    private menuItems: IPropertyMenuItem[] = [];

    constructor() {
        document.body.addEventListener("click", () => this.closeActiveMenu());

        this.menuItems.push(copyValue);
        this.menuItems.push(copyFormattedValue);
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
    }
}


const copyValue: IPropertyMenuItem = {
    text: "Copy value",
    isEnabled: context => true,
    onClick: context => {
        navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data) : context.node.data);
    }
}

const copyFormattedValue: IPropertyMenuItem = {
    text: "Copy formatted value",
    isEnabled: context => {
        return context.node.isExpandable;
    },
    onClick: context => {
        navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data, null, 2) : context.node.data);
    }
}

interface IPropertyMenuItem {
    text: string;
    isEnabled: (context: IPluginContext) => boolean;
    onClick: (context: IPluginContext) => void;
}