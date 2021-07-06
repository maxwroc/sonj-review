import { $ } from "../mquery";
import { injectCss } from "../helpers";

/**
 * Plugin for truncating long node name and/or value
 * @param options Plugin options
 * @returns Plugin instance
 */
export const truncate = (options: ITruncateOptions): SonjReview.IPlugin => {

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
                addLengthInfoPill(context, false, context.fullValueLength, options.enableShowFull);
            }

            if (context.fullNameLength) {
                addLengthInfoPill(context, true, context.fullNameLength, options.enableShowFull);
            }

        }
    }
}

function addLengthInfoPill(context: SonjReview.IPluginContext, isNameElement: boolean, length: number, enableShowingFull: boolean | string | undefined) {
    const targetElem = $(context.node.header.elem.querySelector(isNameElement ? ".prop-name" : ".prop-value") as HTMLElement);
    targetElem.addClass("prop-truncated");

    const pill = $("span")
        .addClass("prop-pill", "prop-length")
        .text(formatBytes(length))
        .appendTo(targetElem);

    if (enableShowingFull) {
        pill
            .addClass("prop-clickable")
            .attr("title", typeof(enableShowingFull) == "string" ? enableShowingFull : "Show full value")
            .on("click", () => {
                targetElem.empty().text(isNameElement ? context.node.nodeName : context.node.data)
            });
    }
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
    enableShowFull?: boolean | string;
}

interface ITruncateContext extends SonjReview.IPluginContext {
    fullNameLength?: number;
    fullValueLength?: number;
}