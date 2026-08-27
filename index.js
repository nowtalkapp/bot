require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes } = require('discord.js');
const { chromium } = require('playwright');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const PREFIX = ',';
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("bot is online");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("web server running");
});

// ========== SEARCH TERMS ==========
const SPICY_TERMS = ["boob snap", "thong pic snap", "snap pics", "arch pic snap", "boob pic snap", "boob pics snap"];
const CAR_TERMS = ["japanese anime wrap car", "custom anime wrap car", "car anime wrap", "german car custom", "custom car"];
const TRUCK_TERMS = ["custom truck", "lifted truck", "truck wrap", "diesel truck", "offroad truck"];
const LOWRIDER_TERMS = ["lowrider", "lowrider car", "custom lowrider", "lowrider paint job", "hydraulic lowrider"];

const EIGHTBALL_ANSWERS = [
  "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes definitely.",
  "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
  "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.",
  "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
  "Don't count on it.", "My reply is no.", "My sources say no.",
  "Outlook not so good.", "Very doubtful."
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browser;
}

async function getPinterestImages(query, limit = 12) {
  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1400, height: 900 }
    });

    const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollBy(0, 2500));
    await page.waitForTimeout(2500);

    const urls = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const results = [];

      for (const img of imgs) {
        let src = img.src || '';

        // Prefer the largest version from srcset
        const srcset = img.getAttribute('srcset');
        if (srcset) {
          const candidates = srcset.split(',')
            .map(s => s.trim().split(' ')[0])
            .filter(u => u.includes('pinimg.com'));
          if (candidates.length) {
            src = candidates[candidates.length - 1]; // last one is usually the biggest
          }
        }

        if (!src.includes('pinimg.com')) continue;
        if (src.includes('avatar') || src.includes('profile') || src.includes('user') || src.includes('75x75') || src.includes('60x60')) continue;

        // Force highest quality
        src = src
          .replace('/236x/', '/originals/')
          .replace('/474x/', '/originals/')
          .replace('/564x/', '/originals/')
          .replace('/736x/', '/originals/')
          .replace('/1200x/', '/originals/');

        // Clean query params
        src = src.split('?')[0];

        if (
          (src.includes('/originals/') || src.includes('/736x/')) &&
          !results.includes(src)
        ) {
          results.push(src);
        }
      }

      return results;
    });

    console.log(`Found ${urls.length} images for "${query}"`);
    return urls.slice(0, limit);
  } catch (err) {
    console.error('Pinterest scrape error:', err.message);
    return [];
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

async function sendPinterestImage(interactionOrMessage, term, titlePrefix, isSlash = true) {
  if (isSlash) {
    await interactionOrMessage.deferReply();
  }

  try {
    const urls = await getPinterestImages(term);
    if (!urls.length) {
      const msg = `Couldn't find images for **${term}**. Try again in a moment.`;
      return isSlash ? interactionOrMessage.editReply(msg) : interactionOrMessage.reply(msg);
    }

    const imageUrl = urls[Math.floor(Math.random() * urls.length)];
    const embed = new EmbedBuilder()
      .setTitle(`${titlePrefix} • ${term}`)
      .setImage(imageUrl)
      .setColor(0xE60023)
      .setFooter({ text: 'From Pinterest' });

    if (isSlash) {
      await interactionOrMessage.editReply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  } catch (err) {
    console.error(err);
    const msg = 'Something went wrong. Try again.';
    if (isSlash) await interactionOrMessage.editReply(msg).catch(() => {});
    else await interactionOrMessage.reply(msg).catch(() => {});
  }
}

async function translateText(text, targetLang = 'en') {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data[0].map(part => part[0]).join('');
    const detected = data[2] || 'auto';
    return { translated, detected };
  } catch (err) {
    console.error('Translate error:', err.message);
    return null;
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log('Bot ready!');
});

// ===================== SLASH COMMANDS =====================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  // /help
  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 Help — Slash Commands')
      .setDescription('Here are the available **slash commands**.\n\nFor extra commands, use `,help`')
      .addFields(
        {
          name: '🖼️ Pinterest',
          value: '`/spicy` — Spicy image (NSFW only)\n`/cars` — Custom / anime wrap cars\n`/trucks` — Trucks\n`/lowriders` — Lowriders\n`/search` — Search anything on Pinterest'
        },
        {
          name: '🛠️ Utility',
          value: '`/ping` — Bot latency\n`/roll` — Roll a dice\n`/8ball` — Magic 8-Ball\n`/userinfo` — User info\n`/serverinfo` — Server stats\n`/translate` — Translate text\n`/poll` — Create a poll'
        }
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Tip: Use ,help to see all commands including hidden ones' });
    return interaction.reply({ embeds: [embed] });
  }

  // Pinterest
  if (commandName === 'spicy') {
    if (!interaction.channel || !interaction.channel.nsfw) {
      return interaction.reply({ content: '🔒 This command only works in **NSFW channels**.', ephemeral: true });
    }
    const term = SPICY_TERMS[Math.floor(Math.random() * SPICY_TERMS.length)];
    return sendPinterestImage(interaction, term, '🌶️ Spicy', true);
  }

  if (commandName === 'cars') {
    const term = CAR_TERMS[Math.floor(Math.random() * CAR_TERMS.length)];
    return sendPinterestImage(interaction, term, '🚗 Cars', true);
  }

  if (commandName === 'trucks') {
    const term = TRUCK_TERMS[Math.floor(Math.random() * TRUCK_TERMS.length)];
    return sendPinterestImage(interaction, term, '🚛 Trucks', true);
  }

  if (commandName === 'lowriders') {
    const term = LOWRIDER_TERMS[Math.floor(Math.random() * LOWRIDER_TERMS.length)];
    return sendPinterestImage(interaction, term, '🚗 Lowriders', true);
  }

  if (commandName === 'search') {
    const query = interaction.options.getString('query');
    if (!query || query.trim().length < 2) {
      return interaction.reply({ content: 'Please provide a search term (at least 2 characters).', ephemeral: true });
    }
    return sendPinterestImage(interaction, query.trim(), '🔍 Search', true);
  }

  // Utility
  if (commandName === 'ping') {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;
    await interaction.editReply(`🏓 **Pong!**\nRoundtrip: \`${roundtrip}ms\`\nWebsocket: \`${ws}ms\``);
  }

  if (commandName === 'roll') {
    const sides = interaction.options.getInteger('sides') || 6;
    if (sides < 2 || sides > 1000) {
      return interaction.reply({ content: 'Sides must be between 2 and 1000.', ephemeral: true });
    }
    const result = Math.floor(Math.random() * sides) + 1;
    await interaction.reply(`🎲 You rolled a **${result}** (1–${sides})`);
  }

  if (commandName === '8ball') {
    const question = interaction.options.getString('question');
    const answer = EIGHTBALL_ANSWERS[Math.floor(Math.random() * EIGHTBALL_ANSWERS.length)];
    const embed = new EmbedBuilder()
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: 'Question', value: question },
        { name: 'Answer', value: answer }
      )
      .setColor(0x5865F2);
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;

    const embed = new EmbedBuilder()
      .setTitle(`User Info — ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
      )
      .setColor(0x5865F2);

    if (member) {
      embed.addFields(
        { name: 'Joined Server', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Unknown', inline: true },
        { name: 'Nickname', value: member.nickname || 'None', inline: true },
        { name: 'Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r.toString()).join(' ') || 'None' }
      );
    }
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'serverinfo') {
    const guild = interaction.guild;
    if (!guild) return interaction.reply({ content: 'This command only works in a server.', ephemeral: true });

    const owner = await guild.fetchOwner().catch(() => null);
    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'Owner', value: owner ? owner.user.tag : 'Unknown', inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true }
      )
      .setColor(0x5865F2)
      .setFooter({ text: `ID: ${guild.id}` });
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'translate') {
    const text = interaction.options.getString('text');
    const lang = interaction.options.getString('language') || 'en';
    await interaction.deferReply();
    const result = await translateText(text, lang);
    if (!result) return interaction.editReply('Translation failed. Try again later.');

    const embed = new EmbedBuilder()
      .setTitle('🌐 Translation')
      .addFields(
        { name: 'Original', value: text.slice(0, 1000) },
        { name: `Translated (${lang})`, value: result.translated.slice(0, 1000) }
      )
      .setColor(0x5865F2)
      .setFooter({ text: `Detected language: ${result.detected}` });
    await interaction.editReply({ embeds: [embed] });
  }

  if (commandName === 'poll') {
    const question = interaction.options.getString('question');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4')
    ].filter(Boolean);

    if (options.length < 2) {
      return interaction.reply({ content: 'You need at least 2 options.', ephemeral: true });
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    let description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\n${description}`)
      .setColor(0x5865F2)
      .setFooter({ text: `Asked by ${interaction.user.tag}` });

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }
  }
});

