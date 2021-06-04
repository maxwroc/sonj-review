var SonjReview = (function (exports) {
    'use strict';

    class MiniQuery {
        constructor(input) {
            this.elem = document.createElement(input);
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
                    this.isExpandable = false;
                    break;
                case "object":
                    this.isExpandable = true;
                    break;
                default:
                    throw "Type not supported";
            }
            this.plugins.forEach((p, i) => {
                var _a;
                this.pluginContext[i] = { node: this };
                (_a = p.nodeInit) === null || _a === void 0 ? void 0 : _a.call(null, this.pluginContext[i]);
            });
        }
        /**
         * Renders node
         * @param container Container in which node should be rendered
         */
        render(container) {
            if (typeof (container) == "string") {
                container = document.getElementById(container);
            }
            const wrapper = $("div").addClass("prop-wrapper");
            const dataToRender = {
                name: this.nodeName,
                value: this.data,
            };
            this.plugins.forEach((p, i) => { var _a; return (_a = p.beforeRender) === null || _a === void 0 ? void 0 : _a.call(null, this.pluginContext[i], dataToRender); });
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
                    .append($("span").addClass("prop-value", "prop-type-" + typeof (dataToRender.value)).text(dataToRender.value.toString()));
            }
            this.wrapper = wrapper;
            // update DOM only once at the end
            container.appendChild(this.wrapper.elem);
            this.plugins.forEach((p, i) => { var _a; return (_a = p.afterRender) === null || _a === void 0 ? void 0 : _a.call(null, this.pluginContext[i]); });
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
                this.plugins
                    .filter(p => p.beforeRenderProperties)
                    .forEach((p, i) => propsToRender = p.beforeRenderProperties(this.pluginContext[i], propsToRender));
                this.renderProperties(this.childrenWrapper, propsToRender);
                this.plugins.forEach((p, i) => { var _a; return (_a = p.afterRenderProperties) === null || _a === void 0 ? void 0 : _a.call(null, this.pluginContext[i], propsToRender); });
            }
            else {
                this.wrapper.removeClass(expandedClassName);
                this.childrenWrapper.empty();
            }
            this.plugins.forEach((p, i) => { var _a; return (_a = p.afterToggleExpand) === null || _a === void 0 ? void 0 : _a.call(null, this.pluginContext[i], !!expand); });
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
                        .addClass("prop-group")
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
    --sonj-group-bgcolor: #dcdcdc;
    --sonj-group-color: #616161;
    background-color: var(--sonj-group-bgcolor);
    border-radius: 5px;
    padding: 0 5px;
    margin: 2px 0 0 var(--sonj-prop-indent);
    color: var(--sonj-group-color);
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
            .filter(p => data[p] != undefined)
            .map(p => ((options.properties.printNames ? p + ":" : "") + data[p]));
        if (options.properties.maxCount) {
            values = values.slice(0, options.properties.maxCount);
        }
        return values.join(", ");
    };
    const cssCode$1 = `
.prop-expanded > * > .prop-value-teaser {
    display: none;
}
.prop-value-teaser {
    margin: 0 5px;
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

    let defaultOptions = {
        maxNameLength: 20,
        maxValueLength: 40,
    };
    /**
     * Plugin for truncating long node name and/or value
     * @param options Plugin options
     * @returns Plugin instance
     */
    const truncate = (options) => {
        options = options || defaultOptions;
        const maxNameLength = options.maxNameLength;
        const maxValueLength = options.maxValueLength;
        return {
            beforeRender: (context, dataToRender) => {
                if (maxNameLength && dataToRender.name.length > maxNameLength) {
                    dataToRender.name = dataToRender.name.substr(0, maxNameLength - 3) + "...";
                }
                if (context.node.isExpandable) {
                    // when node is expandable we don't want to touch it's value
                    return;
                }
                const val = dataToRender.value.toString();
                if (maxValueLength && val.length > maxValueLength) {
                    dataToRender.value = val.substr(0, maxValueLength - 3) + "...";
                }
            },
        };
    };

    var plugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        autoExpand: autoExpand,
        search: search,
        propertyGroups: propertyGroups,
        propertyTeaser: propertyTeaser,
        truncate: truncate
    });

    var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

    var css = "\r\n\r\n* {\r\n    /*colors*/\r\n    --sonj-prop-name: #b863bf;\r\n    --sonj-prop-type-string: #C41A16;\r\n    --sonj-prop-type-number: #1C00CF;\r\n    --sonj-arrow-color: #727272;\r\n    /*sizes*/\r\n    --sonj-prop-indent: 12px; \r\n}\r\n\r\n.sonj-container {\r\n    overflow: hidden;\r\n    overflow-x: auto;\r\n}\r\n\r\n.prop-wrapper {\r\n    padding-left: var(--sonj-prop-indent);\r\n    cursor: default;\r\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Liberation Sans\", sans-serif;\r\n    font-size: 14px;\r\n}\r\n.prop-header {\r\n    position: relative;\r\n    white-space: nowrap;\r\n}\r\n.prop-separator {\r\n    margin-right: 5px;\r\n}\r\n.prop-name {\r\n    color: var(--sonj-prop-name);\r\n}\r\n\r\n.prop-value.prop-type-string {\r\n    color: var(--sonj-prop-type-string);\r\n}\r\n.prop-value.prop-type-string::before {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-string::after {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-bigint,\r\n.prop-value.prop-type-number {\r\n    color: var(--sonj-prop-type-number);\r\n}\r\n.prop-expand {\r\n    position: absolute;\r\n    border: 4px solid transparent;\r\n    border-top: 6px solid var(--sonj-arrow-color);\r\n    height: 0;\r\n    width: 0;\r\n    left: -10px;\r\n    top: 4px;\r\n    transform: rotate(-90deg);\r\n}\r\n.prop-expanded > * > .prop-expand {\r\n    transform: rotate(0);\r\n    left: -12px;\r\n    top: 6px;\r\n}";
    n(css,{});

    exports.JsonViewer = JsonViewer;
    exports.plugins = plugins;

    return exports;

}({}));
//# sourceMappingURL=sonj-review.js.map
