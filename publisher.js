const { finalizeEvent } = require('nostr-tools');
const { WebSocket } = require('ws');
const { bech32 } = require('@scure/base');

// Get private key from environment variable
let privateKeyInput = process.env.NOSTR_PRIVATE_KEY;

if (!privateKeyInput) {
    console.error('❌ NOSTR_PRIVATE_KEY not set');
    process.exit(1);
}

console.log('Raw key format:', privateKeyInput.slice(0, 10) + '...');

// Convert to hex string first
let privateKeyHex;
if (privateKeyInput.startsWith('nsec1')) {
    try {
        const decoded = bech32.decode(privateKeyInput);
        const data = bech32.fromWords(decoded.words);
        privateKeyHex = Buffer.from(data).toString('hex');
        console.log('✓ Converted nsec to hex');
    } catch (e) {
        console.error('❌ Failed to convert nsec:', e.message);
        process.exit(1);
    }
} else if (/^[0-9a-f]{64}$/i.test(privateKeyInput)) {
    privateKeyHex = privateKeyInput;
    console.log('✓ Using hex key');
} else {
    console.error('❌ Unknown key format');
    process.exit(1);
}

// Convert hex string to Uint8Array (this is what nostr-tools expects)
const privateKeyBytes = new Uint8Array(Buffer.from(privateKeyHex, 'hex'));

console.log('✓ Private key as bytes (length:', privateKeyBytes.length, ')');

// Daily quotes
const quotes = [
    "Let today be soft. You don't have to earn your rest. 🌸",
    "Like a seed, you are exactly where you need to be right now. 🌱",
    "The smallest kind word echoes longer than you know. 🕊️",
    "Your heart is not too much. It is exactly enough. 💫",
    "Moss grows without rushing. So do you. 🍃",
    "You are allowed to outgrow what once held you. 🌿",
    "Today, whisper yes to one small thing you've been avoiding. ✨",
    "The garden doesn't compare roses to daisies. Neither should you. 🌼",
    "Breathe. The world will wait for you this once. 🍂",
    "You have survived every hard day so far. That's a miracle. 🌙"
];

// Pick quote based on day of year
const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const dayOfYear = Math.floor((now - start) / 86400000);
const quote = quotes[dayOfYear % quotes.length];

console.log(`📝 Today's quote (day ${dayOfYear + 1}):`, quote);

// Create Nostr event
const event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["t", "dailyinspiration"]],
    content: quote
};

let signedEvent;
try {
    // Pass the Uint8Array
    signedEvent = finalizeEvent(event, privateKeyBytes);
    console.log('✓ Event signed:', signedEvent.id.slice(0, 16) + '...');
} catch (e) {
    console.error('❌ Failed to sign event:', e.message);
    process.exit(1);
}

// Publish to relays
const relays = [
    'wss://relay.damus.io',
    'wss://nos.lol'
];

let successCount = 0;

async function publishToRelay(url) {
    return new Promise((resolve) => {
        const ws = new WebSocket(url);
        const timeout = setTimeout(() => {
            ws.close();
            console.log(`✗ Timeout: ${url}`);
            resolve(false);
        }, 5000);
        
        ws.on('open', () => {
            clearTimeout(timeout);
            ws.send(JSON.stringify(["EVENT", signedEvent]));
            setTimeout(() => {
                ws.close();
                console.log(`✓ Published to ${url}`);
                resolve(true);
            }, 1000);
        });
        
        ws.on('error', (err) => {
            clearTimeout(timeout);
            console.log(`✗ Error: ${url}`);
            resolve(false);
        });
    });
}

(async () => {
    for (const relay of relays) {
        const success = await publishToRelay(relay);
        if (success) successCount++;
    }
    
    console.log(`\n✅ Published to ${successCount}/${relays.length} relays`);
    if (successCount > 0) {
        console.log(`🔗 View: https://snort.social/e/${signedEvent.id}`);
        console.log('🌸 Your garden is blooming!');
    } else {
        console.error('❌ Failed to publish to any relay');
        process.exit(1);
    }
})();
