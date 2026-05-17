/**
 * Registru unic — sursa de adevăr pentru platforme (date + logo + tag-uri RO).
 */
const platforms = {
  netflix: {
    id: 'netflix', name: 'Netflix', logoSlug: 'netflix', logoColor: 'e50914', logoBg: '#000000',
    category: 'Video', tags: ['Filme', 'Seriale', 'Video'], tagSlugs: ['filme', 'seriale', 'video'],
    featured: true, badgeClass: 'badge-filme', primaryTag: 'Filme',
    tagline: 'Lider global SVOD pentru filme și seriale',
    summary: 'Abonament video cu producții originale și catalog licențiat, în 190+ țări.',
    description: 'Netflix este serviciul de streaming video pe abonament (SVOD) cu cea mai mare bază globală de abonați plătitori. Oferă filme, seriale și documentare originale, plus titluri licențiate.',
    history: '1997 — DVD prin poștă; 2007 — streaming; 2013 — House of Cards; 2024 — 270M+ abonați.',
    origin: { company: 'Netflix, Inc.', founded: 1997, headquarters: 'Los Gatos, California, SUA' },
    users: '270M+ abonați plătitori (2024)',
    revenue: { label: '~33,7 miliarde USD (2023)', reported: true },
    pricing: '6,99–22,99 USD/lună', model: 'SVOD (+ tier cu reclame)',
    pros: ['Cel mai mare catalog de originale', '4K HDR', '190+ țări', 'Recomandări puternice'],
    cons: ['Prețuri în creștere', 'Restricții partajare cont', 'Catalog diferit pe regiuni']
  },
  spotify: {
    id: 'spotify', name: 'Spotify', logoSlug: 'spotify', logoColor: '1db954', logoBg: '#000000',
    category: 'Muzică', tags: ['Muzică', 'Video'], tagSlugs: ['muzica', 'video'],
    featured: true, badgeClass: 'badge-audio', primaryTag: 'Muzică',
    tagline: 'Lider global în streaming muzical',
    summary: 'Peste 100M melodii și podcast-uri; model freemium cu Premium.',
    description: 'Spotify domină streaming-ul audio: muzică, podcast-uri, audiobooks. Freemium + Premium.',
    history: '2008 — Suedia; 2011 — SUA; 2018 — IPO; 602M+ utilizatori lunari.',
    origin: { company: 'Spotify Technology S.A.', founded: 2006, headquarters: 'Stockholm, Suedia' },
    users: '602M+ utilizatori lunari · 236M+ Premium',
    revenue: { label: '~13,9 miliarde USD (2023)', reported: true },
    pricing: 'Gratuit · ~11,99 EUR/lună Premium', model: 'Freemium (AVOD + SVOD)',
    pros: ['Catalog uriaș', 'Discover Weekly', 'Tier gratuit', 'Podcast-uri'],
    cons: ['Plăți mici per stream', 'Fără FLAC nativ', 'Reclame pe gratuit']
  },
  youtube: {
    id: 'youtube', name: 'YouTube', logoSlug: 'youtube', logoColor: 'ff0000', logoBg: '#000000',
    category: 'Video', tags: ['Video', 'Gaming'], tagSlugs: ['video', 'gaming'],
    featured: true, badgeClass: 'badge-video', primaryTag: 'Video',
    tagline: 'Cea mai mare platformă video din lume',
    summary: 'Video și live de la creatori; reclame + YouTube Premium.',
    description: 'YouTube (Google) găzduiește UGC și conținut profesional. 2,5 miliarde utilizatori lunari.',
    history: '2005 — fondare; 2006 — Google; 2007 — Partner Program; Shorts 2020+.',
    origin: { company: 'Google LLC (Alphabet)', founded: 2005, headquarters: 'San Bruno, California, SUA' },
    users: '2,5 miliarde utilizatori lunari',
    revenue: { label: '~31,5 miliarde USD din reclame (2023)', reported: true },
    pricing: 'Gratuit · Premium ~13,99 USD/lună', model: 'AVOD + SVOD',
    pros: ['Gratuit', 'Ecosistem creatori', 'Shorts & Live'],
    cons: ['Reclame', 'Demonetizări', 'Moderare inconsistentă']
  },
  disneyplus: {
    id: 'disneyplus', name: 'Disney+', logoSlug: 'disney', logoColor: '113ccf', logoBg: '#0e1a2e',
    category: 'Video', tags: ['Filme', 'Seriale', 'Video'], tagSlugs: ['filme', 'seriale', 'video'],
    tagline: 'Disney, Marvel, Star Wars, Pixar', summary: 'SVOD familial; ~150M+ abonați.',
    description: 'Disney+ — SVOD Disney: animație, Marvel, Star Wars, Nat Geo. Lansat 2019.',
    history: '2019 — lansare globală; bundle Hulu/Star în unele piețe.',
    origin: { company: 'The Walt Disney Company', founded: 2019, headquarters: 'Burbank, California, SUA' },
    users: '~150M+ abonați (2024)', revenue: { label: '~7,5 miliarde USD estimat (2023)', reported: false },
    pricing: 'De la ~7,99 USD/lună', model: 'SVOD + AVOD tier',
    pros: ['Francize iconice', '4K HDR', 'Familie'], cons: ['Catalog mai mic', 'Creștere încetinită']
  },
  primevideo: {
    id: 'primevideo', name: 'Amazon Prime Video', logoSlug: 'primevideo', logoColor: '00a8e1', logoBg: '#0f1419',
    category: 'Video', tags: ['Filme', 'Seriale', 'Video'], tagSlugs: ['filme', 'seriale', 'video'],
    tagline: 'Video în Amazon Prime', summary: 'Originals + TVOD; inclus în Prime.',
    description: 'Prime Video: streaming, Amazon Originals, închiriere digitală. Inclus în Prime.',
    history: '2006 — Unbox; 2015 — Prime Video.',
    origin: { company: 'Amazon.com, Inc.', founded: 2006, headquarters: 'Seattle, Washington, SUA' },
    users: '~200M+ membri Prime', revenue: { label: '~4–5 miliarde USD estimat video (2023)', reported: false },
    pricing: 'Inclus în Prime (~14,99 USD/lună)', model: 'SVOD + TVOD',
    pros: ['Inclus în Prime', 'Originals'], cons: ['UI aglomerat']
  },
  max: {
    id: 'max', name: 'Max', logoSlug: 'hbomax', logoColor: '002be7', logoBg: '#000000',
    category: 'Video', tags: ['Filme', 'Seriale', 'Video'], tagSlugs: ['filme', 'seriale', 'video'],
    tagline: 'HBO, Warner, DC', summary: 'Fost HBO Max; seriale premium HBO.',
    description: 'Max (WBD): HBO, Warner Bros., DC, Discovery. Rebrand 2023.',
    history: '2020 HBO Max → 2023 Max.',
    origin: { company: 'Warner Bros. Discovery', founded: 2020, headquarters: 'New York, SUA' },
    users: '~100M abonați estimat', revenue: { label: '~8–9 miliarde USD estimat WBD streaming (2023)', reported: false },
    pricing: 'De la ~9,99 USD/lună', model: 'SVOD + AVOD',
    pros: ['HBO', '4K HDR'], cons: ['Rebrand confuz']
  },
  hulu: {
    id: 'hulu', name: 'Hulu', logoSlug: 'hulu', logoColor: '1ce783', logoBg: '#0a0f14',
    category: 'Video', tags: ['Seriale', 'Video'], tagSlugs: ['seriale', 'video'],
    tagline: 'SVOD + TV live (SUA)', summary: 'Episoade la zi; Disney majoritar.',
    description: 'Hulu: on-demand + live TV în SUA. ABC/FX/Hulu Originals.',
    history: '2007 SUA; 2019 Disney control.',
    origin: { company: 'Hulu, LLC (Disney)', founded: 2007, headquarters: 'Los Angeles, SUA' },
    users: '~50M+ abonați SUA', revenue: { label: '~4,5 miliarde USD estimat (2023)', reported: false },
    pricing: 'De la 7,99 USD/lună', model: 'SVOD + Live TV',
    pros: ['Episoade la zi', 'Live TV'], cons: ['Doar SUA']
  },
  peacock: {
    id: 'peacock', name: 'Peacock', logoSlug: 'peacocktv', logoColor: 'ffffff', logoBg: '#14141c',
    category: 'Video', tags: ['Filme', 'Seriale', 'Video'], tagSlugs: ['filme', 'seriale', 'video'],
    tagline: 'NBCUniversal', summary: 'Freemium; sport live în SUA.',
    description: 'Peacock (Comcast/NBCU): NBC, sport, Universal. Tier gratuit.',
    history: '2020 — SUA.',
    origin: { company: 'NBCUniversal (Comcast)', founded: 2020, headquarters: 'New York, SUA' },
    users: '~30M+ premium SUA', revenue: { label: '~3 miliarde USD estimat (2023)', reported: false },
    pricing: 'Gratuit · Premium 5,99+ USD', model: 'Freemium',
    pros: ['Gratuit', 'Sport'], cons: ['Geo-limitare']
  },
  crunchyroll: {
    id: 'crunchyroll', name: 'Crunchyroll', logoSlug: 'crunchyroll', logoColor: 'f47521', logoBg: '#1a1a1a',
    category: 'Anime', tags: ['Anime', 'Seriale', 'Video'], tagSlugs: ['anime', 'seriale', 'video'],
    tagline: 'Anime occidental', summary: '45.000+ episoade; simulcast; Sony.',
    description: 'Crunchyroll — anime, simulcast, manga. Fuziune Funimation 2021.',
    history: '2006 — legalizare; 2021 — Funimation.',
    origin: { company: 'Sony Pictures / Crunchyroll', founded: 2006, headquarters: 'Los Angeles, SUA' },
    users: '13M+ premium · 120M+ înregistrați', revenue: { label: '~1 miliard USD estimat (2023)', reported: false },
    pricing: 'Gratuit · 9,99–14,99 EUR/lună', model: 'Freemium + SVOD',
    pros: ['Catalog anime', 'Simulcast'], cons: ['UI vechi', 'Calitate video']
  },
  twitch: {
    id: 'twitch', name: 'Twitch', logoSlug: 'twitch', logoColor: '9146ff', logoBg: '#0e0e10',
    category: 'Live', tags: ['Gaming', 'Live', 'Video'], tagSlugs: ['gaming', 'live', 'video'],
    tagline: 'Live streaming', summary: 'Gaming & IRL; Amazon; 140M+ lunari.',
    description: 'Twitch — live streaming, subs, Bits. Amazon 2014.',
    history: '2011 Justin.tv spin-off.',
    origin: { company: 'Twitch Interactive (Amazon)', founded: 2011, headquarters: 'San Francisco, SUA' },
    users: '140M+ lunari', revenue: { label: '~2,6 miliarde USD estimat (2023)', reported: false },
    pricing: 'Gratuit · Turbo 9,99 USD', model: 'AVOD + subs creator',
    pros: ['Live interactiv'], cons: ['Moderare', 'Descoperire']
  },
  youtubemusic: {
    id: 'youtubemusic', name: 'YouTube Music', logoSlug: 'youtubemusic', logoColor: 'ff0000', logoBg: '#000000',
    category: 'Muzică', tags: ['Muzică', 'Video'], tagSlugs: ['muzica', 'video'],
    tagline: 'Muzică + video Google', summary: 'Videoclipuri oficiale; bundle Premium.',
    description: 'YouTube Music înlocuiește Play Music. Videoclipuri + audio.',
    history: '2018 lansare; 2020 Play Music oprit.',
    origin: { company: 'Google LLC', founded: 2018, headquarters: 'San Bruno, SUA' },
    users: '~100M+ via Premium', revenue: { label: 'Neraportat separat (venituri YouTube/Alphabet)', reported: false },
    pricing: '10,99 USD sau Premium 13,99 USD', model: 'SVOD bundle',
    pros: ['Videoclipuri', 'Integrare YT'], cons: ['UI sub Spotify']
  },
  applemusic: {
    id: 'applemusic', name: 'Apple Music', logoSlug: 'applemusic', logoColor: 'fc3c44', logoBg: '#000000',
    category: 'Muzică', tags: ['Muzică'], tagSlugs: ['muzica'],
    tagline: 'Hi-Fi Apple', summary: 'Lossless & Atmos; fără gratuit.',
    description: 'Apple Music — 100M+ melodii, integrare iOS/macOS.',
    history: '2015; 2021 Lossless.',
    origin: { company: 'Apple Inc.', founded: 2015, headquarters: 'Cupertino, SUA' },
    users: '~100M abonați', revenue: { label: 'Neraportat separat (~85 mld. USD Services total 2023)', reported: false },
    pricing: '10,99 USD/lună', model: 'SVOD',
    pros: ['Lossless', 'Atmos'], cons: ['Fără gratuit']
  },
  appletv: {
    id: 'appletv', name: 'Apple TV+', logoSlug: 'appletv', logoColor: 'ffffff', logoBg: '#000000',
    category: 'Video', tags: ['Filme', 'Seriale', 'Video'], tagSlugs: ['filme', 'seriale', 'video'],
    tagline: 'Originale Apple', summary: 'Doar originale; Oscar CODA.',
    description: 'Apple TV+ — exclusiv producții Apple. Fără bibliotecă masivă licențiată.',
    history: '2019; CODA Oscar 2022.',
    origin: { company: 'Apple Inc.', founded: 2019, headquarters: 'Cupertino, SUA' },
    users: '~25M abonați', revenue: { label: 'Neraportat separat (Apple Services)', reported: false },
    pricing: '9,99 USD/lună', model: 'SVOD originale',
    pros: ['Calitate', '4K Dolby'], cons: ['Catalog mic']
  },
  deezer: {
    id: 'deezer', name: 'Deezer', logoSlug: 'deezer', logoColor: 'a238ff', logoBg: '#14141c',
    category: 'Muzică', tags: ['Muzică'], tagSlugs: ['muzica'],
    tagline: 'Muzică europeană', summary: 'Flow AI; 90M+ utilizatori.',
    description: 'Deezer — francez, Flow, HiFi în unele piețe.',
    history: '2007 Paris.',
    origin: { company: 'Deezer S.A.', founded: 2007, headquarters: 'Paris, Franța' },
    users: '90M+ · ~7M Premium', revenue: { label: '~400 milioane EUR (2023)', reported: true },
    pricing: 'Freemium · 11,99 EUR', model: 'Freemium',
    pros: ['Flow', 'HiFi'], cons: ['Slab în SUA']
  },
  tidal: {
    id: 'tidal', name: 'Tidal', logoSlug: 'tidal', logoColor: 'ffffff', logoBg: '#000000',
    category: 'Muzică', tags: ['Muzică'], tagSlugs: ['muzica'],
    tagline: 'Lossless Hi-Fi', summary: '~5M abonați; Block.',
    description: 'Tidal — FLAC, focus artiști.',
    history: '2014; 2021 Block.',
    origin: { company: 'Tidal (Block, Inc.)', founded: 2014, headquarters: 'Oslo / New York' },
    users: '~5M abonați', revenue: { label: 'Neraportat public (2023)', reported: false },
    pricing: '10,99–19,99 USD', model: 'SVOD HiFi',
    pros: ['HiFi'], cons: ['Catalog mic']
  },
  soundcloud: {
    id: 'soundcloud', name: 'SoundCloud', logoSlug: 'soundcloud', logoColor: 'ff5500', logoBg: '#1a1a1a',
    category: 'Muzică', tags: ['Muzică', 'Video'], tagSlugs: ['muzica', 'video'],
    tagline: 'Artiști independenți', summary: 'Upload direct; underground.',
    description: 'SoundCloud — publicare directă pentru artiști.',
    history: '2007 Berlin.',
    origin: { company: 'SoundCloud Global Limited', founded: 2007, headquarters: 'Berlin, Germania' },
    users: '76M+ · 20M+ creatori', revenue: { label: '~200 milioane USD estimat (2023)', reported: false },
    pricing: 'Gratuit · Go+ 4,99 USD', model: 'Freemium',
    pros: ['Independenți'], cons: ['Monetizare grea']
  }
};

