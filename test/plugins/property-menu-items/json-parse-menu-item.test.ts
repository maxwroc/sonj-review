import { initPageAndReturnViewerElem, setupTest } from "../../../jest-setup";
import { clickMenuItem } from "./helpers";

beforeEach(() => setupTest());

test("Parse JSON - property position not changed after re-render", async () => {
    const viewerElem = await initPageWithMenuPlugin({
        "first_property": "value 1",
        "json": "{\"val1\": \"value1\", \"val2\": 2}",
        "last_property": "value 2"
    });

    await page.click("#root");
    expect((await page.$$("#root + .prop-children > *")).length).toBe(3);

    await clickMenuItem("#root-json", 1, "Parse JSON");

    expect((await page.$$("#root + .prop-children > *")).length).toBe(3);

    const secondProperty = await page.$("#root + .prop-children > .prop-wrapper:nth-child(2) > .prop-header > .prop-name");
    expect(await page.evaluate(el => el!.textContent, secondProperty)).toBe("json");
});


const initPageWithMenuPlugin = async (data: any) => initPageAndReturnViewerElem(data, () => {
    const propertyMenuPlugin = SonjReview.plugins.propertyMenu;

    const menuItems: SonjReview.IPropertyMenuItem[] = [
        propertyMenuPlugin.items!.parseJsonValue,
    ];
    testSonjPlugins.push(propertyMenuPlugin(menuItems));
});