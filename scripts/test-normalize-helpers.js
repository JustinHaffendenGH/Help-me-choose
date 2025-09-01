// Lightweight adapter to reuse normalizeProviderName logic in tests outside browser
// This duplicates the same normalization logic used client-side. Keep in sync when updating.

function normalizeProviderName(providerName) {
  if (!providerName) return '';
  let s = providerName.trim().toLowerCase();
  s = s.replace(/\(.*?\)/g, '');
  s = s.replace(/[\*\|\/:,]/g, ' ');
  s = s.replace(/\+/g, ' plus').replace(/\s+/g, ' ').trim();
  s = s.replace(/\b(amazon channel|amazon prime channel|amazon channel)\b/g, '');
  s = s.replace(/\b(standard with ads|basic with ads|with ads|with ads?)\b/g, '');
  s = s.replace(/\b(roku premium channel|premium channel|channel)\b/g, '');
  s = s.replace(/\b(available to purchase|buy|rental|rent)\b/g, '');
  s = s.replace(/\b(\(free\)|free)\b/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  if (s.includes('netflix')) return 'netflix';
  if (s.includes('disney')) return 'disney+';
  if (s.includes('hulu')) return 'hulu';
  if (s.includes('amazon') || s.includes('primevideo') || s.includes('prime video') || s.includes('prime')) return 'amazon prime video';
  if (s.includes('hbo') || s.includes('max')) return 'hbo max';
  if (s.includes('apple')) return 'apple tv+';
  if (s.includes('paramount')) return 'paramount+';
  if (s.includes('peacock')) return 'peacock';
  if (s.includes('roku')) return 'roku';
  if (s.includes('amc')) return 'amc+';
  if (s.includes('starz')) return 'starz';
  if (s.includes('google play') || s.includes('play.google')) return 'google play';
  if (s.includes('rakuten')) return 'rakuten tv';
  if (s.includes('pathe')) return 'pathe thuis';
  if (s.includes('vudu')) return 'vudu';
  if (s.includes('mubi')) return 'mubi';
  if (s.includes('peacock')) return 'peacock';
  if (s.includes('tubi')) return 'tubi';
  if (s.includes('pluto')) return 'pluto tv';
  return s;
}

module.exports = { normalizeProviderName };
