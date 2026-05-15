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

const quotes = [
  "Let today be soft. You don't have to earn your rest. 🌸 #catstr #cats #quotes #catposting #caturday",
  "Like a seed, you are exactly where you need to be right now. 🌱 #catstr #cats #quotes #catposting #caturday",
  "The smallest kind word echoes longer than you know. 🕊️ #catstr #cats #quotes #catposting #caturday",
  "Your heart is not too much. It is exactly enough. 💫 #catstr #cats #quotes #catposting #caturday",
  "Moss grows without rushing. So do you. 🍃 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to outgrow what once held you. 🌿 #catstr #cats #quotes #catposting #caturday",
  "Today, whisper yes to one small thing you've been avoiding. ✨ #catstr #cats #quotes #catposting #caturday",
  "The garden doesn't compare roses to daisies. Neither should you. 🌼 #catstr #cats #quotes #catposting #caturday",
  "Breathe. The world will wait for you this once. 🍂 #catstr #cats #quotes #catposting #caturday",
  "You have survived every hard day so far. That's a miracle. 🌙 #catstr #cats #quotes #catposting #caturday",

  "You are allowed to take up space, even on quiet days. 🌾 #catstr #cats #quotes #catposting #caturday",
  "Healing is not a straight line; it’s a winding forest path. 🌲 #catstr #cats #quotes #catposting #caturday",
  "Your softness is not a weakness; it is a form of wisdom. 🌷 #catstr #cats #quotes #catposting #caturday",
  "Even the moon has phases. Let yourself change. 🌘 #catstr #cats #quotes #catposting #caturday",
  "You don’t have to bloom every season. Rest is part of the cycle. 🌺 #catstr #cats #quotes #catposting #caturday",
  "Your presence is a quiet kind of magic. ✨ #catstr #cats #quotes #catposting #caturday",
  "Some days are for growing. Some days are for simply being. 🌤️ #catstr #cats #quotes #catposting #caturday",
  "You are allowed to be proud of how far you've come. 🐾 #catstr #cats #quotes #catposting #caturday",
  "Let your heart be a place where gentleness lives. 💗 #catstr #cats #quotes #catposting #caturday",
  "You don’t have to shine to be worthy. Existing is enough. 🌑 #catstr #cats #quotes #catposting #caturday",

  "Even the quietest steps still move you forward. 🚶‍♀️ #catstr #cats #quotes #catposting #caturday",
  "You are not behind. You are on your own timeline. ⏳ #catstr #cats #quotes #catposting #caturday",
  "Your feelings are real, even the messy ones. 💧 #catstr #cats #quotes #catposting #caturday",
  "You deserve tenderness from yourself too. 🌸 #catstr #cats #quotes #catposting #caturday",
  "Let your hope be stubborn today. 🌟 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to rest before you are tired. 🛏️ #catstr #cats #quotes #catposting #caturday",
  "Your story is still unfolding. Don’t rush the chapter. 📖 #catstr #cats #quotes #catposting #caturday",
  "You are not a burden for needing care. 🤍 #catstr #cats #quotes #catposting #caturday",
  "The sun rises for you too. 🌅 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to choose peace over productivity. 🕊️ #catstr #cats #quotes #catposting #caturday",

  "Your heart is learning new ways to be brave. 💛 #catstr #cats #quotes #catposting #caturday",
  "You don’t have to be perfect to be loved. 🌼 #catstr #cats #quotes #catposting #caturday",
  "Let yourself be held by the moment you’re in. 🌙 #catstr #cats #quotes #catposting #caturday",
  "You are growing in ways you cannot yet see. 🌱 #catstr #cats #quotes #catposting #caturday",
  "Your gentleness is a revolution. ✨ #catstr #cats #quotes #catposting #caturday",
  "You are allowed to take breaks without guilt. 🌤️ #catstr #cats #quotes #catposting #caturday",
  "Your worth is not measured by your output. 🍃 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to feel joy without explaining it. 🌈 #catstr #cats #quotes #catposting #caturday",
  "Your heart knows the way. Trust its quiet voice. 💗 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to be a work in progress. 🛠️ #catstr #cats #quotes #catposting #caturday",

  "Let yourself bloom at your own pace. 🌺 #catstr #cats #quotes #catposting #caturday",
  "You deserve softness, even on hard days. 🌸 #catstr #cats #quotes #catposting #caturday",
  "Your courage is quieter than you think. 🔆 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to change your mind. 🍂 #catstr #cats #quotes #catposting #caturday",
  "Your presence makes the world a little kinder. 🌍 #catstr #cats #quotes #catposting #caturday",
  "You don’t have to rush your healing. 🌿 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to take up emotional space. 💬 #catstr #cats #quotes #catposting #caturday",
  "Your heart is learning to trust the light again. 🌞 #catstr #cats #quotes #catposting #caturday",
  "You are not too late. You are right on time. ⏰ #catstr #cats #quotes #catposting #caturday",
  "Let yourself be surprised by joy. 🎈 #catstr #cats #quotes #catposting #caturday",

  "You are allowed to rest without proving anything. 💤 #catstr #cats #quotes #catposting #caturday",
  "Your softness is a strength the world needs. 🌷 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to start again, even today. 🔄 #catstr #cats #quotes #catposting #caturday",
  "Your heart is wiser than your doubts. 💫 #catstr #cats #quotes #catposting #caturday",
  "You don’t have to carry everything alone. 🤝 #catstr #cats #quotes #catposting #caturday",
  "Let your breath be your anchor. 🌬️ #catstr #cats #quotes #catposting #caturday",
  "You are allowed to be proud of small steps. 🐾 #catstr #cats #quotes #catposting #caturday",
  "Your story is still blooming. 🌸 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to choose gentleness today. 🤍 #catstr #cats #quotes #catposting #caturday",
  "Your heart is doing the best it can. 💗 #catstr #cats #quotes #catposting #caturday",

  "You don’t have to be strong all the time. 🌧️ #catstr #cats #quotes #catposting #caturday",
  "Your quiet resilience is beautiful. 🌙 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to take life one soft moment at a time. 🍃 #catstr #cats #quotes #catposting #caturday",
  "Your feelings deserve room to breathe. 🌬️ #catstr #cats #quotes #catposting #caturday",
  "You are allowed to rest in the middle of the journey. 🛤️ #catstr #cats #quotes #catposting #caturday",
  "Your heart is a garden—tend it gently. 🌼 #catstr #cats #quotes #catposting #caturday",
  "You are allowed to be both healing and hopeful. 🌟 #catstr #cats #quotes #catposting #caturday",
  "Your softness is a sanctuary. 🕊️ #catstr #cats #quotes #catposting #caturday",
  "You are allowed to grow in unexpected directions. 🌱 #catstr #cats #quotes #catposting #caturday",
  "Your light is still here, even on dim days. 🕯️ #catstr #cats #quotes #catposting #caturday"
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
