var SonjReview = (function (exports) {
    'use strict';

    class MiniQuery {
        constructor(input) {
            this.elem = document.createElement(input);
        }
        appendTo(target) {
            target.elem.appendChild(this.elem);
            return this;
        }
        append(child) {
            this.elem.appendChild(child.elem);
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
        }
    }
    const $ = (input) => new MiniQuery(input);

    class JsonViewer {
        constructor(data, path, plugins) {
            this.data = data;
            this.path = path;
            this.plugins = plugins;
            this.rootName = path.split("/").pop();
            this.plugins.forEach(p => { var _a; return (_a = p.init) === null || _a === void 0 ? void 0 : _a.call(null, this); });
        }
        render(container) {
            if (typeof (container) == "string") {
                container = document.getElementById(container);
            }
            const wrapper = $("div").addClass("prop-wrapper");
            const header = $("div")
                .addClass("prop-header")
                .appendTo(wrapper)
                .append($("span").text(this.rootName).addClass("prop-name"));
            switch (typeof (this.data)) {
                case "bigint":
                case "boolean":
                case "number":
                case "string":
                    header
                        .append($("span").text(":").addClass("prop-separator"))
                        .append($("span").addClass("prop-value", "prop-type-" + typeof (this.data)).text(this.data));
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
            this.plugins.forEach(p => { var _a; return (_a = p.render) === null || _a === void 0 ? void 0 : _a.call(null, this); });
        }
        toggleExpand(expand) {
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
                const blockRendering = this.plugins.some(p => { var _a; return (_a = p.beforeRenderProperties) === null || _a === void 0 ? void 0 : _a.call(null, this); });
                if (!blockRendering) {
                    this.renderProperties(this.childrenWrapper, Object.keys(this.data));
                }
            }
            else {
                this.wrapper.removeClass(expandedClassName);
                this.childrenWrapper.empty();
            }
        }
        renderProperties(conatiner, propsToRender) {
            propsToRender.forEach(propName => new JsonViewer(this.data[propName], this.path + "/" + propName, this.plugins).render(conatiner.elem));
        }
        getPropertyGroupsToRender() {
            let groups = [];
            groups.push(Object.keys(this.data));
            //this.plugins.forEach(p => p.)
        }
    }

    const expandAll = () => {
        return {
            render: (node) => {
                node.toggleExpand(true);
            }
        };
    };

    const search = (data) => {
        let rootNode = null;
        let pathsToShow = null;
        return {
            init: node => {
                if (rootNode == null) {
                    rootNode = node;
                }
            },
            render: node => {
                pathsToShow && node.toggleExpand(true);
            },
            beforeRenderProperties: node => {
                if (!pathsToShow) {
                    console.log("default");
                    return false;
                }
                var propsToRender = Object
                    .keys(node.data)
                    .filter(p => pathsToShow === null || pathsToShow === void 0 ? void 0 : pathsToShow.some(path => path.startsWith(node.path + "/" + p)));
                console.log(node.path, propsToRender, pathsToShow);
                if (propsToRender.length) {
                    node.renderProperties(node.childrenWrapper, propsToRender);
                }
                return true; // blocks rendering in the node class
            },
            query: searchString => {
                if (!rootNode) {
                    throw "Root node not initialized";
                }
                rootNode.toggleExpand(false);
                let resultPromise = searchInternal(data, rootNode.path, searchString)
                    .then(paths => {
                    pathsToShow = paths;
                    pathsToShow.length && (rootNode === null || rootNode === void 0 ? void 0 : rootNode.toggleExpand(true));
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
        expandAll: expandAll,
        search: search
    });

    var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

    var css = "\r\n\r\n.prop-wrapper {\r\n    padding-left: 12px;\r\n    cursor: default;\r\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Liberation Sans\", sans-serif;\r\n    font-size: 14px;\r\n}\r\n.prop-header {\r\n    position: relative;\r\n}\r\n.prop-separator {\r\n    margin-right: 5px;\r\n}\r\n.prop-name {\r\n    color: #b863bf;\r\n}\r\n.prop-value.prop-type-string {\r\n    color: #C41A16;\r\n}\r\n.prop-value.prop-type-string::before {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-string::after {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-bigint,\r\n.prop-value.prop-type-number {\r\n    color: #1C00CF;\r\n}\r\n.prop-expand {\r\n    position: absolute;\r\n    border: 4px solid transparent;\r\n    border-top: 6px solid #727272;\r\n    height: 0;\r\n    width: 0;\r\n    left: -12px;\r\n    top: 4px;\r\n    transform: rotate(-90deg);\r\n}\r\n.prop-expanded > * > .prop-expand {\r\n    transform: rotate(0);\r\n    left: -15px;\r\n    top: 8px;\r\n}";
    n(css,{});

    exports.JsonViewer = JsonViewer;
    exports.plugins = plugins;

    return exports;

}({}));
//# sourceMappingURL=sonj-review.js.map
