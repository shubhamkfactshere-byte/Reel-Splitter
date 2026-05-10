const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:8080/');

  // wait for input to be present
  await page.waitForSelector('#file-input');

  // upload file
  const inputUploadHandle = await page.$('#file-input');
  await inputUploadHandle.uploadFile(path.resolve('/Users/shubhamhathi/Clip split/sample.mp4'));

  // Wait for main editor to appear
  await page.waitForSelector('#main-editor:not(.hidden)');
  console.log("File uploaded and editor visible.");

  // Test sequential parts export (like user clicking part 1 then part 2)
  console.log("Clicking export part 1...");
  await page.click('#btn-export-part');
  
  // wait for overlay to be hidden again
  await page.waitForSelector('#processing-overlay.hidden', { timeout: 60000 });
  console.log("Part 1 export finished.");

  // Select part 2
  console.log("Selecting part 2...");
  const pills = await page.$$('#parts-nav .part-pill');
  if (pills.length > 1) {
    await pills[1].click();
    console.log("Clicked part 2 pill.");
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("Clicking export part 2...");
    await page.click('#btn-export-part');
    
    try {
      await page.waitForSelector('#processing-overlay.hidden', { timeout: 60000 });
      console.log("Part 2 export finished successfully.");
    } catch (e) {
      console.log("Timeout or error waiting for part 2:", e.message);
    }
  } else {
    console.log("Only 1 part available, cannot test part 2.");
  }

  await browser.close();
})();
