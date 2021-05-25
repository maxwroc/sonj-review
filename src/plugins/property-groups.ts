import { $ } from "../mquery";
import { IPlugin } from "../plugins";

/**
 * Property groups plugin
 * 
 * @summary It prevents from rendering big number of properties by adding an expandable groups instead
 * 
 * @param maxPropertiesCount Maximum number of properties to render
 * @returns Initialized plugin
 */
export const propertyGroups = (maxPropertiesCount: number): IPlugin => {
    let nodePropsToRender: string[] | null = null;
    return {
        beforeRenderProperties: (node, propertiesToRender) => {
            nodePropsToRender = propertiesToRender;
            return propertiesToRender.slice(0, maxPropertiesCount);
        },
        afterRenderProperties: (node, renderedProperties) => {
            if (!nodePropsToRender || nodePropsToRender.length <= maxPropertiesCount) {
                return;
            }

            let groupStart = maxPropertiesCount;

            do {
                nodePropsToRender = nodePropsToRender.slice(maxPropertiesCount);
                let propsToRenderInGroup = nodePropsToRender.slice(0, maxPropertiesCount);

                const wrapper = $("div");
                $("span")
                    .text(`${groupStart + 1} - ${groupStart + propsToRenderInGroup.length}`)
                    .addClass("prop-group")
                    .on("click", () => {
                        wrapper.empty();
                        node.renderProperties(wrapper, propsToRenderInGroup);
                    })
                    .appendTo(wrapper);
                
                wrapper.appendTo(node.childrenWrapper);

                groupStart += maxPropertiesCount;
            }
            while (nodePropsToRender.length > maxPropertiesCount)
        }
    }
}