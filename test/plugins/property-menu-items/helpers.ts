

export const clickMenuItem = async (elemId: string, itemIndex: number, expectedItemText: string, expectedMenuItemCount?: number) => {
    // clicking manu button to open menu
    await page.click(`${elemId} .prop-menu-button`);

    if (expectedMenuItemCount != undefined) {
        expect((await page.$$(".prop-menu .prop-menu-item")).length).toBe(expectedMenuItemCount);
    }

    const menuItem = await page.$(`.prop-menu .prop-menu-item:nth-child(${itemIndex})`);
    expect(await page.evaluate(el => el!.textContent, menuItem)).toBe(expectedItemText);
    // clicking on menu item
    await menuItem!.click();
}

export const getMenuItem = async (elemId: string, itemIndex: number, expectedMenuItemCount?: number) => {
    // clicking manu button to open menu
    await page.click(`${elemId} .prop-menu-button`);

    if (expectedMenuItemCount != undefined) {
        expect((await page.$$(".prop-menu .prop-menu-item")).length).toBe(expectedMenuItemCount);
    }

    return await page.$(`.prop-menu .prop-menu-item:nth-child(${itemIndex})`);
}