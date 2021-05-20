var SonjReview = (function (exports) {
    'use strict';

    var e=[],t=[];function n(n,r){if(n&&"undefined"!=typeof document){var a,s=!0===r.prepend?"prepend":"append",d=!0===r.singleTag,i="string"==typeof r.container?document.querySelector(r.container):document.getElementsByTagName("head")[0];if(d){var u=e.indexOf(i);-1===u&&(u=e.push(i)-1,t[u]={}),a=t[u]&&t[u][s]?t[u][s]:t[u][s]=c();}else a=c();65279===n.charCodeAt(0)&&(n=n.substring(1)),a.styleSheet?a.styleSheet.cssText+=n:a.appendChild(document.createTextNode(n));}function c(){var e=document.createElement("style");if(e.setAttribute("type","text/css"),r.attributes)for(var t=Object.keys(r.attributes),n=0;n<t.length;n++)e.setAttribute(t[n],r.attributes[t[n]]);var a="prepend"===s?"afterbegin":"beforeend";return i.insertAdjacentElement(a,e),e}}

    var css = "\r\n\r\n.prop-wrapper {\r\n    padding-left: 12px;\r\n    cursor: default;\r\n    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Liberation Sans\", sans-serif;\r\n    font-size: 14px;\r\n}\r\n.prop-header {\r\n    position: relative;\r\n}\r\n.prop-separator {\r\n    margin-right: 5px;\r\n}\r\n.prop-name {\r\n    color: #b863bf;\r\n}\r\n.prop-value.prop-type-string {\r\n    color: #C41A16;\r\n}\r\n.prop-value.prop-type-string::before {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-string::after {\r\n    content: '\"';\r\n}\r\n.prop-value.prop-type-bigint,\r\n.prop-value.prop-type-number {\r\n    color: #1C00CF;\r\n}\r\n.prop-expand {\r\n    position: absolute;\r\n    border: 4px solid transparent;\r\n    border-top: 6px solid #727272;\r\n    height: 0;\r\n    width: 0;\r\n    left: -12px;\r\n    top: 4px;\r\n    transform: rotate(-90deg);\r\n}\r\n.prop-expanded > * > .prop-expand {\r\n    transform: rotate(0);\r\n    left: -15px;\r\n    top: 8px;\r\n}";
    n(css,{});

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
        clear() {
            this.elem.innerHTML = "";
        }
    }
    const $ = (input) => new MiniQuery(input);
    class SonjReview {
        constructor(data, rootName) {
            this.data = data;
            this.rootName = rootName;
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
        renderSimpleType() {
        }
        renderObjectProperties() {
        }
    }

    exports.SonjReview = SonjReview;

    return exports;

}({}));
//# sourceMappingURL=sonj-review.js.map
