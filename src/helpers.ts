import { $ } from "./mquery"

export const injectCss = (pluginName: string, cssCode: string) => {
    const cssId = `sonj-${pluginName}-css`;
    if (!document.getElementById(cssId)) {
        document.head.appendChild($("style").attr("id", cssId).text(cssCode).elem);
    }
}