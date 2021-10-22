var SonjReview = (function (exports) {
    'use strict';

    class MiniQuery {
        constructor(input) {
            if (typeof (input) == "string") {
                this.elem = document.createElement(input);
            }
            else {
                this.elem = input;
            }
        }
        attr(name, value) {
            this.elem.setAttribute(name, value);
            return this;
        }
        appendTo(target) {
            target.elem.appendChild(this.elem);
            return this;
        }
        append(child) {
            if (Array.isArray(child)) {
                child.forEach(c => this.elem.appendChild(c.elem));
            }
            else {
                this.elem.appendChild(child.elem);
            }
            return this;
        }
        on(eventName, handler) {
            this.elem.addEventListener(eventName, handler);
            return this;
        }
        text(input) {
            this.elem.textContent = input;
            return this;
        }
        addClass(...input) {
            input.forEach(c => this.elem.classList.add(c));
            return this;
        }
        removeClass(input) {
            this.elem.classList.remove(input);
            return this;
        }
        hasClass(input) {
            return this.elem.classList.contains(input);
        }
        empty() {
            this.elem.innerHTML = "";
            return this;
        }
        remove() {
            var _a;
            (_a = this.elem.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.elem);
        }
    }
    const $ = (input) => new MiniQuery(input);

    // TODO: this can break if object key/property contains slash
    const pathSeparator = "/";
    class JsonViewer {
        /**
         * Constructor
         * @param data Node value
         * @param path Node path (with name in the last chunk/part)
         * @param plugins Collection of plugins
         */
        constructor(data, path, plugins) {
            this.data = data;
            this.path = path;
            this.plugins = plugins;
            /**
             * Plugin context data
             */
            this.pluginContext = {};
            this.nodeName = path.split(pathSeparator).pop();
            switch (typeof (data)) {
                case "bigint":
                case "boolean":
                case "number":
                case "string":
                case "undefined":
                    this.isExpandable = false;
                    break;
                case "object":
                    this.isExpandable = data != null && Object.keys(data).length > 0;
                    break;
                default:
                    throw "Type not supported";
            }
            this.plugins.forEach((p, i) => {
                var _a;
                this.pluginContext[i] = { node: this };
                (_a = p.nodeInit) === null || _a === void 0 ? void 0 : _a.call(p, this.pluginContext[i]);
            });
        }
        /**
         * Renders node
         * @param container Container in which node should be rendered
         */
        render(container) {
            if (typeof (container) == "string") {
                container = document.getElementById(container);
                if (!container) {
                    throw new Error(`Container element with id '${container}' not found`);
                }
            }
            const wrapper = $("div").addClass("prop-wrapper");
            const dataToRender = {
                name: this.nodeName,
                value: this.data,
            };
            this.plugins.forEach((p, i) => { var _a; return (_a = p.beforeRender) === null || _a === void 0 ? void 0 : _a.call(p, this.pluginContext[i], dataToRender); });
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
                this.header
                    .append($("span").text(":").addClass("prop-separator"))
                    .append($("span").addClass("prop-value", "prop-type-" + typeof (dataToRender.value)).text(getTextValue(dataToRender.value)));
            }
            this.wrapper = wrapper;
            // update DOM only once at the end
            container.appendChild(this.wrapper.elem);
            this.plugins.forEach((p, i) => { var _a; return (_a = p.afterRender) === null || _a === void 0 ? void 0 : _a.call(p, this.pluginContext[i]); });
        }
        /**
         * Shows or hides node properties/children
         * @param expand Whether to force expand/collapse
         */
        toggleExpand(expand) {
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
                this.plugins.forEach((p, i) => {
                    if (p.beforeRenderProperties) {
                        propsToRender = p.beforeRenderProperties(this.pluginContext[i], propsToRender);
                    }
                });
                this.renderProperties(this.childrenWrapper, propsToRender);
                this.plugins.forEach((p, i) => { var _a; return (_a = p.afterRenderProperties) === null || _a === void 0 ? void 0 : _a.call(p, this.pluginContext[i], propsToRender); });
            }
            else {
                this.wrapper.removeClass(expandedClassName);
                this.childrenWrapper.empty();
            }
            this.plugins.forEach((p, i) => { var _a; return (_a = p.afterToggleExpand) === null || _a === void 0 ? void 0 : _a.call(p, this.pluginContext[i], !!expand); });
        }
        /**
         * Renders node properties
         * @param conatiner Container in which properties will be added
         * @param propsToRender List of properties to render
         */
        renderProperties(conatiner, propsToRender) {
            propsToRender.forEach(propName => new JsonViewer(this.data[propName], this.path + pathSeparator + propName, this.plugins).render(conatiner.elem));
        }
    }
    const getTextValue = (val) => {
        if (val === undefined) {
            return "undefined";
        }
        if (val === null) {
            return "null";
        }
        if (typeof (val) == "object") {
            if (Array.isArray(val)) {
                return "[]";
            }
            return "{}";
        }
        return val.toString();
    };

    /**
     * Plugin for auto-expanding nodes
     * @param depth Maxmal depth to expand nodes
     * @returns
     */
    const autoExpand = (depth) => {
        return {
            afterRender: context => {
                if (depth && (context.node.path.split("/").length - 1 >= depth)) {
                    return;
                }
                context.node.toggleExpand(true /*forceExpand*/);
            }
        };
    };

    const injectCss = (pluginName, cssCode) => {
        const cssId = `sonj-${pluginName}-css`;
        if (!document.getElementById(cssId)) {
            document.head.appendChild($("style").attr("id", cssId).text(cssCode).elem);
        }
    };

    /**
     * Property groups plugin
     *
     * @summary It prevents from rendering big number of properties by adding an expandable groups instead
     *
     * @param maxPropertiesCount Maximum number of properties to render
     * @returns Initialized plugin
     */
    const propertyGroups = (maxPropertiesCount) => {
        injectCss("propertyGroups", cssCode);
        return {
            beforeRenderProperties: (context, propertiesToRender) => {
                // store collection of properties for afterRenderProperties processing
                context.propsToRender = propertiesToRender;
                // render only max number of properties 
                return propertiesToRender.slice(0, maxPropertiesCount);
            },
            afterRenderProperties: (context, renderedProperties) => {
                const path = context.node.path;
                let nodePropsToRender = context.propsToRender;
                delete context.propsToRender;
                // check if there is anything what was not rendered already
                if (!nodePropsToRender || nodePropsToRender.length <= maxPropertiesCount) {
                    return;
                }
                let groupStart = maxPropertiesCount;
                // rendering groups
                do {
                    nodePropsToRender = nodePropsToRender.slice(maxPropertiesCount);
                    let propsToRenderInGroup = nodePropsToRender.slice(0, maxPropertiesCount);
                    // group container
                    const wrapper = $("div");
                    // group clickable element / button
                    $("span")
                        .text(`${groupStart + 1} - ${groupStart + propsToRenderInGroup.length}`)
                        .addClass("prop-group", "prop-pill")
                        .on("click", () => {
                        // removing group button
                        wrapper.empty();
                        // rendering properties in the group
                        context.node.renderProperties(wrapper, propsToRenderInGroup);
                    })
                        .appendTo(wrapper);
                    wrapper.appendTo(context.node.childrenWrapper);
                    groupStart += maxPropertiesCount;
                } while (nodePropsToRender.length > maxPropertiesCount);
            }
        };
    };
    const cssCode = `
.prop-group {
    margin: 2px 0 0 var(--sonj-prop-indent);
    display: inline-block;
    white-space: nowrap;
}
`;

    /**
     * Plugin for showing short onformation about the expandable node
     * @param options Plugin options
     * @returns Plugin instance
     */
    const propertyTeaser = (options) => {
        injectCss("propertyTeaser", cssCode$1);
        const getText = (data) => {
            const parts = [
                options.showCounts === false ? "" : getPropertyCount(data),
                getSelectedProperties(data, options)
            ].filter(p => p != "");
            return parts.join(" ");
        };
        return {
            afterRender: context => {
                if (context.node.isExpandable) {
                    $("span")
                        .addClass("prop-value-teaser")
                        .text(getText(context.node.data))
                        .appendTo(context.node.header);
                }
            }
        };
    };
    const getPropertyCount = (data) => Array.isArray(data) ? `[${data.length}]` : `{${Object.keys(data).length}}`;
    const getSelectedProperties = (data, options) => {
        if (!options.properties) {
            return "";
        }
        let values = options.properties.names
            .filter(p => data[p] != undefined && data[p] != "")
            .map(p => ((options.properties.printNames ? p + ":" : "") + data[p]));
        if (options.properties.maxCount) {
            values = values.slice(0, options.properties.maxCount);
        }
        return trimString(values.map(v => trimString(v, options.properties.maxValueLength)).join(", "), options.maxTotalLenght);
    };
    const cssCode$1 = `
.prop-expanded > * > .prop-value-teaser {
    display: none;
}
.prop-value-teaser {
    margin: 0 5px;
    color: var(--sonj-primary-color);
}
`;
    const trimString = (text, maxLength) => {
        if (!maxLength || !text || text.length <= maxLength) {
            return text;
        }
        return text.substr(0, maxLength - 3) + "...";
    };

    /**
     * Plugin for menu rendered next to each property
     * @returns Menu plugin
     */
    const propertyMenu = (menuItems = []) => {
        injectCss("propertyMenu", cssCode$2);
        return new PropertyMenu(menuItems);
    };
    /**
     * Plugin main class
     */
    class PropertyMenu {
        constructor(menuItems = []) {
            this.menuItems = menuItems;
            document.body.addEventListener("click", () => this.closeActiveMenu());
            // adding default menu items
            if (menuItems.length == 0) {
                this.menuItems.push(copyName);
                this.menuItems.push(copyValue);
                this.menuItems.push(copyFormattedValue);
            }
        }
        nodeInit(context) {
            if (this.rootNode == null) {
                // the first one is the root one
                this.rootNode = context.node;
            }
        }
        afterRender(context) {
            const btn = $("span")
                .text("...")
                .addClass("prop-menu-button");
            const menuWrapper = $("div")
                .addClass("prop-menu-wrapper")
                .append(btn)
                .appendTo(context.node.header);
            btn.on("click", evt => this.renderMenu(evt, menuWrapper, context));
        }
        /**
         * Closes currently opened menu
         */
        closeActiveMenu() {
            var _a;
            if (!this.activeMenu) {
                return;
            }
            (_a = this.activeMenu.elem.parentElement) === null || _a === void 0 ? void 0 : _a.classList.remove("prop-menu-open");
            this.activeMenu.remove();
            this.activeMenu = undefined;
        }
        /**
         * Renders menu
         * @param evt Mouse event from menu button click
         * @param wrapper Menu wrapper
         * @param context Context for current node
         */
        renderMenu(evt, wrapper, context) {
            evt.stopPropagation();
            this.closeActiveMenu();
            this.activeMenu = $("div").addClass("prop-menu");
            this.menuItems.forEach(item => {
                var _a, _b;
                if ((_a = item.isHidden) === null || _a === void 0 ? void 0 : _a.call(item, context)) {
                    return;
                }
                const isDisabled = (_b = item.isDisabled) === null || _b === void 0 ? void 0 : _b.call(item, context);
                $("div")
                    .text(item.text)
                    .addClass("prop-menu-item", isDisabled ? "disabled" : "enabled")
                    .on("click", evt => {
                    item.onClick(context);
                    evt.stopPropagation();
                    !isDisabled && this.closeActiveMenu();
                })
                    .appendTo(this.activeMenu);
            });
            this.activeMenu.appendTo(wrapper);
            wrapper.addClass("prop-menu-open");
            this.adjustPosition();
        }
        /**
         * Adjusts menu position to make sure it is visible
         */
        adjustPosition() {
            const menuElem = this.activeMenu.elem;
            const containerRect = this.rootNode.wrapper.elem.getBoundingClientRect();
            const menuRect = menuElem.getBoundingClientRect();
            let style = "";
            if (menuRect.right >= containerRect.right) {
                style += "left: auto; right: 0;";
            }
            if (menuRect.bottom >= containerRect.bottom) {
                style += `bottom: ${menuRect.top - menuElem.parentElement.getBoundingClientRect().top}px;`;
            }
            if (style != "") {
                this.activeMenu.attr("style", style);
            }
        }
    }
    const copyName = {
        text: "Copy name",
        onClick: context => {
            navigator.clipboard.writeText(context.node.nodeName);
        }
    };
    const copyValue = {
        text: "Copy value",
        onClick: context => {
            navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data) : context.node.data);
        }
    };
    const copyFormattedValue = {
        text: "Copy formatted JSON",
        isHidden: context => !context.node.isExpandable,
        onClick: context => {
            navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data, null, 2) : context.node.data);
        }
    };
    /**
     * Exposing menu items (they can be used with custom menu items)
     */
    (propertyMenu["items"]) = { copyName, copyValue, copyFormattedValue };
    const cssCode$2 = `
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

    const search = (data) => {
        let rootNode = null;
        let pathsToShow = null;
        return {
            nodeInit: context => {
                if (rootNode == null) {
                    // the first one is the root one
                    rootNode = context.node;
                }
            },
            afterRender: context => {
                pathsToShow && context.node.toggleExpand(true);
            },
            beforeRenderProperties: (context, props) => {
                if (!pathsToShow) {
                    return props;
                }
                return props
                    .filter(p => pathsToShow === null || pathsToShow === void 0 ? void 0 : pathsToShow.some(path => path.startsWith(context.node.path + "/" + p)));
            },
            query: searchString => {
                if (!rootNode) {
                    throw "Root node not initialized";
                }
                // collapse root node
                rootNode.toggleExpand(false);
                let resultPromise = searchInternal(data, rootNode.path, searchString)
                    .then(paths => {
                    // set the collection off paths to show
                    pathsToShow = paths;
                    // trigger expand
                    pathsToShow.length && (rootNode === null || rootNode === void 0 ? void 0 : rootNode.toggleExpand(true));
                    // disable property filtering
                    pathsToShow = null;
                    return paths;
                });
                resultPromise.catch(() => {
                    pathsToShow = null;
                });
                return resultPromise;
            }
        };
    };
    function searchInternal(data, root, query) {
        return new Promise((resolve, reject) => {
            const result = getValueLocations(data, root, query);
            resolve(result);
        });
    }
    /**
     * Search function which walks through given object and finds locations of the nodes containing query string
     * @param data Data object to be searched
     * @param path Current path
     * @param query Searched query
     */
    function getValueLocations(data, path, query) {
        let results = [];
        switch (typeof data) {
            case "object":
                if (data == null) {
                    return results;
                }
                Object.keys(data).forEach(k => {
                    const propPath = `${path}/${k}`;
                    if (k.includes(query)) {
                        results.push(propPath);
                    }
                    else {
                        results = results.concat(getValueLocations(data[k], `${path}/${k}`, query));
                    }
                });
                break;
            case "number":
                data = data.toString();
            case "string":
                if (data.includes(query)) {
                    results.push(path);
                }
                break;
        }
        return results;
    }

    /**
     * Plugin for truncating long node name and/or value
     * @param options Plugin options
     * @returns Plugin instance
     */
    const truncate = (options) => {
        injectCss("truncatePlugin", cssCode$3);
        options = Object.assign({ maxNameLength: 20, maxValueLength: 40 }, options);
        const maxNameLength = options.maxNameLength;
        const maxValueLength = options.maxValueLength;
        return {
            beforeRender: (context, dataToRender) => {
                if (maxNameLength && dataToRender.name.length > maxNameLength) {
                    context.fullNameLength = dataToRender.name.length;
                    dataToRender.name = dataToRender.name.substr(0, maxNameLength - 3) + "...";
                }
                if (context.node.isExpandable || dataToRender.value === null || dataToRender.value === undefined) {
                    // when node is expandable we don't want to touch it's value
                    return;
                }
                const val = dataToRender.value.toString();
                if (maxValueLength && val.length > maxValueLength) {
                    context.fullValueLength = val.length;
                    dataToRender.value = val.substr(0, maxValueLength - 3) + "...";
                }
            },
            afterRender: (context) => {
                if (!options.showLength || (!context.fullNameLength && !context.fullValueLength)) {
                    return;
                }
                if (context.fullValueLength) {
                    addLengthInfoPill(context, false, context.fullValueLength, options.enableShowFull);
                }
                if (context.fullNameLength) {
                    addLengthInfoPill(context, true, context.fullNameLength, options.enableShowFull);
                }
            }
        };
    };
    function addLengthInfoPill(context, isNameElement, length, enableShowingFull) {
        const targetElem = $(context.node.header.elem.querySelector(isNameElement ? ".prop-name" : ".prop-value"));
        targetElem.addClass("prop-truncated");
        const pill = $("span")
            .addClass("prop-pill", "prop-length")
            .text(formatBytes(length))
            .appendTo(targetElem);
        if (enableShowingFull) {
            pill
                .addClass("prop-clickable")
                .attr("title", typeof (enableShowingFull) == "string" ? enableShowingFull : "Show full value")
                .on("click", () => {
                targetElem.empty().text(isNameElement ? context.node.nodeName : context.node.data);
            });
        }
    }
    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0)
            return "0";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + (sizes[i] ? " " + sizes[i] : "");
    }
    const cssCode$3 = `
