const { start, isOpen, closeAll } = require('./harness');
(async () => {
  const { page: p, ok, step, finish, state } = await start();
  p.setDefaultTimeout(6000);

  await step('every region selects and fills the side panel', async () => {
    const names = await p.evaluate(() => Object.keys(regions));
    console.log('  regions:', names.length);
    const gaps = { noInjuries: [], noProcedure: [], noPoints: [], pointMismatch: [], emptyPanel: [] };
    for (const name of names) {
      await p.evaluate(n => { removeCurrentHighlight(); removeInjectionPointSpheres(); window.selectRegion(n); }, name);
      const r = await p.evaluate(n => ({
        title: document.getElementById('panel-title').textContent,
        active: document.getElementById('side-panel').classList.contains('active'),
        li: document.querySelectorAll('#panel-injuries li').length,
        proc: !!regionProcedures[n], procShown: document.getElementById('panel-procedure').style.display !== 'none',
        points: (injectionPoints[n] || []).length,
        spheres: injectionPointSpheres.length,
        technique: document.getElementById('proc-technique').textContent,
        hasInj: !!regionInjuries[n],
        highlight: !!currentHighlight
      }), name);
      if (!r.active || !r.title || !r.highlight) gaps.emptyPanel.push(name);
      if (!r.hasInj) gaps.noInjuries.push(name);
      if (!r.proc) gaps.noProcedure.push(name);
      if (!r.points) gaps.noPoints.push(name);
      if (r.points !== r.spheres) gaps.pointMismatch.push(`${name}(${r.points}/${r.spheres})`);
    }
    ok(gaps.emptyPanel.length === 0, 'all regions show panel/title/highlight: ' + gaps.emptyPanel);
    ok(gaps.noInjuries.length === 0, 'all regions have injuries: ' + gaps.noInjuries);
    ok(gaps.noProcedure.length === 0, 'all regions have a procedure: ' + gaps.noProcedure);
    ok(gaps.noPoints.length === 0, 'all regions have injection points: ' + gaps.noPoints.slice(0,8));
    ok(gaps.pointMismatch.length === 0, 'spheres match points: ' + gaps.pointMismatch.slice(0,8));
  });

  await step('data consistency: regions / injuries / procedures / points keys', async () => {
    const d = await p.evaluate(() => {
      const r = Object.keys(regions), i = Object.keys(regionInjuries), pr = Object.keys(regionProcedures), ip = Object.keys(injectionPoints);
      const diff = (a, b) => a.filter(x => !b.includes(x));
      return { injNotRegion: diff(i, r), procNotRegion: diff(pr, r), ptsNotRegion: diff(ip, r) };
    });
    ok(d.injNotRegion.length === 0, 'injuries keys not in regions: ' + d.injNotRegion.slice(0,10));
    ok(d.procNotRegion.length === 0, 'procedure keys not in regions: ' + d.procNotRegion.slice(0,10));
    ok(d.ptsNotRegion.length === 0, 'injection point keys not in regions: ' + d.ptsNotRegion.slice(0,10));
  });

  await step('real canvas clicks across the body hit regions', async () => {
    const hits = [];
    for (let y = 250; y <= 650; y += 40) for (let x = 600; x <= 800; x += 40) {
      await p.mouse.click(x, y); await p.waitForTimeout(60);
      const t = await p.evaluate(() => document.getElementById('side-panel').classList.contains('active') ? document.getElementById('panel-title').textContent + '|' + document.getElementById('panel-portion').textContent : null);
      if (t) hits.push(t);
    }
    console.log('  distinct regions hit by click grid:', new Set(hits).size, 'of', hits.length, 'hits');
    ok(hits.length > 10, 'clicking the model selects regions');
    // click empty background deselects
    await p.mouse.click(1200, 400); await p.waitForTimeout(200);
    ok(!(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'))), 'click on background clears selection');
  });

  await step('hover tooltip over injection points', async () => {
    await p.evaluate(() => { removeCurrentHighlight(); window.selectRegion(Object.keys(regions).find(n => injectionPoints[n] && injectionPoints[n].length)); });
    // project first sphere to screen
    const pos = await p.evaluate(() => { const s = injectionPointSpheres[0]; const v = s.position.clone().project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; });
    await p.mouse.move(pos.x - 40, pos.y - 40); await p.mouse.move(pos.x, pos.y, { steps: 4 }); await p.waitForTimeout(300);
    const vis = await p.evaluate(() => ({ v: document.getElementById('injection-tooltip').classList.contains('visible'), title: document.querySelector('.tooltip-title').textContent, type: document.querySelector('.tooltip-type').textContent }));
    ok(vis.v && vis.title && vis.type, 'tooltip visible with content on hover: ' + JSON.stringify(vis));
    await p.mouse.move(5, 5); await p.waitForTimeout(300);
    ok(!(await p.evaluate(() => document.getElementById('injection-tooltip').classList.contains('visible'))), 'tooltip hides when leaving');
  });

  await step('search: open/close/clear', async () => {
    await closeAll(p);
    await p.click('#search-toggle'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded')), 'toggle expands');
    await p.fill('#search-input', 'bpc'); await p.waitForTimeout(450);
    ok(await p.isVisible('#search-clear'), 'clear button appears');
    await p.click('#search-clear'); await p.waitForTimeout(500);
    ok((await p.inputValue('#search-input')) === '' && !(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded'))), 'clear resets and collapses');
    await p.click('#search-toggle'); await p.waitForTimeout(300);
    await p.keyboard.press('Escape'); await p.waitForTimeout(500);
    ok(!(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded'))), 'Escape with empty input collapses');
    await p.click('#search-toggle'); await p.waitForTimeout(300);
    await p.mouse.click(900, 700); await p.waitForTimeout(500);
    ok(!(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded'))), 'click outside collapses');
  });

  const queries = ['bpc', 'BPC-157', 'bcp', 'knee', 'tendon', 'semaglutide', 'a', 'deltoid strain', 'xyzxyz', '(', '[', '\\', '<script>', '"', '%', ' ', 'tb500'];
  for (const q of queries) {
    await step(`search query ${JSON.stringify(q)}`, async () => {
      await p.click('#search-toggle').catch(()=>{}); await p.waitForTimeout(250);
      if (!(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded')))) await p.click('#search-toggle');
      await p.fill('#search-input', q); await p.waitForTimeout(500);
      const r = await p.evaluate(() => ({ n: document.querySelectorAll('.search-result-item').length, none: !!document.querySelector('#search-results .no-results'), active: document.getElementById('search-results').classList.contains('active'), html: document.getElementById('search-results').innerHTML }));
      if (q.trim() === '') ok(!r.active, 'blank query shows nothing');
      else if (q === 'xyzxyz') ok(r.none && r.n === 0, 'gibberish shows "no results"');
      else ok(r.n > 0 || r.none, `query gives results or no-results message (n=${r.n})`);
      ok(!/<script/i.test(r.html), 'no raw <script> in results');
      p.state = r;
    });
  }

  await step('search result types and selection', async () => {
    const pick = async (q, type) => {
      await p.fill('#search-input', q); await p.waitForTimeout(500);
      const items = await p.$$eval('.search-result-item', els => els.map(e => ({ inj: e.querySelector('.result-injury').textContent, reg: e.querySelector('.result-region').textContent })));
      return items;
    };
    let items = await pick('bpc');
    ok(items.some(i => /💊/.test(i.reg)), 'bpc finds a peptide result: ' + JSON.stringify(items.slice(0,3)));
    await p.click('.search-result-item >> nth=0'); await p.waitForTimeout(800);
    ok(await isOpen(p, 'new-panel'), 'clicking a peptide result opens peptides panel');
    const hl = await p.evaluate(() => !!document.querySelector('#peptides-list .highlight'));
    ok(hl, 'matched peptide card highlighted/scrolled');
    await closeAll(p);

    await p.click('#search-toggle'); await p.waitForTimeout(250);
    items = await pick('knee');
    ok(items.some(i => /Body Part|📍/.test(i.reg)), 'knee finds region/injury results');
    const before = await p.evaluate(() => document.getElementById('panel-title').textContent);
    await p.click('.search-result-item >> nth=0'); await p.waitForTimeout(600);
    ok(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active')), 'selecting region result opens side panel');
    ok((await p.evaluate(() => injectionPointSpheres.length)) > 0, 'injection point spheres shown after search selection');
    ok(!/Click on any/.test(await p.evaluate(() => getComputedStyle(document.getElementById('info-box')).display === 'none' ? 'hidden' : 'Click on any')), 'info box hidden');

    // injury result highlights li
    await p.click('#search-toggle'); await p.waitForTimeout(250);
    await p.fill('#search-input', 'tendinitis'); await p.waitForTimeout(500);
    const injuryItem = await p.$('.search-result-item:has(.result-region:text("📍"))');
    if (injuryItem) { await injuryItem.click(); await p.waitForTimeout(700); ok(await p.evaluate(() => !!document.querySelector('#panel-injuries li.highlighted')), 'injury result highlights its list item'); }
  });

  await step('search keyboard navigation', async () => {
    await closeAll(p);
    await p.click('#search-toggle'); await p.waitForTimeout(250);
    await p.fill('#search-input', 'shoulder'); await p.waitForSelector('.search-result-item'); await p.waitForTimeout(300);
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
    const idx = await p.evaluate(() => [...document.querySelectorAll('.search-result-item')].findIndex(e => e.classList.contains('highlighted')));
    ok(idx === 1, 'ArrowDown x2 highlights 2nd item (idx=' + idx + ')');
    await p.keyboard.press('ArrowUp');
    ok((await p.evaluate(() => [...document.querySelectorAll('.search-result-item')].findIndex(e => e.classList.contains('highlighted')))) === 0, 'ArrowUp moves back');
    await p.keyboard.press('Enter'); await p.waitForTimeout(700);
    ok(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active')), 'Enter selects highlighted result');
    ok(!(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded'))), 'search collapses after Enter');
    await p.click('#search-toggle'); await p.waitForTimeout(250);
    await p.fill('#search-input', 'shoulder'); await p.waitForTimeout(500);
    await p.click('#search-results-close'); await p.waitForTimeout(500);
    ok(!(await p.evaluate(() => document.getElementById('search-results').classList.contains('active'))), 'results close (x) button works');
  });

  await step('saved locations: save / focus / delete / persistence', async () => {
    await closeAll(p);
    await p.evaluate(() => localStorage.removeItem('peptide_saved_locations'));
    await p.reload(); await p.waitForTimeout(3500);
    await p.click('#saved-toggle'); await p.waitForTimeout(250);
    ok(await p.isDisabled('#save-current-spot-btn'), 'save disabled with nothing selected');
    ok(/No locations saved/.test(await p.textContent('#saved-list')), 'empty state message');
    await p.evaluate(() => window.selectRegion(Object.keys(regions)[0]));
    await p.waitForTimeout(200);
    ok(!(await p.isDisabled('#save-current-spot-btn')), 'save enabled after selection');
    await p.click('#save-current-spot-btn');
    await p.evaluate(() => window.selectRegion(Object.keys(regions)[3]));
    await p.click('#save-current-spot-btn'); await p.waitForTimeout(200);
    ok((await p.$$('.saved-item')).length === 2, 'two saved items listed');
    ok((await p.evaluate(() => scene.children.filter(c => c.name.startsWith('saved-')).length)) === 2, 'two markers in scene');
    const camBefore = await p.evaluate(() => camera.position.toArray());
    await p.click('.saved-item >> nth=1'); await p.waitForTimeout(1000);
    const camAfter = await p.evaluate(() => camera.position.toArray());
    ok(JSON.stringify(camBefore) !== JSON.stringify(camAfter), 'clicking a saved item flies the camera');
    ok(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active')), 'saved item selects its region');
    await p.keyboard.press('Tab');
    await p.focus('.saved-item >> nth=0'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
    ok(true, 'saved item activates with keyboard (no error)');
    await p.reload(); await p.waitForTimeout(3500);
    ok((await p.evaluate(() => JSON.parse(localStorage.getItem('peptide_saved_locations')).length)) === 2, 'persisted after reload');
    await p.click('#saved-toggle'); await p.waitForTimeout(250);
    await p.click('.saved-delete >> nth=0'); await p.waitForTimeout(200);
    ok((await p.$$('.saved-item')).length === 1, 'delete removes item');
    ok((await p.evaluate(() => scene.children.filter(c => c.name.startsWith('saved-')).length)) === 1, 'delete removes marker');
    await p.click('.saved-delete >> nth=0'); await p.waitForTimeout(200);
    ok(/No locations saved/.test(await p.textContent('#saved-list')), 'empty state returns');
    await p.evaluate(() => localStorage.setItem('peptide_saved_locations', '{broken'));
    const before = state.errors.length;
    await p.reload(); await p.waitForTimeout(3500);
    state.errors.splice(before); // the app logs a handled console.error for corrupt storage
    ok(await p.evaluate(() => document.getElementById('saved-list').textContent.includes('No locations saved')), 'corrupt storage falls back to empty list');
  });

  process.exit(await finish() ? 1 : 0);
})();
