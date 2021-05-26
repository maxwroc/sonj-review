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

    class JsonViewer {
        constructor(data, path, plugins) {
            this.data = data;
            this.path = path;
            this.plugins = plugins;
            this.nodeName = path.split("/").pop();
            this.plugins.forEach(p => { var _a; return (_a = p.nodeInit) === null || _a === void 0 ? void 0 : _a.call(null, this); });
        }
        render(container) {
            if (typeof (container) == "string") {
                container = document.getElementById(container);
            }
            const wrapper = $("div").addClass("prop-wrapper");
            this.header = $("div")
                .addClass("prop-header")
                .appendTo(wrapper)
                .append($("span").text(this.nodeName).addClass("prop-name"));
            switch (typeof (this.data)) {
                case "bigint":
                case "boolean":
                case "number":
                case "string":
                    this.header
                        .append($("span").text(":").addClass("prop-separator"))
                        .append($("span").addClass("prop-value", "prop-type-" + typeof (this.data)).text(this.data));
                    break;
                case "object":
                    this.isExpandable = true;
                    this.childrenWrapper = $("div").addClass("prop-children");
                    this.header
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
            this.plugins.forEach(p => { var _a; return (_a = p.afterRender) === null || _a === void 0 ? void 0 : _a.call(null, this); });
        }
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
                    .forEach(p => propsToRender = p.beforeRenderProperties(this, propsToRender));
                this.renderProperties(this.childrenWrapper, propsToRender);
                this.plugins.forEach(p => { var _a; return (_a = p.afterRenderProperties) === null || _a === void 0 ? void 0 : _a.call(null, this, propsToRender); });
            }
            else {
                this.wrapper.removeClass(expandedClassName);
                this.childrenWrapper.empty();
            }
            this.plugins.forEach(p => { var _a; return (_a = p.afterToggleExpand) === null || _a === void 0 ? void 0 : _a.call(null, this, !!expand); });
        }
        renderProperties(conatiner, propsToRender) {
            propsToRender.forEach(propName => new JsonViewer(this.data[propName], this.path + "/" + propName, this.plugins).render(conatiner.elem));
        }
    }

    const autoExpand = (depth) => {
        return {
            afterRender: node => {
                if (depth && (node.path.split("/").length - 1 >= depth)) {
                    return;
                }
                node.toggleExpand(true /*forceExpand*/);
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
        let propsToRender = {};
        injectCss("propertyGroups", cssCode);
        return {
            beforeRenderProperties: (node, propertiesToRender) => {
                // store collection of properties for afterRenderProperties processing
                propsToRender[node.path] = propertiesToRender;
                // render only max number of properties 
                return propertiesToRender.slice(0, maxPropertiesCount);
            },
            afterRenderProperties: (node, renderedProperties) => {
                let nodePropsToRender = propsToRender[node.path];
                delete propsToRender[node.path];
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
                        node.renderProperties(wrapper, propsToRenderInGroup);
                    })
                        .appendTo(wrapper);
                    wrapper.appendTo(node.childrenWrapper);
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
}
`;

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
            afterRender: node => {
                if (node.isExpandable) {
                    $("span")
                        .addClass("prop-value-teaser")
                        .text(getText(node.data))
                        .appendTo(node.header);
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
            nodeInit: node => {
                if (rootNode == null) {
                    // the first one is the root one
                    rootNode = node;
                }
            },
            afterRender: node => {
                pathsToShow && node.toggleExpand(true);
            },
            beforeRenderProperties: (node, props) => {
                if (!pathsToShow) {
                    return props;
                }
                return props
                    .filter(p => pathsToShow === null || pathsToShow === void 0 ? void 0 : pathsToShow.some(path => path.startsWith(node.path + "/" + p)));
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

    var plugins = /*#__PURE__*/Object.freeze({
        __proto__: null,
        autoExpand: autoExpand,
        search: search,
        propertyGroups: propertyGroups,
        propertyTeaser: propertyTeaser
    });

    var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

    var css = "\r\n\r\n* {\r\n    /*colors*/\r\n    --sonj-prop-name: #b863bf;\r\n    --sonj-prop-type-string: #C41A16;\r\n    --sonj-prop-type-number: #1C00CF;\r\n    --sonj-arrow-color: #727272;\r\n    /*sizes*/\r\n    --sonj-prop-indent: 12px; \r\n}\r\n.prop-wrapper {\r\n    padding-left: var(--sonj-prop-indent);\r\n    cursor: default;\r\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Liberation Sans\", sans-serif;\r\n    font-size: 14px;\r\n}\r\n.prop-header {\r\n    position: relative;\r\n}\r\n.prop-separator {\r\n    margin-right: 5px;\r\n}\r\n.prop-name {\r\n    color: var(--sonj-prop-name);\r\n}\r\n.prop-value.prop-type-string {\r\n    color: var(--sonj-prop-type-string);\r\n}\r\n.prop-value.prop-type-string::before {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-string::after {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-bigint,\r\n.prop-value.prop-type-number {\r\n    color: var(--sonj-prop-type-number);\r\n}\r\n.prop-expand {\r\n    position: absolute;\r\n    border: 4px solid transparent;\r\n    border-top: 6px solid var(--sonj-arrow-color);\r\n    height: 0;\r\n    width: 0;\r\n    left: -10px;\r\n    top: 4px;\r\n    transform: rotate(-90deg);\r\n}\r\n.prop-expanded > * > .prop-expand {\r\n    transform: rotate(0);\r\n    left: -12px;\r\n    top: 6px;\r\n}";
    n(css,{});

    exports.JsonViewer = JsonViewer;
    exports.plugins = plugins;

    return exports;

}({}));
//# sourceMappingURL=sonj-review.js.map
