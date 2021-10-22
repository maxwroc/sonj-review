import { setupTest } from "../jest-setup";

beforeEach(() => setupTest());

test("Root element rendered", async () => {
    const elem = await initPageAndReturnViewerElem({ test: 1 });

    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Root element expanded", async () => {
    const elem = await initPageAndReturnViewerElem({ number: 1, string: "test string", float: 3.456, bool: true, emptyArray: [], emptyObject: {} });

    const root = await page.$("#root");
    await root!.click();
    
    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Empty arrays and objects not expandable", async () => {
    const elem = await initPageAndReturnViewerElem({ arrayNode: [], objectNode: {} });

    const root = await page.$("#root");
    await root!.click();

    const arrayNodeElem = await page.$("#root-arrayNode");
    const objectNodeElem = await page.$("#root-objectNode");

    expect(await arrayNodeElem!.$(".prop-expand") !== null).toBeFalsy();
    expect(await objectNodeElem!.$(".prop-expand") !== null).toBeFalsy();
});

const initPageAndReturnViewerElem = async (data: any) => {
    await page.evaluate((dataInternal: any) => {
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem!.setAttribute("id", context.node.path.replace(/\//g, "-"));
            }
        }
        const viewer = new SonjReview.JsonViewer(dataInternal, "root", [ addNodeIds ]);
        viewer.render("viewer");
    }, data);

    return await page.$("#viewer");
}
