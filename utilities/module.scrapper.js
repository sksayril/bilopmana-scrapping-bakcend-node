// const puppeteer = require("puppeteer-extra"); // Puppeteer for browser automation
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// puppeteer.use(StealthPlugin());

// const userAgents = [
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
//   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
//   "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
// ];

// const scrapeGoogleMaps = async (keyword) => {
//   console.log(`🚀 Starting Google Maps Scraper for: ${keyword}`);

//   // Select a random user agent
//   const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

//   // Launch Puppeteer browser (headless mode enabled)
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   const page = await browser.newPage();
//   await page.setUserAgent(randomUserAgent);
//   await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(keyword)}/`, {
//     waitUntil: "networkidle2",
//   });

//   // Try to accept cookies (if the button appears)
//   try {
//     const acceptCookiesSelector = "form:nth-child(2)";
//     await page.waitForSelector(acceptCookiesSelector, { timeout: 5000 });
//     await page.click(acceptCookiesSelector);
//   } catch (error) {
//     console.log("✅ No cookie banner detected, proceeding...");
//   }

//   console.log("🔄 Scrolling to load more results...");
//   await page.evaluate(async () => {
//     const resultsSelector = 'div[role="feed"]';
//     const wrapper = document.querySelector(resultsSelector);

//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       let distance = 1000;
//       let scrollDelay = 3000;

//       let timer = setInterval(async () => {
//         let scrollHeightBefore = wrapper.scrollHeight;
//         wrapper.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeightBefore) {
//           totalHeight = 0;
//           await new Promise((resolve) => setTimeout(resolve, scrollDelay));

//           let scrollHeightAfter = wrapper.scrollHeight;
//           if (scrollHeightAfter === scrollHeightBefore) {
//             clearInterval(timer);
//             resolve();
//           }
//         }
//       }, 200);
//     });
//   });

//   console.log("✅ Finished scrolling. Extracting data...");
//   const results = await page.evaluate(() => {
//     const items = Array.from(
//       document.querySelectorAll('div[role="feed"] > div > div[jsaction]')
//     );

//     return items.map((item) => {
//       let data = {};
//       try {
//         data.title = item.querySelector(".fontHeadlineSmall").textContent.trim();
//       } catch (error) {}
//       try {
//         data.link = item.querySelector("a").getAttribute("href");
//       } catch (error) {}
//       try {
//         data.website = item.querySelector('[data-value="Website"]').getAttribute("href");
//       } catch (error) {}
//       try {
//         const ratingText = item
//           .querySelector('.fontBodyMedium > span[role="img"]')
//           .getAttribute("aria-label")
//           .split(" ")
//           .map((x) => x.replace(",", "."))
//           .map(parseFloat)
//           .filter((x) => !isNaN(x));
//         data.stars = ratingText[0];
//         data.reviews = ratingText[1];
//       } catch (error) {}
//       try {
//         const textContent = item.innerText;
//         const phoneRegex = /((\+?\d{1,2}[ -]?)?(\(?\d{3}\)?[ -]?\d{3,4}[ -]?\d{4}|\(?\d{2,3}\)?[ -]?\d{2,3}[ -]?\d{2,3}[ -]?\d{2,3}))/g;
//         const matches = [...textContent.matchAll(phoneRegex)];
//         let phoneNumbers = matches.map((match) => match[0]).filter((phone) => (phone.match(/\d/g) || []).length >= 10);
//         let phoneNumber = phoneNumbers.length > 0 ? phoneNumbers[0] : null;
//         if (phoneNumber) {
//           phoneNumber = phoneNumber.replace(/[ -]/g, "");
//         }
//         data.phone = phoneNumber;
//       } catch (error) {}
//       return data;
//     });
//   });

//   const filteredResults = results.filter((result) => result.title);
//   await browser.close();

//   console.log(`✅ Extracted ${filteredResults.length} results.`);
//   return { count: filteredResults.length, data: filteredResults };
// };

// module.exports = scrapeGoogleMaps;

const puppeteer = require("puppeteer-extra"); // Puppeteer for browser automation
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const ScrapeResult = require("../models/scrape.model"); // Import MongoDB model

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
];

