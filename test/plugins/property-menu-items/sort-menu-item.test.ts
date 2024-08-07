import { initPageAndReturnViewerElem, setupTest } from "../../../jest-setup";
import { clickMenuItem } from "./helpers";

beforeEach(() => setupTest());

test("Sorting array asc", async () => {
    await initPageWithMenuPlugin(testData);
    
    await page.click("#root");
    await page.click("#root-array");

    await page.click(`#root-array .prop-menu-button`);

    const menuItem = await page.$(`.prop-menu .prop-menu-item:nth-child(1)`);
    expect(await page.evaluate(el => el!.textContent, menuItem)).toBe("Sort asc");

    await menuItem!.click();

    const sortedArrayValues = await getTextValues("#root-array + .prop-children .prop-value");
    expect(sortedArrayValues).toEqual([
        "amet",
        "dolor",
        "ipsum",
        "lorem",
        "sit",
    ]);
});

test("Sorting array desc", async () => {
    await initPageWithMenuPlugin(testData);
    
    await page.click("#root");
    await page.click("#root-array");

    await clickMenuItem("#root-array", 1, "Sort asc");
    await clickMenuItem("#root-array", 1, "Sort desc");

    const sortedArrayValues = await getTextValues("#root-array + .prop-children .prop-value");
    expect(sortedArrayValues).toEqual([
        "sit",
        "lorem",
        "ipsum",
        "dolor",
        "amet",
    ]);
});

const initPageWithMenuPlugin = async (data: any) => initPageAndReturnViewerElem(data, () => {
    const propertyMenuPlugin = SonjReview.plugins.propertyMenu;

    const menuItems: SonjReview.IPropertyMenuItem[] = [
        propertyMenuPlugin.items!.sortProperties,
    ];
    testSonjPlugins.push(propertyMenuPlugin(menuItems));
});

const testData = {
    array: [
        "lorem",
        "ipsum",
        "dolor",
        "sit",
        "amet",
    ],
    object: {
        "lorem": 1,
        "ipsum": 2,
        "dolor": 3,
        "sit": 4,
        "amet": 5,
    }
}

const getTextValues = async (querySelector: string) => 
    await page.evaluate(
        querySelector => Array.from(document.querySelectorAll(querySelector)).map(e => e.textContent), 
        querySelector);