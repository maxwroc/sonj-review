import { initPageAndReturnViewerElem, setupTest } from "../../jest-setup";

beforeEach(() => setupTest());

test("Hover property appearance", async () => {
    const viewerElem = await initPageWithMenuPlugin(testData);

    await page.click("#root");
    await page.hover("#root-number_value");
    await new Promise((r) => setTimeout(r, 500));

    expect(await viewerElem?.screenshot()).toMatchImageSnapshot();
});

test("Hover menu button appearance", async () => {
    const viewerElem = await initPageWithMenuPlugin(testData);

    await page.click("#root");
    await page.hover("#root-number_value .prop-menu-button");
    await new Promise((r) => setTimeout(r, 500));

    expect(await viewerElem?.screenshot()).toMatchImageSnapshot();
});


test("Menu appearance", async () => {
    const viewerElem = await initPageWithMenuPlugin(testData);

    await page.click("#root");
    await page.click("#root-number_value .prop-menu-button");
    await new Promise((r) => setTimeout(r, 500));

    expect(await viewerElem?.screenshot()).toMatchImageSnapshot();
});

test.each([
    ["number_value", 1, 2, "Copy name", "number_value"],
    ["number_value", 2, 2, "Copy value", 1],
    ["object", 2, 3, "Copy value", `{"val1":1,"val2":2}`],
    ["object", 3, 3, "Copy formatted JSON", `{\n  "val1": 1,\n  "val2": 2\n}`],
    ["array", 2, 3, "Copy value", `[1,2,3,4]`],
    ["array", 3, 3, "Copy formatted JSON", `[\n  1,\n  2,\n  3,\n  4\n]`]
])("Copy property name/value", async (propertyName: string, itemPos: number, expectedMenuItemCount: number, expectedText: string, expectedCopiedValue: any) => {
    await initPageWithMenuPlugin(testData);

    await page.click("#root");
    await page.click(`#root-${propertyName} .prop-menu-button`);
    
    expect((await page.$$(".prop-menu .prop-menu-item")).length).toBe(expectedMenuItemCount);

    const menuItem = await page.$(`.prop-menu .prop-menu-item:nth-child(${itemPos})`);
    expect(await page.evaluate(el => el.textContent, menuItem)).toBe(expectedText);

    await menuItem!.click();

    expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(expectedCopiedValue);
});

test("Parse JSON", async () => {
    const viewerElem = await initPageWithMenuPlugin(testData);

    await page.click("#root");
    await page.click(`#root-json .prop-menu-button`);
    
    expect((await page.$$(".prop-menu .prop-menu-item")).length).toBe(3);

    const menuItem = await page.$(`.prop-menu .prop-menu-item:nth-child(1)`);
    expect(await page.evaluate(el => el.textContent, menuItem)).toBe("Parse JSON");

    await menuItem!.click();
    await page.click(`#root-json`);
    await new Promise((r) => setTimeout(r, 500));

    expect(await viewerElem!.screenshot()).toMatchImageSnapshot();
});

const initPageWithMenuPlugin = async (data: any) => initPageAndReturnViewerElem(data, () => {

    // mock clipboard
    let clipboardText: string | null = null;
    (<any>window)["navigator"]["clipboard"] = {
        writeText: (text: string) => new Promise(resolve => clipboardText = text),
        readText: () => new Promise(resolve => resolve(clipboardText)),
    }

    const propertyMenuPlugin = SonjReview.plugins.propertyMenu;

    const menuItems: SonjReview.IPropertyMenuItem[] = [
        propertyMenuPlugin.items!.parseJsonValue,
        propertyMenuPlugin.items!.copyName,
        propertyMenuPlugin.items!.copyValue,
        propertyMenuPlugin.items!.copyFormattedValue,
    ];
    testSonjPlugins.push(propertyMenuPlugin(menuItems));
});

const testData = {
    "string_value": "value",
    "number_value": 1,
    "object": {
        "val1": 1,
        "val2": 2
    },
    "array": [1,2,3,4],
    "json": "{\"val1\": \"value1\", \"val2\": 2}"
}