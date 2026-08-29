require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { chromium } = require('playwright');
const express = require('express');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const PREFIX = ',';

const app = express();
app.get('/', (req, res) => {
  res.send('bot is online');
});
app.listen(process.env.PORT || 3000, () => {
  console.log('web server running');
});

// ========== SEARCH TERMS ==========
const SPICY_TERMS = [
  'boob snap',
  'thong pic snap',
  'snap pics',
  'arch pics snap',
  'boob pic snap',
  'boob pics snap'
];
const CAR_TERMS = [
  'japanese anime wrap car',
  'custom anime wrap car',
  'car anime wrap',
  'german car custom',
  'custom car'
];
const TRUCK_TERMS = [
  'custom truck',
  'lifted truck',
  'truck wrap',
  'diesel truck',
  'offroad truck'
];
const LOWRIDER_TERMS = [
  'lowrider',
  'lowrider car',
  'custom lowrider',
  'lowrider paint job',
  'hydraulic lowrider'
];

// Use real subreddit names (no spaces)
const NSFW_SUBS = [
  'nsfw',
  'gonewild',
  'RealGirls',
  'boobs',
  'ass',
  'Nudes',
  'Amateur',
  'nsfw_gifs',
  'LegalTeens',
  'collegesluts'
];

// Explicit search terms used as web fallback when Reddit is blocked
const NSFW_SEARCH_TERMS = [
  'nipple',
  'nudity',
  'porn',
  'nip slip',
  'latina boobs',
  'latina nip slip',
  'latina thong',
  'ass',
  'sophie rain nude',
  'sophie rain nip slip'
];

const EIGHTBALL_ANSWERS = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  "Don't count on it.",
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.'
];

const JOKES = [
  "Why don't scientists trust atoms? Because they make up everything.",
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Why did the scarecrow win an award? Because he was outstanding in his field.",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why don't eggs tell jokes? They'd crack each other up.",
  "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
  "I used to hate facial hair, but then it grew on me.",
  "Why did the bicycle fall over? Because it was two-tired.",
  "I'm on a seafood diet. I see food and I eat it.",
  "What do you call a fake noodle? An impasta."
];

const QUOTES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
  "Be yourself; everyone else is already taken. — Oscar Wilde",
  "The best revenge is massive success. — Frank Sinatra",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "Stay hungry, stay foolish. — Steve Jobs",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "Whether you think you can or you think you can't, you're right. — Henry Ford",
  "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
  "It always seems impossible until it's done. — Nelson Mandela"
];

const FACTS = [
  "Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible.",
  "Octopuses have three hearts and blue blood.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus.",
  "Sharks are older than trees.",
  "There are more stars in the universe than grains of sand on Earth.",
  "Wombat poop is cube-shaped.",
  "The shortest war in history lasted 38 minutes.",
  "A group of flamingos is called a flamboyance.",
  "Your stomach gets a new lining every 3-4 days so it doesn't digest itself."
];

const ROASTS = [
  "You're the reason the gene pool needs a lifeguard.",
  "If I wanted to hear from an idiot, I'd watch the news.",
  "You're like a cloud. When you disappear, it's a beautiful day.",
  "I'd agree with you, but then we'd both be wrong.",
  "You're proof that evolution can go in reverse.",
  "Somewhere out there is a tree working hard to replace the oxygen you waste.",
  "You're not stupid; you just have bad luck thinking.",
  "I'd explain it to you, but I left my crayons at home.",
  "You bring everyone so much joy... when you leave the room.",
  "You're the human equivalent of a participation trophy."
];

const COMPLIMENTS = [
  "You're like a human sunshine — you brighten every room.",
  "Your vibe is elite. Never change.",
  "You're smarter than you give yourself credit for.",
  "People are lucky to know you.",
  "You have great energy. It's contagious in the best way.",
  "You're one of the real ones.",
  "Your smile could power a small city.",
  "You're cooler than the other side of the pillow.",
  "The world needs more people like you.",
  "You're doing better than you think."
];

const WYR_PG16 = [
  "Would you rather always be 10 minutes late or always be 20 minutes early?",
  "Would you rather have unlimited battery life on your phone or free high-speed internet everywhere?",
  "Would you rather be able to talk to animals or speak every human language?",
  "Would you rather never have to sleep or never have to eat?",
  "Would you rather always have perfect hair or always have perfect skin?",
  "Would you rather fight one horse-sized duck or 100 duck-sized horses?",
  "Would you rather be famous for something embarrassing or never be famous at all?",
  "Would you rather only be able to whisper or only be able to shout?",
  "Would you rather have a rewind button or a pause button for your life?",
  "Would you rather always know when someone is lying or always get away with lying?",
  "Would you rather live without music or live without movies/TV?",
  "Would you rather be able to fly or be invisible?",
  "Would you rather have a personal chef or a personal driver?",
  "Would you rather never use social media again or never watch YouTube again?",
  "Would you rather wake up every day at 5 AM or stay up until 3 AM every night?"
];

const TRUTHS_PG16 = [
  "What's the most embarrassing thing you've done in public?",
  "What's a secret talent you have?",
  "Who was your first crush?",
  "What's the worst fashion trend you've ever participated in?",
  "What's something you're weirdly good at?",
  "What's the biggest lie you've ever told a teacher/parent?",
  "What's your most irrational fear?",
  "Have you ever pretended to like a gift you hated?",
  "What's the dumbest thing you've done because you were bored?",
  "What's a song you secretly love but would never admit in public?"
];

const DARES_PG16 = [
  "Send a random emoji to the 5th person in your DMs.",
  "Talk in an accent for the next 3 messages.",
  "Change your status to something ridiculous for 10 minutes.",
  "Compliment the next person who talks in this chat.",
  "Do your best impression of another person in the server.",
  "Type with your elbows for the next message.",
  "Post a photo of your current view (desk/room/window).",
  "Make up a short rap about the last thing you ate.",
  "Speak only in questions for the next 5 minutes.",
  "Let the group choose your next profile picture for 1 hour (SFW)."
];

// Snipe + AFK storage
const snipes = new Map();      // channelId -> { content, author, avatar, timestamp }
const editSnipes = new Map();  // channelId -> { old, new, author, avatar, timestamp }
const afkUsers = new Map();    // userId -> { reason, since }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
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

/**
 * Try Reddit JSON API (works on residential IPs, often blocked on VPS/datacenter)
 */
async function tryRedditJson() {
  const sub = NSFW_SUBS[Math.floor(Math.random() * NSFW_SUBS.length)];
  const endpoints = [
    `https://www.reddit.com/r/${sub}/hot.json?limit=50`,
    `https://www.reddit.com/r/${sub}/top.json?t=week&limit=50`,
    `https://old.reddit.com/r/${sub}/hot.json?limit=50`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) {
        console.error(`Reddit API ${res.status} for ${url}`);
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('json')) {
        console.error('Reddit returned non-JSON (likely blocked)');
        continue;
      }

      const data = await res.json();
      if (!data?.data?.children) continue;

      const posts = data.data.children
        .map(p => p.data)
        .filter(p => {
          if (!p || p.over_18 !== true) return false;
          const u = p.url || '';
          // Direct images
          if (
            u.endsWith('.jpg') ||
            u.endsWith('.png') ||
            u.endsWith('.jpeg') ||
            u.endsWith('.gif') ||
            u.includes('i.redd.it') ||
            u.includes('i.imgur.com') ||
            u.includes('preview.redd.it')
          )
            return true;
          // Galleries – grab first image if present
          if (p.is_gallery && p.media_metadata) return true;
          return false;
        });

      if (!posts.length) continue;

      const post = posts[Math.floor(Math.random() * posts.length)];
      let imageUrl = post.url;

      // Resolve gallery image if needed
      if (post.is_gallery && post.media_metadata) {
        const keys = Object.keys(post.media_metadata);
        if (keys.length) {
          const meta = post.media_metadata[keys[0]];
          if (meta?.s?.u) {
            imageUrl = meta.s.u.replace(/&amp;/g, '&');
          } else if (meta?.s?.gif) {
            imageUrl = meta.s.gif.replace(/&amp;/g, '&');
          }
        }
      }

      // Clean preview.redd.it → i.redd.it when possible
      if (imageUrl.includes('preview.redd.it')) {
        imageUrl = imageUrl.split('?')[0].replace('preview.redd.it', 'i.redd.it');
      }

      return {
        title: (post.title || 'NSFW').slice(0, 250),
        image: imageUrl,
        sub: sub,
        permalink: `https://reddit.com${post.permalink}`,
        source: 'Reddit'
      };
    } catch (err) {
      console.error('Reddit JSON attempt failed:', err.message);
    }
  }
  return null;
}

