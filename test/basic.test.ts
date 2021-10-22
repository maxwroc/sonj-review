



test("Root element rendered", async () => {
    await page.evaluate(() => {
        const viewer = new SonjReview.JsonViewer({ test: 1 }, "root", []);
        viewer.render("viewer");
    });
    const elem = await page.$("#viewer");

    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Root element expanded", async () => {
    await page.evaluate(() => {
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem.querySelector(".prop-name")!.setAttribute("id", context.node.path.replace(/\//g, "."));
            }
        }
        const viewer = new SonjReview.JsonViewer({ number: 1, string: "test string", float: 3.456, bool: true }, "root", [ addNodeIds ]);
        viewer.render("viewer");
    });

    const root = await page.$("#root");
    await root!.click();

    const elem = await page.$("#viewer");
    expect(await elem!.screenshot()).toMatchImageSnapshot();
});

test("Root element clicked twice", async () => {
    await page.evaluate(() => {
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem.querySelector(".prop-name")!.setAttribute("id", context.node.path.replace(/\//g, "."));
            }
        }
        const viewer = new SonjReview.JsonViewer({ number: 1, string: "test string", float: 3.456, bool: true }, "root", [ addNodeIds ]);
        viewer.render("viewer");
    });

    const root = await page.$("#root");
    // expand
    await root!.click();
    // collapse
    await root!.click();

    const elem = await page.$("#viewer");
    expect(await elem!.screenshot()).toMatchImageSnapshot();
});