const PLATFORM_IDS = Object.keys(platforms);
const FEATURED_IDS = ['netflix', 'spotify', 'youtube'];
const OTHER_GRID_IDS = ['disneyplus', 'primevideo', 'max', 'hulu', 'peacock', 'crunchyroll', 'twitch', 'deezer', 'tidal', 'soundcloud', 'youtubemusic', 'applemusic', 'appletv'];

function formatRevenue(p) {
  return p?.revenue?.label || '—';
}

function formatOrigin(p) {
  const o = p?.origin;
  if (!o) return '—';
  return o.company + ' · fondată ' + o.founded + ' · ' + o.headquarters;
}

function platformLogoHtml(id, size = 28) {
  const p = platforms[id];
  if (!p) return '';

  const specialIcons = {
    disneyplus: "https://www.svgrepo.com/show/504281/disneyplus.svg",
    peacock: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Peacock_2019.svg"
  };

  // IMPORTANT: use platform ID, not logoSlug
  const override = specialIcons[id];

  const primary = `https://cdn.simpleicons.org/${p.logoSlug}/${p.logoColor}`;
  const secondary = `https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${p.logoSlug}.svg`;
  const fallback = "https://www.svgrepo.com/show/334195/question-mark.svg";

  const sources = [override, primary, secondary, fallback]
    .filter(src => typeof src === "string" && src.length > 0);

  return `
    <img
      class="platform-logo-img"
      data-sources='${JSON.stringify(sources)}'
      src="${sources[0]}"
      width="${size}"
      height="${size}"
      alt="Logo ${p.name}"
      loading="lazy"
      decoding="async"
      onerror="
        const list = JSON.parse(this.dataset.sources);
        const current = this.src;
        const i = list.indexOf(current);

        if (i >= 0 && i < list.length - 1) {
          this.src = list[i + 1];
        } else {
          this.onerror = null;
        }
      "
    >
  `;
}

