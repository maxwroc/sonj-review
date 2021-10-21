import { setupJestScreenshot } from "jest-screenshot";
import { writeFileSync, unlinkSync, realpathSync } from "fs";

setupJestScreenshot({
    detectAntialiasing: true,
    reportDir: "test/__report__"
});

beforeAll(() => {
    writeFileSync(testPagePath, testPageHtml);
});

beforeEach(async () => {
    await page.setViewport({
        width: 640,
        height: 480,
        deviceScaleFactor: 1,
    });
    
    let path = realpathSync('./test/index.html');
    await page.goto('file://' + path, {waitUntil: 'domcontentloaded'});
    await page.waitForSelector("#viewer");
});

afterAll(() => {
    unlinkSync(testPagePath);
});

const testPagePath = "test/index.html";
const testPageHtml = `
<!DOCTYPE html>
<html>
    <head>
        <title>Test page</title>
        <script src="../dist/sonj-review.js" type="text/javascript"></script>
    </head>
    <style type="text/css">
        * {
            font-family: monospace !important;
        }
    </style>
<body>
    <div id="viewer" style="display: inline-block; padding: 5px;"></div>
</body>
</html>
`;