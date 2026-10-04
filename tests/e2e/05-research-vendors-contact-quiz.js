const { start, isOpen, closeAll } = require('./harness');
(async () => {
  const { page: p, ok, step, finish, state } = await start({ seen: true });
  p.setDefaultTimeout(8000);
  const setv = (sel, v) => p.fill(sel, String(v));

  // ---------- Research ----------
  await step('research: live PubMed search "BPC-157"', async () => {
    await p.click('#studies-toggle'); await p.waitForTimeout(300);
    await setv('#research-query', 'BPC-157 tendon healing');
    await p.click('#research-search-btn');
    await p.waitForSelector('.research-article, .research-error, .research-no-results', { timeout: 40000 });
    const n = (await p.$$('.research-article')).length;
    const err = await p.evaluate(() => document.querySelector('.research-error')?.textContent);
    ok(n > 0, `got ${n} results ${err ? 'ERR: ' + err : ''}`);
    ok(await p.isEnabled('#research-search-btn') && /Search/.test(await p.textContent('#research-search-btn')), 'search button re-enabled');
    if (n > 0) {
      ok(/Showing 1-\d+ of \d+ results/.test(await p.textContent('.research-results-count')), 'range label: ' + await p.textContent('.research-results-count'));
      ok(await p.evaluate(() => /Search Enhanced/.test(document.getElementById('research-results').textContent)), 'peptide synonyms expansion notice');
      const first = await p.$eval('.research-article', e => ({ title: e.querySelector('.research-article-title').textContent, src: e.querySelector('.research-meta-item:last-child').textContent }));
      ok(first.title.length > 5, 'title: ' + first.title.slice(0, 60));
      // open modal
      await p.click('.research-article-title >> nth=0'); await p.waitForTimeout(500);
      ok(await p.evaluate(() => getComputedStyle(document.getElementById('study-modal')).display !== 'none'), 'study modal opens');
      ok(await p.evaluate(() => /^https?:/.test(document.getElementById('study-open-link').href)), 'open-study link is http(s)');
      ok(!!(await p.textContent('.study-modal-title')), 'modal title filled');
      // vote buttons without backend: must not throw
      await p.click('#study-upvote-btn'); await p.waitForTimeout(400);
      await p.click('#study-downvote-btn'); await p.waitForTimeout(400);
      ok(true, 'vote clicks do not throw without backend');
      // comment form
      await setv('#study-comment-input', 'hello'); ok((await p.textContent('#study-char-count')) === '5', 'char counter');
      await p.click('.study-comment-actions button[type=submit]'); await p.waitForTimeout(500);
      ok(true, 'comment post does not throw without backend');
      // close methods
      await p.keyboard.press('Escape'); await p.waitForTimeout(250);
      let shown = await p.evaluate(() => getComputedStyle(document.getElementById('study-modal')).display !== 'none');
      if (shown) { await p.click('.study-modal-close'); await p.waitForTimeout(250); shown = await p.evaluate(() => getComputedStyle(document.getElementById('study-modal')).display !== 'none'); ok(!shown, 'study modal closes with X (Escape did not)'); ok(false, 'Escape does not close study modal'); }
      else ok(true, 'Escape closes study modal');
      ok((await p.evaluate(() => document.body.style.overflow)) !== 'hidden', 'body scroll restored after closing study modal');
    }
  });

  await step('research: filters, sort, pagination, cache', async () => {
    await p.click('#research-filters-toggle');
    ok(await p.isVisible('#research-filters-content'), 'filters expand'); ok(/Hide/.test(await p.textContent('#research-filters-toggle')), 'toggle text');
    await p.selectOption('#research-max-results', '10'); await setv('#research-year-from', '2022'); await setv('#research-year-to', '2026');
    await setv('#research-primary-terms', 'BPC-157'); await setv('#research-secondary-terms', 'tendon, rat');
    await p.selectOption('#research-sort', 'pub+date');
    await p.click('#research-search-btn');
    await p.waitForSelector('.research-article, .research-error, .research-no-results', { timeout: 40000 });
    const years = await p.$$eval('.research-article', els => els.map(e => parseInt((e.textContent.match(/Year:\s*(\d{4})/) || [])[1])).filter(Boolean));
    ok(years.every(y => y >= 2022 && y <= 2026), 'year filter respected: ' + years.slice(0, 10));
    ok(years.length < 2 || years.every((y, i) => i === 0 || years[i - 1] >= y), 'sorted by date desc: ' + years.slice(0, 10));
    ok((await p.$$('.research-article')).length <= 10, 'max 10 per page');
    // pagination
    if (await p.$('.research-page-btn')) {
      const info0 = await p.textContent('.research-results-count');
      await p.click('.research-page-btn:has-text(">") >> nth=0'); await p.waitForTimeout(800);
      ok((await p.textContent('.research-results-count')) !== info0, 'next page changes range');
    } else ok(true, 'single page of results');
    // cache
    ok(/Cache: [1-9]/.test(await p.textContent('#research-cache-info')), 'cache stats updated: ' + await p.textContent('#research-cache-info'));
    await p.click('#research-search-btn'); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => /Loaded from cache/.test(document.getElementById('research-results').textContent)), 'second identical search served from cache');
    await p.click('#research-clear-cache-btn'); await p.waitForTimeout(300);
    ok(/Cache: 0/.test(await p.textContent('#research-cache-info')), 'clear cache: ' + await p.textContent('#research-cache-info'));
    // unicode + odd queries
    for (const q of ['Thymosin α1', '<img src=x onerror=1>', 'a'.repeat(300), 'GHK-Cu "copper peptide"']) {
      await setv('#research-query', q); await p.click('#research-search-btn');
      await p.waitForSelector('.research-article, .research-error, .research-no-results', { timeout: 40000 }).catch(() => {});
      await p.waitForTimeout(500);
      ok(!/<img/.test(await p.evaluate(() => document.getElementById('research-results').innerHTML.replace(/&lt;/g, ''))) , 'odd query rendered safely: ' + q.slice(0, 20));
    }
    await closeAll(p);
  });

  // ---------- Vendors ----------
  await step('vendors: list/filter/clear/add', async () => {
    await p.click('#companies-toggle'); await p.waitForTimeout(800);
    ok((await p.$$('.company-card')).length === 32, '32 vendor cards: ' + (await p.$$('.company-card')).length);
    ok(await p.isDisabled('#companies-add'), 'Add disabled when ratings backend offline');
    await setv('#companies-filter', 'bach'); await p.waitForTimeout(200);
    ok((await p.$$('.company-card')).length === 1, 'filter bach -> 1');
    await setv('#companies-filter', 'https://www.gen'); await p.waitForTimeout(200); ok((await p.$$('.company-card')).length >= 1, 'filter by URL text');
    await setv('#companies-filter', 'zzzz'); await p.waitForTimeout(200); ok(/No vendors found/.test(await p.textContent('#companies-list')), 'empty message');
    await p.click('#companies-clear-filter'); await p.waitForTimeout(200); ok((await p.$$('.company-card')).length === 32, 'clear restores');
    const hrefs = await p.$$eval('.company-visit', a => a.map(x => x.href + '|' + x.rel + '|' + x.target));
    ok(hrefs.every(h => /^https?:/.test(h) && /noopener/.test(h) && /_blank/.test(h)), 'all vendor links http(s), noopener, new tab');
    await closeAll(p);
  });

  await step('vendors: backend online path (mocked API) — rate, comment, add/edit with admin token', async () => {
    const vendors = [{ id: 1, name: 'Alpha', url: 'https://a.example', avg_rating: 4.5, total_ratings: 10, star_5: 6, star_4: 4, star_3: 0, star_2: 0, star_1: 0, total_comments: 1 }, { id: 2, name: 'Evil', url: 'javascript:alert(1)', avg_rating: 0, total_ratings: 0, star_5: 0, star_4: 0, star_3: 0, star_2: 0, star_1: 0, total_comments: 0 }];
    const calls = [];
    await p.route('**/php/api/**', async route => {
      const u = new URL(route.request().url()); const m = route.request().method();
      calls.push(m + ' ' + u.pathname.split('/').pop() + u.search + ' ' + (route.request().headers()['x-admin-token'] || ''));
      const json = (b, s = 200) => route.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(b) });
      if (u.pathname.endsWith('companies.php')) {
        if (m === 'GET' && u.searchParams.get('id')) return json(vendors.find(v => v.id == u.searchParams.get('id')));
        if (m === 'GET') return json(vendors);
        if (route.request().headers()['x-admin-token'] !== 'secret') return json({ error: 'forbidden' }, 403);
        return json({ status: 'ok' });
      }
      if (u.pathname.endsWith('ratings.php')) return json({ status: 'ok' });
      if (u.pathname.endsWith('comments.php')) return m === 'GET' ? json([{ comment: '<b>hi</b>', created_at: '2026-01-01' }]) : json({ status: 'ok' });
      return json({});
    });
    await p.reload(); await p.waitForTimeout(3500);
    await p.click('#companies-toggle'); await p.waitForTimeout(800);
    ok((await p.$$('.company-card')).length === 2, 'online cards rendered');
    ok(await p.evaluate(() => !document.querySelector('.vendor-badge')), 'no fabricated badges');
    const evilHref = await p.$eval('#company-2 .company-visit', a => a.getAttribute('href')); ok(evilHref === '#', 'javascript: URL neutralised: ' + evilHref);
    ok(!(await p.isDisabled('#companies-add')), 'Add enabled online');
    state.dialogs.length = 0; await p.click('#company-1 .star-btn[data-rating="5"]'); await p.waitForTimeout(1200);
    ok(calls.some(c => /POST ratings\.php/.test(c)), 'rating POSTed'); ok(state.dialogs.some(d => /submitted/i.test(d)), 'rating confirmation');
    await p.click('#company-1 .comment-btn'); await p.waitForTimeout(500);
    ok(/<b>hi<\/b>/.test(await p.textContent('#comments-1')), 'comment text escaped (shown literally)');
    ok(await p.evaluate(() => !!document.getElementById('comment-input-1')), 'comment textarea has unique id');
    await p.fill('#comments-1 .comment-input', 'nice'); await p.click('#comments-1 .comment-submit'); await p.waitForTimeout(600);
    ok(calls.some(c => /POST comments\.php/.test(c)), 'comment POSTed');
    // admin edit flow
    state.promptValue = 'wrong'; state.dialogs.length = 0;
    await p.click('#company-1 .company-edit'); await p.fill('#company-1 .company-name', 'Alpha2'); await p.click('#company-1 .company-edit'); await p.waitForTimeout(600);
    ok(state.dialogs.some(d => /Admin token/i.test(d)), 'edit prompts for admin token');
    ok(state.dialogs.some(d => /rejected/i.test(d)), 'wrong token rejected with message');
    state.promptValue = 'secret'; state.dialogs.length = 0;
    await p.click('#company-1 .company-edit', { force: true }); await p.waitForTimeout(300);
    if (await p.evaluate(() => document.querySelector('#company-1 .company-name').readOnly)) { await p.click('#company-1 .company-edit'); }
    await p.fill('#company-1 .company-name', 'Alpha3'); await p.click('#company-1 .company-edit'); await p.waitForTimeout(700);
    ok(calls.some(c => /POST companies\.php.* secret/.test(c)), 'edit POST carries X-Admin-Token');
    ok(state.dialogs.some(d => /Changes saved/.test(d)), 'edit success message');
    // add
    state.dialogs.length = 0; calls.length = 0; state.promptValue = 'Newco';
    await p.evaluate(() => { let n = 0; const orig = window.prompt; window.prompt = (m) => /URL/.test(m) ? 'https://newco.example' : /token/i.test(m) ? 'secret' : 'Newco'; });
    await p.click('#companies-add'); await p.waitForTimeout(800);
    ok(calls.some(c => /POST companies\.php/.test(c)), 'add POSTs'); ok(state.dialogs.length === 0 || state.dialogs.some(d => /added/i.test(d)), 'add flow completes');
    await p.evaluate(() => { window.prompt = () => 'ftp://bad'; }); state.dialogs.length = 0;
    await p.click('#companies-add'); await p.waitForTimeout(300); ok(state.dialogs.some(d => /http/i.test(d)), 'non-http URL rejected client-side');
    await p.unroute('**/php/api/**'); state.promptValue = '';
    await closeAll(p);
  });

  // ---------- Contact ----------
  await step('contact: failure modes', async () => {
    const errStart = state.errors.length; p.on('response', () => {});
    const respond = async (status, body, delay = 0) => { await p.unroute('**/api/contact').catch(() => {}); await p.route('**/api/contact', async r => { if (delay) await new Promise(x => setTimeout(x, delay)); r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }); }); };
    await p.click('#contact-toggle'); await p.waitForTimeout(250);
    const submit = async (e = 'me@x.co', m = 'This is a decent message') => { await setv('#contact-email', e); await setv('#contact-message', m); await p.click('#contact-submit'); await p.waitForTimeout(400); return (await p.textContent('#contact-status')).trim(); };
    await respond(500, { error: 'Email service not configured. Please try again later.' });
    ok(/not configured/.test(await submit()), '500 error message shown'); ok(await p.isEnabled('#contact-submit') && /Send Message/.test(await p.textContent('#contact-submit')), 'button restored after error');
    await respond(429, { error: 'Too many messages. Please wait a minute and try again.' }); ok(/Too many/.test(await submit()), '429 message shown');
    await p.unroute('**/api/contact'); await p.route('**/api/contact', r => r.abort()); ok(/Network error/.test(await submit()), 'network failure message');
    await p.unroute('**/api/contact'); await p.route('**/api/contact', r => r.fulfill({ status: 502, contentType: 'text/html', body: '<h1>Bad gateway</h1>' })); ok(/Failed to send/.test(await submit()), 'non-JSON error body handled');
    await respond(200, { success: true }, 700);
    await setv('#contact-email', 'me@x.co'); await setv('#contact-message', 'Another decent message'); await p.click('#contact-submit'); await p.waitForTimeout(150);
    ok(await p.isDisabled('#contact-submit') && /Sending/.test(await p.textContent('#contact-submit')), 'button disabled + "Sending..." while in flight');
    await p.waitForTimeout(1000); ok(/sent/i.test(await p.textContent('#contact-status')), 'success'); ok((await p.inputValue('#contact-message')) === '', 'form cleared on success');
    await p.waitForTimeout(6500); ok(!(await p.isVisible('#contact-status')), 'success message auto-hides');
    await setv('#contact-message', 'x'.repeat(6000)); ok((await p.inputValue('#contact-message')).length === 5000, 'message capped at 5000 chars');
    await closeAll(p); await p.unroute('**/api/contact');
    state.errors.splice(errStart); // simulated 500/429/502/abort responses are expected here
  });

  // ---------- Quiz ----------
  await step('quiz: every goal, branches, back, retake', async () => {
    await p.click('#quiz-toggle'); await p.waitForTimeout(300);
    const run = async (goal, extra = {}) => p.evaluate(async ([goal, extra]) => {
      const sleep = ms => new Promise(r => setTimeout(r, ms)); const root = document.getElementById('quiz-container');
      const btn = t => [...root.querySelectorAll('button')].find(b => b.textContent === t);
      if (btn('Retake Quiz')) btn('Retake Quiz').click(); await sleep(30);
      const ans = { 'q-age': '31-45', 'q-sex': 'male', 'q-height': '70', 'q-weight': '180', 'q-goal': goal, ...extra.sel };
      const qs = [];
      for (let i = 0; i < 40; i++) {
        const label = root.querySelector('.q-block label, .q-block > div')?.textContent; qs.push(label);
        const sel = root.querySelector('select, input[type=number]');
        if (sel) { const v = ans[sel.id]; if (v !== undefined) sel.value = v; else if (sel.tagName === 'SELECT') sel.value = sel.options[1].value; sel.dispatchEvent(new Event('change', { bubbles: true })); await sleep(20); }
        const cbs = [...root.querySelectorAll('input[type=checkbox]')];
        if (cbs.length) { const want = (extra.checks || {})[cbs[0].id.split('-')[1]] || ['none']; cbs.forEach(c => { c.checked = want.includes(c.value); }); cbs[0].dispatchEvent(new Event('change', { bubbles: true })); if (want.length && !want.includes('none')) { cbs.find(c => c.checked)?.dispatchEvent(new Event('change', { bubbles: true })); } }
        if (btn('See Recommendations')) { btn('See Recommendations').click(); break; }
        btn('Next')?.click(); await sleep(20);
      }
      return { text: root.innerText, qs };
    }, [goal, extra]);
    for (const g of ['weight_loss', 'muscle_growth', 'injury_recovery', 'anti_aging', 'performance', 'immune', 'wellness']) {
      const r = await run(g);
      ok(/Educational only/.test(r.text) && !/undefined|NaN|null/.test(r.text), `goal ${g}: ${r.text.split('\n')[0]}`);
      ok(/mcg|mg/.test(r.text), `goal ${g} lists doses`);
      if (g === 'injury_recovery') ok(r.qs.some(q => /Injury Type/.test(q)), 'injury branch asks Injury Type');
      else ok(!r.qs.some(q => /Injury Type/.test(q)), `${g} skips Injury Type`);
    }
    const preg = await run('muscle_growth', { checks: { conditions: ['pregnancy'] } }); ok(/No recommendation/.test(preg.text), 'pregnancy blocks');
    const cancer = await run('muscle_growth', { checks: { conditions: ['cancer'] } }); ok(!/Ipamorelin|IGF-1 LR3/.test(cancer.text.split('Notes')[0]), 'cancer removes GH peptides'); ok(/Cancer history/.test(cancer.text), 'cancer note shown');
    const bmiLow = await run('weight_loss', { sel: { 'q-height': '70', 'q-weight': '120' } }); ok(/BMI under 27/.test(bmiLow.text), 'low BMI warning for GLP-1');
    // validation + Back (fresh page: Retake keeps earlier answers by design)
    await p.reload(); await p.waitForTimeout(3500); await p.click('#quiz-toggle'); await p.waitForTimeout(300);
    await p.click('#quiz-container button:has-text("Next")'); await p.waitForTimeout(100);
    ok(/choose an answer/.test(await p.textContent('#quiz-container')), 'blocked on unanswered required question');
    await p.selectOption('#q-age', '18-30'); await p.click('#quiz-container button:has-text("Next")'); await p.waitForTimeout(100);
    ok(/Question 2/.test(await p.textContent('#quiz-container')), 'advances'); await p.click('#quiz-container button:has-text("Back")'); await p.waitForTimeout(100);
    ok(/Question 1 /.test(await p.textContent('#quiz-container')) && (await p.inputValue('#q-age')) === '18-30', 'Back keeps previous answer');
    // metric units
    await p.selectOption('#q-age', '31-45'); await p.click('#quiz-container button:has-text("Next")'); await p.selectOption('#q-sex', 'female'); await p.click('#quiz-container button:has-text("Next")');
    await p.waitForTimeout(150);
    await p.evaluate(() => document.querySelector('#quiz-container .unit-toggle-btn[data-unit="cm"]')?.click());
    await p.fill('#q-height', '170'); await p.click('#quiz-container button:has-text("Next")'); await p.waitForTimeout(150);
    ok(/Question 4/.test(await p.textContent('#quiz-container')), 'height 170 accepted in cm');
    await closeAll(p);
  });

  process.exit(await finish() ? 1 : 0);
})();
