
const jsonPattern = /^[\{\[].*?[\}\]]$/;

export const parseJsonValue: SonjReview.IPropertyMenuItem = {
    text: "Parse JSON",
    isHidden: context => typeof(context.node.data) != "string" || !jsonPattern.test(context.node.data),
    onClick: context => {
        context.node.data = JSON.parse(context.node.data);
        context.node.reRender && context.node.reRender();
    }
}