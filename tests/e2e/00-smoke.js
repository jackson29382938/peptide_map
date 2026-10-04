const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args:['--ignore-certificate-errors','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 900 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('dialog', d => { console.log('  dialog:', d.message().slice(0,80)); d.dismiss(); });
  await p.addInitScript(() => { try { localStorage.setItem('hasSeenOnboarding','true'); } catch(e){} });
  let contactBody = null;
  await p.route('**/api/contact', async route => { contactBody = JSON.parse(route.request().postData()); await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) }); });
  await p.goto(BASE + '/index.html');
  await p.waitForTimeout(4000);
  ok(!(await p.isVisible('#onboarding-overlay.visible')), 'onboarding not shown to returning visitor');

  // Calculator: 5mg / 2ml, 250mcg => 10 units regardless of syringe
  await p.click('#calc-toggle'); await p.waitForTimeout(400);
  for (const [vol, expectWarn] of [['1', false], ['0.3', false], ['0.5', false]]) {
    await p.selectOption('#syringe-volume', vol);
    const t = await p.textContent('#syringe-units');
    ok(t.trim() === '10.0 units', `calc syringe ${vol}ml -> ${t.trim()} (expect 10.0 units)`);
  }
  await p.fill('#peptide-dose', '1000'); // 1000mcg = 0.4ml = 40 units > 30 capacity on 0.3? currently 0.5 => 50 cap
  await p.selectOption('#syringe-volume', '0.3');
  let instr = await p.textContent('#result-instruction');
  ok(/more than a 0.3 ml syringe/.test(instr), 'calc capacity warning shown: ' + instr.slice(0, 90));
  await p.fill('#bac-water', '0');
  instr = await p.textContent('#result-instruction');
  ok(/positive/.test(instr), 'calc zero water handled: ' + instr);
  await p.fill('#bac-water', '2'); await p.fill('#peptide-dose', '250'); await p.selectOption('#syringe-volume', '1');
  // advanced: add blend once (no duplicate listeners)
  await p.click('.mode-btn[data-mode="advanced"]');
  await p.click('#add-blend');
  ok((await p.$$('.peptide-blend')).length === 3, 'add blend adds exactly one');
  await p.fill('#blend-name-1', '<img src=x onerror=window.__xss=1>');
  await p.click('#calculate-blend'); await p.waitForTimeout(200);
  ok(!(await p.evaluate(() => window.__xss)), 'blend name not injected as HTML');
  // toggle calc closed/open again then add blend -> still 1 extra
  await p.click('#calc-toggle'); await p.click('#calc-toggle'); await p.waitForTimeout(300);
  await p.click('#add-blend');
  ok((await p.$$('.peptide-blend')).length === 4, 'add blend after reopen still adds exactly one');
  await p.click('#calc-toggle');

  // Contact form
  await p.click('#contact-toggle'); await p.waitForTimeout(300);
  await p.fill('#contact-email', 'bad'); await p.fill('#contact-message', 'hello there friend');
  await p.click('#contact-submit');
  ok(/valid email/.test(await p.textContent('#contact-status')), 'contact rejects bad email');
  await p.fill('#contact-email', 'a@b.co'); await p.fill('#contact-message', 'short');
  await p.click('#contact-submit');
  ok(/at least 10/.test(await p.textContent('#contact-status')), 'contact rejects short message');
  await p.fill('#contact-message', 'This is a real message');
  await p.click('#contact-submit'); await p.waitForTimeout(500);
  ok(contactBody && contactBody.email === 'a@b.co' && contactBody.website === '', 'contact posts JSON with empty honeypot');
  ok(/sent/i.test(await p.textContent('#contact-status')), 'contact shows success');
  ok(page_url_unchanged(p.url()), 'contact form did not navigate/reload: ' + p.url());
  await p.click('#contact-toggle');

  // Search special chars
  await p.click('#search-toggle'); await p.waitForTimeout(300);
  for (const q of ['(', '[bpc', 'bpc', '<b>']) {
    await p.fill('#search-input', q); await p.waitForTimeout(450);
  }
  await p.fill('#search-input', 'bpc'); await p.waitForTimeout(450);
  ok((await p.$$('.search-result-item')).length > 0, 'search "bpc" has results');
  await p.keyboard.press('Escape');

  // Chat
  await p.click('#chat-toggle'); await p.waitForTimeout(300);
  await p.fill('#chat-input', '<img src=x onerror=window.__xss2=1>'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
  ok(!(await p.evaluate(() => window.__xss2)), 'chat input not injected');
  await p.fill('#chat-input', 'dosing for BPC-157'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  const lastBot = await p.evaluate(() => [...document.querySelectorAll('.chat-message-bot')].pop().textContent);
  ok(/BPC-157/.test(lastBot) && /Dosing/i.test(lastBot), 'chat answers dosing for BPC-157');
  await p.fill('#chat-input', 'this attack is bad'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  const lastBot2 = await p.evaluate(() => [...document.querySelectorAll('.chat-message-bot')].pop().textContent);
  ok(!/TTA|Tetradecyl/i.test(lastBot2), 'chat does not false-match "tta" in "attack"');
  await p.click('#chat-toggle');

  // Quiz: pregnancy & semaglutide
  const quiz = async (answers, multi = {}) => {
    await p.click('#quiz-toggle'); await p.waitForTimeout(300);
    return;
  };
  await p.click('#quiz-toggle'); await p.waitForTimeout(400);
  const result = await p.evaluate(async () => {
    // drive quiz via DOM
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const root = document.getElementById('quiz-container');
    const nextBtn = () => [...root.querySelectorAll('button')].find(b => b.textContent === 'Next');
    const submit = () => [...root.querySelectorAll('button')].find(b => b.textContent === 'See Recommendations');
    const answers = { 'q-age': '60+', 'q-sex': 'male', 'q-height': '70', 'q-weight': '240', 'q-goal': 'weight_loss' };
    for (let i = 0; i < 40; i++) {
      const sel = root.querySelector('select, input[type=number]');
      if (sel && answers[sel.id] !== undefined) { sel.value = answers[sel.id]; sel.dispatchEvent(new Event('change', { bubbles: true })); await sleep(30); }
      else if (sel && sel.tagName === 'SELECT' && sel.options.length > 1) { sel.value = sel.options[1].value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      const cbs = root.querySelectorAll('input[type=checkbox]');
      if (cbs.length && cbs[0].value === 'none') { cbs[0].checked = true; cbs[0].dispatchEvent(new Event('change', { bubbles: true })); }
      if (submit()) { submit().click(); break; }
      if (nextBtn()) nextBtn().click();
      await sleep(30);
    }
    return root.innerText;
  });
  ok(/Start 0\.25 mg once weekly/.test(result) && !/1\.9\d-/.test(result), 'quiz semaglutide uses label start 0.25 mg');
  ok(/Do not use|Educational only/.test(result), 'quiz shows disclaimer');
  await p.click('#quiz-toggle');

  // Journal escaping + CSV
  await p.click('#journal-toggle'); await p.waitForTimeout(300);
  await p.fill('#journal-dose', '=1+1'); await p.selectOption('#journal-peptide', 'bpc157');
  await p.fill('#journal-notes', '<img src=x onerror=window.__xss3=1>, "quoted"');
  await p.click('.journal-submit-btn'); await p.waitForTimeout(300);
  ok(!(await p.evaluate(() => window.__xss3)), 'journal notes not injected');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#journal-export')]);
  const csv = require('fs').readFileSync(await dl.path(), 'utf8');
  ok(/"'=1\+1"/.test(csv), 'csv neutralises formula');
  ok(/"<img[^\n]*""quoted"""/.test(csv), 'csv quotes commas and quotes');
  await p.click('#journal-toggle');

  // click vs drag
  await p.mouse.move(700, 450); await p.mouse.down(); await p.mouse.move(760, 460, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(300);
  ok(!(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'))), 'dragging does not select a region');
  await p.mouse.click(700, 330); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active')), 'plain click selects a region');
  const title = await p.textContent('#panel-title'); console.log('  selected:', title);

  // saved location persists + marker restored
  await p.click('#saved-toggle'); await p.click('#save-current-spot-btn'); await p.waitForTimeout(300);
  const markers = await p.evaluate(() => scene.children.filter(c => c.name && c.name.startsWith('saved-')).length);
  ok(markers === 1, 'saved marker added to scene (' + markers + ')');
  await p.reload(); await p.waitForTimeout(4500);
  const markers2 = await p.evaluate(() => scene.children.filter(c => c.name && c.name.startsWith('saved-')).length);
  ok(markers2 === 1, 'saved marker restored after reload (' + markers2 + ')');

  // GLP-1 calculator never exceeds label values
  await p.click('#tab-toggle'); await p.waitForTimeout(300);
  await p.click('.tab-btn[data-tab="analysis"]');
  await p.fill('#glp1-bmi', '45'); await p.selectOption('#glp1-tolerance', 'high');
  await p.click('#glp1-calculate'); await p.waitForTimeout(200);
  const glp = await p.textContent('#glp1-results');
  ok(/Tirzepatide[\s\S]*2\.5 mg weekly/.test(glp) && /15 mg weekly/.test(glp) && !/7\.\d+ mg/.test(glp), 'GLP-1 uses label start/max regardless of BMI');
  ok(/not medical advice/i.test(glp), 'GLP-1 results include disclaimer');
  await p.click('#tab-toggle');

  // BPC dashboard iframe lazy
  ok(!(await p.getAttribute('#bpc157-frame', 'src')), 'BPC iframe not loaded before opening panel');
  await p.click('#bpc157-toggle'); await p.waitForTimeout(500);
  ok(!!(await p.getAttribute('#bpc157-frame', 'src')), 'BPC iframe loads when panel opens');
  await p.click('#bpc157-toggle');

  // Pregnancy => no recommendation
  await p.click('#quiz-toggle'); await p.waitForTimeout(300);
  const preg = await p.evaluate(async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const root = document.getElementById('quiz-container');
    const retake = [...root.querySelectorAll('button')].find(b => b.textContent === 'Retake Quiz');
    if (retake) retake.click();
    await sleep(50);
    const answers = { 'q-age': '31-45', 'q-sex': 'female', 'q-height': '65', 'q-weight': '150', 'q-goal': 'muscle_growth' };
    for (let i = 0; i < 40; i++) {
      const sel = root.querySelector('select, input[type=number]');
      if (sel && answers[sel.id] !== undefined) { sel.value = answers[sel.id]; sel.dispatchEvent(new Event('change', { bubbles: true })); await sleep(30); }
      else if (sel && sel.tagName === 'SELECT' && sel.options.length > 1) { sel.value = sel.options[1].value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      const cbs = root.querySelectorAll('input[type=checkbox]');
      if (cbs.length && cbs[0].value === 'none') { const preg = [...cbs].find(c => c.value === 'pregnancy'); (preg || cbs[0]).checked = true; (preg || cbs[0]).dispatchEvent(new Event('change', { bubbles: true })); }
      const submit = [...root.querySelectorAll('button')].find(b => b.textContent === 'See Recommendations');
      if (submit) { submit.click(); break; }
      const next = [...root.querySelectorAll('button')].find(b => b.textContent === 'Next');
      if (next) next.click();
      await sleep(30);
    }
    return root.innerText;
  });
  ok(/No recommendation/.test(preg) && !/CJC-1295|Ipamorelin/.test(preg), 'pregnancy yields no peptide recommendation');
  await p.click('#quiz-toggle');


  ok(errors.length === 0, 'no page errors ' + JSON.stringify(errors));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
})();
function page_url_unchanged(u) { return u === BASE + '/index.html'; }
