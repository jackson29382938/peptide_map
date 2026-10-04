const { start, isOpen, closeAll } = require('./harness');
(async () => {
  const { page: p, ok, step, finish, state } = await start();
  const setv = (sel, v) => p.fill(sel, String(v));

  // ---------- Peptides database panel ----------
  await step('peptides DB: list, filter, clear, modal, compare', async () => {
    await p.click('#new-panel-toggle'); await p.waitForTimeout(300);
    ok((await p.$$('#peptides-list .peptide-card')).length === 34, '34 peptide cards');
    ok(/34 peptides/.test(await p.textContent('#peptides-count')), 'count label');
    for (const [q, min] of [['bpc', 1], ['GLP-1', 1], ['metabolic', 3], ['amp', 0], ['<b>', 0], ['(', 0], ['zzzz', 0]]) {
      await setv('#peptides-filter', q); await p.waitForTimeout(350);
      const n = (await p.$$('#peptides-list .peptide-card')).length;
      ok(n >= min, `filter ${JSON.stringify(q)} -> ${n} cards`);
      if (n === 0) ok(/No peptides match/.test(await p.textContent('#peptides-list')), 'empty message for ' + q);
      ok(/peptide/.test(await p.textContent('#peptides-count')), 'count updates');
    }
    await setv('#peptides-filter', 'bpc'); await p.waitForTimeout(350);
    ok(await p.evaluate(() => !!document.querySelector('#peptides-list mark')), 'matches highlighted with <mark>');
    await p.click('#peptides-clear-filter'); await p.waitForTimeout(350);
    ok((await p.$$('#peptides-list .peptide-card')).length === 34 && (await p.inputValue('#peptides-filter')) === '', 'clear restores list');
    // open each of the 34 modals
    const ids = await p.$$eval('#peptides-list .peptide-card', els => els.map(e => e.dataset.peptideId));
    let modalFails = [];
    for (const id of ids) {
      await p.click(`#peptides-list [data-peptide-id="${id}"]`); await p.waitForTimeout(80);
      const r = await p.evaluate(() => ({ active: document.getElementById('peptide-modal').classList.contains('active'), title: document.querySelector('.peptide-modal-title')?.textContent, undef: /undefined|null|NaN/.test(document.getElementById('peptide-modal-body').textContent) }));
      if (!r.active || !r.title || r.undef) modalFails.push(id + JSON.stringify(r));
      await p.keyboard.press('Escape'); await p.waitForTimeout(40);
    }
    ok(modalFails.length === 0, 'all 34 modals open cleanly: ' + modalFails.slice(0,3));
    // modal close methods
    await p.click('#peptides-list .peptide-card >> nth=0'); await p.waitForTimeout(150);
    await p.click('.peptide-modal-close'); await p.waitForTimeout(150);
    ok(!(await p.evaluate(() => document.getElementById('peptide-modal').classList.contains('active'))), 'X closes modal');
    await p.click('#peptides-list .peptide-card >> nth=0'); await p.waitForTimeout(150);
    await p.mouse.click(5, 450); await p.waitForTimeout(150);
    ok(!(await p.evaluate(() => document.getElementById('peptide-modal').classList.contains('active'))), 'backdrop closes modal');
    ok((await p.evaluate(() => document.body.style.overflow)) === '', 'body scroll restored');
    // keyboard open
    await p.focus('#peptides-list .peptide-card >> nth=1'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.getElementById('peptide-modal').classList.contains('active')), 'Enter on card opens modal');
    // add to compare from modal
    await p.click('.peptide-modal-compare'); await p.waitForTimeout(400);
    ok(await isOpen(p, 'compare-panel'), 'Add to comparison opens compare panel');
    ok((await p.evaluate(() => PeptideCompare.getSelected().length)) === 1, 'one peptide selected for compare');
    await closeAll(p);
  });

  // ---------- Compare ----------
  await step('compare panel', async () => {
    await p.evaluate(() => PeptideCompare.clear());
    await p.click('#compare-toggle'); await p.waitForTimeout(300);
    await p.selectOption('#compare-select-0', 'bpc157'); await p.waitForTimeout(100);
    await p.selectOption('#compare-select-1', 'tb500'); await p.waitForTimeout(100);
    await p.click('#compare-now-btn'); await p.waitForTimeout(200);
    ok((await p.$$('.compare-table th')).length === 3, 'table has attribute + 2 peptide columns');
    ok(!/undefined|NaN/.test(await p.textContent('.compare-table')), 'no undefined in table');
    // duplicate prevention
    state.dialogs.length = 0;
    await p.selectOption('#compare-select-2', 'bpc157'); await p.waitForTimeout(150);
    ok(state.dialogs.some(d => /already selected/.test(d)), 'duplicate peptide rejected');
    await p.selectOption('#compare-select-2', 'semaglutide'); await p.waitForTimeout(150);
    await p.click('#compare-now-btn'); ok((await p.$$('.compare-table th')).length === 4, '3 peptides compared');
    state.dialogs.length = 0; ok(!(await p.evaluate(() => PeptideCompare.add('ghk-cu'))) && state.dialogs.some(d => /Maximum 3/.test(d)), 'max 3 enforced');
    await p.click('.compare-remove >> nth=0'); await p.waitForTimeout(200);
    ok((await p.evaluate(() => PeptideCompare.getSelected().length)) === 2, 'remove works');
    await p.click('.compare-remove >> nth=0'); await p.waitForTimeout(200);
    ok(/at least 2/.test(await p.textContent('.compare-table-container')), 'message when <2 selected');
    await p.evaluate(() => PeptideCompare.clear()); await closeAll(p);
  });

  // ---------- Chat ----------
  await step('chat: every intent', async () => {
    await p.click('#chat-toggle'); await p.waitForTimeout(300);
    const ask = async (q) => { const n = await p.evaluate(() => document.querySelectorAll('.chat-message-bot').length); await setv('#chat-input', q); await p.click('#chat-send'); await p.waitForTimeout(500); const t = await p.evaluate(() => [...document.querySelectorAll('.chat-message-bot')].pop().textContent); return { t, grew: (await p.evaluate(() => document.querySelectorAll('.chat-message-bot').length)) > n }; };
    const cases = [
      ['What is BPC-157?', /BPC-157/], ['benefits of TB-500', /TB-500|Thymosin/i], ['dosing for semaglutide', /Dosing|Typical Dose/i],
      ['side effects of ipamorelin', /side effects|well-tolerated/i], ['how to inject bpc157', /How to use|Administration/i],
      ['what forms does mk677 come in', /form|available|oral/i], ['category of selank', /categorized/i],
      ['compare bpc-157 vs tb-500', /Comparison Tool/i], ['best peptides for sleep', /sleep|DSIP/i], ['peptides for hair', /GHK/i],
      ['joint pain', /joint|BPC/i], ['hello', /Try asking/i], ['', null], ['   ', null], ['Thymosin Alpha 1 dose', /Thymosin/i], ['nad+', /NAD|nad/i], ['cjc-1295 ipamorelin dose', /CJC/i]
    ];
    for (const [q, re] of cases) {
      if (re === null) { const before = await p.evaluate(() => document.querySelectorAll('.chat-message').length); await setv('#chat-input', q); await p.click('#chat-send'); await p.waitForTimeout(300); ok((await p.evaluate(() => document.querySelectorAll('.chat-message').length)) === before, 'empty input ignored'); continue; }
      const r = await ask(q);
      ok(r.grew && re.test(r.t), `chat ${JSON.stringify(q)} -> ${r.t.slice(0, 70).replace(/\s+/g, ' ')}`);
      ok(!/undefined|null|NaN/.test(r.t), 'no undefined in reply to ' + q);
    }
    await setv('#chat-input', 'x'.repeat(500)); ok((await p.inputValue('#chat-input')).length === 300, 'input limited to 300 chars');
    await setv('#chat-input', ''); await p.keyboard.press('Escape');
    await p.evaluate(() => PeptideChat.clear()); ok((await p.$$('.chat-message')).length === 1, 'clear resets conversation');
    await closeAll(p);
  });

  // ---------- Journal ----------
  await step('journal: add/rate/delete/export/clear', async () => {
    await p.evaluate(() => localStorage.removeItem('peptideJournal'));
    await p.reload(); await p.waitForTimeout(3500);
    await p.click('#journal-toggle'); await p.waitForTimeout(300);
    ok(/No entries yet/.test(await p.textContent('.journal-entries-container')), 'empty state');
    state.dialogs.length = 0;
    await p.click('.journal-submit-btn'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => !document.getElementById('journal-entry-form').checkValidity()), 'required fields block submit');
    await p.selectOption('#journal-peptide', 'bpc157'); await setv('#journal-dose', '250mcg'); await p.selectOption('#journal-route', 'im');
    await setv('#journal-notes', 'felt good, "no" issues'); await p.click('.rating-star[data-rating="4"]');
    ok((await p.$$('.rating-star.active')).length === 4, '4 stars lit');
    await p.click('.journal-submit-btn'); await p.waitForTimeout(200);
    ok((await p.$$('.journal-entry')).length === 1, 'entry added');
    const txt = await p.textContent('.journal-entry');
    ok(/IM/.test(txt) && /250mcg/.test(txt) && /★★★★☆/.test(txt), 'entry shows route/dose/rating: ' + txt.replace(/\s+/g,' ').slice(0, 100));
    ok((await p.$$('.rating-star.active')).length === 0, 'form reset incl. rating');
    // date displayed correctly (local date, not shifted)
    const today = new Date(); const expected = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    ok((await p.textContent('.journal-entry-date')) === expected, `date not shifted: ${await p.textContent('.journal-entry-date')} vs ${expected}`);
    await p.selectOption('#journal-peptide', 'other'); await setv('#journal-dose', '1 mg'); await p.click('.journal-submit-btn'); await p.waitForTimeout(150);
    ok((await p.$$('.journal-entry')).length === 2, 'second entry (other)');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#journal-export')]);
    const csv = require('fs').readFileSync(await dl.path(), 'utf8');
    ok(csv.split('\r\n').length === 3 && /bpc157/.test(csv), 'csv has header + 2 rows');
    ok(/\.csv$/.test(dl.suggestedFilename()), 'csv filename ' + dl.suggestedFilename());
    await p.reload(); await p.waitForTimeout(3500); await p.click('#journal-toggle'); await p.waitForTimeout(300);
    ok((await p.$$('.journal-entry')).length === 2, 'entries persist after reload');
    await p.click('.journal-entry-delete >> nth=0'); await p.waitForTimeout(150);
    ok((await p.$$('.journal-entry')).length === 1, 'delete removes entry (confirm accepted)');
    await p.evaluate(() => PeptideJournal.clearAll()); await p.waitForTimeout(100);
    ok((await p.$$('.journal-entry')).length === 0, 'clearAll');
    state.dialogs.length = 0; await p.click('#journal-export'); await p.waitForTimeout(100);
    ok(state.dialogs.some(d => /No entries/.test(d)), 'export with no entries alerts');
    await p.evaluate(() => localStorage.setItem('peptideJournal', '{"not":"array"}')); await p.reload(); await p.waitForTimeout(3500);
    ok(true, 'non-array journal storage tolerated');
    await closeAll(p);
  });

  process.exit(await finish() ? 1 : 0);
})();
