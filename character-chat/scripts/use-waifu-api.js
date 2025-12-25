/**
 * Use waifu.pics API to get random waifu images
 * Since waifu.pics doesn't support seeded URLs, we'll fetch random images
 * and cache the URLs, or use a different approach
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

async function fetchWaifuImage() {
  return new Promise((resolve, reject) => {
    https.get('https://api.waifu.pics/sfw/waifu', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.url);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function updateFantasyAvatars() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  const fantasy = personas.filter(p => 
    ['fantasy', 'fiction', 'adventure', 'horror'].includes(p.category?.toLowerCase())
  );
  
  console.log(`Fetching ${fantasy.length} waifu images...\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  for (const persona of fantasy) {
    try {
      console.log(`Fetching for ${persona.name}...`);
      const imageUrl = await fetchWaifuImage();
      persona.avatarUrl = imageUrl;
      results.success.push(persona.name);
      console.log(`✅ Got: ${imageUrl.substring(0, 50)}...`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed for ${persona.name}:`, error.message);
      results.failed.push({ name: persona.name, error: error.message });
    }
  }
  
  // Save updated file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  
  console.log(`\n✅ Updated ${results.success.length} fantasy avatars`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\nFailed characters:`);
    results.failed.forEach(f => console.log(`  - ${f.name}`));
  }
}

// Actually, let's use a better approach - use a service that supports seeding
// Or provide manual download instructions
console.log('Note: waifu.pics API returns random images (not seeded)');
console.log('Better approach: Use manual download or a different service');
console.log('Generating download list instead...\n');



