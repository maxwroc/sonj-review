import { setupTest } from "../../jest-setup";

beforeEach(() => setupTest());

test("Appearance", async () => {
    const viewerElem = await initPageAndReturnViewerElem(testData, { maxNameLength: 12, maxValueLength: 8 });

    await page.click("#root");
    await page.click("#root-thisIsVeryLongPropertyName");
    await page.hover("#root-thisIsVeryLongPropertyName .prop-name .prop-pill");
    await new Promise((r) => setTimeout(r, 500));

    expect(await viewerElem!.screenshot()).toMatchImageSnapshot();
});

test("Pill disabled", async () => {
    await initPageAndReturnViewerElem(testData, { showLengthPill: false, maxNameLength: 12, maxValueLength: 8 });

    await page.click("#root");
    await page.click("#root-thisIsVeryLongPropertyName");
    await page.hover("#root-thisIsVeryLongPropertyName .prop-name");

    expect((await page.$$(".prop-pill")).length).toBe(0);
});

test.each([
    ["value", "Jet a...36", "Jet another very long property value"],
    ["name", "jetAnothe...26", "jetAnotherLongPropertyName"]
])("Click on pill reveals full text", async (fieldType: string, expectedTruncatedVal: string, expectedFullVal: string) => {

    await initPageAndReturnViewerElem(testData, { maxNameLength: 12, maxValueLength: 8 });
    await page.click("#root");

    const propertyValueElem = await page.$(`#root-jetAnotherLongPropertyName .prop-${fieldType}`);

    // before click
    expect(await page.evaluate(el => el.textContent, propertyValueElem)).toBe(expectedTruncatedVal);
    // click on pill
    await page.click(`#root-jetAnotherLongPropertyName .prop-${fieldType} .prop-pill`);
    // after click
    expect(await page.evaluate(el => el.textContent, propertyValueElem)).toBe(expectedFullVal);
});

test("Click on pill doesn't expand node", async () => {
    await initPageAndReturnViewerElem(testData, { maxNameLength: 12, maxValueLength: 8 });
    await page.click("#root");

    expect((await page.$$(".prop-name")).length).toBe(3);

    await page.click(`#root-thisIsVeryLongPropertyName .prop-name .prop-pill`);

    expect((await page.$$(".prop-name")).length).toBe(3);
});

const initPageAndReturnViewerElem = async (data: any, options: SonjReview.ITruncateOptions) => {
    await page.evaluate((dataInternal: any, options: SonjReview.ITruncateOptions) => {
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem!.setAttribute("id", context.node.path.replace(/\//g, "-"));
            }
        }

        const truncatePlugin = SonjReview.plugins.truncate(options);

        const viewer = new SonjReview.JsonViewer(dataInternal, "root", [ truncatePlugin, addNodeIds ]);
        viewer.render("viewer");
    }, data, <any>options);

    return await page.$("#viewer");
}

const testData = {
    thisIsVeryLongPropertyName: {
        content: "this is very long value",
        val: 123456,
    },
    jetAnotherLongPropertyName: "Jet another very long property value"
}