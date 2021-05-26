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

    const cssId = "sonj-propertyGroups-css";
    if (!document.getElementById(cssId)) {
        document.head.appendChild($("style").attr("id", cssId).text(cssCode).elem);
    }

    return {

        beforeRenderProperties: (node, propertiesToRender) => {
            // store collection of properties for 
            nodePropsToRender = propertiesToRender;
            // render only max number of properties 
            return propertiesToRender.slice(0, maxPropertiesCount);
        },

        afterRenderProperties: (node, renderedProperties) => {
            // check if there is anything what was not rendered already
            if (!nodePropsToRender || nodePropsToRender.length <= maxPropertiesCount) {
                return;
            }
            console.log("after render", node.path);

            let groupStart = maxPropertiesCount;

            // rendering groups
            do {
                nodePropsToRender = nodePropsToRender.slice(maxPropertiesCount);
                let propsToRenderInGroup = nodePropsToRender.slice(0, maxPropertiesCount);

                // group container
                const wrapper = $("div");
                // group clickable element
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

const cssCode = `
.prop-group {
    background-color: #dcdcdc;
    border-radius: 5px;
    padding: 0 5px;
    margin: 2px 0 0 10px;
    color: #616161;
    display: inline-block;
}
`;