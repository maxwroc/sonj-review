import { IPlugin, IPluginContext } from "../plugins";
import { $ } from "../mquery";
import { injectCss } from "../helpers";

let defaultOptions: ITruncateOptions = {
    maxNameLength: 20,
    maxValueLength: 40,
}

/**
 * Plugin for truncating long node name and/or value
 * @param options Plugin options
 * @returns Plugin instance
 */
export const truncate = (options: ITruncateOptions): IPlugin => {

    injectCss("truncatePlugin", cssCode);

    options = {
        maxNameLength: 20,
        maxValueLength: 40,
        ...options
    };

    const maxNameLength = options.maxNameLength;
    const maxValueLength = options.maxValueLength;

    return {
        beforeRender: (context: ITruncateContext, dataToRender) => {
            if (maxNameLength && dataToRender.name.length > maxNameLength) {
                console.log("name", context.node.path);
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
        afterRender: (context: ITruncateContext) => {
            if (!options.showLength || (!context.fullNameLength && !context.fullValueLength)) {
                return;
            }

            if (context.fullValueLength) {
                addLengthInfoPill(context, ".prop-value", context.fullValueLength);
            }

            if (context.fullNameLength) {
                addLengthInfoPill(context, ".prop-name", context.fullNameLength);
            }

        }
    }
}

function addLengthInfoPill(context: IPluginContext, targetElemSelector: string, length: number) {
    const targetElem = $(context.node.header.elem.querySelector(targetElemSelector) as HTMLElement);
    targetElem.addClass("prop-truncated");

    return $("span")
        .addClass("prop-pill", "prop-length")
        .text(formatBytes(length))
        .appendTo(targetElem);
}

function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return "0";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + (sizes[i] ? " " + sizes[i] : "");
}

const cssCode = `
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

export interface ITruncateOptions {
    /**
     * Maximum length of node name
     */
    maxNameLength?: number;

    /**
     * Maximum length of node value
     */
    maxValueLength?: number;

    /**
     * Whether to show length (on hover) when truncated
     */
    showLength?: boolean;

    /**
     * Whether to make length info button clickable
     */
    //enableShowFull?: boolean;
}

interface ITruncateContext extends IPluginContext {
    fullNameLength?: number;
    fullValueLength?: number;
}