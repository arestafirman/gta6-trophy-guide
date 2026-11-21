// Leonida Platinum Ledger: tracker + cited guide for the 55 GTA VI trophies.
// All counts in the audit strip are computed here at runtime from trophies.json —
// nothing on that strip is typed in by hand.
const KEY = 'gta6-platinum-ledger-v1';
const COUNTS_KEY = 'gta6-platinum-ledger-counts-v1';
const POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;
const byNum = new Map(sources.map((s) => [s.n, s]));

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let counts = JSON.parse(localStorage.getItem(COUNTS_KEY) ?? '{}');
let selected = null;
let tab = 'tracker';

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
}
function cite(nums) {
  return (nums || []).map((n) => '[' + n + ']').join(' ');
}
function sourceName(n) {
  const s = byNum.get(n);
  return s ? s.site : 'source ' + n;
}
function earnedPoints() {
  let p = 0;
  for (const t of trophies) if (earned.has(t.name)) p += POINTS[t.grade] || 0;
  return p;
}
function audit() {
  const claims = trophies.flatMap((t) => t.claims || []);
  const cited = claims.filter((c) => (c.sources || []).length > 0);
  const backed = claims.filter((c) => (c.sources || []).length >= 2);
  const unconfirmed = claims.filter((c) => c.unconfirmed);
  const usedNums = new Set();
  for (const t of trophies) for (const c of [...(t.claims || []), ...(t.steps || [])]) for (const n of (c.sources || [])) usedNums.add(n);
  const sites = new Set([...usedNums].map((n) => sourceName(n)));
  const registrySites = new Set(sources.map((s) => s.site));
  return {
    claims: claims.length, cited: cited.length, backed: backed.length,
    unconfirmed: unconfirmed.length, sites: sites.size, registrySites: registrySites.size,
    registry: sources.length, disputes: trophies.filter((t) => t.dispute).length,
    missable: trophies.filter((t) => t.missable).length,
    hidden: trophies.filter((t) => t.hidden).length,
    guidesCited: trophies.filter((t) => (t.claims || []).some((c) => (c.sources || []).length > 0)).length,
  };
}
function renderAudit() {
  const a = audit();
  document.getElementById('auditStrip').innerHTML =
    '<span>Official list <b>' + trophies.length + '/55</b></span>' +
    '<span>Claims cited <b>' + a.cited + '/' + a.claims + '</b></span>' +
    '<span>Backed by 2+ sources <b>' + a.backed + '</b></span>' +
    '<span>Sources read <b>' + a.registry + ' pages &middot; ' + a.registrySites + ' sites</b></span>' +
    '<span>Sites cited in guides <b>' + a.sites + '</b></span>' +
    '<span>Disputes shown both ways <b>' + a.disputes + '</b></span>' +
    '<span>Missable <b>' + a.missable + '</b> &middot; PSN-hidden <b>' + a.hidden + '</b></span>' +
    '<span>Unconfirmed facts flagged <b>' + a.unconfirmed + '</b></span>' +
    '<span>Guides citing sources <b>' + a.guidesCited + '/55</b></span>';
}
function renderProgress() {
  document.getElementById('earnedLine').textContent = earned.size + ' / 55 earned';
  document.getElementById('pointsLine').textContent = earnedPoints() + ' / 1,350 PSN points (published total)';
  document.getElementById('barFill').style.width = (earned.size / 55 * 100) + '%';
}
function spoilerOn() { return document.getElementById('spoiler').checked; }
function displayName(t) {
  if (spoilerOn() && t.hidden && !earned.has(t.name)) return 'Hidden trophy — earn it to reveal';
  return t.name;
}
function displayDesc(t) {
  if (spoilerOn() && t.hidden && !earned.has(t.name)) return 'Spoiler shield on: the official description is hidden until this trophy is earned.';
  return t.description;
}
function visibleTrophies() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const g = document.getElementById('grade').value;
  const k = document.getElementById('kind').value;
  const hid = document.getElementById('hiddenOnly').checked;
  const dis = document.getElementById('disputedOnly').checked;
  const notE = document.getElementById('notEarned').checked;
  return trophies.filter((t) => {
    if (g !== 'all' && t.grade !== g) return false;
    if (k !== 'all') {
      if (k === 'missable' && !t.missable) return false;
      if (k === 'online') return false;
      if (k !== 'missable' && k !== 'online' && t.kind !== k) return false;
    }
    if (hid && !t.hidden) return false;
    if (dis && !t.dispute) return false;
    if (notE && earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.chapter || '').toLowerCase().includes(q))) return false;
    return true;
  });
}
function renderChips() {
  const c = (label, n) => '<span class="chip">' + label + ' <b>' + n + '</b></span>';
  document.getElementById('filterChips').innerHTML =
    c('All', 55) + c('Story', trophies.filter((t) => t.kind === 'story').length) +
    c('Missable', trophies.filter((t) => t.missable).length) +
    c('Collectibles', trophies.filter((t) => t.kind === 'collectibles').length) +
    c('Activities', trophies.filter((t) => t.kind === 'activities').length) +
    c('Online', 0) + c('PSN-hidden', trophies.filter((t) => t.hidden).length) +
    c('Disputed', trophies.filter((t) => t.dispute).length) +
    c('Not earned', 55 - earned.size);
}
function renderList() {
  const list = document.getElementById('list');
  list.replaceChildren();
  for (const t of visibleTrophies()) {
    const row = document.createElement('div');
    row.className = 'row' + (earned.has(t.name) ? ' earned' : '') + (selected === t.name ? ' sel' : '');
    row.setAttribute('role', 'listitem');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', 'Earned: ' + t.name);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      save(); renderAll();
    });
    const mid = document.createElement('div');
    const nm = document.createElement('div');
    nm.className = 'nm';
    nm.textContent = (earned.has(t.name) ? '✓ ' : '') + displayName(t);
    const ds = document.createElement('div');
    ds.className = 'ds';
    ds.textContent = displayDesc(t);
    mid.append(nm, ds);
    if (t.missable) {
      const tag = document.createElement('div');
      tag.className = 'tag miss';
      tag.textContent = 'MISSABLE — do in Chapter 1';
      mid.append(tag);
    }
    if (t.dispute) {
      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.textContent = 'SOURCES DIFFER — both versions shown';
      mid.append(tag);
    }
    if (t.yourCount) {
      const tag = document.createElement('div');
      tag.className = 'ds';
      tag.textContent = 'Your count: ' + (counts[t.name] || 0) + ' / ' + t.yourCount;
      mid.append(tag);
    }
    const gr = document.createElement('span');
    gr.className = 'gr ' + t.grade;
    gr.textContent = t.grade[0].toUpperCase();
    row.append(box, mid, gr);
    row.addEventListener('click', (e) => { if (e.target !== box) { selected = t.name; renderList(); renderDetail(); } });
    list.append(row);
  }
  if (!list.children.length) list.textContent = 'No trophies match these filters.';
}
function renderDetail() {
  const el = document.getElementById('detail');
  const t = trophies.find((x) => x.name === selected) || trophies[0];
  if (!t) { el.textContent = 'Pick a trophy.'; return; }
  selected = t.name;
  let h = '<h2>' + displayName(t) + '</h2>';
  h += '<p class="off">“' + displayDesc(t) + '” — official description</p>';
  h += '<p>Grade <b>' + t.grade + '</b> &middot; #' + t.id + ' of 55 &middot; ' + (t.hidden ? 'PSN-hidden' : 'visible') +
    ' &middot; ' + (t.kind || '') + ' &middot; Stage ' + t.stage + ' &middot; ' + (t.chapter || '') +
    (t.missable ? ' &middot; <span class="unc">MISSABLE</span>' : '') + '</p>';
  if (t.yourCount) {
    h += '<div class="counter"><button type="button" id="cntMinus" aria-label="Decrease count">−</button><span>Your count: <b>' + (counts[t.name] || 0) + ' / ' + t.yourCount + '</b></span><button type="button" id="cntPlus" aria-label="Increase count">+</button></div>';
  }
  h += '<h3>HOW TO EARN IT — ' + (t.steps || []).length + ' STEPS, IN OUR OWN WORDS, EACH WITH ITS SOURCES</h3><ol>';
  for (const s of (t.steps || [])) h += '<li>' + escapeHtml(s.text) + ' <span class="cite">' + cite(s.sources) + '</span></li>';
  h += '</ol>';
  h += '<h3>CLAIMS — EVERY FACT CITED</h3><ul>';
  for (const c of (t.claims || [])) h += '<li>' + escapeHtml(c.text) + ' <span class="cite">' + cite(c.sources) + '</span>' + (c.unconfirmed ? ' <span class="unc">UNCONFIRMED</span>' : '') + '</li>';
  h += '</ul>';
  if (t.dispute) {
    h += '<div class="dispute"><h3>SOURCES DIFFER — BOTH VERSIONS SHOWN</h3><p><b>A:</b> ' + escapeHtml(t.dispute.a) + '</p><p><b>B:</b> ' + escapeHtml(t.dispute.b) + '</p><p><b>OUR CALL:</b> ' + escapeHtml(t.dispute.call) + '</p></div>';
  }
  h += '<p class="srcs"><b>Sources for this guide:</b> ' + [...new Set([...(t.steps || []), ...(t.claims || [])].flatMap((x) => x.sources || []))].map((n) => '[' + n + '] ' + sourceName(n)).join(' · ') + '</p>';
  el.innerHTML = h;
  const minus = document.getElementById('cntMinus');
  const plus = document.getElementById('cntPlus');
  if (minus) minus.addEventListener('click', () => { counts[t.name] = Math.max(0, (counts[t.name] || 0) - 1); save(); renderAll(); });
  if (plus) plus.addEventListener('click', () => { counts[t.name] = Math.min(t.yourCount, (counts[t.name] || 0) + 1); save(); renderAll(); });
}
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function renderRail() {
  const next = trophies.filter((t) => !earned.has(t.name)).sort((a, b) => (a.stage - b.stage) || (a.id - b.id)).slice(0, 8);
  let h = '<h3>NEXT UP — ROADMAP ORDER</h3><ul>';
  for (const t of next) h += '<li data-name="' + escapeHtml(t.name) + '">Stage ' + t.stage + ' — ' + escapeHtml(displayName(t)) + '</li>';
  h += '</ul><h3>POINTS OF NO RETURN</h3><ul><li>Chapter 1 ends: the balcony meditation is gone for good.</li><li>Story choices: keep a manual save before each big decision.</li><li>Cheats: guides report they disable trophies — leave them off.</li></ul>';
  const rail = document.getElementById('rail');
  rail.innerHTML = h;
  rail.querySelectorAll('li[data-name]').forEach((li) => li.addEventListener('click', () => { selected = li.getAttribute('data-name'); renderList(); renderDetail(); }));
}
function renderRoadmap() {
  const el = document.getElementById('roadmapPage');
  let h = '<h2>Roadmap to the platinum</h2><p>55 trophies in 6 stages. Story first, then side strands, then the activity grind, then crime and the open world, then money and collectibles — the platinum pops last.</p>';
  for (const s of doc.roadmap) {
    const ts = trophies.filter((t) => t.stage === s.stage);
    h += '<div class="stage"><h2>' + escapeHtml(s.title) + '</h2><p>' + escapeHtml(s.note) + '</p><ul>';
    for (const t of ts) h += '<li>' + (earned.has(t.name) ? '✓ ' : '○ ') + escapeHtml(t.name) + ' (' + t.grade + ')' + (t.missable ? ' — MISSABLE' : '') + '</li>';
    h += '</ul></div>';
  }
  el.innerHTML = h;
}
function renderMissables() {
  const el = document.getElementById('missablesPage');
  const miss = trophies.filter((t) => t.missable);
  const unc = trophies.filter((t) => (t.claims || []).some((c) => c.unconfirmed));
  let h = '<h2>Missables &amp; disputes</h2><p>Only one trophy is missable by the guides we read — but ' + unc.length + ' trophies carry at least one unconfirmed fact, and every one of those is flagged here, not hidden.</p>';
  h += '<h3>Missable trophies</h3>';
  for (const t of miss) {
    h += '<div class="stage"><h2>' + escapeHtml(t.name) + ' — MISSABLE</h2><p>Last chance: the morning after Down to Earth, in Chapter 1, at Jason\u2019s house. Accept Lucia\u2019s meditation invite on the balcony before Chapter 1 ends. <span class="cite">[10] [11]</span></p></div>';
  }
  h += '<h3>Disputes — sources differ, both versions shown (' + trophies.filter((t) => t.dispute).length + ' panels)</h3>';
  for (const t of trophies.filter((x) => x.dispute)) {
    h += '<div class="dispute"><h3>' + escapeHtml(t.name) + '</h3><p><b>A:</b> ' + escapeHtml(t.dispute.a) + '</p><p><b>B:</b> ' + escapeHtml(t.dispute.b) + '</p><p><b>OUR CALL:</b> ' + escapeHtml(t.dispute.call) + '</p></div>';
  }
  h += '<h3>Unconfirmed facts (' + unc.length + ' trophies)</h3><ul>';
  for (const t of unc) h += '<li>' + escapeHtml(t.name) + ' — method or detail not confirmed in two sources yet.</li>';
  h += '</ul>';
  el.innerHTML = h;
}
function renderSources() {
  const el = document.getElementById('sourcesPage');
  const countsBySource = new Map();
  for (const t of trophies) for (const c of [...(t.claims || []), ...(t.steps || [])]) for (const n of (c.sources || [])) countsBySource.set(n, (countsBySource.get(n) || 0) + 1);
  let h = '<h2>Sources registry</h2><p>' + sources.length + ' pages read on 21 Nov 2026 across ' + new Set(sources.map((s) => s.site)).size + ' sites. Counts below are computed from the guides at runtime.</p><table><thead><tr><th>#</th><th>Site</th><th>Page</th><th>Read</th><th>Claims &amp; steps citing it</th></tr></thead><tbody>';
  for (const s of sources) h += '<tr><td>[' + s.n + ']</td><td>' + escapeHtml(s.site) + '</td><td>' + escapeHtml(s.title) + '</td><td>' + escapeHtml(s.read) + '</td><td>' + (countsBySource.get(s.n) || 0) + '</td></tr>';
  h += '</tbody></table><p>Note: the game launched 19 Nov 2026, two days before this guide was written. Where guides are thin, this ledger says so and flags the fact UNCONFIRMED instead of inventing a location or step.</p>';
  el.innerHTML = h;
}
function renderLedger() {
  const el = document.getElementById('ledgerPage');
  const a = audit();
  let h = '<h2>100% Ledger</h2><p>The 100% completion checklist opens after the story. These are the targets guides report for it, next to the trophy targets — the checklist is stricter on stunts, challenges, vehicles and meditations.</p><table><thead><tr><th>Goal</th><th>Trophy target</th><th>100% target</th><th>Sources</th></tr></thead><tbody>' +
    '<tr><td>Stunts</td><td>250</td><td>300 of 397</td><td>[13] [5]</td></tr>' +
    '<tr><td>Challenges</td><td>50 of 80</td><td>70 of 80</td><td>[4] [13]</td></tr>' +
    '<tr><td>Vehicles discovered</td><td>100</td><td>200</td><td>[13] [12]</td></tr>' +
    '<tr><td>Meditations</td><td>18 of 18</td><td>15 of 18</td><td>[10] [11]</td></tr>' +
    '<tr><td>WAiNK locations</td><td>100</td><td>100</td><td>[4] [13]</td></tr>' +
    '<tr><td>Shooting Range golds</td><td>42</td><td>42</td><td>[4] [13]</td></tr>' +
    '<tr><td>Race wins</td><td>20 different</td><td>30 of 40</td><td>[13] [5]</td></tr>' +
    '<tr><td>Drone races</td><td>14 locations</td><td>42 time trials</td><td>[5] [13]</td></tr>' +
    '<tr><td>Bank vaults</td><td>5</td><td>8 large vaults</td><td>[13] [5]</td></tr>' +
    '<tr><td>Gang operations</td><td>1 per gang</td><td>39</td><td>[5] [13]</td></tr>' +
    '<tr><td>Card sets</td><td>3 of 18</td><td>15 Target Decks</td><td>[13] [12]</td></tr>' +
    '</tbody></table>' +
    '<p>Audit, computed at runtime: ' + a.cited + '/' + a.claims + ' claims cited, ' + a.backed + ' backed by 2+ sources, ' + a.disputes + ' dispute panels, ' + a.unconfirmed + ' unconfirmed facts flagged, ' + a.guidesCited + '/55 guides cite sources.</p>';
  el.innerHTML = h;
}
function renderAll() {
  renderAudit(); renderProgress(); renderChips(); renderList(); renderDetail(); renderRail();
  renderRoadmap(); renderMissables(); renderSources(); renderLedger();
}
document.getElementById('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (!b) return;
  tab = b.dataset.tab;
  document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('on', x === b));
  document.querySelectorAll('.tabpage').forEach((p) => p.classList.toggle('on', p.id === 'tab-' + tab));
});
for (const id of ['search', 'grade', 'kind', 'hiddenOnly', 'disputedOnly', 'notEarned', 'spoiler']) {
  document.getElementById(id).addEventListener('input', renderList);
  document.getElementById(id).addEventListener('change', renderList);
}
document.getElementById('spoiler').addEventListener('change', () => { renderList(); renderDetail(); renderRail(); });
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned], counts })], { type: 'application/json' }));
  a.download = 'trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    earned = new Set(Array.isArray(data) ? data : (data.earned || []));
    if (data.counts) counts = data.counts;
    save(); renderAll();
  } catch { alert('That file is not valid progress JSON.'); }
});
renderAll();
