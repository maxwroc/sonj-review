import { injectCss } from "../helpers";
import { $ } from "../mquery";

/**
 * Plugin for showing short onformation about the expandable node
 * @param options Plugin options
 * @returns Plugin instance
 */
export const propertyTeaser: SonjReview.ITeaserPluginInitializer = (options) => {

    injectCss("propertyTeaser", cssCode);

    const getText = (data: any): string => {
        const parts = [
            options.showCounts === false ? "" : getPropertyCount(data),
            getSelectedProperties(data, options)
        ].filter(p => p != "")

        return parts.join(" ");
    }

    return {
        afterRender: context => {
            if (context.node.isExpandable) {
                $("span")
                    .addClass("prop-value-teaser")
                    .text(getText(context.node.data))
                    .appendTo(context.node.header);
            }
        }
    }
}

const getPropertyCount = (data: any) => Array.isArray(data) ? `[${data.length}]` : `{${Object.keys(data).length}}`;

const getSelectedProperties = (data: any, options: SonjReview.ITeaserOptions) => {
    if (!options.properties) {
        return "";
    }

    let values = options.properties.names
        .filter(p => data[p] != undefined && data[p] != "")
        .map(p => ((options.properties!.printNames ? p + ":" : "") + data[p])) as string[];

    if (options.properties.maxCount) {
        values = values.slice(0, options.properties.maxCount);
    }

    console.log(options, options.maxTotalLenght);

    return trimString(values.map(v => trimString(v, options.properties!.maxValueLength)).join(", "), options.maxTotalLenght);
}

const cssCode = `
.prop-expanded > * > .prop-value-teaser {
    display: none;
}
.prop-value-teaser {
    margin: 0 5px;
    color: var(--sonj-primary-color);
}
`;

const trimString = (text: string, maxLength: number | undefined): string => {
    if (!maxLength || !text || text.length <= maxLength) {
        return text;
    }

    return text.substr(0, maxLength - 3) + "...";
}