import { initPageAndReturnViewerElem, setupTest } from "../../jest-setup";


beforeEach(() => setupTest());

test("Single result", async () => {
    await initPageWithSearchPlugin(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("James");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(1);
    expect(await page.$("#root-collection-0-name")).toBeTruthy();
});

test("Multiple results", async () => {
    await initPageWithSearchPlugin(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("Contoso");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(3);
    expect(await page.$("#root-collection-0-company")).toBeTruthy();
    expect(await page.$("#root-collection-1-company")).toBeTruthy();
    expect(await page.$("#root-company")).toBeTruthy();
});

test("Search for number", async () => {
    await initPageWithSearchPlugin(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("234");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(1);
    expect(await page.$("#root-office-employees")).toBeTruthy();
});

test("Search for property name", async () => {
    await initPageWithSearchPlugin(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("job_title");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(3);
    expect(await page.$("#root-collection-0-job_title")).toBeTruthy();
    expect(await page.$("#root-collection-0-job_title")).toBeTruthy();
    expect(await page.$("#root-collection-0-job_title")).toBeTruthy();
});

test("Result which path partially matches the other existing path", async () => {
    await initPageWithSearchPlugin(testData);

    await page.focus("#inputElem");
    await page.keyboard.type("microbots");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(1);
    expect((await page.$$(".prop-name")).length).toBe(4);
    expect(await page.$("#root-products-nanobots-name")).toBeTruthy();
});

test("Case sensitive search", async () => {
    await initPageWithSearchPlugin(testData, { caseSensitive: true });

    await page.focus("#inputElem");
    await page.keyboard.type("james");
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(0);

    await page.evaluate(() => (<any>document).getElementById("inputElem").value = "")
    await page.keyboard.type("James");
    await page.keyboard.press("Enter");
    
    expect((await page.$$(".prop-value")).length).toBe(1);
    expect(await page.$("#root-collection-0-name")).toBeTruthy();
});

test("Special characters in query", async () => {
    await initPageWithSearchPlugin(testData);

    await page.focus("#inputElem");
    await page.keyboard.type(`$%^&*()\\`);
    await page.keyboard.press("Enter");

    expect((await page.$$(".prop-value")).length).toBe(2);
});

const initPageWithSearchPlugin = async (data: any, options?: SonjReview.ISearchOptions) => 
    initPageAndReturnViewerElem(data, (dataInternal: any, optionsInternal: SonjReview.ISearchOptions) => {
        const searchPlugin = SonjReview.plugins.search(dataInternal, optionsInternal);

        const inputElem = document.createElement("input");
        inputElem.setAttribute("id", "inputElem");
        document.body.appendChild(inputElem);

        inputElem.addEventListener("keyup", evt => {
            if (evt.code == "Enter") {
                searchPlugin.query(inputElem.value);
            }
        });

        testSonjPlugins.push(searchPlugin);
    }, options);


const testData = {
    "collection": [
        {
            "name": "James Jones",
            "job_title": "CEO",
            "company": "Contoso"
        },
        {
            "name": "Wendy Moore",
            "job_title": "Office manager",
            "company": "Contoso"
        },
        {
            "name": "Jack Marble",
            "job_title": "Assistant",
            "mobile_phone": "07777666555"
        }
    ],
    "company": "Contoso Ltd",
    "office": {
        "location": {
            "street": "10 Downing Street",
            "post_code": "SW1A 2AA",
            "city": "London"
        },
        "employees": 234
    },
    "products": {
        "nano": {
            "name": "micro"
        },
        "nanobots": {
            "name": "microbots"
        }
    },
    "spacial_chars": {
        "value": "special_chars_$%^&*()\\",
        "special_chars_$%^&*()\\": "property_name_with_special_chars"
    }
}