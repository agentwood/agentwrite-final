
import dotenv from 'dotenv';
dotenv.config();

console.log(`RUNPOD_ENDPOINT_ID: ${process.env.RUNPOD_ENDPOINT_ID ? 'SET' : 'MISSING'}`);
