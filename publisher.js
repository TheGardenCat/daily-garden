const { finalizeEvent } = require('nostr-tools');
const { WebSocket } = require('ws');
const { bech32 } = require('@scure/base');

let privateKeyInput = process.env.NOSTR_PRIVATE_KEY;
if (!privateKeyInput) {
    console.error('❌ NOSTR_PRIVATE_KEY not set');
    process.exit(1);
}

// Convert nsec to hex bytes
let privateKeyHex;
if (privateKeyInput.startsWith('nsec1')) {
    const decoded = bech32.decode(privateKeyInput);
    const data = bech32.fromWords(decoded.words);
    privateKeyHex = Buffer.from(data).toString('hex');
} else {
    privateKeyHex = privateKeyInput;
}
const privateKeyBytes = new Uint8Array(Buffer.from(privateKeyHex, 'hex'));

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

const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const dayOfYear = Math.floor((now - start) / 86400000);
const quote = quotes[dayOfYear % quotes.length];

console.log(`📝 Quote: ${quote}`);

// Create event with NO reply tags — just a simple text note
const event = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],  // EMPTY tags array = top-level post, not a reply
    content: quote
};

const signedEvent = finalizeEvent(event, privateKeyBytes);
console.log(`✓ Signed: ${signedEvent.id}`);

// Publish to your relays
const relays = ['wss://relay.damus.io', 'wss://nos.lol'];
let success = 0;

async function publish(url) {
    return new Promise((resolve) => {
        const ws = new WebSocket(url);
        ws.on('open', () => {
            ws.send(JSON.stringify(["EVENT", signedEvent]));
            setTimeout(() => ws.close(), 1000);
            console.log(`✓ Published to ${url}`);
            resolve(true);
        });
        ws.on('error', () => {
            console.log(`✗ Failed ${url}`);
            resolve(false);
        });
        setTimeout(() => resolve(false), 5000);
    });
}

(async () => {
    for (const url of relays) {
        if (await publish(url)) success++;
    }
    console.log(`✅ Published to ${success}/${relays.length} relays`);
    if (success === 0) process.exit(1);
})();