/**
 * Fallback: scrape Reddit with Playwright (more reliable when JSON is blocked)
 */
async function tryRedditPlaywright() {
  const sub = NSFW_SUBS[Math.floor(Math.random() * NSFW_SUBS.length)];
  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 }
    });

    // Use old.reddit – simpler HTML
    await page.goto(`https://old.reddit.com/r/${sub}/hot/?limit=50`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    await page.waitForTimeout(2500);

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('.thing.link').forEach(el => {
        if (!el.classList.contains('over18')) return;
        const titleEl = el.querySelector('a.title');
        const thumb = el.querySelector('a.thumbnail img');
        const permalink = el.getAttribute('data-permalink');
        let img = null;

        // Prefer full-res from data attributes or expand
        const expando = el.querySelector('.expando-button');
        if (thumb && thumb.src && !thumb.src.includes('self') && !thumb.src.includes('default')) {
          img = thumb.src.replace('b.thumbs.redditmedia.com', 'i.redd.it');
        }

        // Look for direct image links
        const url = el.getAttribute('data-url') || '';
        if (
          url.match(/\.(jpg|jpeg|png|gif)$/i) ||
          url.includes('i.redd.it') ||
          url.includes('i.imgur.com')
        ) {
          img = url;
        }

        if (img && titleEl) {
          items.push({
            title: titleEl.innerText.trim(),
            image: img,
            permalink: permalink ? `https://reddit.com${permalink}` : null
          });
        }
      });
      return items;
    });

    if (!results.length) return null;

    const pick = results[Math.floor(Math.random() * results.length)];
    return {
      title: (pick.title || 'NSFW').slice(0, 250),
      image: pick.image,
      sub: sub,
      permalink: pick.permalink || `https://reddit.com/r/${sub}`,
      source: 'Reddit (scraped)'
    };
  } catch (err) {
    console.error('Reddit Playwright scrape error:', err.message);
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

/**
 * Fallback: DuckDuckGo Images API (vqd + i.js) with Safe Search = Off
 * Uses the official image endpoint — much more reliable than page scraping.
 */
async function tryDuckDuckGoNSFW(query) {
  try {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://duckduckgo.com/'
    };

    // Step 1: get the vqd token
    const tokenRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    const html = await tokenRes.text();

    // Try several known patterns for the vqd token
    let vqd = null;
    const patterns = [
      /vqd=["']([^"']+)["']/,
      /vqd=([\d-]+)/,
      /name=["']vqd["'][^>]*value=["']([^"']+)["']/,
      /"vqd":"([^"]+)"/
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        vqd = m[1];
        break;
      }
    }

    if (!vqd) {
      console.error('DuckDuckGo: could not extract vqd token');
      return null;
    }

    // Step 2: hit the image results endpoint
    // p=-1 (or -2) = Safe Search Off
    const params = new URLSearchParams({
      l: 'us-en',
      o: 'json',
      q: query,
      vqd: vqd,
      f: ',,,',
      p: '-1',       // Safe Search Off
      v7exp: 'a'
    });

    const imgRes = await fetch(`https://duckduckgo.com/i.js?${params.toString()}`, {
      headers: {
        ...headers,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!imgRes.ok) {
      console.error(`DuckDuckGo i.js status ${imgRes.status}`);
      return null;
    }

    const data = await imgRes.json();
    const results = data?.results || [];
    if (!results.length) {
      console.log(`DuckDuckGo returned 0 images for "${query}"`);
      return null;
    }

    // Prefer the full-size image URL
    const urls = results
      .map(r => r.image || r.thumbnail || r.url)
      .filter(u => u && u.startsWith('http'));

    if (!urls.length) return null;

    const image = urls[Math.floor(Math.random() * Math.min(urls.length, 30))];
    console.log(`DuckDuckGo NSFW found ${urls.length} images for "${query}"`);

    return {
      title: query,
      image,
      sub: 'duckduckgo',
      permalink: null,
      source: 'DuckDuckGo Images (SafeSearch Off)'
    };
  } catch (err) {
    console.error('DuckDuckGo NSFW error:', err.message);
    return null;
  }
}

/**
 * Fallback: reuse the existing Pinterest scraper with explicit terms
 */
async function tryPinterestNSFW() {
  const term = NSFW_SEARCH_TERMS[Math.floor(Math.random() * NSFW_SEARCH_TERMS.length)];
  const urls = await getPinterestImages(term, 15);
  if (!urls.length) return null;
  const image = urls[Math.floor(Math.random() * urls.length)];
  return {
    title: term,
    image,
    sub: 'pinterest',
    permalink: null,
    source: 'Pinterest'
  };
}

/**
 * Main NSFW getter – tries multiple sources in order until one succeeds
 */
async function getRedditNSFW() {
  // 1. Try Reddit JSON (fastest when it works)
  let result = await tryRedditJson();
  if (result) return result;

  // 2. Try Reddit via Playwright
  result = await tryRedditPlaywright();
  if (result) return result;

  // 3. DuckDuckGo Images with Safe Search = Off
  const ddgTerm = NSFW_SEARCH_TERMS[Math.floor(Math.random() * NSFW_SEARCH_TERMS.length)];
  result = await tryDuckDuckGoNSFW(ddgTerm);
  if (result) return result;

  // 4. Pinterest fallback
  result = await tryPinterestNSFW();
  if (result) return result;

  return null;
}

async function getPinterestImages(query, limit = 12) {
  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
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
          const candidates = srcset
            .split(',')
            .map(s => s.trim().split(' ')[0])
            .filter(u => u.includes('pinimg.com'));
          if (candidates.length) {
            src = candidates[candidates.length - 1]; // last one is usually the biggest
          }
        }

        if (!src.includes('pinimg.com')) continue;
        if (
          src.includes('avatar') ||
          src.includes('profile') ||
          src.includes('user') ||
          src.includes('75x75') ||
          src.includes('60x60')
        ) {
          continue;
        }

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
  } else {
    await interactionOrMessage.channel.sendTyping().catch(() => {});
  }

  try {
    const urls = await getPinterestImages(term);
    if (!urls.length) {
      const msg = `Couldn't find images for **${term}**. Try again in a moment.`;
      return isSlash
        ? interactionOrMessage.editReply(msg)
        : interactionOrMessage.reply(msg);
    }

    const imageUrl = urls[Math.floor(Math.random() * urls.length)];
    const embed = new EmbedBuilder()
      .setTitle(`${titlePrefix} • ${term}`)
      .setImage(imageUrl)
      .setColor(0xe60023)
      .setFooter({ text: 'From Pinterest' });

    if (isSlash) {
      await interactionOrMessage.editReply({ embeds: [embed] });
    } else {
      await interactionOrMessage.reply({ embeds: [embed] });
    }
  } catch (err) {
    console.error(err);
    const msg = 'Something went wrong. Try again.';
    if (isSlash) {
      await interactionOrMessage.editReply(msg).catch(() => {});
    } else {
      await interactionOrMessage.reply(msg).catch(() => {});
    }
  }
}

