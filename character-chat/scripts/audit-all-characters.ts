
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();

function checkVoiceFile(voicePath: string | null): string {
    if (!voicePath) return "❌ Missing";

    // Handle monorepo structure: check both root/public and character-chat/public
    const relativePath = voicePath.startsWith('/') ? voicePath.slice(1) : voicePath;

    // Try root public first
    let localPath = path.join(process.cwd(), 'public', relativePath);
    if (fs.existsSync(localPath)) return "✅ Valid (Local)";

    // Try character-chat public
    localPath = path.join(process.cwd(), 'character-chat', 'public', relativePath);
    if (fs.existsSync(localPath)) return "✅ Valid (Local)";

    return `❌ Not Found: ${voicePath}`;
}

async function main() {
    console.log("🔍 Starting Full Character Audit...");
    const characters = await prisma.personaTemplate.findMany({
        orderBy: { name: 'asc' },
        include: { voiceSeed: true }
    });

    console.log(`Found ${characters.length} characters.`);

    let reportContent = "# Master Character Audit Report\n\n";
    reportContent += `Generated at: ${new Date().toISOString()}\n\n`;
    reportContent += `| ID | Name | Category | Voice Status | Avatar Status | Data Integrity |\n`;
    reportContent += `|---|---|---|---|---|---|\n`;

    const results = [];

    for (const char of characters) {
        // 1. Voice Check
        const voicePath = char.voiceSeed?.filePath || null;
        const voiceStatus = checkVoiceFile(voicePath);

        // 2. Avatar Check
        const avatarStatus = char.avatarUrl ? "✅ Set" : "❌ Missing";

        // 3. Data Integrity
        const issues = [];
        if (!char.tagline) issues.push("No Tagline");
        if (!char.description) issues.push("No Description");
        if (!char.systemPrompt && !char.description) issues.push("No System Prompt");

        const dataStatus = issues.length > 0 ? `⚠️ ${issues.join(', ')}` : "✅ Complete";

        const line = `| ${char.id.slice(0, 4)} | **${char.name}** | ${char.category} | ${voiceStatus} | ${avatarStatus} | ${dataStatus} |`;
        // Only log errors to console to keep it clean, but write ALL to file
        if (voiceStatus.includes('❌') || avatarStatus.includes('❌')) {
            console.log(line);
        }
        reportContent += line + "\n";

        results.push({ name: char.name, voice: voiceStatus, avatar: avatarStatus, data: dataStatus });
    }

    // Summary
    const missingVoices = results.filter(r => r.voice.includes('❌') || r.voice.includes('Missing')).length;
    const missingAvatars = results.filter(r => r.avatar.includes('❌')).length;

    const summary = `
### Audit Summary
- Total Characters: ${characters.length}
- Missing/Invalid Voice Seeds: ${missingVoices}
- Missing Avatars: ${missingAvatars}
`;
    reportContent += summary;
    console.log(summary);

    if (missingVoices === 0 && missingAvatars === 0) {
        console.log("\n✅ GREAT SUCCESS! All characters are valid.");
        reportContent += "\n\n✅ **PASSED 100%**\n";
    } else {
        console.log("\n⚠️ ACTION REQUIRED: Review the table.");
        reportContent += "\n\n⚠️ **ISSUES FOUND**\n";
    }

    // Write to artifacts directory if possible, or CWD
    // We'll write to CWD 'audit_report.md'
    fs.writeFileSync('audit_report.md', reportContent);
    console.log("📝 Report saved to audit_report.md");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
