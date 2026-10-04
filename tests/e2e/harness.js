// Run with `npm run test:e2e`. Needs `npm i -D playwright` and a Chromium (Playwright's own, or set CHROMIUM_PATH).
const { chromium } = require('playwright');
// Serve the site first (e.g. `npm start` -> http://localhost:3000, or `python3 -m http.server 8123`)
const BASE = process.env.BASE || 'http://localhost:3000';
async function start(opts = {}) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args:['--ignore-certificate-errors','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1400, height: 900 }, hasTouch: !!opts.mobile, isMobile: !!opts.mobile, acceptDownloads: true });
  const page = await ctx.newPage();
  const state = { errors: [], dialogs: [], results: [], current: '' };
  page.on('pageerror', e => state.errors.push(`[${state.current}] PAGEERROR ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) state.errors.push(`[${state.current}] console.error ${m.text().slice(0,200)}`); });
  page.on('response', r => { if (r.status() >= 400 && !/api\/(study|research)|php\/api|semanticscholar/.test(r.url())) state.errors.push(`[${state.current}] HTTP ${r.status()} ${r.url()}`); });
  page.on('dialog', d => { state.dialogs.push(d.message()); d.accept(state.promptValue || undefined).catch(()=>{}); });
  await page.addInitScript((seen) => { try { if (seen) localStorage.setItem('hasSeenOnboarding','true'); } catch(e){} }, opts.seen !== false);
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(opts.wait || 4000);
  const ok = (cond, msg) => { state.results.push({ pass: !!cond, msg: `${state.current}: ${msg}` }); if (!cond) console.log('  FAIL ' + state.current + ': ' + msg); };
  const step = async (name, fn) => {
    state.current = name; const before = state.errors.length;
    try { await fn(); } catch (e) { ok(false, 'threw ' + e.message.split('\n')[0]); }
    if (state.errors.length > before) ok(false, 'page errors: ' + state.errors.slice(before).join(' | '));
    console.log((state.results.filter(r => r.msg.startsWith(name+':') && !r.pass).length ? '✗ ' : '✓ ') + name);
  };
  const finish = async () => {
    const failed = state.results.filter(r => !r.pass);
    console.log(`\n${state.results.length - failed.length}/${state.results.length} checks passed`);
    failed.forEach(f => console.log('  FAIL', f.msg));
    await browser.close();
    return failed.length;
  };
  return { browser, page, state, ok, step, finish };
}
const isOpen = (page, id) => page.evaluate(i => { const e = document.getElementById(i); return !!e && !e.classList.contains('collapsed') && e.getBoundingClientRect().width > 0; }, id);
const closeAll = async (page) => {
  await page.evaluate(() => {
    const pairs = [['tab-panel','tab-toggle'],['studies-panel','studies-toggle'],['companies-panel','companies-toggle'],['quiz-panel','quiz-toggle'],['calc-panel','calc-toggle'],['contact-panel','contact-toggle'],['new-panel','new-panel-toggle'],['bpc157-panel','bpc157-toggle'],['compare-panel','compare-toggle'],['journal-panel','journal-toggle'],['chat-panel','chat-toggle'],['saved-locations-panel','saved-toggle']];
    pairs.forEach(([p,t]) => { const e = document.getElementById(p); if (e && !e.classList.contains('collapsed')) document.getElementById(t).click(); });
    const s = document.getElementById('search-container'); if (s && s.classList.contains('expanded')) document.getElementById('search-toggle').click();
    document.getElementById('peptide-modal')?.classList.remove('active'); document.body.style.overflow = '';
  });
  await page.waitForTimeout(250);
};
module.exports = { start, isOpen, closeAll, BASE };