async function translateText(text, targetLang = 'en') {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;
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

/** Helper: check if a channel is NSFW (works for both interaction + message) */
async function isNsfwChannel(channel, client, channelId) {
  let ch = channel;
  if (!ch || ch.nsfw === undefined) {
    try {
      ch = await client.channels.fetch(channelId);
    } catch {
      ch = null;
    }
  }
  return ch && ch.nsfw === true;
}


// ===================== EMBED BUILDER =====================
const embedBuilders = new Map();
const embedPresets = new Map();

function freshEmbedState(userId) {
  return {
    userId,
    data: {
      author: null,
      title: '',
      description: '',
      thumbnail: '',
      image: '',
      color: '#5865f2',
      fields: [],
      footer: '',
      timestamp: false,
      message: ''
    },
    message: null,
    timeout: null
  };
}

function safeHttpUrl(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function buildEmbed(data) {
  const embed = new EmbedBuilder();
  let hasContent = false;

  if (data.author?.name?.trim()) {
    const author = { name: String(data.author.name).slice(0, 256) };
    const authorUrl = safeHttpUrl(data.author.url);
    const iconUrl = safeHttpUrl(data.author.iconURL);
    if (authorUrl) author.url = authorUrl;
    if (iconUrl) author.iconURL = iconUrl;
    try {
      embed.setAuthor(author);
      hasContent = true;
    } catch (err) {
      console.error('Embed author error:', err.message);
    }
  }

  if (data.title?.trim()) {
    try {
      embed.setTitle(String(data.title).slice(0, 256));
      hasContent = true;
    } catch (err) {
      console.error('Embed title error:', err.message);
    }
  }

  if (data.description?.trim()) {
    try {
      embed.setDescription(String(data.description).slice(0, 4096));
      hasContent = true;
    } catch (err) {
      console.error('Embed description error:', err.message);
    }
  }

  const thumbnailUrl = safeHttpUrl(data.thumbnail);
  if (thumbnailUrl) {
    try {
      embed.setThumbnail(thumbnailUrl);
      hasContent = true;
    } catch (err) {
      console.error('Embed thumbnail error:', err.message);
    }
  }

  const imageUrl = safeHttpUrl(data.image);
  if (imageUrl) {
    try {
      embed.setImage(imageUrl);
      hasContent = true;
    } catch (err) {
      console.error('Embed image error:', err.message);
    }
  }

  if (data.color) {
    try {
      embed.setColor(data.color);
      hasContent = true;
    } catch (err) {
      console.error('Embed color error:', err.message);
    }
  }

  if (Array.isArray(data.fields) && data.fields.length) {
    const fields = data.fields
      .slice(0, 25)
      .map(f => ({
        name: String(f.name || 'Field').slice(0, 256),
        value: String(f.value || ' ').slice(0, 1024),
        inline: !!f.inline
      }))
      .filter(f => f.name.trim() && f.value.trim());

    if (fields.length) {
      try {
        embed.addFields(fields);
        hasContent = true;
      } catch (err) {
        console.error('Embed fields error:', err.message);
      }
    }
  }

  if (data.footer?.trim()) {
    try {
      embed.setFooter({ text: String(data.footer).slice(0, 2048) });
      hasContent = true;
    } catch (err) {
      console.error('Embed footer error:', err.message);
    }
  }

  if (data.timestamp) {
    try {
      embed.setTimestamp();
      hasContent = true;
    } catch (err) {
      console.error('Embed timestamp error:', err.message);
    }
  }

  // Discord rejects a completely empty embed. Keep the live preview valid
  // before the user has entered any content.
  if (!hasContent) embed.setDescription('\u200b');

  return embed;
}

function builderComponents(disabled = false) {
  const b = (id, label, style = ButtonStyle.Secondary) =>
    new ButtonBuilder().setCustomId(`embed:${id}`).setLabel(label).setStyle(style).setDisabled(disabled);

  return [
    new ActionRowBuilder().addComponents(
      b('author', 'Author'), b('title', 'Title'), b('description', 'Description'),
      b('thumbnail', 'Thumbnail'), b('image', 'Image')
    ),
    new ActionRowBuilder().addComponents(
      b('color', 'Color'), b('fields', 'Fields'), b('footer', 'Footer'),
      b('timestamp', 'Timestamp'), b('message', 'Message')
    ),
    new ActionRowBuilder().addComponents(
      b('save', '📂 Save'), b('paste', '📋 Paste'), b('json', '🧑‍💻 JSON'), b('refresh', '🔄️')
    ),
    new ActionRowBuilder().addComponents(
      b('cancel', 'Cancel', ButtonStyle.Danger), b('submit', 'Submit', ButtonStyle.Success)
    )
  ];
}

function builderPreview(state) {
  const d = state.data;
  const lines = [];
  lines.push('**embed builder**');
  lines.push('use the buttons below to customize your embed. the preview updates after every change.');
  lines.push('');
  lines.push(`**author:** ${d.author?.name || 'none'}`);
  lines.push(`**title:** ${d.title || 'none'}`);
  lines.push(`**description:** ${d.description ? d.description.slice(0, 150) : 'none'}`);
  lines.push(`**thumbnail:** ${d.thumbnail ? 'set' : 'none'}  •  **image:** ${d.image ? 'set' : 'none'}`);
  lines.push(`**color:** ${d.color || 'default'}  •  **fields:** ${d.fields.length}  •  **footer:** ${d.footer || 'none'}`);
  lines.push(`**timestamp:** ${d.timestamp ? 'on' : 'off'}  •  **message:** ${d.message ? 'set' : 'none'}`);
  return lines.join('\n');
}

async function updateEmbedBuilder(state) {
  if (!state.message) return;
  await state.message.edit({
    content: builderPreview(state),
    embeds: [buildEmbed(state.data)],
    components: builderComponents()
  }).catch(() => {});
}

function modalFor(id, title, inputs) {
  const modal = new ModalBuilder().setCustomId(`embedmodal:${id}`).setTitle(title);
  modal.addComponents(...inputs.map(input => {
    const field = new TextInputBuilder()
      .setCustomId(input.id)
      .setLabel(input.label)
      .setStyle(input.style || TextInputStyle.Short)
      .setRequired(input.required !== false)
      .setMaxLength(input.maxLength || (input.style === TextInputStyle.Paragraph ? 4000 : 1000));
    if (input.placeholder) field.setPlaceholder(input.placeholder);
    if (input.value) field.setValue(input.value);
    return new ActionRowBuilder().addComponents(field);
  }));
  return modal;
}

function clearEmbedBuilder(userId) {
  const state = embedBuilders.get(userId);
  if (state?.timeout) clearTimeout(state.timeout);
  embedBuilders.delete(userId);
}

function startEmbedTimeout(state) {
  state.timeout = setTimeout(async () => {
    if (state.message) await state.message.delete().catch(() => {});
    clearEmbedBuilder(state.userId);
  }, 6 * 60 * 60 * 1000);
}

async function handleEmbedButton(interaction) {
  const id = interaction.customId.slice('embed:'.length);
  const state = embedBuilders.get(interaction.user.id);
  if (!state) return interaction.reply({ content: 'this embed builder has expired. run `/embed` again.', ephemeral: true });
  if (state.message?.id !== interaction.message.id) return interaction.reply({ content: 'this is no longer the active embed builder.', ephemeral: true });

  if (id === 'cancel') {
    clearEmbedBuilder(interaction.user.id);
    return interaction.message.delete().catch(() => {});
  }

  if (id === 'submit') {
    const d = state.data;
    const hasEmbedContent =
      !!d.author?.name?.trim() ||
      !!d.title?.trim() ||
      !!d.description?.trim() ||
      !!safeHttpUrl(d.thumbnail) ||
      !!safeHttpUrl(d.image) ||
      (Array.isArray(d.fields) && d.fields.some(f => String(f.name || '').trim() && String(f.value || '').trim())) ||
      !!d.footer?.trim() ||
      !!d.timestamp ||
      (typeof d.color === 'string' && d.color.trim() && d.color.trim().toLowerCase() !== '#5865f2');
    const hasContent = !!d.message?.trim() || hasEmbedContent;
    if (!hasContent) return interaction.reply({ content: 'add something to the embed before submitting.', ephemeral: true });
    clearEmbedBuilder(interaction.user.id);
    await interaction.deferUpdate();
    await interaction.message.delete().catch(() => {});
    const embed = buildEmbed(state.data);
    return interaction.channel.send({ content: state.data.message || undefined, embeds: [embed] });
  }

  if (id === 'refresh') {
    state.data = freshEmbedState(interaction.user.id).data;
    return interaction.update({ content: builderPreview(state), embeds: [buildEmbed(state.data)], components: builderComponents() });
  }

  if (id === 'timestamp') {
    state.data.timestamp = !state.data.timestamp;
    return interaction.update({ content: builderPreview(state), embeds: [buildEmbed(state.data)], components: builderComponents() });
  }

  const d = state.data;
  const modals = {
    author: modalFor('author', 'Set Author', [
      { id: 'name', label: 'Author name', value: d.author?.name, maxLength: 256 },
      { id: 'url', label: 'Author URL (optional)', value: d.author?.url || '', required: false },
      { id: 'icon', label: 'Author icon URL (optional)', value: d.author?.iconURL || '', required: false }
    ]),
    title: modalFor('title', 'Set Title', [{ id: 'value', label: 'Title', value: d.title, maxLength: 256 }]),
    description: modalFor('description', 'Set Description', [{ id: 'value', label: 'Description', value: d.description, style: TextInputStyle.Paragraph, maxLength: 4000 }]),
    thumbnail: modalFor('thumbnail', 'Set Thumbnail', [{ id: 'url', label: 'Image URL', value: d.thumbnail, required: false }]),
    image: modalFor('image', 'Set Image', [{ id: 'url', label: 'Image URL', value: d.image, required: false }]),
    color: modalFor('color', 'Set Color', [{ id: 'value', label: 'Hex color', value: d.color, placeholder: '#5865f2' }]),
    fields: modalFor('fields', 'Add Field', [
      { id: 'name', label: 'Field name', maxLength: 256 },
      { id: 'value', label: 'Field value', style: TextInputStyle.Paragraph, maxLength: 1024 },
      { id: 'inline', label: 'Inline? (yes/no)', value: 'no', required: false, maxLength: 3 }
    ]),
    footer: modalFor('footer', 'Set Footer', [{ id: 'value', label: 'Footer text', value: d.footer, required: false, maxLength: 2048 }]),
    message: modalFor('message', 'Set Message', [{ id: 'value', label: 'Message content', value: d.message, style: TextInputStyle.Paragraph, required: false, maxLength: 2000 }]),
    save: modalFor('save', 'Save Preset', [{ id: 'name', label: 'Preset name', maxLength: 50 }]),
    paste: modalFor('paste', 'Paste Embed JSON', [{ id: 'json', label: 'Embed JSON', style: TextInputStyle.Paragraph, maxLength: 4000 }]),
    json: modalFor('json', 'JSON Editor', [{ id: 'json', label: 'Embed JSON', style: TextInputStyle.Paragraph, maxLength: 4000 }])
  };

  if (modals[id]) return interaction.showModal(modals[id]);
}

async function handleEmbedModal(interaction) {
  const id = interaction.customId.slice('embedmodal:'.length);
  const state = embedBuilders.get(interaction.user.id);
  if (!state) {
    return interaction.reply({ content: 'this embed builder has expired. run `/embed` again.', ephemeral: true }).catch(() => {});
  }

  const get = key => interaction.fields.getTextInputValue(key);
  const d = state.data;

  // Validate/apply everything BEFORE acknowledging the modal. This is important:
  // once a modal is deferred, Discord will reject a later reply() with
  // "Interaction has already been acknowledged".
  try {
    if (id === 'author') {
      const name = get('name').trim();
      if (!name) throw new Error('author name is required');
      const url = get('url').trim();
      const icon = get('icon').trim();
      d.author = { name, url, iconURL: icon };
    } else if (id === 'title') {
      d.title = get('value').trim();
    } else if (id === 'description') {
      d.description = get('value');
    } else if (id === 'thumbnail') {
      const value = get('url').trim();
      if (value && !safeHttpUrl(value)) throw new Error('thumbnail URL must start with http:// or https://');
      d.thumbnail = value;
    } else if (id === 'image') {
      const value = get('url').trim();
      if (value && !safeHttpUrl(value)) throw new Error('image URL must start with http:// or https://');
      d.image = value;
    } else if (id === 'color') {
      const value = get('value').trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error('color must be a 6-digit hex value like #5865f2');
      d.color = value;
    } else if (id === 'fields') {
      if (d.fields.length >= 25) throw new Error('an embed can have at most 25 fields');
      const name = get('name').trim();
      const value = get('value').trim();
      if (!name || !value) throw new Error('field name and value are required');
      d.fields.push({ name, value, inline: get('inline').trim().toLowerCase() === 'yes' });
    } else if (id === 'footer') {
      d.footer = get('value').trim();
    } else if (id === 'message') {
      d.message = get('value');
    } else if (id === 'save') {
      const name = get('name').trim();
      if (!name) throw new Error('preset name is required');
      const key = interaction.user.id;
      const presets = embedPresets.get(key) || new Map();
      presets.set(name.toLowerCase(), JSON.parse(JSON.stringify(d)));
      embedPresets.set(key, presets);
      return interaction.reply({ content: `saved preset **${name}**.`, ephemeral: true });
    } else if (id === 'paste' || id === 'json') {
      const raw = get('json').trim();
      if (!raw) throw new Error('JSON cannot be empty');
      const parsed = JSON.parse(raw);
      const e = parsed.data || parsed;
      if (!e || typeof e !== 'object') throw new Error('invalid embed JSON');
      if (e.author) d.author = e.author;
      if (e.title !== undefined) d.title = String(e.title || '').slice(0, 256);
      if (e.description !== undefined) d.description = String(e.description || '').slice(0, 4096);
      if (e.thumbnail) d.thumbnail = typeof e.thumbnail === 'string' ? e.thumbnail : e.thumbnail.url;
      if (e.image) d.image = typeof e.image === 'string' ? e.image : e.image.url;
      if (e.color !== undefined) d.color = typeof e.color === 'number' ? `#${e.color.toString(16).padStart(6, '0')}` : e.color;
      if (Array.isArray(e.fields)) d.fields = e.fields.map(f => ({ name: f.name, value: f.value, inline: !!f.inline })).slice(0, 25);
      if (e.footer) d.footer = typeof e.footer === 'string' ? e.footer : e.footer.text;
      if (e.timestamp !== undefined) d.timestamp = !!e.timestamp;
    }

    // Build once here so malformed data is caught before acknowledging the modal.
    const preview = buildEmbed(d);
    await interaction.deferUpdate();
    if (state.message) {
      await state.message.edit({
        content: builderPreview(state),
        embeds: [preview],
        components: builderComponents()
      });
    }
  } catch (err) {
    console.error('Embed modal error:', err);
    const msg = `couldn't update the embed: ${err?.message || 'unknown error'}`;
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: msg, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
}

// Snipe listeners
client.on('messageDelete', message => {
  if (!message.author || message.author.bot || !message.content) return;
  snipes.set(message.channel.id, {
    content: message.content.slice(0, 1000),
    author: message.author.tag,
    avatar: message.author.displayAvatarURL(),
    timestamp: Date.now()
  });
});

client.on('messageUpdate', (oldMsg, newMsg) => {
  if (!oldMsg.author || oldMsg.author.bot || !oldMsg.content || oldMsg.content === newMsg.content) return;
  editSnipes.set(oldMsg.channel.id, {
    old: oldMsg.content.slice(0, 500),
    new: (newMsg.content || '').slice(0, 500),
    author: oldMsg.author.tag,
    avatar: oldMsg.author.displayAvatarURL(),
    timestamp: Date.now()
  });
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log('Bot ready!');
});

// ===================== SLASH COMMANDS =====================
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isButton() && interaction.customId.startsWith('embed:')) return await handleEmbedButton(interaction);
    if (interaction.isModalSubmit() && interaction.customId.startsWith('embedmodal:')) return await handleEmbedModal(interaction);
    if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // /embed
  if (commandName === 'embed') {
    const existing = embedBuilders.get(interaction.user.id);
    if (existing?.message) {
      return interaction.reply({ content: 'you already have an embed builder open.', ephemeral: true });
    }
    const state = freshEmbedState(interaction.user.id);
    const msg = await interaction.reply({
      content: builderPreview(state),
      embeds: [buildEmbed(state.data)],
      components: builderComponents(),
      fetchReply: true
    });
    state.message = msg;
    embedBuilders.set(interaction.user.id, state);
    startEmbedTimeout(state);
    return;
  }

  // /help
  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 Help — Slash Commands')
      .setDescription(
        'Here are the available **slash commands**.\n\nFor extra commands, use `,help`'
      )
      .addFields(
        {
          name: '🖼️ Pinterest',
          value:
            '`/spicy` — Spicy image (NSFW only)\n`/cars` — Custom / anime wrap cars\n`/trucks` — Trucks\n`/lowriders` — Lowriders\n`/search` — Search anything on Pinterest'
        },
        {
          name: '🌶️ NSFW',
          value: '`/nsfw` — Random NSFW image from Reddit (NSFW only)'
        },
        {
          name: '🛠️ Utility',
          value:
            '`/ping` — Bot latency\n`/roll` — Roll a dice\n`/8ball` — Magic 8-Ball\n`/userinfo` — User info\n`/serverinfo` — Server stats\n`/translate` — Translate text\n`/poll` — Create a poll'
        }
      )
      .setColor(0x5865f2)
      .setFooter({
        text: 'Tip: Use ,help to see all commands including prefix versions'
      });
    return interaction.reply({ embeds: [embed] });
  }

  // /spicy
  if (commandName === 'spicy') {
    const ok = await isNsfwChannel(
      interaction.channel,
      interaction.client,
      interaction.channelId
    );
    if (!ok) {
      return interaction.reply({
        content: '🔒 This command only works in **NSFW channels**.',
        ephemeral: true
      });
    }
    const term = SPICY_TERMS[Math.floor(Math.random() * SPICY_TERMS.length)];
    return sendPinterestImage(interaction, term, '🌶️ Spicy', true);
  }

  // /nsfw (Reddit)
  if (commandName === 'nsfw') {
    const ok = await isNsfwChannel(
      interaction.channel,
      interaction.client,
      interaction.channelId
    );
    if (!ok) {
      return interaction.reply({
        content: '🔒 This command only works in **NSFW channels**.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const result = await getRedditNSFW();
    if (!result) {
      return interaction.editReply(
        "Couldn't find an image right now. Try again."
      );
    }

    const footerText = result.source
      ? `${result.source}${result.sub && result.sub !== 'web' && result.sub !== 'pinterest' ? ` • r/${result.sub}` : ''}`
      : `r/${result.sub}`;

    const embed = new EmbedBuilder()
      .setTitle(result.title.slice(0, 250))
      .setImage(result.image)
      .setColor(0xff0000)
      .setFooter({ text: footerText });

    if (result.permalink) embed.setURL(result.permalink);

    return interaction.editReply({ embeds: [embed] });
  }

  // /cars
  if (commandName === 'cars') {
    const term = CAR_TERMS[Math.floor(Math.random() * CAR_TERMS.length)];
    return sendPinterestImage(interaction, term, '🚗 Cars', true);
  }

  // /trucks
  if (commandName === 'trucks') {
    const term = TRUCK_TERMS[Math.floor(Math.random() * TRUCK_TERMS.length)];
    return sendPinterestImage(interaction, term, '🚛 Trucks', true);
  }

  // /lowriders
  if (commandName === 'lowriders') {
    const term =
      LOWRIDER_TERMS[Math.floor(Math.random() * LOWRIDER_TERMS.length)];
    return sendPinterestImage(interaction, term, '🚗 Lowriders', true);
  }

  // /search
  if (commandName === 'search') {
    const query = interaction.options.getString('query');
    if (!query || query.trim().length < 2) {
      return interaction.reply({
        content: 'Please provide a search term (at least 2 characters).',
        ephemeral: true
      });
    }
    return sendPinterestImage(interaction, query.trim(), '🔍 Search', true);
  }

  // /ping
  if (commandName === 'ping') {
    const sent = await interaction.reply({
      content: 'Pinging...',
      fetchReply: true
    });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;
    await interaction.editReply(
      `🏓 **Pong!**\nRoundtrip: \`${roundtrip}ms\`\nWebsocket: \`${ws}ms\``
    );
    return;
  }

  // /roll
  if (commandName === 'roll') {
    const sides = interaction.options.getInteger('sides') || 6;
    if (sides < 2 || sides > 1000) {
      return interaction.reply({
        content: 'Sides must be between 2 and 1000.',
        ephemeral: true
      });
    }
    const result = Math.floor(Math.random() * sides) + 1;
    return interaction.reply(`🎲 You rolled a **${result}** (1–${sides})`);
  }

  // /8ball
  if (commandName === '8ball') {
    const question = interaction.options.getString('question');
    const answer =
      EIGHTBALL_ANSWERS[Math.floor(Math.random() * EIGHTBALL_ANSWERS.length)];
    const embed = new EmbedBuilder()
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: 'Question', value: question },
        { name: 'Answer', value: answer }
      )
      .setColor(0x5865f2);
    return interaction.reply({ embeds: [embed] });
  }

  // /userinfo
  if (commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;

    const embed = new EmbedBuilder()
      .setTitle(`User Info — ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        {
          name: 'Account Created',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          inline: true
        }
      )
      .setColor(0x5865f2);

    if (member) {
      embed.addFields(
        {
          name: 'Joined Server',
          value: member.joinedAt
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
            : 'Unknown',
          inline: true
        },
        {
          name: 'Nickname',
          value: member.nickname || 'None',
          inline: true
        },
        {
          name: 'Roles',
          value:
            member.roles.cache
              .filter(r => r.id !== interaction.guild.id)
              .map(r => r.toString())
              .join(' ') || 'None'
        }
      );
    }
    return interaction.reply({ embeds: [embed] });
  }

  // /serverinfo
  if (commandName === 'serverinfo') {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({
        content: 'This command only works in a server.',
        ephemeral: true
      });
    }

    const owner = await guild.fetchOwner().catch(() => null);
    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        {
          name: 'Owner',
          value: owner ? owner.user.tag : 'Unknown',
          inline: true
        },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        {
          name: 'Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          inline: true
        },
        { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
        {
          name: 'Boosts',
          value: `${guild.premiumSubscriptionCount || 0}`,
          inline: true
        },
        {
          name: 'Channels',
          value: `${guild.channels.cache.size}`,
          inline: true
        },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true }
      )
      .setColor(0x5865f2)
      .setFooter({ text: `ID: ${guild.id}` });
    return interaction.reply({ embeds: [embed] });
  }

  // /translate
  if (commandName === 'translate') {
    const text = interaction.options.getString('text');
    const lang = interaction.options.getString('language') || 'en';
    await interaction.deferReply();
    const result = await translateText(text, lang);
    if (!result) {
      return interaction.editReply('Translation failed. Try again later.');
    }

    const embed = new EmbedBuilder()
      .setTitle('🌐 Translation')
      .addFields(
        { name: 'Original', value: text.slice(0, 1000) },
        {
          name: `Translated (${lang})`,
          value: result.translated.slice(0, 1000)
        }
      )
      .setColor(0x5865f2)
      .setFooter({ text: `Detected language: ${result.detected}` });
    return interaction.editReply({ embeds: [embed] });
  }

  // /poll
  if (commandName === 'poll') {
    const question = interaction.options.getString('question');
    const options = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
      interaction.options.getString('option4')
    ].filter(Boolean);

    if (options.length < 2) {
      return interaction.reply({
        content: 'You need at least 2 options.',
        ephemeral: true
      });
    }

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
    const description = options
      .map((opt, i) => `${emojis[i]} ${opt}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\n${description}`)
      .setColor(0x5865f2)
      .setFooter({ text: `Asked by ${interaction.user.tag}` });

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < options.length; i++) {
      await msg.react(emojis[i]);
    }
    return;
  }

  // ========== NEW FUN / UTILITY COMMANDS ==========

  if (commandName === 'meme') {
    await interaction.deferReply();
    try {
      const subs = ['memes', 'dankmemes', 'me_irl', 'wholesomememes'];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=40`, {
        headers: { 'User-Agent': 'Mozilla/5.0 DiscordBot' },
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      const posts = (data?.data?.children || [])
        .map(p => p.data)
        .filter(p => p && !p.over_18 && (p.url?.endsWith('.jpg') || p.url?.endsWith('.png') || p.url?.endsWith('.gif') || p.url?.includes('i.redd.it')));
      if (!posts.length) return interaction.editReply('No memes found, try again.');
      const post = posts[Math.floor(Math.random() * posts.length)];
      const embed = new EmbedBuilder()
        .setTitle(post.title.slice(0, 250))
        .setImage(post.url)
        .setURL(`https://reddit.com${post.permalink}`)
        .setColor(0xff4500)
        .setFooter({ text: `r/${sub}` });
      return interaction.editReply({ embeds: [embed] });
    } catch {
      return interaction.editReply('Failed to fetch a meme.');
    }
  }

  if (commandName === 'joke') {
    const joke = JOKES[Math.floor(Math.random() * JOKES.length)];
    return interaction.reply(`😂 ${joke}`);
  }

  if (commandName === 'quote') {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return interaction.reply(`💬 ${q}`);
  }

  if (commandName === 'fact') {
    const f = FACTS[Math.floor(Math.random() * FACTS.length)];
    return interaction.reply(`🧠 **Fun Fact:** ${f}`);
  }

  if (commandName === 'ship') {
    const u1 = interaction.options.getUser('user1') || interaction.user;
    const u2 = interaction.options.getUser('user2');
    if (!u2) return interaction.reply({ content: 'Mention two users.', ephemeral: true });
    const pct = Math.floor(Math.random() * 101);
    let msg = pct > 80 ? 'Match made in heaven 💕' : pct > 50 ? 'Pretty solid 👀' : pct > 20 ? 'Could work... maybe' : 'Yikes 💀';
    return interaction.reply(`💖 **${u1.username}** × **${u2.username}** = **${pct}%**\n${msg}`);
  }

  if (commandName === 'rate') {
    const user = interaction.options.getUser('user') || interaction.user;
    const score = (Math.random() * 10).toFixed(1);
    return interaction.reply(`I'd rate **${user.username}** a **${score}/10**`);
  }

  if (commandName === 'howgay') {
    const user = interaction.options.getUser('user') || interaction.user;
    const pct = Math.floor(Math.random() * 101);
    return interaction.reply(`**${user.username}** is **${pct}%** gay`);
  }

  if (commandName === 'howhot') {
    const user = interaction.options.getUser('user') || interaction.user;
    const pct = Math.floor(Math.random() * 101);
    return interaction.reply(`**${user.username}** is **${pct}%** hot`);
  }

  if (commandName === 'pp') {
    const user = interaction.options.getUser('user') || interaction.user;
    const size = Math.floor(Math.random() * 15) + 1;
    return interaction.reply(`your dih is **${size}%** inches`);
  }

  if (commandName === 'coinflip') {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    return interaction.reply(`🪙 **${result}**`);
  }

  if (commandName === 'choose') {
    const options = interaction.options.getString('options');
    const parts = options.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return interaction.reply({ content: 'Give at least 2 options separated by |', ephemeral: true });
    const pick = parts[Math.floor(Math.random() * parts.length)];
    return interaction.reply(`🎯 I choose: **${pick}**`);
  }

  if (commandName === 'avatar') {
    const user = interaction.options.getUser('user') || interaction.user;
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .setColor(0x5865f2);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'banner') {
    const user = interaction.options.getUser('user') || interaction.user;
    const fetched = await client.users.fetch(user.id, { force: true });
    const banner = fetched.bannerURL({ size: 1024 });
    if (!banner) return interaction.reply({ content: 'That user has no banner.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Banner`)
      .setImage(banner)
      .setColor(0x5865f2);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'snipe') {
    const data = snipes.get(interaction.channel.id);
    if (!data) return interaction.reply({ content: 'Nothing to snipe.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setAuthor({ name: data.author, iconURL: data.avatar })
      .setDescription(data.content)
      .setColor(0xed4245)
      .setFooter({ text: 'Deleted message' })
      .setTimestamp(data.timestamp);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'editsnipe') {
    const data = editSnipes.get(interaction.channel.id);
    if (!data) return interaction.reply({ content: 'Nothing to editsnipe.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setAuthor({ name: data.author, iconURL: data.avatar })
      .addFields(
        { name: 'Before', value: data.old || '*empty*' },
        { name: 'After', value: data.new || '*empty*' }
      )
      .setColor(0xfaa61a)
      .setTimestamp(data.timestamp);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'afk') {
    const reason = interaction.options.getString('reason') || 'AFK';
    afkUsers.set(interaction.user.id, { reason, since: Date.now() });
    return interaction.reply(`😴 You're now AFK: **${reason}**`);
  }

  if (commandName === 'remind') {
    const timeStr = interaction.options.getString('time');
    const text = interaction.options.getString('message');
    const match = timeStr.match(/^(\d+)(s|m|h|d)$/i);
    if (!match) return interaction.reply({ content: 'Use format like `10m`, `2h`, `1d`', ephemeral: true });
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const ms = unit === 's' ? num * 1000 : unit === 'm' ? num * 60000 : unit === 'h' ? num * 3600000 : num * 86400000;
    if (ms > 86400000 * 7) return interaction.reply({ content: 'Max 7 days.', ephemeral: true });
    await interaction.reply(`⏰ Reminder set for **${timeStr}**: ${text}`);
    setTimeout(() => {
      interaction.followUp({ content: `⏰ **Reminder for ${interaction.user}:** ${text}` }).catch(() => {});
    }, ms);
    return;
  }

  if (commandName === 'weather') {
    const city = interaction.options.getString('city');
    await interaction.deferReply();
    try {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { signal: AbortSignal.timeout(8000) }).then(r => r.json());
      if (!geo?.results?.[0]) return interaction.editReply('City not found.');
      const { latitude, longitude, name, country } = geo.results[0];
      const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`, { signal: AbortSignal.timeout(8000) }).then(r => r.json());
      const cw = w.current_weather;
      const embed = new EmbedBuilder()
        .setTitle(`🌤️ Weather — ${name}, ${country}`)
        .addFields(
          { name: 'Temperature', value: `${cw.temperature}°C`, inline: true },
          { name: 'Wind', value: `${cw.windspeed} km/h`, inline: true },
          { name: 'Code', value: `${cw.weathercode}`, inline: true }
        )
        .setColor(0x3498db);
      return interaction.editReply({ embeds: [embed] });
    } catch {
      return interaction.editReply('Failed to get weather.');
    }
  }

  if (commandName === 'define') {
    const word = interaction.options.getString('word');
    await interaction.deferReply();
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return interaction.editReply('No definition found.');
      const data = await res.json();
      const entry = data[0];
      const meaning = entry.meanings?.[0];
      const def = meaning?.definitions?.[0]?.definition || 'No definition.';
      const embed = new EmbedBuilder()
        .setTitle(`📖 ${entry.word}`)
        .setDescription(def)
        .addFields({ name: 'Part of speech', value: meaning?.partOfSpeech || '—', inline: true })
        .setColor(0x5865f2);
      if (entry.phonetic) embed.setFooter({ text: entry.phonetic });
      return interaction.editReply({ embeds: [embed] });
    } catch {
      return interaction.editReply('Failed to look up that word.');
    }
  }

  if (commandName === 'roast') {
    const user = interaction.options.getUser('user') || interaction.user;
    const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
    return interaction.reply(`🔥 ${user}: ${roast}`);
  }

  if (commandName === 'compliment') {
    const user = interaction.options.getUser('user') || interaction.user;
    const c = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
    return interaction.reply(`💖 ${user}: ${c}`);
  }

  if (commandName === 'simp') {
    const user = interaction.options.getUser('user') || interaction.user;
    const pct = Math.floor(Math.random() * 101);
    return interaction.reply(`🥺 **${interaction.user.username}** is **${pct}%** simping for **${user.username}**`);
  }

  if (commandName === 'wyr') {
    const q = WYR_PG16[Math.floor(Math.random() * WYR_PG16.length)];
    const embed = new EmbedBuilder()
      .setTitle('🤔 Would You Rather')
      .setDescription(q)
      .setColor(0x9b59b6)
      .setFooter({ text: 'PG-16' });
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('🅰️');
    await msg.react('🅱️');
    return;
  }

  if (commandName === 'truth') {
    const t = TRUTHS_PG16[Math.floor(Math.random() * TRUTHS_PG16.length)];
    return interaction.reply(`🗣️ **Truth:** ${t}`);
  }

  if (commandName === 'dare') {
    const d = DARES_PG16[Math.floor(Math.random() * DARES_PG16.length)];
    return interaction.reply(`😈 **Dare:** ${d}`);
  }

  } catch (err) {
    console.error('Interaction handler error:', err);
    try {
      const errorMessage = 'Something went wrong while running that command. Please try again.';
      if (interaction.deferred) {
        await interaction.editReply(errorMessage).catch(() => {});
      } else if (interaction.replied) {
        await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true }).catch(() => {});
      }
    } catch {}
  }
});

// ===================== PREFIX COMMANDS (,) =====================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // AFK return + mention check
  if (afkUsers.has(message.author.id)) {
    afkUsers.delete(message.author.id);
    message.reply(`👋 Welcome back, you're no longer AFK.`).catch(() => {});
  }
  for (const [id, data] of afkUsers) {
    if (message.mentions.users.has(id)) {
      const mins = Math.floor((Date.now() - data.since) / 60000);
      message.reply(`😴 **${message.mentions.users.get(id).username}** is AFK: ${data.reason} (${mins}m)`).catch(() => {});
    }
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();
  if (!command) return;

  // ,help
  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('📖 Help — All Commands')
      .setDescription('Full list of commands (slash + prefix)')
      .addFields(
        {
          name: '🖼️ Pinterest (Slash + Prefix)',
          value:
            '`/spicy` or `,spicy` — Spicy image (NSFW only)\n`/cars` or `,cars` — Custom / anime wrap cars\n`/trucks` or `,trucks` — Trucks\n`/lowriders` or `,lowriders` — Lowriders\n`/search <query>` or `,search <query>` — Search Pinterest'
        },
        {
          name: '🌶️ NSFW',
          value:
            '`/nsfw` or `,nsfw` — Random NSFW image from Reddit (NSFW only)'
        },
        {
          name: '🛠️ Utility (mostly slash)',
          value:
            '`/ping` `/roll` `/8ball` `/userinfo` `/serverinfo` `/translate` `/poll` `/help`\n`,help` — Shows this list\n`,ping` — Quick latency check'
        }
      )
      .setColor(0x5865f2);
    return message.reply({ embeds: [embed] });
  }

  // ,spicy
  if (command === 'spicy') {
    const ok = await isNsfwChannel(
      message.channel,
      message.client,
      message.channelId
    );
    if (!ok) {
      return message.reply(
        '🔒 This command only works in **NSFW channels**.'
      );
    }
    const term = SPICY_TERMS[Math.floor(Math.random() * SPICY_TERMS.length)];
    return sendPinterestImage(message, term, '🌶️ Spicy', false);
  }

  // ,nsfw
  if (command === 'nsfw') {
    const ok = await isNsfwChannel(
      message.channel,
      message.client,
      message.channelId
    );
    if (!ok) {
      return message.reply(
        '🔒 This command only works in **NSFW channels**.'
      );
    }

    await message.channel.sendTyping().catch(() => {});
    const result = await getRedditNSFW();
    if (!result) {
      return message.reply(
        "Couldn't find an image right now. Try again."
      );
    }

    const footerText = result.source
      ? `${result.source}${result.sub && result.sub !== 'web' && result.sub !== 'pinterest' ? ` • r/${result.sub}` : ''}`
      : `r/${result.sub}`;

    const embed = new EmbedBuilder()
      .setTitle(result.title.slice(0, 250))
      .setImage(result.image)
      .setColor(0xff0000)
      .setFooter({ text: footerText });

    if (result.permalink) embed.setURL(result.permalink);

    return message.reply({ embeds: [embed] });
  }

  // ,cars
  if (command === 'cars') {
    const term = CAR_TERMS[Math.floor(Math.random() * CAR_TERMS.length)];
    return sendPinterestImage(message, term, '🚗 Cars', false);
  }

  // ,trucks
  if (command === 'trucks') {
    const term = TRUCK_TERMS[Math.floor(Math.random() * TRUCK_TERMS.length)];
    return sendPinterestImage(message, term, '🚛 Trucks', false);
  }

  // ,lowriders
  if (command === 'lowriders') {
    const term =
      LOWRIDER_TERMS[Math.floor(Math.random() * LOWRIDER_TERMS.length)];
    return sendPinterestImage(message, term, '🚗 Lowriders', false);
  }

  // ,search <query>
  if (command === 'search') {
    const query = args.join(' ').trim();
    if (!query || query.length < 2) {
      return message.reply(
        'Please provide a search term (at least 2 characters).\nExample: `,search anime car wrap`'
      );
    }
    return sendPinterestImage(message, query, '🔍 Search', false);
  }

  // ,ping
  if (command === 'ping') {
    const sent = await message.reply('Pinging...');
    const roundtrip = sent.createdTimestamp - message.createdTimestamp;
    const ws = message.client.ws.ping;
    return sent.edit(
      `🏓 **Pong!**\nRoundtrip: \`${roundtrip}ms\`\nWebsocket: \`${ws}ms\``
    );
  }

  // ---- New prefix commands ----
  if (command === 'meme') {
    await message.channel.sendTyping().catch(() => {});
    try {
      const subs = ['memes', 'dankmemes', 'me_irl', 'wholesomememes'];
      const sub = subs[Math.floor(Math.random() * subs.length)];
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=40`, {
        headers: { 'User-Agent': 'Mozilla/5.0 DiscordBot' },
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      const posts = (data?.data?.children || [])
        .map(p => p.data)
        .filter(p => p && !p.over_18 && (p.url?.endsWith('.jpg') || p.url?.endsWith('.png') || p.url?.endsWith('.gif') || p.url?.includes('i.redd.it')));
      if (!posts.length) return message.reply('No memes found.');
      const post = posts[Math.floor(Math.random() * posts.length)];
      const embed = new EmbedBuilder()
        .setTitle(post.title.slice(0, 250))
        .setImage(post.url)
        .setURL(`https://reddit.com${post.permalink}`)
        .setColor(0xff4500)
        .setFooter({ text: `r/${sub}` });
      return message.reply({ embeds: [embed] });
    } catch {
      return message.reply('Failed to fetch a meme.');
    }
  }

  if (command === 'joke') return message.reply(`😂 ${JOKES[Math.floor(Math.random() * JOKES.length)]}`);
  if (command === 'quote') return message.reply(`💬 ${QUOTES[Math.floor(Math.random() * QUOTES.length)]}`);
  if (command === 'fact') return message.reply(`🧠 **Fun Fact:** ${FACTS[Math.floor(Math.random() * FACTS.length)]}`);

  if (command === 'ship') {
    const u1 = message.mentions.users.first();
    const u2 = message.mentions.users.at(1);
    if (!u1 || !u2) return message.reply('Mention two users: `,ship @user1 @user2`');
    const pct = Math.floor(Math.random() * 101);
    let msg = pct > 80 ? 'Match made in heaven 💕' : pct > 50 ? 'Pretty solid 👀' : pct > 20 ? 'Could work... maybe' : 'Yikes 💀';
    return message.reply(`💖 **${u1.username}** × **${u2.username}** = **${pct}%**\n${msg}`);
  }

  if (command === 'rate') {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`📊 I'd rate **${user.username}** a **${(Math.random() * 10).toFixed(1)}/10**`);
  }

  if (command === 'howgay') {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`🏳️‍🌈 **${user.username}** is **${Math.floor(Math.random() * 101)}%** gay`);
  }

  if (command === 'howhot') {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`🔥 **${user.username}** is **${Math.floor(Math.random() * 101)}%** hot`);
  }

  if (command === 'pp') {
    const user = message.mentions.users.first() || message.author;
    const size = Math.floor(Math.random() * 15) + 1;
    return message.reply(`🍆 **${user.username}**'s pp: 8${'='.repeat(size)}D`);
  }

  if (command === 'coinflip') return message.reply(`🪙 **${Math.random() < 0.5 ? 'Heads' : 'Tails'}**`);

  if (command === 'choose') {
    const parts = args.join(' ').split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return message.reply('Use: `,choose option1 | option2 | option3`');
    return message.reply(`🎯 I choose: **${parts[Math.floor(Math.random() * parts.length)]}**`);
  }

  if (command === 'avatar') {
    const user = message.mentions.users.first() || message.author;
    const embed = new EmbedBuilder().setTitle(`${user.username}'s Avatar`).setImage(user.displayAvatarURL({ size: 1024 })).setColor(0x5865f2);
    return message.reply({ embeds: [embed] });
  }

  if (command === 'banner') {
    const user = message.mentions.users.first() || message.author;
    const fetched = await client.users.fetch(user.id, { force: true });
    const banner = fetched.bannerURL({ size: 1024 });
    if (!banner) return message.reply('That user has no banner.');
    const embed = new EmbedBuilder().setTitle(`${user.username}'s Banner`).setImage(banner).setColor(0x5865f2);
    return message.reply({ embeds: [embed] });
  }

  if (command === 'snipe') {
    const data = snipes.get(message.channel.id);
    if (!data) return message.reply('Nothing to snipe.');
    const embed = new EmbedBuilder()
      .setAuthor({ name: data.author, iconURL: data.avatar })
      .setDescription(data.content)
      .setColor(0xed4245)
      .setTimestamp(data.timestamp);
    return message.reply({ embeds: [embed] });
  }

  if (command === 'editsnipe') {
    const data = editSnipes.get(message.channel.id);
    if (!data) return message.reply('Nothing to editsnipe.');
    const embed = new EmbedBuilder()
      .setAuthor({ name: data.author, iconURL: data.avatar })
      .addFields({ name: 'Before', value: data.old || '*empty*' }, { name: 'After', value: data.new || '*empty*' })
      .setColor(0xfaa61a)
      .setTimestamp(data.timestamp);
    return message.reply({ embeds: [embed] });
  }

  if (command === 'afk') {
    const reason = args.join(' ') || 'AFK';
    afkUsers.set(message.author.id, { reason, since: Date.now() });
    return message.reply(`😴 You're now AFK: **${reason}**`);
  }

  if (command === 'remind') {
    const timeStr = args[0];
    const text = args.slice(1).join(' ');
    if (!timeStr || !text) return message.reply('Use: `,remind 10m do something`');
    const match = timeStr.match(/^(\d+)(s|m|h|d)$/i);
    if (!match) return message.reply('Time format: 10s, 5m, 2h, 1d');
    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const ms = unit === 's' ? num * 1000 : unit === 'm' ? num * 60000 : unit === 'h' ? num * 3600000 : num * 86400000;
    if (ms > 86400000 * 7) return message.reply('Max 7 days.');
    await message.reply(`⏰ Reminder set for **${timeStr}**: ${text}`);
    setTimeout(() => {
      message.channel.send(`⏰ **Reminder for ${message.author}:** ${text}`).catch(() => {});
    }, ms);
    return;
  }

  if (command === 'weather') {
    const city = args.join(' ');
    if (!city) return message.reply('Use: `,weather London`');
    await message.channel.sendTyping().catch(() => {});
    try {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`, { signal: AbortSignal.timeout(8000) }).then(r => r.json());
      if (!geo?.results?.[0]) return message.reply('City not found.');
      const { latitude, longitude, name, country } = geo.results[0];
      const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`, { signal: AbortSignal.timeout(8000) }).then(r => r.json());
      const cw = w.current_weather;
      const embed = new EmbedBuilder()
        .setTitle(`🌤️ Weather — ${name}, ${country}`)
        .addFields(
          { name: 'Temperature', value: `${cw.temperature}°C`, inline: true },
          { name: 'Wind', value: `${cw.windspeed} km/h`, inline: true }
        )
        .setColor(0x3498db);
      return message.reply({ embeds: [embed] });
    } catch {
      return message.reply('Failed to get weather.');
    }
  }

  if (command === 'define') {
    const word = args[0];
    if (!word) return message.reply('Use: `,define hello`');
    await message.channel.sendTyping().catch(() => {});
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) return message.reply('No definition found.');
      const data = await res.json();
      const entry = data[0];
      const meaning = entry.meanings?.[0];
      const def = meaning?.definitions?.[0]?.definition || 'No definition.';
      const embed = new EmbedBuilder()
        .setTitle(`📖 ${entry.word}`)
        .setDescription(def)
        .addFields({ name: 'Part of speech', value: meaning?.partOfSpeech || '—', inline: true })
        .setColor(0x5865f2);
      return message.reply({ embeds: [embed] });
    } catch {
      return message.reply('Failed to look up that word.');
    }
  }

  if (command === 'roast') {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`🔥 ${user}: ${ROASTS[Math.floor(Math.random() * ROASTS.length)]}`);
  }

  if (command === 'compliment') {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`💖 ${user}: ${COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]}`);
  }

  if (command === 'simp') {
    const user = message.mentions.users.first() || message.author;
    return message.reply(`🥺 **${message.author.username}** is **${Math.floor(Math.random() * 101)}%** simping for **${user.username}**`);
  }

  if (command === 'wyr') {
    const q = WYR_PG16[Math.floor(Math.random() * WYR_PG16.length)];
    const embed = new EmbedBuilder().setTitle('🤔 Would You Rather').setDescription(q).setColor(0x9b59b6).setFooter({ text: 'PG-16' });
    const msg = await message.reply({ embeds: [embed] });
    await msg.react('🅰️');
    await msg.react('🅱️');
    return;
  }

  if (command === 'truth') return message.reply(`🗣️ **Truth:** ${TRUTHS_PG16[Math.floor(Math.random() * TRUTHS_PG16.length)]}`);
  if (command === 'dare') return message.reply(`😈 **Dare:** ${DARES_PG16[Math.floor(Math.random() * DARES_PG16.length)]}`);

  // existing 8ball / roll prefix aliases
  if (command === '8ball') {
    const question = args.join(' ');
    if (!question) return message.reply('Ask a question: `,8ball will I win?`');
    const answer = EIGHTBALL_ANSWERS[Math.floor(Math.random() * EIGHTBALL_ANSWERS.length)];
    const embed = new EmbedBuilder().setTitle('🎱 Magic 8-Ball').addFields({ name: 'Question', value: question }, { name: 'Answer', value: answer }).setColor(0x5865f2);
    return message.reply({ embeds: [embed] });
  }

  if (command === 'dice' || command === 'roll') {
    const sides = parseInt(args[0]) || 6;
    if (sides < 2 || sides > 1000) return message.reply('Sides must be 2–1000.');
    return message.reply(`🎲 You rolled a **${Math.floor(Math.random() * sides) + 1}** (1–${sides})`);
  }
});

