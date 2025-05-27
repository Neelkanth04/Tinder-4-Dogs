const puppeteer = require('puppeteer');
const fs = require('fs');

const baseURL = 'https://thepetnest.com/adopt-a-pet/dog?page=';
const outputFile = 'dogs.json';

let allDogs = [];
let seenDogIds = new Set();
let consecutiveNoNewDogs = 0;

// Load existing data if available
if (fs.existsSync(outputFile)) {
  try {
    const existingData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    allDogs = existingData;
    seenDogIds = new Set(existingData.map(d => d.id));
    console.log(`Loaded ${allDogs.length} existing dogs`);
  } catch (error) {
    console.error('Error loading existing data:', error.message);
  }
}

function extractDogData(cards) {
  return cards.map(card => {
    const link = card.querySelector('a')?.href || '';
    const idMatch = link.match(/pet\/(\d+)/);
    return {
      id: idMatch ? idMatch[1] : Math.random().toString(36).substr(2, 9),
      name: card.querySelector('.css-9yc7g4')?.textContent.trim() || 'unknown',
      breed: card.querySelector('.css-1l5sf9q')?.textContent.trim() || 'unknown',
      location: card.querySelector('.css-1yyk1n8')?.textContent.trim() || 'unknown',
      age: card.querySelector('.css-1vm6rnk')?.textContent.trim() || 'unknown',
      image: card.querySelector('img')?.src || '',
      link: link,
      lastUpdated: new Date().toISOString()
    };
  });
}

async function loadPageWithRetry(page, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      await page.waitForSelector('.css-k008qs', { timeout: 15000 });
      return true;
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed for ${url}: ${err.message}`);
      if (i === retries - 1) return false;
      await new Promise(res => setTimeout(res, 3000 * (i + 1)));
    }
  }
  return false;
}

(async () => {
  // Configure Puppeteer for GitHub Actions
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

  let pageNum = 1;
  const startTime = Date.now();
  let totalNewDogs = 0;

  try {
    while (true) {
      console.log(`\nScraping page ${pageNum}...`);
      const pageUrl = `${baseURL}${pageNum}`;

      const loaded = await loadPageWithRetry(page, pageUrl);
      if (!loaded) {
        console.error(`Failed to load page ${pageNum}. Ending scrape.`);
        break;
      }

      const dogData = await page.evaluate(() => {
        const cards = document.querySelectorAll('.css-k008qs');
        return Array.from(cards).map(card => {
          const link = card.querySelector('a')?.href || '';
          const idMatch = link.match(/pet\/(\d+)/);
          return {
            id: idMatch ? idMatch[1] : Math.random().toString(36).substr(2, 9),
            name: card.querySelector('.css-9yc7g4')?.textContent.trim() || 'unknown',
            breed: card.querySelector('.css-1l5sf9q')?.textContent.trim() || 'unknown',
            location: card.querySelector('.css-1yyk1n8')?.textContent.trim() || 'unknown',
            age: card.querySelector('.css-1vm6rnk')?.textContent.trim() || 'unknown',
            image: card.querySelector('img')?.src || '',
            link: link,
            lastUpdated: new Date().toISOString()
          };
        });
      });

      const newDogs = dogData.filter(dog => !seenDogIds.has(dog.id));
      newDogs.forEach(dog => seenDogIds.add(dog.id));
      allDogs.push(...newDogs);
      totalNewDogs += newDogs.length;

      console.log(`Page ${pageNum}: Found ${dogData.length} dogs, ${newDogs.length} new. Total unique dogs: ${allDogs.length}`);

      // Save progress after each page
      fs.writeFileSync(outputFile, JSON.stringify(allDogs, null, 2));
      console.log('Progress saved.');

      if (newDogs.length === 0) {
        consecutiveNoNewDogs++;
        if (consecutiveNoNewDogs >= 3) {
          console.log('No new dogs in 3 consecutive pages. Stopping scrape.');
          break;
        }
      } else {
        consecutiveNoNewDogs = 0;
      }

      // Add delay between pages
      await new Promise(resolve => setTimeout(resolve, 2000));
      pageNum++;
    }
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nScraping complete in ${totalTime}s.`);
    console.log(`Total dogs: ${allDogs.length}`);
    console.log(`New dogs added: ${totalNewDogs}`);
  }
})();
