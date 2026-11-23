import { useState } from 'react';

const art = (id) => `https://media.base44.com/images/public/694f3e0401b05e6e8a042002/${id}_generated_image.png`;
const web = art('54f589424a03b50463d0117261e71580');
const healing = art('fcd4e2736816a6b743774b128f2d2a8a');
const coaching = art('f0238e9f637939d8791141e5bc219e6b');
const yoga = art('415a4dc24ac312243f9e55924ec3ee4d');
const finance = art('d7a3ed25fec224a66b5e3aa67d3e3f5f');
const community = art('347d35f33ea2f24f8d8857ebf4865e9d');
const learning = art('f0518bca2060c75a787a084110e7e310');
const planning = art('3de87200685d9c2d2c20466ce864b21d');
const byCategory = {
  web_dev: web, design: web, ai_prompts: web, digital_rights: web,
  healing, wellness: yoga, teaching: learning, course: learning,
  coaching, mentorship: coaching, session: coaching, consulting: coaching,
  finance, strategy: planning, governance: planning, legal: planning,
  writing: learning, collaboration: community, mutual_aid: community,
};

function illustration(row) {
  const title = row.title || '';
  if (/\b(yoga|breathwork)\b/i.test(title)) return yoga;
  if (/\bweb\s+(dev(?:elopment)?|design)\b/i.test(title)) return web;
  if (/\btrading\b/i.test(title)) return finance;
  if (/\breiki\b/i.test(title)) return healing;
  if (/\bcoaching\b/i.test(title)) return coaching;
  return byCategory[row.category] || community;
}

export default function ImpactOpportunityArt({ row, detail = false }) {
  const [failed, setFailed] = useState([]);
  const src = [row.image_url, illustration(row), community].find(url => url && !failed.includes(url));
  return <div className={detail ? 'impact-detail-art' : 'impact-record-art'} aria-hidden="true">
    {src && <img key={src} src={src} alt="" loading={detail ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(previous => [...previous, src])} />}
  </div>;
}