.prop-truncated {
    position: relative;
}
.prop-length {
    position: absolute;
    right: 0;
    opacity: 0;
    transition: opacity 0.5s;
}
.prop-name:hover .prop-length,
.prop-value:hover .prop-length {
    opacity: 1;
}
`;

    var plugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        autoExpand: autoExpand,
        search: search,
        propertyGroups: propertyGroups,
        propertyTeaser: propertyTeaser,
        truncate: truncate,
        propertyMenu: propertyMenu
    });

    var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

    var css = "\r\n\r\n* {\r\n    /*colors*/\r\n    --sonj-prop-name: #b863bf;\r\n    --sonj-prop-type-string: #C41A16;\r\n    --sonj-prop-type-number: #1C00CF;\r\n    --sonj-prop-type-undefined: #444444;\r\n    --sonj-arrow-color: #727272;\r\n    --sonj-primary-color: #909090;\r\n    --sonj-primary-bgcolor: #fff;\r\n    --sonj-secondary-bgcolor: #dedede;\r\n    --sonj-secondary-color: #808080;\r\n    /*sizes*/\r\n    --sonj-prop-indent: 12px; \r\n}\r\n\r\n.sonj-container {\r\n    overflow: hidden;\r\n    overflow-x: auto;\r\n    color: var(--sonj-primary-color);\r\n}\r\n\r\n.prop-wrapper {\r\n    padding-left: var(--sonj-prop-indent);\r\n    cursor: default;\r\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Liberation Sans\", sans-serif;\r\n    font-size: 14px;\r\n}\r\n.prop-header {\r\n    position: relative;\r\n    display: inline-block;\r\n    white-space: nowrap;\r\n}\r\n.prop-separator {\r\n    margin-right: 5px;\r\n}\r\n.prop-name {\r\n    color: var(--sonj-prop-name);\r\n}\r\n\r\n.prop-value.prop-type-string {\r\n    color: var(--sonj-prop-type-string);\r\n}\r\n.prop-value.prop-type-string::before {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-string::after {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-bigint,\r\n.prop-value.prop-type-number {\r\n    color: var(--sonj-prop-type-number);\r\n}\r\n.prop-value.prop-type-undefined,\r\n.prop-value.prop-type-object {\r\n    color: var(--sonj-prop-type-undefined);\r\n    font-style: italic;\r\n}\r\n.prop-expand {\r\n    position: absolute;\r\n    border: 4px solid transparent;\r\n    border-top: 6px solid var(--sonj-arrow-color);\r\n    height: 0;\r\n    width: 0;\r\n    left: -10px;\r\n    top: 4px;\r\n    transform: rotate(-90deg);\r\n}\r\n.prop-expanded > * > .prop-expand {\r\n    transform: rotate(0);\r\n    left: -12px;\r\n    top: 6px;\r\n}\r\n.prop-pill {\r\n    background-color: var(--sonj-secondary-bgcolor);\r\n    color: var(--sonj-secondary-color);\r\n    border-radius: 5px;\r\n    padding: 0 5px;\r\n}\r\n\r\n.prop-clickable {\r\n    cursor: pointer;\r\n}";
    n(css,{});

    exports.JsonViewer = JsonViewer;
    exports.plugins = plugins;

    return exports;

}({}));
//# sourceMappingURL=sonj-review.js.map
