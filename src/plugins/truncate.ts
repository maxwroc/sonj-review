import { IPlugin } from "../plugins";

let defaultOptions: ITruncateOptions = {
    maxNameLength: 20,
    maxValueLength: 40,
}

export const truncate = (options: ITruncateOptions): IPlugin => {

    options = options || defaultOptions;

    const maxNameLength = options.maxNameLength;
    const maxValueLength = options.maxValueLength;

    return {
        beforeRender: (node, dataToRender) => {
            if (node.isExpandable) {
                return;
            }

            if (maxNameLength && dataToRender.name.length > maxNameLength) {
                dataToRender.name = dataToRender.name.substr(0, maxNameLength - 3) + "...";
            }

            const val = dataToRender.value.toString();
            if (maxValueLength && val.length > maxValueLength) {
                dataToRender.value = val.substr(0, maxValueLength - 3) + "...";
            }
        }
    }
}

export interface ITruncateOptions {
    maxNameLength?: number;
    maxValueLength?: number;
}