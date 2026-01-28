
import { SEO_DATA } from '../lib/seo/keywords';

async function verifyScale() {
    console.log('🔍 Verifying Sitemap Scale & SEO Pillars...');

    const characterCount = SEO_DATA.characters.length;
    const scenarioCount = SEO_DATA.scenarios.length;
    const totalCombinations = characterCount * scenarioCount;

    console.log(`\n📊 Data Source Stats:`);
    console.log(`- Characters: ${characterCount}`);
    console.log(`- Scenarios: ${scenarioCount}`);
    console.log(`\n🚀 Total Programmatic Pages (Roleplay Combinations):`);
    console.log(`  ${characterCount} x ${scenarioCount} = ${totalCombinations.toLocaleString()} pages`);

    if (totalCombinations > 25000) {
        console.log(`\n✅ PASS: Sitemap scale (${totalCombinations.toLocaleString()}) exceeds target of 25,000.`);
    } else {
        console.log(`\n❌ FAIL: Sitemap scale (${totalCombinations.toLocaleString()}) is below target.`);
    }
}

verifyScale();
