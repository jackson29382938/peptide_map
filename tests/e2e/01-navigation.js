const { start, isOpen, closeAll } = require('./harness');
(async () => {
  const { page: p, ok, step, finish, state } = await start();

  await step('panel toggles open/close and are mutually exclusive', async () => {
    const pairs = [['tab-toggle','tab-panel'],['studies-toggle','studies-panel'],['companies-toggle','companies-panel'],['quiz-toggle','quiz-panel'],['calc-toggle','calc-panel'],['contact-toggle','contact-panel'],['new-panel-toggle','new-panel'],['bpc157-toggle','bpc157-panel'],['compare-toggle','compare-panel'],['journal-toggle','journal-panel'],['chat-toggle','chat-panel']];
    for (const [t, pn] of pairs) {
      await p.click('#' + t); await p.waitForTimeout(250);
      ok(await isOpen(p, pn), `${t} opens ${pn}`);
      const others = [];
      for (const [, o] of pairs) if (o !== pn && await isOpen(p, o)) others.push(o);
      ok(others.length === 0, `${pn} open exclusively (also open: ${others})`);
      ok((await p.getAttribute('#' + t, 'aria-expanded')) === 'true', `${t} aria-expanded true`);
      const left = await p.evaluate(id => parseInt(document.getElementById(id).style.left) || 0, 'theme-toggle');
      ok(left > 100, `toggle column shifts right of ${pn} (left=${left})`);
      await p.click('#' + t); await p.waitForTimeout(250);
      ok(!(await isOpen(p, pn)), `${t} closes ${pn}`);
      ok((await p.getAttribute('#' + t, 'aria-expanded')) === 'false', `${t} aria-expanded false`);
    }
  });

  await step('open panel A then toggle B switches', async () => {
    await p.click('#quiz-toggle'); await p.click('#new-panel-toggle'); await p.waitForTimeout(250);
    ok(await isOpen(p, 'new-panel') && !(await isOpen(p, 'quiz-panel')), 'switching panels');
    await p.click('#new-panel-toggle');
  });

  await step('theme toggle', async () => {
    const t0 = await p.evaluate(() => document.documentElement.dataset.theme);
    await p.click('#theme-toggle'); await p.waitForTimeout(300);
    const t1 = await p.evaluate(() => document.documentElement.dataset.theme);
    ok(t0 !== t1, `theme changed ${t0}->${t1}`);
    const stored = await p.evaluate(() => localStorage.getItem('theme')); ok(stored === t1, 'theme persisted');
    const bg = await p.evaluate(() => scene.background.getHexString());
    ok(bg === (t1 === 'light' ? 'f9fafb' : '1f2937'), 'scene background follows theme: ' + bg);
    await p.reload(); await p.waitForTimeout(3500);
    ok((await p.evaluate(() => document.documentElement.dataset.theme)) === t1, 'theme restored after reload');
    await p.click('#theme-toggle'); await p.waitForTimeout(200);
  });

  await step('info tab panel tabs', async () => {
    await p.click('#tab-toggle'); await p.waitForTimeout(250);
    for (const tab of ['types','analysis','procedure']) {
      await p.click(`.tab-btn[data-tab="${tab}"]`);
      ok(await p.evaluate(t => document.getElementById('tab-' + t).classList.contains('active'), tab), `tab ${tab} active`);
      ok((await p.evaluate(() => document.querySelectorAll('.tab-content.active').length)) === 1, `only one tab content active (${tab})`);
    }
    // arrow-key tab navigation
    await p.click('.tab-btn[data-tab="procedure"]'); await p.evaluate(() => document.activeElement.blur());
    await p.keyboard.press('ArrowRight'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => document.getElementById('tab-types').classList.contains('active')), 'ArrowRight -> next tab');
    await p.keyboard.press('ArrowLeft'); ok(await p.evaluate(() => document.getElementById('tab-procedure').classList.contains('active')), 'ArrowLeft -> previous tab');
    await p.click('#tab-toggle');
  });

  await step('peptide-analysis toggle (open/switch/close)', async () => {
    await p.click('#peptide-analysis-toggle'); await p.waitForTimeout(300);
    ok(await isOpen(p, 'tab-panel') && await p.evaluate(() => document.getElementById('tab-analysis').classList.contains('active')), 'opens analysis tab');
    await p.click('#peptide-analysis-toggle'); await p.waitForTimeout(300);
    ok(!(await isOpen(p, 'tab-panel')), 'second click closes');
    await p.click('#tab-toggle'); await p.waitForTimeout(250);
    await p.click('.tab-btn[data-tab="procedure"]');
    await p.click('#peptide-analysis-toggle'); await p.waitForTimeout(250);
    ok(await isOpen(p, 'tab-panel') && await p.evaluate(() => document.getElementById('tab-analysis').classList.contains('active')), 'switches to analysis when panel already open');
    await p.click('#tab-toggle');
  });

  await step('keyboard shortcuts', async () => {
    await closeAll(p);
    await p.evaluate(() => document.activeElement.blur());
    await p.keyboard.press('t'); await p.waitForTimeout(200);
    const t = await p.evaluate(() => document.documentElement.dataset.theme); ok(!!t, 'theme toggled by t');
    await p.keyboard.press('t');
    await p.keyboard.press('m'); await p.waitForTimeout(250); ok(await isOpen(p, 'tab-panel'), 'm opens menu panel');
    await p.keyboard.press('m'); await p.waitForTimeout(250); ok(!(await isOpen(p, 'tab-panel')), 'm closes menu panel');
    await p.keyboard.press('/'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded')), '/ opens search');
    ok(await p.evaluate(() => document.activeElement.id) === 'search-input', 'search input focused');
    await p.keyboard.type('t'); // typing t in input must not toggle theme
    ok((await p.inputValue('#search-input')) === 't', 'typing letter in input does not trigger shortcut');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    ok(!(await p.evaluate(() => document.getElementById('search-container').classList.contains('expanded'))), 'Escape closes search');
    await p.keyboard.press('?'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.getElementById('keyboard-shortcuts-modal')?.classList.contains('visible')), '? opens shortcuts help');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(!(await p.evaluate(() => document.getElementById('keyboard-shortcuts-modal').classList.contains('visible'))), 'Escape closes help');
    await p.keyboard.press('?'); await p.click('.shortcuts-close'); await p.waitForTimeout(200);
    ok(!(await p.evaluate(() => document.getElementById('keyboard-shortcuts-modal').classList.contains('visible'))), 'help close button');
    await p.keyboard.press('Control+t'); // should not change theme via our handler (browser would)
  });

  process.exit(await finish() ? 1 : 0);
})();