function hydratePlatformIcons() {
  document.querySelectorAll('[data-platform-icon]').forEach(function(el) {
    const id = el.dataset.platformIcon;
    const p = platforms[id];
    if (!p) return;
    var sz = 26;
    if (el.classList.contains('modal-logo')) sz = 32;
    else if (el.classList.contains('fc-logo')) sz = 22;
  el.innerHTML = platformLogoHtml(id, sz);
    el.style.background = p.logoBg || '#000';
    if (id === 'appletv' || id === 'tidal' || id === 'peacock') {
      el.style.border = '1px solid var(--border-dim)';
    }
  });
}

function tagsHtml(p) {
  return p.tags.map(function(t) { return '<span class="tag">#' + t + '</span>'; }).join('');
}

function buildCompData() {
  var data = {};
  PLATFORM_IDS.forEach(function(id) {
    var p = platforms[id];
    data[id] = {
      utilizatori: p.users,
      venituri: formatRevenue(p),
      pret: p.pricing,
      model: p.model,
      tip: p.category,
      origine: formatOrigin(p),
      lansare: String(p.origin.founded),
      calitate: (p.pros && p.pros[0]) ? p.pros[0] : '—'
    };
  });
  return data;
}

function renderOtherPlatformsGrid() {
  var el = document.getElementById('otherPlatformsGrid');
  if (!el) return;
  el.innerHTML = OTHER_GRID_IDS.map(function(id) {
    var p = platforms[id];
    var D = 'di' + 'v';
    return '<article class="other-card fade-up" role="button" tabindex="0" onclick="openModal(\'' + id + '\')">' +
      '<' + D + ' class="other-logo" data-platform-icon="' + id + '"></' + D + '>' +
      '<' + D + ' class="other-name">' + p.name + '</' + D + '>' +
      '<p class="other-desc">' + p.summary + '</p>' +
      '<span class="other-cat">' + p.category + '</span></article>';
  }).join('');
  hydratePlatformIcons();
  if (typeof window.reobserveFadeUp === 'function') window.reobserveFadeUp(el);
}

