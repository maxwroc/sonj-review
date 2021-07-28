import { injectCss } from "../helpers";
import { $ } from "../mquery";

/**
 * Property groups plugin
 * 
 * @summary It prevents from rendering big number of properties by adding an expandable groups instead
 * 
 * @param maxPropertiesCount Maximum number of properties to render
 * @returns Initialized plugin
 */
export const propertyGroups: SonjReview.IPropertyGroupsPluginInitializer = (maxPropertiesCount) => {

    injectCss("propertyGroups", cssCode);

    return {

        beforeRenderProperties: (context: IGroupsContext, propertiesToRender) => {
            // store collection of properties for afterRenderProperties processing
            context.propsToRender = propertiesToRender;
            // render only max number of properties 
            return propertiesToRender.slice(0, maxPropertiesCount);
        },

        afterRenderProperties: (context: IGroupsContext, renderedProperties) => {
            const path = context.node.path;
            let nodePropsToRender = context.propsToRender;

            delete context.propsToRender;

            // check if there is anything what was not rendered already
            if (!nodePropsToRender || nodePropsToRender.length <= maxPropertiesCount) {
                return;
            }

            let groupStart = maxPropertiesCount;

            // rendering groups
            do {
                nodePropsToRender = nodePropsToRender.slice(maxPropertiesCount);
                let propsToRenderInGroup = nodePropsToRender.slice(0, maxPropertiesCount);

                // group container
                const wrapper = $("div");
                // group clickable element / button
                $("span")
                    .text(`${groupStart + 1} - ${groupStart + propsToRenderInGroup.length}`)
                    .addClass("prop-group", "prop-pill")
                    .on("click", () => {
                        // removing group button
                        wrapper.empty();
                        // rendering properties in the group
                        context.node.renderProperties(wrapper, propsToRenderInGroup);
                    })
                    .appendTo(wrapper);
                
                wrapper.appendTo(context.node.childrenWrapper);

                groupStart += maxPropertiesCount;
            }
            while (nodePropsToRender.length > maxPropertiesCount)
        }
    }
}

const cssCode = `
.prop-group {
    margin: 2px 0 0 var(--sonj-prop-indent);
    display: inline-block;
    white-space: nowrap;
}
`;

interface IGroupsContext extends SonjReview.IPluginContext {
    propsToRender?: string[];
}