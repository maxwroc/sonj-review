import { IPlugin } from "../plugins";

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

    options = options || defaultOptions;

    const maxNameLength = options.maxNameLength;
    const maxValueLength = options.maxValueLength;

    return {
        beforeRender: (context, dataToRender) => {
            if (maxNameLength && dataToRender.name.length > maxNameLength) {
                dataToRender.name = dataToRender.name.substr(0, maxNameLength - 3) + "...";
            }

            if (context.node.isExpandable || dataToRender.value === null || dataToRender.value === undefined) {
                // when node is expandable we don't want to touch it's value
                return;
            }

            const val = dataToRender.value.toString();
            if (maxValueLength && val.length > maxValueLength) {
                dataToRender.value = val.substr(0, maxValueLength - 3) + "...";
            }
        },
    }
}

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
     * Whether to show length when truncated
     */
    showLength?: boolean;

    /**
     * Whether to show 
     */
    showCopy?: boolean;
}