function renderFilteredPlatforms() {
  var el = document.getElementById('filteredPlatforms');
  if (!el) return;
  var D = 'di' + 'v';
  el.innerHTML = PLATFORM_IDS.map(function(id) {
    var p = platforms[id];
    return '<article class="filtered-card" data-tags="' + p.tagSlugs.join(' ') + '" onclick="openModal(\'' + id + '\')">' +
      '<header class="fc-header"><' + D + ' class="fc-logo" data-platform-icon="' + id + '"></' + D + '>' +
      '<' + D + ' class="fc-meta"><' + D + ' class="fc-name">' + p.name + '</' + D + '><' + D + ' class="fc-cat">' + p.category + '</' + D + '></' + D + '></header>' +
      '<p class="fc-desc">' + p.summary + '</p><' + D + ' class="fc-tags">' + tagsHtml(p) + '</' + D + '></article>';
  }).join('');
  hydratePlatformIcons();
  if (typeof window.reobserveFadeUp === 'function') window.reobserveFadeUp(el);
}

function populateComparisonSelects() {
  ['comp1', 'comp2'].forEach(function(selId) {
    var sel = document.getElementById(selId);
    if (!sel) return;
    var current = sel.value;
    sel.innerHTML = PLATFORM_IDS.map(function(id) {
      return '<option value="' + id + '">' + platforms[id].name + '</option>';
    }).join('');
    if (platforms[current]) sel.value = current;
  });
}

