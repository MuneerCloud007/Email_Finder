import puppeteer from 'puppeteer';

const randomDelay = () => {
  const min = 1000; // 1 second in milliseconds
  const max = 5000; // 5 seconds in milliseconds
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const extractData = async (page) => {
  await page.waitForSelector('#profile-card-section');

  const profileData = await page.evaluate(() => {
    const profileSection = document.getElementById("profile-card-section");

    const fullName = profileSection.children[0]?.textContent.trim() || 'N/A';
    const designation = profileSection.children[2]?.children[0]?.textContent.trim() ? profileSection.children[2]?.children[0]?.textContent.trim().replace(/\s+/g, ' ').trim() : 'N/A';
    const personLocation = profileSection.children[2]?.children[0]?.children[3]?.children[0]?.innerText.trim() || 'N/A';
    const connections = profileSection.children[2]?.children[0]?.children[3]?.children[1]?.innerText.trim() || 'N/A';

    const currentRoles = Array.from(profileSection.children[4]?.children[0]?.children[1]?.children || [])
      .map(role => ({
        designation: role.children[0]?.children[1]?.children[0]?.children[0]?.textContent.trim() || 'N/A',
        companyUrl: role.children[0]?.children[1]?.children[0]?.children[1]?.href || 'N/A',
        date: role.children[0]?.children[1]?.children[1]?.children[0]?.innerText.trim() || 'N/A'
      }));

    const socialMedia = Array.from(profileSection.children[4]?.children[1]?.children[1]?.children || [])
      .slice(0, -1)
      .map(media => {
        const url = media.children[0]?.children[0]?.children[1]?.href || 'N/A';
        const name = media.children[0]?.children[0]?.children[1]?.innerText.replace('social media', '').trim() || 'N/A';
        const socialMediaType = getSocialMediaName(url);
        return { name, url, socialMedia: socialMediaType };
      });

    function getSocialMediaName(url) {
      try {
        const domain = new URL(url).hostname;
        if (domain.includes('twitter.com')) return 'twitter';
        if (domain.includes('facebook.com')) return 'facebook';
        if (domain.includes('linkedin.com')) return 'linkedin';
        if (domain.includes('instagram.com')) return 'instagram';
        return 'other';
      } catch (error) {
        return 'N/A';
      }
    }

    return { fullName, designation, personLocation, connections, currentRoles, socialMedia };
  });

  return profileData;
};

const checkLoadingState = async (page) => {
  const startTime = Date.now();
  const loadingTimeout = 30000; // 30 seconds
  
  while (Date.now() - startTime < loadingTimeout) {
    const isLoading = await page.evaluate(() => {
      return document.readyState !== 'complete';
    });
    
    if (!isLoading) {
      return true; // Page has loaded
    }
    
    await delay(1000); // Check every second
  }
  
  return false; // Timeout reached
};

const simulateMouseMovement = async (page, selector) => {
  try {
    const element = await page.waitForSelector(selector, { timeout: 5000 });
    const box = await element.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
      await delay(500); // Simulate a short pause to mimic human interaction
    }
  } catch (error) {
    console.log(`Error moving mouse to ${selector}: ${error.message}`);
  }
};

const simulateClick = async (page, selector) => {
  try {
    await simulateMouseMovement(page, selector);
    const element = await page.waitForSelector(selector, { timeout: 5000 });
    await element.click();
    await delay(1000); // Simulate time taken for a human to click
  } catch (error) {
    console.log(`Error clicking ${selector}: ${error.message}`);
  }
};

const simulateTyping = async (page, selector, text) => {
  try {
    await simulateMouseMovement(page, selector);
    const element = await page.waitForSelector(selector, { timeout: 5000 });
    await element.focus();
    await page.keyboard.type(text, { delay: 100 }); // Simulate typing with delay
    await delay(1000); // Simulate time taken to type
  } catch (error) {
    console.log(`Error typing into ${selector}: ${error.message}`);
  }
};

const extractSectionData = async (page, selector, extractionFunction) => {
  try {
    await page.waitForSelector(selector, { timeout: 5000 }); // Adjust timeout as needed
    return await page.evaluate(extractionFunction);
  } catch (error) {
    console.log(`Selector ${selector} not found: ${error.message}`);
    return [];
  }
};

