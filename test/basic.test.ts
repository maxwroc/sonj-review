import { setupTest, initPageAndReturnViewerElem } from "../jest-setup";

beforeEach(() => setupTest());

test("Root element rendered", async () => {
    const elem = await initPageAndReturnViewerElem({ test: 1 });

    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Root element expanded", async () => {
    const elem = await initPageAndReturnViewerElem({ number: 1, string: "test string", float: 3.456, bool: true, emptyArray: [], emptyObject: {} });

    await page.click("#root");
    
    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Empty arrays and objects not expandable", async () => {
    const elem = await initPageAndReturnViewerElem({ arrayNode: [], objectNode: {} });

    await page.click("#root");

    const arrayNodeElem = await page.$("#root-arrayNode");
    const objectNodeElem = await page.$("#root-objectNode");

    expect(await arrayNodeElem!.$(".prop-expand") !== null).toBeFalsy();
    expect(await objectNodeElem!.$(".prop-expand") !== null).toBeFalsy();
});

test("Root element clicked twice", async () => {
    const elem = await initPageAndReturnViewerElem({ number: 1 });

    // check if element is not visible
    expect(await page.$("#root-number")).toBeFalsy();

    await page.click("#root");

    // check if element is visible
    expect(await page.$("#root-number")).toBeTruthy();
});

test("Object with special characters in property names", async () => {
    const elem = await initPageAndReturnViewerElem({
        "name_!@#$%^&*()-=_\"[]{}:<>?/\\": "value_!@#$%^&*()-=_\"[]{}:<>?/\\"
     });
     
    await page.click("#root");

    const dd = await page.$$("#root + .prop-children > *");

    expect(dd.length).toBe(1);

    const name = await page.$("#root + .prop-children .prop-name")
    expect(await page.evaluate(el => el.textContent, name)).toBe("name_!@#$%^&*()-=_\"[]{}:<>?/\\");

    const val = await page.$("#root + .prop-children .prop-value")
    expect(await page.evaluate(el => el.textContent, val)).toBe("value_!@#$%^&*()-=_\"[]{}:<>?/\\");
})
