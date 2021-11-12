/**
 * Plugin for auto-expanding nodes
 * @param depth Maxmal depth to expand nodes
 * @returns 
 */
export const autoExpand: SonjReview.IAutoExpandPluginInitializer = (depth) => {
    return {
        afterRender: context => {
            if (depth && (context.node.path.length - 1 >= depth)) {
                return;
            }

            context.node.toggleExpand(true/*forceExpand*/);
        }
    }
}