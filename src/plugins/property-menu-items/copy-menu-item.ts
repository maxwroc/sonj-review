
export const copyName: SonjReview.IPropertyMenuItem = {
    text: "Copy name",
    onClick: context => {
        navigator.clipboard.writeText(context.node.nodeName);
    }
};

export const copyValue: SonjReview.IPropertyMenuItem = {
    text: "Copy value",
    onClick: context => {
        navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data) : context.node.data);
    }
};

export const copyFormattedValue: SonjReview.IPropertyMenuItem = {
    text: "Copy formatted JSON",
    isHidden: context => !context.node.isExpandable,
    onClick: context => {
        navigator.clipboard.writeText(context.node.isExpandable ? JSON.stringify(context.node.data, null, 2) : context.node.data);
    }
};