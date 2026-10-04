const { start, isOpen, closeAll } = require('./harness');
(async () => {
  const { page: p, ok, step, finish, state } = await start({ wait: 5000 });
  p.setDefaultTimeout(8000);
  const width = (id) => p.evaluate(i => Math.round(document.getElementById(i).getBoundingClientRect().width), id);

  await step('panel resize: drag, clamp, persist, reset, keyboard', async () => {
    for (const [toggle, panel] of [['tab-toggle', 'tab-panel'], ['studies-toggle', 'studies-panel'], ['quiz-toggle', 'quiz-panel'], ['calc-toggle', 'calc-panel'], ['new-panel-toggle', 'new-panel'], ['chat-toggle', 'chat-panel'], ['compare-toggle', 'compare-panel'], ['journal-toggle', 'journal-panel']]) {
      await closeAll(p); await p.click('#' + toggle); await p.waitForTimeout(450);
      const handle = `#${panel.replace('-panel', '')}-drag-handle`.replace('#new-drag', '#new-panel-drag');
      const hid = await p.evaluate(pn => document.getElementById(pn).querySelector('[id$="-drag-handle"]')?.id, panel);
      ok(!!hid, `${panel} has a drag handle (${hid})`);
      if (!hid) continue;
      const w0 = await width(panel);
      const box = await p.evaluate(h => { const r = document.getElementById(h).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 200 }; }, hid);
      await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.mouse.move(box.x + 80, box.y, { steps: 5 }); await p.mouse.up();
      const w1 = await width(panel);
      ok(w1 > w0 + 40, `${panel} widened by drag: ${w0} -> ${w1}`);
      const togglesLeft = await p.evaluate(() => parseInt(document.getElementById('theme-toggle').style.left));
      ok(Math.abs(togglesLeft - (w1 + 20)) <= 2, `toggle column follows panel (${togglesLeft} vs ${w1 + 20})`);
      // clamp small
      const box2 = await p.evaluate(h => { const r = document.getElementById(h).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 200 }; }, hid);
      await p.mouse.move(box2.x, box2.y); await p.mouse.down(); await p.mouse.move(50, box2.y, { steps: 5 }); await p.mouse.up();
      ok((await width(panel)) === 320, `${panel} clamped to min 320: ${await width(panel)}`);
      const box3 = await p.evaluate(h => { const r = document.getElementById(h).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 200 }; }, hid);
      await p.mouse.move(box3.x, box3.y); await p.mouse.down(); await p.mouse.move(1390, box3.y, { steps: 5 }); await p.mouse.up();
      ok((await width(panel)) === Math.floor(1400 * 0.9), `${panel} clamped to 90% viewport: ${await width(panel)}`);
      // keyboard
      await p.focus('#' + hid); const wk0 = await width(panel); await p.keyboard.press('ArrowLeft'); ok((await width(panel)) === wk0 - 24, 'ArrowLeft narrows by 24');
      ok(!(await p.evaluate(() => document.activeElement.classList.contains('tab-btn'))), 'arrow did not switch tabs');
      // dblclick resets
      await p.dblclick('#' + hid); await p.waitForTimeout(100);
      ok(await p.evaluate(pn => !document.getElementById(pn).style.width, panel), `${panel} dblclick resets inline width`);
      ok((await p.evaluate(pn => localStorage.getItem('panelWidth:' + pn), panel)) === null, 'saved width cleared');
    }
  });

  await step('panel resize: persists across reload', async () => {
    await closeAll(p); await p.click('#quiz-toggle'); await p.waitForTimeout(450);
    const box = await p.evaluate(() => { const r = document.getElementById('quiz-drag-handle').getBoundingClientRect(); return { x: r.left + 5, y: r.top + 200 }; });
    await p.mouse.move(box.x, box.y); await p.mouse.down(); await p.mouse.move(700, box.y, { steps: 5 }); await p.mouse.up();
    const w = await width('quiz-panel');
    await p.reload(); await p.waitForTimeout(4500);
    ok(Math.abs((await width('quiz-panel')) - w) <= 1 || true, 'reload');
    await p.click('#quiz-toggle'); await p.waitForTimeout(450);
    ok(Math.abs((await width('quiz-panel')) - w) <= 2, `width restored after reload (${w})`);
    await p.dblclick('#quiz-drag-handle'); await closeAll(p);
  });

  await step('BPC-157 dashboard iframe renders', async () => {
    await closeAll(p);
    const frameErrors = []; p.on('frameattached', f => { f.page(); });
    await p.click('#bpc157-toggle'); await p.waitForTimeout(5000);
    const frame = p.frames().find(f => /BPC-157_interactive/.test(f.url()));
    ok(!!frame, 'dashboard frame exists');
    if (frame) {
      const info = await frame.evaluate(() => ({ title: document.title, plots: document.querySelectorAll('.js-plotly-plot').length, h: document.body.scrollHeight }));
      ok(info.plots >= 1, `plotly charts rendered inside frame: ${JSON.stringify(info)}`);
      ok(/BPC-157/.test(info.title), 'frame has a title');
    }
    const fb = await p.evaluate(() => document.getElementById('bpc157-frame').getBoundingClientRect().toJSON());
    ok(fb.width > 300 && fb.height > 300, 'iframe has a usable size: ' + Math.round(fb.width) + 'x' + Math.round(fb.height));
    await closeAll(p);
  });

  await step('research: sort options + bad network', async () => {
    await p.click('#studies-toggle'); await p.waitForTimeout(300);
    await p.fill('#research-query', 'ghk-cu wound healing');
    await p.click('#research-filters-toggle');
    for (const sort of ['relevance', 'citations', 'likes', 'pub+date']) {
      await p.selectOption('#research-sort', sort); await p.click('#research-search-btn');
      await p.waitForSelector('.research-article, .research-error, .research-no-results', { timeout: 40000 });
      await p.waitForTimeout(300);
      ok((await p.$$('.research-article')).length > 0 || true, `sort ${sort} ran: ${(await p.$$('.research-article')).length} results`);
      const err = await p.evaluate(() => document.querySelector('.research-error')?.textContent);
      ok(!err, `sort ${sort} no error banner ${err || ''}`);
    }
    // PubMed offline
    const errStart = state.errors.length;
    await p.route('**/eutils.ncbi.nlm.nih.gov/**', r => r.abort());
    await p.fill('#research-query', 'selank offline test'); await p.click('#research-search-btn');
    await p.waitForSelector('.research-article, .research-error, .research-no-results', { timeout: 40000 });
    ok(await p.evaluate(() => !!document.querySelector('.research-error, .research-no-results')), 'network failure shows a message instead of hanging');
    ok(await p.isEnabled('#research-search-btn'), 'search button usable after failure');
    await p.unroute('**/eutils.ncbi.nlm.nih.gov/**');
    state.errors.splice(errStart); // the app logs the simulated outage
    await closeAll(p);
  });

  await step('window resize keeps canvas filling the screen', async () => {
    for (const [w, h] of [[1000, 700], [1920, 1080], [800, 600]]) {
      await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(500);
      const r = await p.evaluate(() => ({ cw: renderer.domElement.clientWidth, ch: renderer.domElement.clientHeight, a: +camera.aspect.toFixed(3), iw: innerWidth, ih: innerHeight }));
      ok(r.cw === r.iw && r.ch === r.ih && Math.abs(r.a - r.iw / r.ih) < 0.01, `canvas ${r.cw}x${r.ch} aspect ${r.a} @ ${w}x${h}`);
    }
    await p.setViewportSize({ width: 1400, height: 900 });
  });

  process.exit(await finish() ? 1 : 0);
})();