// ===================== REGISTER SLASH COMMANDS =====================
async function registerCommands() {
  const commands = [
    { name: 'embed', description: 'Create a custom embed with a live preview' },
    { name: 'help', description: 'Shows available slash commands' },
    {
      name: 'spicy',
      description: 'Get a random spicy image from Pinterest (NSFW only)'
    },
    {
      name: 'nsfw',
      description: 'Get a random NSFW image from Reddit (NSFW only)'
    },
    {
      name: 'cars',
      description: 'Get a random custom/anime wrap car image'
    },
    { name: 'trucks', description: 'Get a random truck image' },
    {
      name: 'lowriders',
      description: 'Get a random lowrider image'
    },
    {
      name: 'search',
      description: 'Search Pinterest for any term',
      options: [
        {
          name: 'query',
          description: 'What to search for',
          type: 3,
          required: true
        }
      ]
    },
    { name: 'ping', description: 'Shows the bot latency' },
    {
      name: 'roll',
      description: 'Roll a dice',
      options: [
        {
          name: 'sides',
          description: 'Number of sides (default 6)',
          type: 4,
          required: false,
          min_value: 2,
          max_value: 1000
        }
      ]
    },
    {
      name: '8ball',
      description: 'Ask the Magic 8-Ball a question',
      options: [
        {
          name: 'question',
          description: 'Your question',
          type: 3,
          required: true
        }
      ]
    },
    {
      name: 'userinfo',
      description: 'Shows info about a user',
      options: [
        {
          name: 'user',
          description: 'The user to look up',
          type: 6,
          required: false
        }
      ]
    },
    { name: 'serverinfo', description: 'Shows server stats' },
    {
      name: 'translate',
      description: 'Translate text to another language',
      options: [
        {
          name: 'text',
          description: 'Text to translate',
          type: 3,
          required: true
        },
        {
          name: 'language',
          description: 'Target language code (en, es, fr, de, ja...)',
          type: 3,
          required: false
        }
      ]
    },
    {
      name: 'poll',
      description: 'Create a quick poll',
      options: [
        {
          name: 'question',
          description: 'The poll question',
          type: 3,
          required: true
        },
        {
          name: 'option1',
          description: 'First option',
          type: 3,
          required: true
        },
        {
          name: 'option2',
          description: 'Second option',
          type: 3,
          required: true
        },
        {
          name: 'option3',
          description: 'Third option (optional)',
          type: 3,
          required: false
        },
        {
          name: 'option4',
          description: 'Fourth option (optional)',
          type: 3,
          required: false
        }
      ]
    },
    { name: 'meme', description: 'Get a random meme' },
    { name: 'joke', description: 'Get a random joke' },
    { name: 'quote', description: 'Get a random quote' },
    { name: 'fact', description: 'Get a random fun fact' },
    {
      name: 'ship',
      description: 'Ship two users',
      options: [
        { name: 'user1', description: 'First user', type: 6, required: true },
        { name: 'user2', description: 'Second user', type: 6, required: true }
      ]
    },
    {
      name: 'rate',
      description: 'Rate a user out of 10',
      options: [{ name: 'user', description: 'User to rate', type: 6, required: false }]
    },
    {
      name: 'howgay',
      description: 'How gay is someone?',
      options: [{ name: 'user', description: 'User', type: 6, required: false }]
    },
    {
      name: 'howhot',
      description: 'How hot is someone?',
      options: [{ name: 'user', description: 'User', type: 6, required: false }]
    },
    {
      name: 'pp',
      description: 'The classic pp size command',
      options: [{ name: 'user', description: 'User', type: 6, required: false }]
    },
    { name: 'coinflip', description: 'Flip a coin' },
    {
      name: 'choose',
      description: 'Choose between options (separate with |)',
      options: [{ name: 'options', description: 'option1 | option2 | option3', type: 3, required: true }]
    },
    {
      name: 'avatar',
      description: "Show a user's avatar",
      options: [{ name: 'user', description: 'User', type: 6, required: false }]
    },
    {
      name: 'banner',
      description: "Show a user's banner",
      options: [{ name: 'user', description: 'User', type: 6, required: false }]
    },
    { name: 'snipe', description: 'Show the last deleted message' },
    { name: 'editsnipe', description: 'Show the last edited message' },
    {
      name: 'afk',
      description: 'Set yourself as AFK',
      options: [{ name: 'reason', description: 'AFK reason', type: 3, required: false }]
    },
    {
      name: 'remind',
      description: 'Set a reminder',
      options: [
        { name: 'time', description: 'e.g. 10m, 2h, 1d', type: 3, required: true },
        { name: 'message', description: 'What to remind you about', type: 3, required: true }
      ]
    },
    {
      name: 'weather',
      description: 'Get the weather for a city',
      options: [{ name: 'city', description: 'City name', type: 3, required: true }]
    },
    {
      name: 'define',
      description: 'Define a word',
      options: [{ name: 'word', description: 'Word to define', type: 3, required: true }]
    },
    {
      name: 'roast',
      description: 'Roast someone',
      options: [{ name: 'user', description: 'Victim', type: 6, required: false }]
    },
    {
      name: 'compliment',
      description: 'Compliment someone',
      options: [{ name: 'user', description: 'User', type: 6, required: false }]
    },
    {
      name: 'simp',
      description: 'How much are you simping?',
      options: [{ name: 'user', description: 'Who you simp for', type: 6, required: false }]
    },
    { name: 'wyr', description: 'Would You Rather (PG-16)' },
    { name: 'truth', description: 'Truth question (PG-16)' },
    { name: 'dare', description: 'Dare challenge (PG-16)' }
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
