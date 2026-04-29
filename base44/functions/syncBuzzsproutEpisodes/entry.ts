import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RSS_URL = Deno.env.get("BUZZSPROUT_RSS_URL");

function parseXmlTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function parseCDATA(value) {
  if (!value) return null;
  const cdataMatch = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return cdataMatch ? cdataMatch[1].trim() : value.trim();
}

function parseAttr(xml, tag, attr) {
  const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : null;
}

function parseEpisodes(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];

    const title = parseCDATA(parseXmlTag(itemXml, 'title')) || '';
    const description = parseCDATA(parseXmlTag(itemXml, 'description')) || '';
    const pubDate = parseXmlTag(itemXml, 'pubDate');
    const enclosureUrl = parseAttr(itemXml, 'enclosure', 'url');
    const guid = parseCDATA(parseXmlTag(itemXml, 'guid')) || enclosureUrl || title;
    const imageHref = parseAttr(itemXml, 'itunes:image', 'href');
    const durationStr = parseXmlTag(itemXml, 'itunes:duration');

    let durationMinutes = 60;
    if (durationStr) {
      const parts = durationStr.split(':').map(Number);
      if (parts.length === 3) {
        durationMinutes = Math.round(parts[0] * 60 + parts[1] + parts[2] / 60);
      } else if (parts.length === 2) {
        durationMinutes = Math.round(parts[0] + parts[1] / 60);
      } else if (parts.length === 1 && !isNaN(parts[0])) {
        durationMinutes = Math.round(parts[0] / 60) || 1;
      }
    }

    items.push({
      title,
      description: description.replace(/<[^>]*>/g, '').substring(0, 2000),
      scheduled_time: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      recording_url: enclosureUrl || '',
      cover_image_url: imageHref || '',
      duration_minutes: durationMinutes,
      guid,
    });
  }
  return items;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    if (!RSS_URL) {
      return Response.json({ error: 'BUZZSPROUT_RSS_URL secret not set' }, { status: 500 });
    }

    // Fetch RSS feed
    const rssResponse = await fetch(RSS_URL);
    if (!rssResponse.ok) {
      return Response.json({ error: `Failed to fetch RSS: ${rssResponse.status}` }, { status: 502 });
    }
    const xmlText = await rssResponse.text();

    // Parse channel-level image as fallback
    const channelImage = parseAttr(xmlText, 'itunes:image', 'href');

    // Parse episodes
    const episodes = parseEpisodes(xmlText);
    if (episodes.length === 0) {
      return Response.json({ message: 'No episodes found in feed', synced: 0 });
    }

    // Fetch existing broadcasts to avoid duplicates (match by title)
    const existing = await base44.asServiceRole.entities.Broadcast.filter({
      broadcast_type: 'podcast'
    });
    const existingTitles = new Set(existing.map(b => b.title?.toLowerCase().trim()));

    let created = 0;
    let skipped = 0;

    for (const ep of episodes) {
      if (existingTitles.has(ep.title.toLowerCase().trim())) {
        skipped++;
        continue;
      }

      await base44.asServiceRole.entities.Broadcast.create({
        title: ep.title,
        description: ep.description,
        host_id: user.email,
        host_name: user.full_name || 'Deep Disclosure',
        scheduled_time: ep.scheduled_time,
        duration_minutes: ep.duration_minutes,
        status: 'ended',
        broadcast_type: 'podcast',
        recording_url: ep.recording_url,
        cover_image_url: ep.cover_image_url || channelImage || '',
        topics: ['deep disclosure'],
        is_featured: false,
        notify_all: false,
      });
      created++;
    }

    return Response.json({
      message: `Sync complete`,
      total_in_feed: episodes.length,
      created,
      skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});