import { initPageAndReturnViewerElem, setupTest } from "../../jest-setup";

beforeEach(() => setupTest());

test("Pill disabled", async () => {
    await initPageAndReturnViewerElem(testData, () => {
        testSonjPlugins.push(SonjReview.plugins.truncate({ showLengthPill: false, maxNameLength: 12, maxValueLength: 8 }));
    });

    await page.click("#root");
    await page.click("#root-thisIsVeryLongPropertyName");
    await page.hover("#root-thisIsVeryLongPropertyName .prop-name");

    expect((await page.$$(".prop-pill")).length).toBe(0);
});

test.each([
    ["value", "Jet a...36", "Jet another very long property value"],
    ["name", "jetAnothe...26", "jetAnotherLongPropertyName"]
])("Click on pill reveals full text", async (fieldType: string, expectedTruncatedVal: string, expectedFullVal: string) => {

    await initPageAndReturnViewerElem(testData, () => {
        testSonjPlugins.push(SonjReview.plugins.truncate({ maxNameLength: 12, maxValueLength: 8 }));
    });
    await page.click("#root");

    const propertyValueElem = await page.$(`#root-jetAnotherLongPropertyName .prop-${fieldType}`);

    // before click
    expect(await page.evaluate(el => el!.textContent, propertyValueElem)).toBe(expectedTruncatedVal);
    // click on pill
    await page.click(`#root-jetAnotherLongPropertyName .prop-${fieldType} .prop-pill`);
    // after click
    expect(await page.evaluate(el => el!.textContent, propertyValueElem)).toBe(expectedFullVal);
});

test("Click on pill doesn't expand node", async () => {
    await initPageAndReturnViewerElem(testData, () => {
        testSonjPlugins.push(SonjReview.plugins.truncate({ maxNameLength: 12, maxValueLength: 8 }));
    });
    await page.click("#root");

    expect((await page.$$(".prop-name")).length).toBe(3);

    await page.click(`#root-thisIsVeryLongPropertyName .prop-name .prop-pill`);

    expect((await page.$$(".prop-name")).length).toBe(3);
});

const testData = {
    thisIsVeryLongPropertyName: {
        content: "this is very long value",
        val: 123456,
    },
    jetAnotherLongPropertyName: "Jet another very long property value"
}