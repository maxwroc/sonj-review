

export const sortProperties: SonjReview.IPropertyMenuItem = {
    text: (ctx: ISortContext) => ctx.sortedAsc ? "Sort desc" : "Sort asc",
    isHidden: context => !context.node.isExpandable,
    onClick: (context: ISortContext) => {

        if (Array.isArray(context.node.data)) {
            context.node.data = context.node.data.sort();
            if (context.sortedAsc) {
                context.node.data = context.node.data.reverse();
            }
        }
        else {
            let keys = Object.keys(context.node.data).sort();
            if (context.sortedAsc) {
                keys = keys.reverse();
            }

            context.node.data = keys.reduce((acc, curr) => {
                acc[curr] = context.node.data[curr];
                return acc;
            }, <any>{});
        }

        context.sortedAsc = !context.sortedAsc;

        context.node.reRender && context.node.reRender();
        context.node.toggleExpand(true);
    }
}

interface ISortContext extends SonjReview.IPluginContext {
    sortedAsc?: boolean;
}