const main = async (url, cookieValue) => {
  const PROFILE_URL = url;

  try {
    const maxRetries = 5;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      let browser;

      try {
        browser = await puppeteer.launch({ 
          headless: false,
          ignoreHTTPSErrors: true,
          args: [
             
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  "--hide-scrollbars",
                  "--disable-web-security",
                  "--single-process",
                  "--no-zygote",
              
          ],
          timeout: 600000,


         });
        const page = await browser.newPage();

        const COOKIES = [
          {
            name: 'li_at',
            value: cookieValue, // Replace with your actual cookie value
            domain: '.www.linkedin.com',
            path: '/',
            httpOnly: true,
            secure: true
          }
          // Add more cookies if needed
        ];

        await page.setCookie(...COOKIES);
        await page.goto(PROFILE_URL);
        await delay(2000); // Wait for the page to load
        setTimeout(async () => {
          console.log('Closing browser due to timeout...');
          if (browser) {
              await browser.close();
          }
      }, 180000);

        await simulateMouseMovement(page, '#profile-card-section');

        console.log("EXTRACT DATA POINT IS Started down");

        const profileData = await extractData(page);
        console.log(profileData);

        const aboutData = await extractSectionData(page, '#about-section', () => {
          const heading = document.querySelector('#about-section h1')?.innerText.trim() || 'N/A';
          const paragraph = document.querySelector('#about-section div')?.innerText.trim() || 'N/A';
          return { heading, content: paragraph };
        });
        console.log("ABOUT DATA");
        console.log(aboutData);

        const relationshipData = await extractSectionData(page, '#relationship-section', () => {
          const relationshipSection = document.querySelector('#relationship-section');
          if (!relationshipSection) return {};
          const sectionHeading = relationshipSection.querySelector('h2')?.innerText.trim() || 'N/A';
          const conversationSection = relationshipSection.querySelector('[aria-labelledby="conversation-section-v2--heading"]');
          const conversationHeading = conversationSection?.querySelector('h2')?.innerText.trim() || 'N/A';
          const conversationText = conversationSection?.querySelector('p')?.innerText.trim() || 'N/A';
          const recentActivitySection = relationshipSection.querySelector('[aria-labelledby="recent-activity-v2--heading"]');
          const recentActivityHeading = recentActivitySection?.querySelector('h3')?.innerText.trim() || 'N/A';
          const recentActivityText = recentActivitySection?.querySelector('p')?.innerText.trim() || 'N/A';
          const recentActivityDetails = Array.from(recentActivitySection.querySelectorAll('ul.no-more-activities li')).map(li => {
            const personName = li.querySelector('h4 span')?.innerText.trim() || 'N/A';
            const action = li.querySelector('h4')?.innerText.replace(personName, '').trim() || 'N/A';
            const time = li.querySelector('time')?.getAttribute('datetime') || 'N/A';
            const content = li.querySelector('span.mb2')?.innerText.trim() || 'N/A';
            const reactions = li.querySelector('span.ml2')?.innerText.trim() || 'N/A';
            const replies = li.querySelector('span.mlA')?.innerText.trim() || 'N/A';
            return { personName, action, time, content, reactions, replies };
          });
          const sharedInCommonSection = relationshipSection.querySelector('[aria-labelledby="shared-in-common-v2--heading"]');
          const sharedInCommonHeading = sharedInCommonSection?.querySelector('h3')?.innerText.trim() || 'N/A';
          const sharedInCommonText = sharedInCommonSection?.querySelector('p')?.innerText.trim() || 'N/A';
          const getIntroducedSection = relationshipSection.querySelector('[aria-labelledby="introductions-section--heading"]');
          const getIntroducedHeading = getIntroducedSection?.querySelector('h2')?.innerText.trim() || 'N/A';
          const getIntroducedText = getIntroducedSection?.querySelector('p')?.innerText.trim() || 'N/A';
          const emptyStateText = relationshipSection.querySelector('div._empty-state_1wpdh6 p')?.innerText.trim() || 'N/A';
          const searchLeadsLink = relationshipSection.querySelector('div._empty-state_1wpdh6 a._empty-state-cta_1wpdh6')?.href || 'N/A';
          return {
            sectionHeading,
            conversation: { heading: conversationHeading, text: conversationText },
            recentActivity: { heading: recentActivityHeading, text: recentActivityText, details: recentActivityDetails },
            sharedInCommon: { heading: sharedInCommonHeading, text: sharedInCommonText },
            getIntroduced: { heading: getIntroducedHeading, text: getIntroducedText, emptyState: { text: emptyStateText, link: searchLeadsLink } }
          };
        });

        console.log("RelationSHip");
        console.log(relationshipData);

        const experienceData = await extractSectionData(page, 'li._experience-entry_1irc72', () => {
          const experience = Array.from(document.querySelectorAll('li._experience-entry_1irc72')).map(entry => {
            const companyName = entry.querySelector('p[data-anonymize="company-name"]')?.textContent.trim() || 'N/A';
            const jobTitle = entry.querySelector('h2[data-anonymize="job-title"]')?.textContent.trim() || 'N/A';
            const logoUrl = entry.querySelector('img[data-anonymize="company-logo"]')?.src || 'N/A';
            const duration = entry.querySelector('p._bodyText_1e5nen._default_1i6ulk._sizeXSmall_1e5nen._lowEmphasis_1i6ulk span')?.textContent.trim() || 'N/A';
            const location = entry.querySelector('p.QGbcgTnAyBLfLOzcFvoXmaPCuNSITnODBCqCKE._bodyText_1e5nen._default_1i6ulk._sizeXSmall_1e5nen._lowEmphasis_1i6ulk')?.textContent.trim() || 'N/A';
            const description = entry.querySelector('p[data-anonymize="person-blurb"]')?.textContent.trim() || 'N/A';
            return { companyName, jobTitle, logoUrl, duration, location, description };
          });
          return { experience };
        });
        console.log("experienceData");
        console.log(experienceData);

        const educationData = await extractSectionData(page, 'section[data-sn-view-name="feature-lead-education"]', () => {
          const education = Array.from(document.querySelectorAll('li.UhSfAYiyWstsqOyhosgANwoFxXoMCcbfxbQypA')).map(entry => {
            const logoUrl = entry.querySelector('img')?.src || 'N/A';
            const schoolName = entry.querySelector('h3[data-anonymize="education-name"]')?.textContent.trim() || 'N/A';
            const details = entry.querySelector('p')?.innerText.trim().split('\n') || ['N/A'];
            return { schoolName, logoUrl, details };
          });
          return { education };
        });
        console.log("educationData");
        console.log(educationData);

        const interestsData = await extractSectionData(page, '#interests-section', () => {
          const interests = Array.from(document.querySelectorAll('#interests-section li')).map(entry => ({
            name: entry.querySelector('span')?.innerText.trim() || 'N/A'
          }));
          return { interests };
        });
        console.log("interestsData");
        console.log(interestsData);

        const skillsData = await extractSectionData(page, '#skills-section', () => {
          const skills = Array.from(document.querySelectorAll('#skills-section li')).map(entry => ({
            skill: entry.querySelector('span')?.innerText.trim() || 'N/A'
          }));
          return { skills };
        });

        console.log("skillsData");
        console.log(skillsData);

        const endorsementsData = await extractSectionData(page, '#skills-section', () => {
          const endorsementsSection = document.querySelector('#skills-section');
          if (!endorsementsSection) return { endorsements: [] };

          const endorsements = Array.from(endorsementsSection.querySelectorAll('li')).map(li => {
            const skillName = li.querySelector('p.skill-name')?.textContent.trim() || 'N/A';
            const count = li.querySelector('span.count')?.textContent.trim() || 'N/A';
            return {
              skill: skillName,
              count: count
            };
          });

          return { endorsements };
        });

        const languagesData = await extractSectionData(page, 'section.jRrGacNqFmfNQDkEdTJNeYvhbzZAthEk', () => {
          const section = document.querySelector('section.jRrGacNqFmfNQDkEdTJNeYvhbzZAthEk');
          if (!section) return { languages: [] };

          const languages = Array.from(section.querySelectorAll('li')).map(li => {
            const languageName = li.querySelector('p._bodyText_1e5nen._default_1i6ulk._weightBold_1e5nen')?.textContent.trim() || 'N/A';
            const proficiency = li.querySelector('p._language-proficiency_1vzdq2')?.textContent.trim() || 'Not specified';
            return {
              language: languageName,
              proficiency: proficiency
            };
          });

          return { languages };
        });

        const allData = {
          profile: profileData,
          about: aboutData,
          relationship: relationshipData,
          experience: experienceData,
          education: educationData,
          interests: interestsData,
          skills: skillsData,
          endorsements: endorsementsData,
          languages: languagesData
        };

        success = true;
        return allData;
      } catch (error) {
        console.log(error);
        const random = randomDelay();
        await delay(random);
        attempt++;
        if (attempt === maxRetries) {
          throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
        }
      } finally {
        if (browser) {
          await browser.close();
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Something went wrong in profile page scraping !!!!");
  }
};

export default main;
