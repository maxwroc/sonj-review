import { injectCss } from "../helpers";
import { IPlugin } from "../plugins";
import { $ } from "../mquery";

export const propertyTeaser = (options: ITeaserOptions): IPlugin => {

    injectCss("propertyTeaser", cssCode);

    const getText = (data: any): string => {
        const parts = [
            options.showCounts === false ? "" : getPropertyCount(data),
            getSelectedProperties(data, options)
        ].filter(p => p != "")

        return parts.join(" ");
    }

    return {
        afterRender: node => {
            if (node.isExpandable) {
                $("span")
                    .addClass("prop-value-teaser")
                    .text(getText(node.data))
                    .appendTo(node.header);
            }
        }
    }
}

export interface ITeaserOptions {
    properties?: ITeaserPropertiesOptions;
    showCounts?: boolean;
}

interface ITeaserPropertiesOptions {
    names: string[];
    maxCount?: number;
    printNames?: boolean;
}

const getPropertyCount = (data: any) => Array.isArray(data) ? `[${data.length}]` : `{${Object.keys(data).length}}`;

const getSelectedProperties = (data: any, options: ITeaserOptions) => {
    if (!options.properties) {
        return "";
    }

    let values = options.properties.names
        .filter(p => data[p] != undefined)
        .map(p => ((options.properties!.printNames ? p + ":" : "") + data[p])) as string[];

    if (options.properties.maxCount) {
        values = values.slice(0, options.properties.maxCount);
    }

    return values.join(", ");
}

const cssCode = `
.prop-expanded > * > .prop-value-teaser {
    display: none;
}
.prop-value-teaser {
    margin: 0 5px;
}
`;