const scrapeGoogleMaps = async (keyword, userId) => {
  console.log(`🚀 Starting Google Maps Scraper for: ${keyword}`);

  // Select a random user agent
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  // Launch Puppeteer browser (headless mode enabled)
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(randomUserAgent);
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(keyword)}/`, {
    waitUntil: "networkidle2",
  });

  // Try to accept cookies (if the button appears)
  try {
    const acceptCookiesSelector = "form:nth-child(2)";
    await page.waitForSelector(acceptCookiesSelector, { timeout: 5000 });
    await page.click(acceptCookiesSelector);
  } catch (error) {
    console.log("✅ No cookie banner detected, proceeding...");
  }

  console.log("🔄 Scrolling to load more results...");
  await page.evaluate(async () => {
    const resultsSelector = 'div[role="feed"]';
    const wrapper = document.querySelector(resultsSelector);

    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 1000;
      let scrollDelay = 3000;

      let timer = setInterval(async () => {
        let scrollHeightBefore = wrapper.scrollHeight;
        wrapper.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeightBefore) {
          totalHeight = 0;
          await new Promise((resolve) => setTimeout(resolve, scrollDelay));

          let scrollHeightAfter = wrapper.scrollHeight;
          if (scrollHeightAfter === scrollHeightBefore) {
            clearInterval(timer);
            resolve();
          }
        }
      }, 200);
    });
  });

  console.log("✅ Finished scrolling. Extracting data...");
  const results = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('div[role="feed"] > div > div[jsaction]')
    );

    return items.map((item) => {
      let data = {};
      try {
        data.title = item.querySelector(".fontHeadlineSmall").textContent.trim();
      } catch (error) {}
      try {
        data.link = item.querySelector("a").getAttribute("href");
      } catch (error) {}
      try {
        data.website = item.querySelector('[data-value="Website"]').getAttribute("href");
      } catch (error) {}
      try {
        const ratingText = item
          .querySelector('.fontBodyMedium > span[role="img"]')
          .getAttribute("aria-label")
          .split(" ")
          .map((x) => x.replace(",", "."))
          .map(parseFloat)
          .filter((x) => !isNaN(x));
        data.stars = ratingText[0];
        data.reviews = ratingText[1];
      } catch (error) {}
      try {
        const textContent = item.innerText;
        const phoneRegex = /((\+?\d{1,2}[ -]?)?(\(?\d{3}\)?[ -]?\d{3,4}[ -]?\d{4}|\(?\d{2,3}\)?[ -]?\d{2,3}[ -]?\d{2,3}[ -]?\d{2,3}))/g;
        const matches = [...textContent.matchAll(phoneRegex)];
        let phoneNumbers = matches.map((match) => match[0]).filter((phone) => (phone.match(/\d/g) || []).length >= 10);
        let phoneNumber = phoneNumbers.length > 0 ? phoneNumbers[0] : null;
        if (phoneNumber) {
          phoneNumber = phoneNumber.replace(/[ -]/g, "");
        }
        data.phone = phoneNumber;
      } catch (error) {}
      return data;
    });
  });

  const filteredResults = results.filter((result) => result.title);
  
  // Fetch previously scraped data for this user
  const previousScrapes = await ScrapeResult.findOne({ userId, keyword });
  let previousData = previousScrapes ? previousScrapes.data.map((item) => item.title.toLowerCase()) : [];

  // Remove duplicates (filter out already scraped data)
  const uniqueData = filteredResults.filter(item => !previousData.includes(item.title.toLowerCase()));

  if (uniqueData.length === 0) {
    console.log("⚠️ No new data found, all results are duplicates.");
    await browser.close();
    return { count: 0, data: [] };
  }

  // Shuffle the unique data (random order)
  const shuffledData = uniqueData.sort(() => 0.5 - Math.random());

  // Limit to 50 results
  const finalData = shuffledData.slice(0, 50);
  
  await browser.close();

  console.log(`✅ Extracted ${finalData.length} unique results.`);
  return { count: finalData.length, data: finalData };
};

module.exports = scrapeGoogleMaps;
