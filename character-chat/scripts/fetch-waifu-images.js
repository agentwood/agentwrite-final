/**
 * Fetch waifu images from waifu.pics API and cache URLs
 * Since waifu.pics doesn't support seeded URLs, we fetch random images
 * and store the URLs in the seed file
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

function fetchWaifuImage() {
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
  
  console.log(`Fetching ${fantasy.length} waifu images from waifu.pics API...\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  for (let i = 0; i < fantasy.length; i++) {
    const persona = fantasy[i];
    try {
      console.log(`[${i + 1}/${fantasy.length}] Fetching for ${persona.name}...`);
      const imageUrl = await fetchWaifuImage();
      persona.avatarUrl = imageUrl;
      results.success.push({ name: persona.name, url: imageUrl });
      console.log(`✅ Got: ${imageUrl.substring(0, 60)}...`);
      
      // Rate limiting - wait 1.5 seconds between requests
      if (i < fantasy.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed for ${persona.name}:`, error.message);
      results.failed.push({ name: persona.name, error: error.message });
    }
  }
  
  // Save updated file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  
  console.log(`\n✅ Successfully fetched ${results.success.length} waifu images`);
  console.log(`❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\nFailed characters:`);
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
  
  console.log(`\n💡 Next: Run 'npm run db:seed' to update database`);
  console.log(`\n📝 Note: These are random waifu images. For specific character-matched images,`);
  console.log(`   you'll need to manually download from waifu.pics or thiswaifudoesnotexist.net`);
}

updateFantasyAvatars().catch(console.error);



