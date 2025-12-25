/**
 * Download avatars from waifu.pics for fantasy characters
 * Stores them in public/avatars/ directory
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const AVATAR_DIR = path.join(__dirname, '../public/avatars');
const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

// Ensure avatar directory exists
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

// Download function
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        file.close();
        fs.unlinkSync(filepath);
        downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

async function downloadAvatars() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  const fantasyPersonas = personas.filter(p => 
    p.category === 'fantasy' || 
    p.category === 'fiction' || 
    p.category === 'adventure' ||
    p.category === 'horror'
  );

  console.log(`Found ${fantasyPersonas.length} fantasy characters to download avatars for\n`);

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (const persona of fantasyPersonas) {
    const characterId = persona.id || persona.seedId || persona.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${characterId}.jpg`;
    const filepath = path.join(AVATAR_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipped ${persona.name} (already exists)`);
      results.skipped.push(persona.name);
      continue;
    }

    // Generate waifu.pics URL
    const seed = characterId.replace(/-/g, '');
    const url = `https://i.waifu.pics/${seed}.jpg`;

    try {
      console.log(`⬇️  Downloading ${persona.name}...`);
      await downloadFile(url, filepath);
      console.log(`✅ Downloaded ${persona.name}`);
      results.success.push(persona.name);
      
      // Update seed file with local path
      persona.avatarUrl = `/avatars/${filename}`;
    } catch (error) {
      console.error(`❌ Failed to download ${persona.name}: ${error.message}`);
      results.failed.push({ name: persona.name, error: error.message });
    }

    // Rate limiting - wait 500ms between downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save updated seed file
  fs.writeFileSync(SEED_FILE, JSON.stringify(personas, null, 2));
  console.log(`\n✅ Updated ${SEED_FILE} with local avatar paths`);

  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${results.success.length}`);
  console.log(`   ⏭️  Skipped: ${results.skipped.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed downloads:`);
    results.failed.forEach(({ name, error }) => {
      console.log(`   - ${name}: ${error}`);
    });
  }

  console.log(`\n💡 To manually download failed avatars:`);
  console.log(`   1. Visit https://waifu.pics`);
  console.log(`   2. Generate images for: ${results.failed.map(f => f.name).join(', ')}`);
  console.log(`   3. Save them as: ${results.failed.map(f => {
    const id = f.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${id}.jpg`;
  }).join(', ')}`);
  console.log(`   4. Place them in: ${AVATAR_DIR}`);
}

downloadAvatars().catch(console.error);



