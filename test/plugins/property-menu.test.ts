import { initPageAndReturnViewerElem, setupTest } from "../../jest-setup";
import { clickMenuItem, getMenuItem } from "./property-menu-items/helpers";

beforeEach(() => setupTest());

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

    const menuItem = await getMenuItem(`#root-${propertyName}`, itemPos, expectedMenuItemCount);
    expect(await page.evaluate(el => el!.textContent, menuItem)).toBe(expectedText);
    
    // there is no access to clipboard (mock doesn't work any more)
    // await clickMenuItem(`#root-${propertyName}`, itemPos, expectedText, expectedMenuItemCount);
    // expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(expectedCopiedValue);
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
    "array": [1,2,3,4]
}