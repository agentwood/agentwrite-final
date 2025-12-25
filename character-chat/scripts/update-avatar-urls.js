/**
 * Script to update avatar URLs after generating Perchance images
 * Scans /public/avatars/ and updates persona-templates.seed.json
 */

const fs = require('fs');
const path = require('path');

const PERSONAS_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const AVATARS_DIR = path.join(__dirname, '../public/avatars');
const OUTPUT_FILE = path.join(__dirname, '../data/persona-templates.seed.json');

/**
 * Update avatar URLs based on generated images
 */
function updateAvatarUrls() {
  console.log('Reading persona templates...');
  const personas = JSON.parse(fs.readFileSync(PERSONAS_FILE, 'utf8'));
  
  // Check if avatars directory exists
  if (!fs.existsSync(AVATARS_DIR)) {
    console.log(`⚠️  Avatars directory not found: ${AVATARS_DIR}`);
    console.log('   Creating directory...');
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
    console.log('   Directory created. Please add generated images here.\n');
  }
  
  // Get list of generated images
  const avatarFiles = fs.existsSync(AVATARS_DIR) 
    ? fs.readdirSync(AVATARS_DIR).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
    : [];
  
  console.log(`Found ${avatarFiles.length} avatar images\n`);
  
  const updated = personas.map((persona) => {
    const expectedFilename = `${persona.id}.jpg`;
    const hasImage = avatarFiles.includes(expectedFilename) || 
                     avatarFiles.includes(`${persona.id}.png`) ||
                     avatarFiles.includes(`${persona.id}.webp`);
    
    let newUrl = persona.avatarUrl;
    
    // Check if it's a human character (keep Dicebear)
    const isHuman = persona.category === 'realistic' || 
                    persona.name.toLowerCase().includes('old man') ||
                    persona.name.toLowerCase().includes('surfer') ||
                    persona.name.toLowerCase().includes('chef') ||
                    persona.name.toLowerCase().includes('tutor') ||
                    persona.name.toLowerCase().includes('therapy') ||
                    persona.name.toLowerCase().includes('comedic') ||
                    persona.name.toLowerCase().includes('leader') ||
                    persona.name.toLowerCase().includes('introvert') ||
                    persona.name.toLowerCase().includes('romantic') ||
                    persona.name.toLowerCase().includes('sassy') ||
                    persona.name.toLowerCase().includes('best friend');
    
    if (!isHuman) {
      // For fantasy characters, use Perchance-generated images
      if (hasImage) {
        // Find actual filename (could be .jpg, .png, or .webp)
        const actualFile = avatarFiles.find(f => f.startsWith(persona.id + '.'));
        newUrl = `/avatars/${actualFile}`;
        console.log(`✅ ${persona.name}: Updated to /avatars/${actualFile}`);
      } else {
        // Keep placeholder or existing URL
        if (!newUrl.startsWith('/avatars/')) {
          console.log(`⚠️  ${persona.name}: No image found, keeping current URL: ${newUrl}`);
        }
      }
    } else {
      // Human characters keep Dicebear
      if (hasImage) {
        console.log(`ℹ️  ${persona.name}: Human character, keeping Dicebear avatar`);
      }
    }
    
    return {
      ...persona,
      avatarUrl: newUrl,
    };
  });
  
  // Count updates
  const updatedCount = updated.filter((p, i) => p.avatarUrl !== personas[i].avatarUrl).length;
  
  // Write updated file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(updated, null, 2));
  
  console.log(`\n✅ Updated ${updatedCount} avatar URLs`);
  console.log(`📁 Output: ${OUTPUT_FILE}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Generate remaining images using prompts in perchance-prompts.json`);
  console.log(`   2. Save images to: ${AVATARS_DIR}`);
  console.log(`   3. Run this script again to update URLs`);
  console.log(`   4. Run: npm run db:seed`);
}

updateAvatarUrls();




