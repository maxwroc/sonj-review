import { injectCss } from "../helpers";
import { IPlugin } from "../plugins";
import { $ } from "../mquery";

/**
 * Plugin for showing short onformation about the expandable node
 * @param options Plugin options
 * @returns Plugin instance
 */
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
    /**
     * Properties which values will be displayed
     */
    properties?: ITeaserPropertiesOptions;

    /**
     * Whether to show counts (of array elements )
     */
    showCounts?: boolean;
}

interface ITeaserPropertiesOptions {
    /**
     * Names of properties to show
     */
    names: string[];

    /**
     * Maximum number of properties to show
     */
    maxCount?: number;

    /**
     * Whether to print property names next to values
     */
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