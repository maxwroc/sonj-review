import { readFileSync } from "fs";

export const setupTest = async () => {
    
    page.on('pageerror', ({ message }) => console.log(message));

    await page.setViewport({
        width: 640,
        height: 480,
        deviceScaleFactor: 1,
    });

    await page.setContent(testPageHtml, { waitUntil: "load" });

    await page.evaluate(() => {
        (<any>window)["testSonjPlugins"] = [];
    });
}

export const initPageAndReturnViewerElem = async (data: any, additionalSetup?: { (data: any, ...params: any[]): void }, ...params: any[]) => {

    if (additionalSetup) {
        params = params || [];
        params.unshift(additionalSetup, data);
        await page.evaluate.apply(page, <any>params);
    }

    await page.evaluate((dataInternal: any) => {
        // plugin for adding unique IDs on each node
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem!.setAttribute("id", context.node.path.join("-"));
            }
        }

        testSonjPlugins.push(addNodeIds);

        const viewer = new SonjReview.JsonViewer(dataInternal, "root", testSonjPlugins);
        viewer.render("viewer");
    }, data);

    return await page.$("#viewer");
}

const sonj = readFileSync("./dist/sonj-review.js");
const testPageHtml = `
<!DOCTYPE html>
<html>
    <head>
        <title>Test page</title>
        <script type="text/javascript">${sonj}</script>
    </head>
<body>
    <div id="viewer" style="display: inline-block; padding: 5px;"></div>
</body>
</html>
`;