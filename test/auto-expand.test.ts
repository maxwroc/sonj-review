import { setupTest } from "../jest-setup";

beforeEach(() => setupTest());

test("Expands all", async () => {
    const elem = await initPageAndReturnViewerElem(testData);

    expect(await elem!.screenshot()).toMatchImageSnapshot();
});


test("Expands level 1", async () => {
    const elem = await initPageAndReturnViewerElem(testData, 1);

    expect(await elem!.screenshot()).toMatchImageSnapshot();
});


test("Expands level 2", async () => {
    const elem = await initPageAndReturnViewerElem(testData, 2);

    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Auto expand 2 able to click and expand", async () => {
    const elem = await initPageAndReturnViewerElem(testData, 2);

    // check if it is folded/collapsed
    expect(await elem!.$("#root-object-children-0")).toBeFalsy();

    await page.click("#root-object-children");

    // check if it is visible
    expect(await elem!.$("#root-object-children-0")).toBeTruthy();
});

const initPageAndReturnViewerElem = async (data: any, depth?: number) => {
    await page.evaluate((dataInternal: any, depth?: number) => {
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem!.setAttribute("id", context.node.path.replace(/\//g, "-"));
            }
        }

        const autoExpand = SonjReview.plugins.autoExpand(depth);

        const viewer = new SonjReview.JsonViewer(dataInternal, "root", [ addNodeIds, autoExpand ]);
        viewer.render("viewer");
    }, data, <any>depth);

    return await page.$("#viewer");
}


const testData = {
    array: [
        {
            property: 1,
            children: [
                {
                    name: "John"
                },
                {
                    name: "Wendy"
                }
            ]
        },
        {
            property: 2,
        }
    ],
    object: {
        name: "Test object",
        children: [
            {
                name: "Child One"
            },
            {
                name: "Child Two"
            }
        ]
    }
};