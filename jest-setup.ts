import { setupJestScreenshot } from "jest-screenshot";
import { readFileSync } from "fs";

setupJestScreenshot({
    detectAntialiasing: true,
    reportDir: "test/__report__"
});

export const setupTest = async () => {
    
    page.on('pageerror', ({ message }) => console.log(message));

    await page.setViewport({
        width: 640,
        height: 480,
        deviceScaleFactor: 1,
    });

    await page.setContent(testPageHtml, { waitUntil: "load" });
}

const sonj = readFileSync("./dist/sonj-review.js");
const testPageHtml = `
<!DOCTYPE html>
<html>
    <head>
        <title>Test page</title>
        <script type="text/javascript">${sonj}</script>
    </head>
<body>
    <div id="viewer" style="display: inline-block; padding: 5px;"></div>
</body>
</html>
`;