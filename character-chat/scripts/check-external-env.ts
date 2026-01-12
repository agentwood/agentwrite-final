
import dotenv from 'dotenv';
dotenv.config();

function checkExternal() {
    const keys = [
        'FISH_API_KEY',
        'ELEVENLABS_API_KEY',
        'OPENAI_API_KEY'
    ];

    console.log('--- External Provider Check ---');
    keys.forEach(key => {
        const val = process.env[key];
        console.log(`${key}: ${val ? 'SET (length: ' + val.length + ')' : 'MISSING'}`);
    });
}

checkExternal();
