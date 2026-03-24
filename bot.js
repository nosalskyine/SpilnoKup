const BOT_TOKEN = process.env.BOT_TOKEN || '8631620817:AAFJVKrpjoZUOQSRAOBrbVCfSnEeabwNNQE';
const APP_URL = 'https://iscup-production-25c2.up.railway.app';
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function sendMessage(chatId, text, options = {}) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML', ...options };
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function poll() {
  let offset = 0;
  console.log('Bot started polling...');

  while (true) {
    try {
      const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
      const data = await res.json();

      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          const msg = update.message;
          if (msg && msg.text === '/start') {
            await sendMessage(msg.chat.id,
              `👋 Вітаю у <b>СпільноКуп</b>!\n\n` +
              `Спільні покупки від малого бізнесу України.\n\n` +
              `🔗 Відкрий додаток у браузері:\n${APP_URL}\n\n` +
              `📱 Щоб додати на головний екран:\n` +
              `1. Відкрий посилання в Chrome/Safari\n` +
              `2. Натисни ⋮ → "Додати на головний екран"`
            );
            console.log(`Sent link to ${msg.from.first_name} (${msg.chat.id})`);
          }
        }
      }
    } catch (err) {
      console.error('Poll error:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

poll();