// ===================== PREFIX COMMANDS (,) =====================
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ,help
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 Help — All Commands')
      .setDescription('Full list of commands (slash + prefix)')
      .addFields(
        {
          name: '🖼️ Pinterest (Slash)',
          value: '`/spicy` — Spicy image (NSFW only)\n`/cars` — Custom / anime wrap cars\n`/trucks` — Trucks\n`/lowriders` — Lowriders\n`/search` — Search anything on Pinterest'
        },
        {
          name: '🌶️ Hidden / Prefix',
          value: '`,spicy` — Spicy image (NSFW only) — **prefix version**'
        },
        {
          name: '🛠️ Utility (Slash)',
          value: '`/ping` `/roll` `/8ball` `/userinfo` `/serverinfo` `/translate` `/poll` `/help`'
        },
        {
          name: 'Prefix',
          value: '`,help` — Shows this full list'
        }
      )
      .setColor(0x5865F2);
    return message.reply({ embeds: [embed] });
  }

  // ,spicy  (NSFW only)
  if (command === 'spicy') {
    if (!message.channel || !message.channel.nsfw) {
      return message.reply('🔒 This command only works in **NSFW channels**.');
    }
    const term = SPICY_TERMS[Math.floor(Math.random() * SPICY_TERMS.length)];
    return sendPinterestImage(message, term, '🌶️ Spicy', false);
  }
});

