const { start, isOpen, closeAll } = require('./harness');
(async () => {
  const { page: p, ok, step, finish, state } = await start();
  const txt = (s) => p.evaluate(s => document.querySelector(s)?.textContent.trim(), s);
  const setv = async (sel, v) => { await p.fill(sel, String(v)); };

  await step('reconstitution calc: normal mode math table', async () => {
    await p.click('#calc-toggle'); await p.waitForTimeout(300);
    const cases = [ // mg vial, ml bac, dose mcg, expected units, expected doses, conc
      [5, 2, 250, '10.0 units', '20 doses', '2.50 mg/ml'],
      [10, 3, 250, '7.5 units', '40 doses', '3.33 mg/ml'],
      [5, 1, 500, '10.0 units', '10 doses', '5.00 mg/ml'],
      [2, 2, 100, '10.0 units', '20 doses', '1.00 mg/ml'],
      [1, 1, 50, '5.0 units', '20 doses', '1.00 mg/ml'],
      [100, 3, 10000, '30.0 units', '10 doses', '33.33 mg/ml']
    ];
    for (const [mg, ml, dose, units, doses, conc] of cases) {
      await setv('#peptide-amount', mg); await setv('#bac-water', ml); await setv('#peptide-dose', dose);
      ok((await txt('#syringe-units')) === units, `${mg}mg/${ml}ml/${dose}mcg units ${await txt('#syringe-units')} == ${units}`);
      ok((await txt('#total-doses')) === doses, `doses ${await txt('#total-doses')} == ${doses}`);
      ok((await txt('#concentration')) === conc, `conc ${await txt('#concentration')} == ${conc}`);
    }
  });

  await step('reconstitution calc: mg/mcg unit toggle', async () => {
    await setv('#peptide-amount', 5); await setv('#bac-water', 2); await setv('#peptide-dose', 250);
    await p.click('.unit-btn[data-unit="mg"]'); await setv('#peptide-dose', 0.25);
    ok((await txt('#syringe-units')) === '10.0 units', 'mg mode 0.25mg -> 10 units: ' + await txt('#syringe-units'));
    ok((await txt('#dose-display')) === '0.25 mg', 'dose display in mg: ' + await txt('#dose-display'));
    ok(await p.evaluate(() => document.querySelector('.unit-btn[data-unit="mg"]').classList.contains('active') && !document.querySelector('.unit-btn[data-unit="mcg"]').classList.contains('active')), 'only mg active');
    await p.click('.unit-btn[data-unit="mcg"]'); await setv('#peptide-dose', 250);
    ok((await txt('#dose-display')) === '250 mcg', 'back to mcg');
  });

  await step('reconstitution calc: bad inputs', async () => {
    for (const [sel, v] of [['#peptide-amount', ''], ['#bac-water', '0'], ['#peptide-dose', '-5'], ['#peptide-dose', 'abc'], ['#peptide-amount', '1e9']]) {
      await setv('#peptide-amount', 5); await setv('#bac-water', 2); await setv('#peptide-dose', 250);
      await p.evaluate(([s, val]) => { const e = document.querySelector(s); e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); }, [sel, v]);
      const u = await txt('#syringe-units');
      ok(!/NaN|Infinity|undefined/.test(await p.textContent('#normal-mode')), `no NaN/Infinity for ${sel}=${JSON.stringify(v)} (units: ${u})`);
    }
    await setv('#peptide-amount', 5); await setv('#bac-water', 2); await setv('#peptide-dose', 250);
  });

  await step('syringe volume warning on each size', async () => {
    await setv('#peptide-dose', 1500); // 60 units
    for (const [vol, warn] of [['0.3', true], ['0.5', true], ['1', false]]) {
      await p.selectOption('#syringe-volume', vol);
      ok(/more than a/.test(await txt('#result-instruction')) === warn, `${vol}ml warn=${warn}`);
    }
    await setv('#peptide-dose', 250);
  });

  await step('converters', async () => {
    await p.click('.mode-btn[data-mode="advanced"]');
    await setv('#conv-mcg', 250); ok((await p.inputValue('#conv-mg')) === '0.250', 'mcg->mg');
    await setv('#conv-mg', 2); ok((await p.inputValue('#conv-mcg')) === '2000.00', 'mg->mcg ' + await p.inputValue('#conv-mcg'));
    await setv('#conv-ml', 0.25); ok((await p.inputValue('#conv-units')) === '25', 'ml->units ' + await p.inputValue('#conv-units'));
    await setv('#conv-units', 50); ok((await p.inputValue('#conv-ml')) === '0.50', 'units->ml');
    await p.click('.mode-btn[data-mode="normal"]'); await p.selectOption('#syringe-volume', '0.3'); await p.click('.mode-btn[data-mode="advanced"]'); await setv('#conv-ml', 0.1);
    ok((await p.inputValue('#conv-units')) === '10', 'ml->units independent of syringe size: ' + await p.inputValue('#conv-units'));
    await p.click('.mode-btn[data-mode="normal"]'); await p.selectOption('#syringe-volume', '1');
  });

  await step('advanced blend mode', async () => {
    await p.click('.mode-btn[data-mode="advanced"]');
    ok(await p.isVisible('#advanced-mode') && !(await p.isVisible('#normal-mode')), 'advanced visible, normal hidden');
    await setv('#blend-name-1', 'BPC-157'); await setv('#blend-amount-1', 5); await setv('#blend-dosage-1', 250); await setv('#blend-bac-1', 2);
    await setv('#blend-name-2', 'TB-500'); await setv('#blend-amount-2', 10); await setv('#blend-dosage-2', 500); await setv('#blend-bac-2', 2);
    await p.click('#calculate-blend'); await p.waitForTimeout(150);
    const t = await p.textContent('#blend-results-content');
    ok(/BPC-157/.test(t) && /TB-500/.test(t), 'both blends listed');
    ok((await p.$$eval('#blend-results-content .result-card', els => els.filter(e => /DRAW SYRINGE TO:\s*10\.0 units/.test(e.textContent)).length)) === 2, 'both cards = 10 units: ' + (t.match(/[\d.]+ units/g)));
    ok(await p.isVisible('#blend-results'), 'results visible');
    await p.click('#add-blend'); await p.click('#add-blend');
    ok((await p.$$('.peptide-blend')).length === 4, '4 blends');
    await p.click('#add-blend');
    ok(state.dialogs.some(d => /Maximum 4/.test(d)), 'max-4 alert');
    await setv('#blend-name-4', ''); await p.click('#calculate-blend');
    ok(/Peptide 4/.test(await p.textContent('#blend-results-content')), 'unnamed blend gets default name');
    await setv('#blend-amount-3', ''); await p.click('#calculate-blend');
    ok(!/NaN|Infinity/.test(await p.textContent('#blend-results-content')), 'blank amount handled');
    await p.click('.mode-btn[data-mode="normal"]');
    ok(await p.isVisible('#normal-mode'), 'back to normal');
  });

  await step('analysis: BPC-157 calculator all combos', async () => {
    await closeAll(p);
    await p.click('#tab-toggle'); await p.click('.tab-btn[data-tab="analysis"]'); await p.waitForTimeout(200);
    for (const cond of ['musculoskeletal', 'gut', 'neurological']) for (const sev of ['1', '2', '3']) {
      await p.selectOption('#bpc-condition', cond); await p.selectOption('#bpc-severity', sev);
      await p.evaluate(() => document.getElementById('bpc-calculate').click());
      const t = await p.textContent('#bpc-results');
      ok(/SINGLE DOSE/.test(t) && !/NaN/.test(t) && /not medical advice/i.test(t), `BPC ${cond}/${sev}: ${(t.match(/(\d+) mcg/)||[])[0]}`);
    }
    // weight 200 lbs musculoskeletal moderate => 90.7kg*8 = 726
    await p.selectOption('#bpc-condition', 'musculoskeletal'); await p.selectOption('#bpc-severity', '2'); await setv('#bpc-weight', 200);
    await p.evaluate(() => document.getElementById('bpc-calculate').click());
    ok(/726 mcg/.test(await p.textContent('#bpc-results')), 'BPC 200 lbs -> 726 mcg: ' + (await p.textContent('#bpc-results')).match(/\d+ mcg/));
    state.dialogs.length = 0;
    await setv('#bpc-weight', 5); await p.evaluate(() => document.getElementById('bpc-calculate').click());
    ok(state.dialogs.some(d => /realistic/.test(d)), 'unrealistic weight rejected');
    await setv('#bpc-weight', ''); await p.evaluate(() => document.getElementById('bpc-calculate').click());
    ok(state.dialogs.length === 2, 'blank weight rejected');
    await setv('#bpc-weight', 200);
  });

  await step('analysis: unit toggles lbs<->kg and in<->cm', async () => {
    const toggles = await p.$$('#bpc-weight ~ *, label[for="bpc-weight"] .unit-toggle-btn');
    await p.evaluate(() => document.querySelector('label[for="bpc-weight"] .unit-toggle-btn[data-unit="kg"]').click());
    const kg = await p.inputValue('#bpc-weight'); ok(Math.abs(parseFloat(kg) - 90.7) < 0.2, 'lbs 200 -> kg 90.7: ' + kg);
    ok((await p.getAttribute('#bpc-weight', 'max')) === '200', 'input max updated for kg');
    await p.evaluate(() => document.getElementById('bpc-calculate').click());
    ok(/726 mcg/.test(await p.textContent('#bpc-results')), 'same dose after unit switch: ' + (await p.textContent('#bpc-results')).match(/\d+ mcg/));
    await p.evaluate(() => document.querySelector('label[for="bpc-weight"] .unit-toggle-btn[data-unit="lbs"]').click());
    ok(Math.abs(parseFloat(await p.inputValue('#bpc-weight')) - 200) < 0.5, 'kg -> lbs round trip');
    // other weight inputs share the global unit state
    const labelsSynced = await p.evaluate(() => [...document.querySelectorAll('label[for$="-weight"] .unit-toggle-btn.active')].map(b => b.dataset.unit));
    console.log('  active unit buttons per weight label:', labelsSynced.join(','));
    await p.evaluate(() => document.querySelector('label[for="adv-height"] .unit-toggle-btn[data-unit="cm"]').click());
    const cm = parseFloat(await p.inputValue('#adv-height')); ok(Math.abs(cm - 177.8) < 0.5, 'in->cm: ' + cm);
    await p.evaluate(() => document.querySelector('label[for="adv-height"] .unit-toggle-btn[data-unit="inches"]').click());
  });

  await step('analysis: unit toggle sync across calculators', async () => {
    // switch weight to kg on the BPC calc, then check the GHS weight input value/units are consistent
    await p.evaluate(() => document.querySelector('label[for="bpc-weight"] .unit-toggle-btn[data-unit="kg"]').click());
    const info = await p.evaluate(() => ['bpc','ghs','glp1','adv'].map(k => ({ k, val: document.getElementById(k + '-weight').value, activeBtn: document.querySelector(`label[for="${k}-weight"] .unit-toggle-btn.active`)?.dataset.unit, max: document.getElementById(k + '-weight').max })));
    console.log('  ', JSON.stringify(info));
    const inconsistent = info.filter(i => i.activeBtn !== 'kg' || i.max !== '200' || parseFloat(i.val) > 200);
    ok(inconsistent.length === 0, 'all weight inputs follow the global unit: ' + JSON.stringify(inconsistent));
    await p.evaluate(() => document.querySelector('label[for="bpc-weight"] .unit-toggle-btn[data-unit="lbs"]').click());
  });

  await step('analysis: GHS calculator all combos', async () => {
    for (const goal of ['muscle_growth', 'fat_loss', 'recovery', 'anti_aging']) for (const exp of ['1', '2', '3']) {
      await p.selectOption('#ghs-goal', goal); await p.selectOption('#ghs-experience', exp);
      await p.evaluate(() => document.getElementById('ghs-calculate').click());
      const t = await p.textContent('#ghs-results');
      ok(/SINGLE DOSE/.test(t) && !/NaN/.test(t), `GHS ${goal}/${exp}: ${(t.match(/(\d+) mcg/)||[])[0]} ${(t.match(/(\d)x daily/)||[])[0]}`);
    }
    state.dialogs.length = 0;
    await setv('#ghs-age', 10); await p.evaluate(() => document.getElementById('ghs-calculate').click());
    ok(state.dialogs.length === 1, 'age 10 rejected'); await setv('#ghs-age', 35);
  });

  await step('analysis: GLP-1 calculator all combos', async () => {
    for (const d of ['none', 'pre', 'type2']) for (const t of ['low', 'medium', 'high']) for (const bmi of [22, 28, 35, 50]) {
      await p.selectOption('#glp1-diabetes', d); await p.selectOption('#glp1-tolerance', t); await setv('#glp1-bmi', bmi);
      await p.evaluate(() => document.getElementById('glp1-calculate').click());
      const txt = await p.textContent('#glp1-results');
      const bad = !/0\.25 mg weekly/.test(txt) || !/2\.5 mg weekly/.test(txt) || !/2\.4 mg weekly/.test(txt) || !/15 mg weekly/.test(txt) || /NaN/.test(txt);
      if (bad) ok(false, `GLP-1 ${d}/${t}/${bmi} wrong values`);
      if (bmi < 27 && !/under 27/.test(txt)) ok(false, `low-BMI warning missing for ${bmi}`);
      if (d === 'type2' && !/type 2 diabetes/.test(txt)) ok(false, 'diabetes warning missing');
      if (t === 'low' && !/every 8 weeks/.test(txt)) ok(false, 'low tolerance should slow titration');
    }
    ok(true, 'GLP-1 36 combos checked');
  });

  await step('analysis: Advanced calculator all offered combos', async () => {
    let n = 0;
    for (const pep of ['bpc157', 'tb500', 'ghrp2', 'ipamorelin']) {
      await p.selectOption('#adv-peptide', pep);
      const conds = await p.$$eval('#adv-condition option', o => o.map(x => x.value));
      ok(conds.length >= 2, `${pep} offers conditions: ${conds}`);
      ok(await p.evaluate((pep) => conds => conds.every(c => c in ADV_BASE_DOSING[pep]), pep).then(f => p.evaluate(([pep, conds]) => conds.every(c => c in ADV_BASE_DOSING[pep]), [pep, conds])), `${pep} offers only supported conditions`);
      for (const cond of conds) for (const act of ['1', '5']) {
        await p.selectOption('#adv-condition', cond); await p.selectOption('#adv-activity', act);
        await p.evaluate(() => document.getElementById('adv-calculate').click());
        const t = await p.textContent('#adv-results'); n++;
        const dose = parseInt((t.match(/ADJUSTED DOSE:\s*(\d+) mcg/) || [])[1]);
        if (!(dose > 0) || /NaN/.test(t)) ok(false, `ADV ${pep}/${cond}/${act}: ${dose}`);
      }
    }
    ok(true, `Advanced ${n} combos`);
    // 200 lbs 70in 35y, 15% bf, athlete, bpc157 musculoskeletal: LBM = .407*90.72+.267*177.8-19.2 = 65.17; *8*1.3*1 = 644
    await p.selectOption('#adv-peptide', 'bpc157'); await p.selectOption('#adv-condition', 'musculoskeletal'); await p.selectOption('#adv-activity', '5');
    await p.evaluate(() => document.getElementById('adv-calculate').click());
    ok(/ADJUSTED DOSE:\s*644 mcg/.test((await p.textContent('#adv-results')).replace(/\s+/g, ' ')) || /644 mcg/.test(await p.textContent('#adv-results')), 'known case = 644 mcg: ' + (await p.textContent('#adv-results')).match(/\d+ mcg/));
    state.dialogs.length = 0;
    await setv('#adv-height', 5); await p.evaluate(() => document.getElementById('adv-calculate').click());
    ok(state.dialogs.length === 1, 'absurd height rejected'); await setv('#adv-height', 70);
  });

  process.exit(await finish() ? 1 : 0);
})();
