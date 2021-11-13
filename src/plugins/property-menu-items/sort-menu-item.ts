

export const sortProperties: SonjReview.IPropertyMenuItem = {
    text: "Sort",
    isHidden: context => !context.node.isExpandable,
    onClick: context => {

        if (Array.isArray(context.node.data)) {
            context.node.data = context.node.data.sort();
        }
        else {
            context.node.data = Object.keys(context.node.data).sort().reduce((acc, curr) => {
                acc[curr] = context.node.data[curr];
                return acc;
            }, <any>{});
        }

        context.node.reRender && context.node.reRender();
        context.node.toggleExpand(true);
    }
}