function hydrateFeaturedCards() {
  FEATURED_IDS.forEach(function(id) {
    var p = platforms[id];
    var card = document.querySelector('.platform-card[data-platform="' + id + '"]');
    if (!card) return;
    var badge = card.querySelector('.card-badge');
    if (badge) {
      badge.textContent = '#' + p.primaryTag;
      badge.className = 'card-badge ' + (p.badgeClass || 'badge-video');
    }
    var desc = card.querySelector('.card-desc');
    if (desc) desc.textContent = p.summary;
    var tagsEl = card.querySelector('.card-tags');
    if (tagsEl) tagsEl.innerHTML = tagsHtml(p);
  });
}

/* Expunere globală pentru scriptul principal (const/let nu iese din modulul script) */
(function (w) {
  w.platforms = platforms;
  w.PLATFORM_IDS = PLATFORM_IDS;
  w.FEATURED_IDS = FEATURED_IDS;
  w.OTHER_GRID_IDS = OTHER_GRID_IDS;
  w.formatRevenue = formatRevenue;
  w.formatOrigin = formatOrigin;
  w.platformLogoHtml = platformLogoHtml;
  w.hydratePlatformIcons = hydratePlatformIcons;
  w.buildCompData = buildCompData;
  w.tagsHtml = tagsHtml;
  w.renderOtherPlatformsGrid = renderOtherPlatformsGrid;
  w.renderFilteredPlatforms = renderFilteredPlatforms;
  w.populateComparisonSelects = populateComparisonSelects;
  w.hydrateFeaturedCards = hydrateFeaturedCards;
})(typeof window !== 'undefined' ? window : globalThis);
