const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  url: 'https://thepetnest.com/adopt-a-dog',
  rateLimitDelay: 2500,
  navigationTimeout: 90000,
  pageUpdateTimeout: 20000, // Increased timeout for page updates
  maxRetries: 3,
  retryDelay: 5000,
  selectors: {
    dogName: '.pet__name',
    dogImage: '.pet__image',
    moreDetails: '.more-details-btn',
    nextButton: 'a[aria-label="Next"]'
  }
};

// Helper function to validate dog data
function isValidDogData(dog) {
  return (
    dog &&
    typeof dog.name === 'string' &&
    dog.name.trim().length > 0 &&
    typeof dog.image === 'string' &&
    dog.image.startsWith('http') &&
    typeof dog.link === 'string' &&
    dog.link.startsWith('http')
  );
}

// Helper function to save dog data
function saveDogData(dogs, isPartial = false) {
  const outputPath = path.join(__dirname, 'src', 'app', 'dogs.json');
  fs.writeFileSync(outputPath, JSON.stringify(dogs, null, 2));
  console.log(`${isPartial ? 'Partial' : 'Complete'} results saved to ${outputPath}`);
}

// Helper function to wait for page stability
async function waitForPageStability(page, timeout = 10000) {
  try {
    await page.waitForFunction(() => {
      return document.readyState === 'complete' && 
             !document.querySelector('.loading') && 
             !document.querySelector('.spinner');
    }, { timeout });
  } catch (error) {
    console.log('Page stability check timed out, continuing anyway...');
  }
}

// Helper function to attempt recovery
async function attemptRecovery(page, currentPage) {
  console.log(`Attempting recovery for page ${currentPage}...`);
  
  try {
    // Try to reload the current page
    await page.reload({ 
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.navigationTimeout 
    });
    
    // Wait for stability
    await waitForPageStability(page);
    
    // Verify we can still see dog names
    const hasContent = await page.evaluate((selector) => {
      return document.querySelector(selector) !== null;
    }, CONFIG.selectors.dogName);
    
    if (!hasContent) {
      throw new Error('Page content not found after reload');
    }
    
    console.log('Recovery successful');
    return true;
  } catch (error) {
    console.error('Recovery failed:', error.message);
    return false;
  }
}

