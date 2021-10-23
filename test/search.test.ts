import { setupTest } from "../jest-setup";


beforeEach(() => setupTest());

test("Single result", async () => {
    await initPageAndReturnViewerElem(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("James");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(1);
    expect(await page.$("#root-collection-0-name")).toBeTruthy();
});

test("Multiple results", async () => {
    await initPageAndReturnViewerElem(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("Contoso");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(3);
    expect(await page.$("#root-collection-0-company")).toBeTruthy();
    expect(await page.$("#root-collection-1-company")).toBeTruthy();
    expect(await page.$("#root-company")).toBeTruthy();
});

const initPageAndReturnViewerElem = async (data: any) => {
    await page.evaluate((dataInternal: any) => {
        const addNodeIds: SonjReview.IPlugin = {
            afterRender: context => {
                context.node.header.elem!.setAttribute("id", context.node.path.replace(/\//g, "-"));
            }
        }

        const searchPlugin = SonjReview.plugins.search(dataInternal);

        const inputElem = document.createElement("input");
        inputElem.setAttribute("id", "inputElem");
        document.body.appendChild(inputElem);

        inputElem.addEventListener("keyup", evt => {
            if (evt.code == "Enter") {
                searchPlugin.query(inputElem.value);
            }
        });

        const viewer = new SonjReview.JsonViewer(dataInternal, "root", [ searchPlugin, addNodeIds ]);
        viewer.render("viewer");
    }, data);

    return await page.$("#viewer");
}

const testData = {
    collection: [
        {
            name: "James Jones",
            job_title: "CEO",
            company: "Contoso",
        },
        {
            name: "Wendy Moore",
            job_title: "Office manager",
            company: "Contoso",
        },
        {
            name: "Jack Marble",
            job_title: "Assistant",
            mobile_phone: "07777666555"
        }
    ],
    company: "Contoso Ltd",
    office: {
        location: {
            street: "10 Downing Street",
            post_code: "SW1A 2AA",
            city: "London",
        },
        employees: 234,
    }
}