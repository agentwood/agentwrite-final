/**
 * Generate a list of avatar file names for manual download
 * This helps when APIs don't support direct seeded URLs
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../data/persona-templates.seed.json');
const OUTPUT_FILE = path.join(__dirname, '../docs/AVATAR_DOWNLOAD_LIST.md');

function generateAvatarList() {
  const personas = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  
  const fantasy = personas.filter(p => 
    ['fantasy', 'fiction', 'adventure', 'horror'].includes(p.category?.toLowerCase())
  );
  
  const realistic = personas.filter(p => {
    const cat = p.category?.toLowerCase();
    if (!['comedy', 'support', 'educational'].includes(cat)) return false;
    const arch = (p.archetype || '').toLowerCase();
    const nm = (p.name || '').toLowerCase();
    return arch.includes('old') || arch.includes('veteran') || arch.includes('granny') ||
           arch.includes('karen') || arch.includes('tribal') || arch.includes('shaman') ||
           arch.includes('merchant') || arch.includes('master') || arch.includes('leader') ||
           arch.includes('seafarer') || arch.includes('elder') ||
           nm.includes('karen') || nm.includes('granny') || nm.includes('veteran') ||
           nm.includes('tribal') || nm.includes('shaman') || nm.includes('old') ||
           nm.includes('elder') || nm.includes('grandfather') || nm.includes('grandmother');
  });
  
  let markdown = `# Avatar Download List\n\n`;
  markdown += `## Fantasy Characters (Waifu Style)\n\n`;
  markdown += `Download from: https://waifu.pics or https://thiswaifudoesnotexist.net\n\n`;
  markdown += `| Character Name | File Name | Notes |\n`;
  markdown += `|----------------|-----------|-------|\n`;
  
  fantasy.forEach(p => {
    const id = p.id || p.seedId || p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${id}.jpg`;
    markdown += `| ${p.name} | \`${filename}\` | Waifu anime style |\n`;
  });
  
  markdown += `\n## Realistic Human Characters\n\n`;
  markdown += `Download from: https://thispersondoesnotexist.net or similar human face generator\n\n`;
  markdown += `| Character Name | File Name | Notes |\n`;
  markdown += `|----------------|-----------|-------|\n`;
  
  realistic.forEach(p => {
    const id = p.id || p.seedId || p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filename = `${id}.jpg`;
    markdown += `| ${p.name} | \`${filename}\` | Realistic human face |\n`;
  });
  
  markdown += `\n## Instructions\n\n`;
  markdown += `1. Download images matching the character descriptions\n`;
  markdown += `2. Save them with the exact file names listed above\n`;
  markdown += `3. Place fantasy images in: \`public/avatars/fantasy/\`\n`;
  markdown += `4. Place realistic images in: \`public/avatars/realistic/\`\n`;
  markdown += `5. Run the update script to set local paths\n`;
  
  fs.writeFileSync(OUTPUT_FILE, markdown);
  console.log(`✅ Generated avatar download list: ${OUTPUT_FILE}`);
  console.log(`\n📋 Summary:`);
  console.log(`   Fantasy: ${fantasy.length} characters`);
  console.log(`   Realistic: ${realistic.length} characters`);
}

generateAvatarList();



