// jiosaavn api client
// tries ur worker first, falls back to public api

const fetch = require("node-fetch");

// hardcoded - no need for env vars, these are public apis
const API_PRIMARY = "https://jiosaavn-api-two-beta.vercel.app/api";
const API_FALLBACK = "https://saavn.dev/api";

async function hit(endpoint) {
  // try ur worker first
  try {
    const r = await fetch(`${API_PRIMARY}${endpoint}`, { timeout: 8000 });
    if (r.ok) {
      const d = await r.json();
      if (d?.success !== false) return d;
    }
  } catch (_) {}

  // fallback to public
  try {
    const r = await fetch(`${API_FALLBACK}${endpoint}`, { timeout: 8000 });
    if (r.ok) {
      const d = await r.json();
      if (d?.success !== false) return d;
    }
  } catch (_) {}

  return null;
}

async function search(query, limit = 5) {
  const d = await hit(`/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
  return d?.data?.results || [];
}

async function getById(id) {
  const d = await hit(`/songs/${id}`);
  return d?.data?.[0] || null;
}

async function getByLink(link) {
  const d = await hit(`/songs?link=${encodeURIComponent(link)}`);
  return d?.data?.[0] || null;
}

async function getLyrics(id) {
  const d = await hit(`/songs/${id}/lyrics`);
  return d?.data?.lyrics || null;
}

async function getPlaylist(idOrLink) {
  const ep = idOrLink.startsWith("http")
    ? `/playlists?link=${encodeURIComponent(idOrLink)}`
    : `/playlists?id=${idOrLink}`;
  const d = await hit(ep);
  return d?.data || null;
}

async function getAlbum(idOrLink) {
  const ep = idOrLink.startsWith("http")
    ? `/albums?link=${encodeURIComponent(idOrLink)}`
    : `/albums?id=${idOrLink}`;
  const d = await hit(ep);
  return d?.data || null;
}

async function getSuggestions(id) {
  const d = await hit(`/songs/${id}/suggestions`);
  return d?.data || [];
}

// pull download url - 160kbps is the sweet spot (fast download, good quality)
function dlUrl(song) {
  if (!song?.downloadUrl) return null;
  const urls = song.downloadUrl;
  if (Array.isArray(urls)) {
    // prefer 160kbps: sounds great, downloads fast, no buffer
    const match = urls.find(u => u.quality === "160kbps");
    return match?.url || urls[urls.length - 1]?.url || null;
  }
  return typeof urls === "string" ? urls : null;
}

// clean up raw song obj
function fmt(song) {
  if (!song) return null;
  return {
    id: song.id,
    name: song.name || song.title || "Unknown",
    artists: song.artists?.primary?.map(a => a.name).join(", ") || song.primaryArtists || "Unknown",
    album: song.album?.name || song.album || "Unknown",
    year: song.year || "",
    duration: song.duration || 0,
    image: song.image?.[song.image.length - 1]?.url || song.image?.[2]?.url || null,
    url: dlUrl(song),
    link: song.url || null,
    lang: song.language || "",
    hasLyrics: song.hasLyrics || false,
  };
}

module.exports = { search, getById, getByLink, getLyrics, getPlaylist, getAlbum, getSuggestions, fmt };
