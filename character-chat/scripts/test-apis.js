
async function testTTS() {
    console.log('Testing TTS API...');
    try {
        const response = await fetch('http://localhost:3000/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: 'Hello world',
                characterId: 'eloise_durand'
            })
        });
        const data = await response.json();
        console.log('TTS STATUS:', response.status);
        if (!response.ok) console.error('TTS ERROR:', data);
    } catch (error) {
        console.error('TTS REQUEST FAILED:', error.message);
    }
}

async function testChat() {
    console.log('Testing Chat API...');
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: 'some-id',
                characterId: 'eloise_durand',
                messages: [{ role: 'user', text: 'hi' }]
            })
        });
        const data = await response.json();
        console.log('Chat STATUS:', response.status);
        if (!response.ok) console.error('Chat ERROR:', data);
    } catch (error) {
        console.error('Chat REQUEST FAILED:', error.message);
    }
}

testTTS().then(testChat);
