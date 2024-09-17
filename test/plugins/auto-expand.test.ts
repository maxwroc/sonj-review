import { initPageAndReturnViewerElem, setupTest } from "../../jest-setup";

beforeEach(() => setupTest());

test("Auto expand 2 able to click and expand", async () => {
    const elem = await initPageAndReturnViewerElem(testData, () => {
        testSonjPlugins.push(SonjReview.plugins.autoExpand(2));
    });

    // check if it is folded/collapsed
    expect(await elem!.$("#root-object-children-0")).toBeFalsy();

    await page.click("#root-object-children");

    // check if it is visible
    expect(await elem!.$("#root-object-children-0")).toBeTruthy();
});

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