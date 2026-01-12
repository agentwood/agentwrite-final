
import dotenv from 'dotenv';
dotenv.config();

function checkEnv() {
    const keys = [
        'RUNPOD_API_KEY',
        'RUNPOD_F5_ENDPOINT_ID',
        'RUNPOD_CHATTERBOX_ENDPOINT_ID',
        'RUNPOD_FISH_ENDPOINT_ID'
    ];

    console.log('--- Environment Check ---');
    keys.forEach(key => {
        const val = process.env[key];
        console.log(`${key}: ${val ? 'SET (length: ' + val.length + ')' : 'MISSING'}`);
    });
}

checkEnv();
