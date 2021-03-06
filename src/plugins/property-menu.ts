import { injectCss } from "../helpers";
import { $, MiniQuery } from "../mquery";
import * as availableMenuItems from "./property-menu-items"

/**
 * Plugin for menu rendered next to each property
 * @returns Menu plugin
 */
export const propertyMenu: SonjReview.IPropertyMenuPluginInitializer = (menuItems: SonjReview.IPropertyMenuItem[] = []): SonjReview.IPlugin => {

    injectCss("propertyMenu", cssCode);

    return new PropertyMenu(menuItems);
}

/**
 * Plugin main class
 */
class PropertyMenu implements SonjReview.IPlugin {

    /**
     * Currently visible menu (it can be the only one)
     */
    private activeMenu: MiniQuery | undefined;

    /**
     * Root node
     */
    private rootNode: SonjReview.IJsonViewer;

    constructor(private menuItems: SonjReview.IPropertyMenuItem[] = []) {
        document.body.addEventListener("click", () => this.closeActiveMenu());

        // adding default menu items
        if (menuItems.length == 0) {
            this.menuItems.push(availableMenuItems.copyName);
            this.menuItems.push(availableMenuItems.copyValue);
            this.menuItems.push(availableMenuItems.copyFormattedValue);
        }
    }

    nodeInit(context: SonjReview.IPluginContext) {
        if (this.rootNode == null) {
            // the first one is the root one
            this.rootNode = context.node;
        }
    }

    afterRender(context: SonjReview.IPluginContext) {
        const btn = $("span")
            .text("...")
            .addClass("prop-menu-button");

        const menuWrapper = $("div")
            .addClass("prop-menu-wrapper")
            .append(btn)
            .appendTo(context.node.header);

        btn.on("click", evt => this.renderMenu(evt as MouseEvent, menuWrapper, context));
    }

    /**
     * Closes currently opened menu
     */
    private closeActiveMenu() {
        if (!this.activeMenu) {
            return;
        }

        this.activeMenu.elem.parentElement?.classList.remove("prop-menu-open");
        this.activeMenu.remove();
        this.activeMenu = undefined;
    }

    /**
     * Renders menu
     * @param evt Mouse event from menu button click
     * @param wrapper Menu wrapper
     * @param context Context for current node
     */
    private renderMenu(evt: MouseEvent, wrapper: MiniQuery, context: SonjReview.IPluginContext) {
        evt.stopPropagation();

        this.closeActiveMenu();

        this.activeMenu = $("div").addClass("prop-menu");

        this.menuItems.forEach(item => {
            if (item.isHidden?.call(item, context)) {
                return;
            }

            const text = typeof(item.text) == "function" ? item.text(context): item.text;
            const isDisabled = item.isDisabled?.call(item, context);
            $("div")
                .text(text)
                .addClass("prop-menu-item", isDisabled ? "disabled" : "enabled")
                .on("click", evt => {
                    item.onClick(context);
                    evt.stopPropagation();
                    !isDisabled && this.closeActiveMenu();
                })
                .appendTo(this.activeMenu!)
            });

        this.activeMenu.appendTo(wrapper);

        wrapper.addClass("prop-menu-open");

        this.adjustPosition();
    }

    /**
     * Adjusts menu position to make sure it is visible
     */
    private adjustPosition() {
        const menuElem = this.activeMenu!.elem;

        const containerRect = this.rootNode.wrapper.elem.getBoundingClientRect();
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

/**
 * Exposing menu items (they can be used with custom menu items)
 */
propertyMenu.items = availableMenuItems;

const cssCode = `
* {
    --sonj-prop-menu-background: var(--sonj-primary-bgcolor);
    --sonj-prop-menu-border: var(--sonj-secondary-bgcolor);
    --sonj-prop-menu-active: var(--sonj-secondary-bgcolor);
    --sonj-prop-menu-active-color: #000;
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
    border: 0px solid var(--sonj-prop-menu-border);
    background-color: var(--sonj-prop-menu-active);
    opacity: 1;
}
.prop-menu {
    color: var(--sonj-secondary-color);
    position: absolute;
    z-index: 1000;
    border-radius: 5px;
    overflow: hidden;
    background-color: var(--sonj-prop-menu-background);
    border: 1px solid var(--sonj-prop-menu-border);
}
.prop-menu-item {
    padding: 2px 5px;
}
.prop-menu-item.enabled:hover {
    background-color: var(--sonj-prop-menu-active);
    color: var(--sonj-prop-menu-active-color);
    cursor: pointer;
}
`;