async function scrapeDogs() {
  let browser;
  let allDogs = [];
  let startTime = Date.now();
  let lastSuccessfulPage = 0;

  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
        '--disable-images',
        '--disable-gpu',
        '--disable-dev-shm-usage'
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });

    const page = await browser.newPage();
    
    // Set request interception to block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const blocked = ['image', 'stylesheet', 'font', 'media'];
      if (blocked.includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    
    // Set longer default timeout
    page.setDefaultNavigationTimeout(CONFIG.navigationTimeout);

    console.log('Navigating to initial page...');
    
    // Try to navigate with retries and faster initial load
    let navigationSuccess = false;
    let navigationRetries = 0;
    const maxNavigationRetries = 3;

    while (!navigationSuccess && navigationRetries < maxNavigationRetries) {
      try {
        await page.goto(CONFIG.url, { 
          waitUntil: 'domcontentloaded',
          timeout: CONFIG.navigationTimeout 
        });
        navigationSuccess = true;
        console.log('Successfully navigated to the initial page');
      } catch (error) {
        navigationRetries++;
        console.log(`Navigation attempt ${navigationRetries} failed: ${error.message}`);
        if (navigationRetries < maxNavigationRetries) {
          console.log('Waiting before retrying navigation...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw new Error(`Failed to navigate after ${maxNavigationRetries} attempts: ${error.message}`);
        }
      }
    }

    let pageCount = 1;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;
    let noNewDogsCount = 0;
    const MAX_NO_NEW_DOGS = 3; // Stop if we get no new dogs for 3 consecutive pages

    while (true) { // Run until we explicitly break
      try {
        console.log(`\nScraping page ${pageCount}...`);
        
        // Wait for content with increased timeout
        await page.waitForSelector(CONFIG.selectors.dogName, { 
          visible: true,
          timeout: CONFIG.pageUpdateTimeout 
        });

        // Wait for page stability
        await waitForPageStability(page);

        const dogsOnPage = await page.evaluate((selectors) => {
          const dogElements = document.querySelectorAll(selectors.dogName);
          const results = [];
          dogElements.forEach(el => {
            const name = el.textContent.trim();
            let card = el;
            while (card && !card.querySelector(selectors.dogImage)) {
              card = card.parentElement;
            }
            const image = card?.querySelector(selectors.dogImage)?.src;
            const link = card?.querySelector(selectors.moreDetails)?.href;
            if (name && image && link) {
              results.push({ name, image, link });
            }
          });
          return results;
        }, CONFIG.selectors);

        if (dogsOnPage.length === 0) {
          console.log('No dogs found on page, attempting recovery...');
          if (!await attemptRecovery(page, pageCount)) {
            console.log('No dogs found after recovery, stopping.');
            break;
          }
          continue;
        }

        let newDogsCount = 0;
        dogsOnPage.forEach(dog => {
          if (!allDogs.some(d => d.name === dog.name)) {
            allDogs.push(dog);
            newDogsCount++;
          }
        });

        // Track if we're getting new dogs
        if (newDogsCount === 0) {
          noNewDogsCount++;
          console.log(`No new dogs found for ${noNewDogsCount} consecutive pages`);
          if (noNewDogsCount >= MAX_NO_NEW_DOGS) {
            console.log('No new dogs found for too many consecutive pages, stopping.');
            break;
          }
        } else {
          noNewDogsCount = 0; // Reset counter if we found new dogs
        }

        console.log(`Page ${pageCount}: Found ${dogsOnPage.length} dogs, ${newDogsCount} new. Total unique dogs: ${allDogs.length}`);
        
        // Save progress
        const outputPath = path.join(__dirname, 'src', 'app', 'dogs.json');
        fs.writeFileSync(outputPath, JSON.stringify(allDogs, null, 2));

        // Check next button with better error handling
        const nextButton = await page.$(CONFIG.selectors.nextButton);
        if (!nextButton) {
          console.log('No next button found, reached last page.');
          break;
        }

        const isDisabled = await page.evaluate((btn) => {
          return btn.classList.contains('disabled') || 
                 btn.getAttribute('aria-disabled') === 'true' ||
                 !btn.offsetParent;
        }, nextButton);

        if (isDisabled) {
          console.log('Next button is disabled or hidden, reached last page.');
          break;
        }

        // Click next with better error handling
        const firstDogNameBefore = dogsOnPage[0].name;
        try {
          await nextButton.click();
          
          // Wait for page content to update with increased timeout
          await page.waitForFunction(
            (name, selector) => {
              const currentFirst = document.querySelector(selector)?.textContent.trim();
              return currentFirst && currentFirst !== name;
            },
            { timeout: CONFIG.pageUpdateTimeout },
            firstDogNameBefore,
            CONFIG.selectors.dogName
          );

          // Wait for page stability after navigation
          await waitForPageStability(page);
          
          console.log('Page content updated successfully.');
          lastSuccessfulPage = pageCount;
          consecutiveErrors = 0;
          
        } catch (clickError) {
          console.error(`Error clicking next button: ${clickError.message}`);
          if (!await attemptRecovery(page, pageCount)) {
            console.log('Failed to recover after click error, stopping.');
            break;
          }
          continue;
        }

        await new Promise(resolve => setTimeout(resolve, CONFIG.rateLimitDelay));
        pageCount++;

      } catch (error) {
        console.error(`Error on page ${pageCount}:`, error.message);
        consecutiveErrors++;
        
        if (consecutiveErrors >= CONFIG.maxRetries) {
          console.log(`Too many consecutive errors (${consecutiveErrors}), stopping.`);
          break;
        }

        // Save progress
        saveDogData(allDogs, true);
        
        // Try to recover
        if (!await attemptRecovery(page, pageCount)) {
          console.log('Failed to recover, stopping.');
          break;
        }
        
        // If we've been stuck on the same page for too long, try going back
        if (pageCount === lastSuccessfulPage) {
          console.log('Stuck on same page, attempting to go back...');
          try {
            await page.goBack({ waitUntil: 'domcontentloaded' });
            await waitForPageStability(page);
          } catch (backError) {
            console.error('Failed to go back:', backError.message);
          }
        }
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\nScraping complete in ${duration.toFixed(1)}s. Total unique dogs scraped: ${allDogs.length}`);

  } catch (error) {
    console.error('Fatal error during scraping:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed successfully.');
    }
  }
}

// Run the scraper
scrapeDogs().catch(console.error);
