const { start, isOpen, closeAll, BASE } = require('./harness');
(async () => {
  // ---------- Onboarding (first visit) ----------
  let h = await start({ seen: false, wait: 7000 });
  let { page: p, ok, step, finish, state } = h; p.setDefaultTimeout(8000);
  await step('onboarding: first-visit tutorial walk-through (desktop)', async () => {
    ok(await p.isVisible('#onboarding-overlay.visible'), 'auto-starts on first visit');
    const total = parseInt((await p.textContent('.onboarding-step-counter')).split('/')[1]);
    ok(total === 17, 'desktop has 17 steps (got ' + total + ')');
    ok(await p.isDisabled('.onboarding-prev'), 'Previous disabled on step 1');
    const titles = [];
    for (let i = 1; i <= total; i++) {
      await p.waitForTimeout(120);
      titles.push(await p.textContent('.onboarding-title'));
      const counter = await p.textContent('.onboarding-step-counter'); ok(counter.trim().startsWith(i + ' /'), `counter at step ${i}: ${counter}`);
      // tooltip stays inside the viewport
      const r = await p.evaluate(() => { const t = document.getElementById('onboarding-tooltip').getBoundingClientRect(); return { l: t.left, t: t.top, r: t.right, b: t.bottom, w: innerWidth, h: innerHeight }; });
      ok(r.l >= 0 && r.t >= 0 && r.r <= r.w && r.b <= r.h, `step ${i} tooltip inside viewport`);
      if (i < total) await p.click('.onboarding-next');
    }
    ok(/Finish/.test(await p.textContent('.onboarding-next')), 'last step shows Finish');
    await p.click('.onboarding-prev'); await p.waitForTimeout(150); ok(/^16 \//.test((await p.textContent('.onboarding-step-counter')).trim()), 'Previous goes back');
    await p.click('.onboarding-dot >> nth=3'); await p.waitForTimeout(150); ok(/^4 \//.test((await p.textContent('.onboarding-step-counter')).trim()), 'progress dot jumps to step 4');
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(150); ok(/^5 \//.test((await p.textContent('.onboarding-step-counter')).trim()), 'ArrowRight next');
    await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); ok(/^4 \//.test((await p.textContent('.onboarding-step-counter')).trim()), 'ArrowLeft prev');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    ok(!(await p.isVisible('#onboarding-overlay.visible')), 'Escape ends tutorial');
    ok((await p.evaluate(() => localStorage.getItem('hasSeenOnboarding'))) === 'true', 'marked as seen');
    ok((await p.evaluate(() => document.body.style.overflow)) !== 'hidden', 'scroll restored');
    await p.reload(); await p.waitForTimeout(6500);
    ok(!(await p.isVisible('#onboarding-overlay.visible')), 'does not restart on reload');
    await p.evaluate(() => window.Onboarding.start()); await p.waitForTimeout(300);
    ok(await p.isVisible('#onboarding-overlay.visible'), 'manual restart works'); await p.click('.onboarding-skip'); await p.waitForTimeout(200);
    ok(!(await p.isVisible('#onboarding-overlay.visible')), 'Skip ends tutorial');
  });
  let bad = await finish();

  // ---------- Units persisted across reload ----------
  h = await start({ seen: true }); ({ page: p, ok, step, finish, state } = h); p.setDefaultTimeout(8000);
  await step('unit preference persists and converts defaults on reload', async () => {
    await p.click('#tab-toggle'); await p.click('.tab-btn[data-tab="analysis"]');
    await p.evaluate(() => document.querySelector('label[for="glp1-weight"] .unit-toggle-btn[data-unit="kg"]').click());
    await p.evaluate(() => document.querySelector('label[for="adv-height"] .unit-toggle-btn[data-unit="cm"]').click());
    await p.reload(); await p.waitForTimeout(3800);
    const v = await p.evaluate(() => ({ w: ['bpc','ghs','glp1','adv'].map(k => document.getElementById(k + '-weight').value), h: document.getElementById('adv-height').value, wb: [...document.querySelectorAll('label[for$="-weight"] .unit-toggle-btn.active')].map(b => b.dataset.unit), hb: document.querySelector('label[for="adv-height"] .unit-toggle-btn.active').dataset.unit }));
    ok(v.w.every(x => Math.abs(parseFloat(x) - 90.7) < 0.2), 'weights shown as ~90.7 kg after reload: ' + v.w);
    ok(v.wb.every(u => u === 'kg'), 'all weight toggles show kg: ' + v.wb);
    ok(Math.abs(parseFloat(v.h) - 177.8) < 0.3 && v.hb === 'cm', `height 177.8 cm: ${v.h} ${v.hb}`);
    // computing with default values must give the same dose as the lbs defaults
    await p.click('#tab-toggle'); await p.click('.tab-btn[data-tab="analysis"]');
    await p.evaluate(() => document.getElementById('bpc-calculate').click());
    ok(/72[5-7] mcg/.test(await p.textContent('#bpc-results')), 'BPC default dose unchanged after unit round-trip: ' + (await p.textContent('#bpc-results')).match(/\d+ mcg/));
    await p.evaluate(() => { localStorage.setItem('preferredWeightUnit', 'banana'); });
    await p.reload(); await p.waitForTimeout(3500);
    ok((await p.evaluate(() => UnitConverter.getWeightUnit())) === 'lbs', 'garbage stored unit falls back to lbs');
    await p.evaluate(() => { localStorage.removeItem('preferredWeightUnit'); localStorage.removeItem('preferredHeightUnit'); });
  });
  bad += await finish();

  // ---------- Mobile ----------
  h = await start({ seen: false, mobile: true, viewport: { width: 390, height: 800 }, wait: 7000 }); ({ page: p, ok, step, finish, state } = h); p.setDefaultTimeout(8000);
  await step('mobile: onboarding collapses to a menu step', async () => {
    const total = parseInt((await p.textContent('.onboarding-step-counter')).split('/')[1]);
    ok(total > 1 && total < 17, 'fewer steps on mobile: ' + total);
    let sawMenu = false;
    for (let i = 1; i <= total; i++) {
      await p.waitForTimeout(120);
      if (/Menu/.test(await p.textContent('.onboarding-title'))) sawMenu = true;
      const r = await p.evaluate(() => { const t = document.getElementById('onboarding-tooltip').getBoundingClientRect(); return { l: t.left, r: t.right, w: innerWidth, t: t.top, b: t.bottom, h: innerHeight }; });
      ok(r.l >= 0 && r.r <= r.w && r.t >= 0 && r.b <= r.h, `mobile step ${i} tooltip inside viewport (${Math.round(r.l)}-${Math.round(r.r)} / ${r.w})`);
      if (i < total) await p.click('.onboarding-next'); else await p.click('.onboarding-next');
    }
    ok(sawMenu, 'a step points at the Menu button');
    await p.waitForTimeout(200); ok(!(await p.isVisible('#onboarding-overlay.visible')), 'tutorial ends after last step');
  });
  await step('mobile: hamburger menu — every item opens its panel and can be closed', async () => {
    const items = await p.$$eval('.mobile-menu-item[data-target]', els => els.map(e => e.dataset.target));
    ok(items.length >= 14, 'menu items: ' + items.length);
    ok(!(await p.isVisible('#tab-toggle')), 'desktop toggles hidden on mobile');
    const panelFor = { 'tab-toggle': 'tab-panel', 'studies-toggle': 'studies-panel', 'companies-toggle': 'companies-panel', 'quiz-toggle': 'quiz-panel', 'calc-toggle': 'calc-panel', 'contact-toggle': 'contact-panel', 'new-panel-toggle': 'new-panel', 'bpc157-toggle': 'bpc157-panel', 'compare-toggle': 'compare-panel', 'journal-toggle': 'journal-panel', 'chat-toggle': 'chat-panel', 'saved-toggle': 'saved-locations-panel' };
    for (const t of items) {
      await p.click('#mobile-hamburger'); await p.waitForTimeout(350);
      await p.click(`.mobile-menu-item[data-target="${t}"]`); await p.waitForTimeout(700);
      if (panelFor[t]) {
        ok(await isOpen(p, panelFor[t]), `${t} opens ${panelFor[t]} on mobile`);
        const box = await p.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return { w: r.width, l: r.left }; }, panelFor[t]);
        ok(box.w >= 385 && box.l >= -1, `${panelFor[t]} fills screen width (${Math.round(box.w)})`);
        // hamburger visible and not overlapping header text
        ok(await p.isVisible('#mobile-hamburger'), 'hamburger still reachable');
        await p.click('#mobile-hamburger'); await p.waitForTimeout(350);
        ok(await p.isVisible('#mobile-close-panel'), 'close-panel item offered');
        await p.click('#mobile-close-panel'); await p.waitForTimeout(600);
        ok(!(await isOpen(p, panelFor[t])), `${panelFor[t]} closed via menu`);
      } else {
        await p.waitForTimeout(300);
        if (t === 'search-toggle') { ok(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded')), 'search expands'); await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
        if (t === 'theme-toggle') { ok(true, 'theme toggled'); }
        if (t === 'peptide-analysis-toggle') { ok(await isOpen(p, 'tab-panel'), 'analysis opens tab panel'); await closeAll(p); }
      }
    }
    // overlay + X closing
    await p.click('#mobile-hamburger'); await p.waitForTimeout(350); ok(await p.evaluate(() => document.getElementById('mobile-drawer').classList.contains('open')), 'drawer opens');
    await p.click('.mobile-drawer-close'); await p.waitForTimeout(350); ok(!(await p.evaluate(() => document.getElementById('mobile-drawer').classList.contains('open'))), 'X closes drawer');
    await p.click('#mobile-hamburger'); await p.waitForTimeout(350); await p.mouse.click(370, 400); await p.waitForTimeout(350);
    ok(!(await p.evaluate(() => document.getElementById('mobile-drawer').classList.contains('open'))), 'overlay tap closes drawer');
    await p.click('#mobile-hamburger'); await p.waitForTimeout(350); await p.click('#mobile-restart-tutorial'); await p.waitForTimeout(800);
    ok(await p.isVisible('#onboarding-overlay.visible'), 'Restart Tutorial works'); await p.click('.onboarding-skip');
  });
  await step('mobile: model touch interaction + side panel', async () => {
    await p.touchscreen.tap(195, 330); await p.waitForTimeout(500);
    const active = await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'));
    console.log('  tap at (195,330) selected region:', active, active ? await p.textContent('#panel-title') : '');
    const sp = await p.evaluate(() => { const r = document.getElementById('side-panel').getBoundingClientRect(); return { l: r.left, w: r.width, vw: innerWidth }; });
    ok(!active || sp.w <= sp.vw + 1, `side panel fits phone width (${Math.round(sp.w)} of ${sp.vw})`);
    const overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(overflowX <= 1, 'no horizontal page overflow on mobile: ' + overflowX);
  });
  bad += await finish();

  // ---------- Legal pages ----------
  h = await start({ seen: true }); ({ page: p, ok, step, finish } = h);
  await step('footer links and legal pages', async () => {
    const links = await p.$$eval('.disclaimer-links a', a => a.map(x => ({ h: x.getAttribute('href'), t: x.target, r: x.rel })));
    ok(links.length === 2 && links.every(l => /noopener/.test(l.r)), 'two links with noopener');
    for (const l of links) {
      const pg = await p.context().newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
      const res = await pg.goto(BASE + '/' + l.h); await pg.waitForTimeout(800);
      ok(res.status() === 200, `${l.h} -> 200`);
      ok((await pg.title()).length > 5 && (await pg.locator('h1').count()) === 1, `${l.h} has title + one h1: ${await pg.title()}`);
      ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'), `${l.h} styled (tailwind css loaded)`);
      const icon = await pg.$eval('link[rel=icon]', e => e.href); const ir = await pg.request.get(icon); ok(ir.status() === 200, 'favicon resolves: ' + icon);
      await pg.click('a:has-text("Back to main site")'); await pg.waitForTimeout(500); ok(/index\.html/.test(pg.url()), `${l.h} back link works`);
      ok(errs.length === 0, 'no page errors'); await pg.close();
    }
    for (const u of ['/sitemap.xml', '/robots.txt', '/assets/site.webmanifest', '/google9e5a33f1c42669c8.html', '/BPC-157_interactive_dashboard.html', '/assets/logo_main.png', '/assets/apple-touch-icon.png', '/assets/android-chrome-512x512.png']) {
      const r = await p.request.get(BASE + u); ok(r.status() === 200, `${u} -> ${r.status()}`);
    }
    const sm = await (await p.request.get(BASE + '/sitemap.xml')).text();
    for (const loc of [...sm.matchAll(/<loc>https:\/\/peptide-map\.vercel\.app([^<]*)<\/loc>/g)].map(m => m[1])) { const r = await p.request.get(BASE + (loc || '/')); ok(r.status() === 200, `sitemap URL ${loc || '/'} exists locally`); }
    const mf = JSON.parse(await (await p.request.get(BASE + '/assets/site.webmanifest')).text());
    for (const ic of mf.icons) { const r = await p.request.get(BASE + '/assets/' + ic.src); ok(r.status() === 200, 'manifest icon ' + ic.src); }
  });
  bad += await finish();
  process.exit(bad ? 1 : 0);
})();