// ===================== REGISTER SLASH COMMANDS =====================
async function registerCommands() {
  const commands = [
    { name: 'help', description: 'Shows available slash commands' },
    { name: 'spicy', description: 'Get a random spicy image from Pinterest (NSFW only)' },
    { name: 'cars', description: 'Get a random custom/anime wrap car image' },
    { name: 'trucks', description: 'Get a random truck image' },
    { name: 'lowriders', description: 'Get a random lowrider image' },
    {
      name: 'search',
      description: 'Search Pinterest for any term',
      options: [{ name: 'query', description: 'What to search for', type: 3, required: true }]
    },
    { name: 'ping', description: 'Shows the bot latency' },
    {
      name: 'roll',
      description: 'Roll a dice',
      options: [{ name: 'sides', description: 'Number of sides (default 6)', type: 4, required: false, min_value: 2, max_value: 1000 }]
    },
    {
      name: '8ball',
      description: 'Ask the Magic 8-Ball a question',
      options: [{ name: 'question', description: 'Your question', type: 3, required: true }]
    },
    {
      name: 'userinfo',
      description: 'Shows info about a user',
      options: [{ name: 'user', description: 'The user to look up', type: 6, required: false }]
    },
    { name: 'serverinfo', description: 'Shows server stats' },
    {
      name: 'translate',
      description: 'Translate text to another language',
      options: [
        { name: 'text', description: 'Text to translate', type: 3, required: true },
        { name: 'language', description: 'Target language code (en, es, fr, de, ja...)', type: 3, required: false }
      ]
    },
    {
      name: 'poll',
      description: 'Create a quick poll',
      options: [
        { name: 'question', description: 'The poll question', type: 3, required: true },
        { name: 'option1', description: 'First option', type: 3, required: true },
        { name: 'option2', description: 'Second option', type: 3, required: true },
        { name: 'option3', description: 'Third option (optional)', type: 3, required: false },
        { name: 'option4', description: 'Fourth option (optional)', type: 3, required: false }
      ]
    }
  ];

  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    console.log('Registering slash commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Slash commands registered!');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
}

client.login(TOKEN).then(() => {
  if (CLIENT_ID) registerCommands();
});

process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});