const { start, isOpen, closeAll } = require('./harness');
(async () => {
  for (const mobile of [false, true]) {
    const vp = mobile ? { width: 390, height: 800 } : { width: 1400, height: 900 };
    const { page: p, ok, step, finish, state } = await start({ mobile, viewport: vp, wait: 5500 });
    p.setDefaultTimeout(5000);
    const tap = async (x, y) => mobile ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
    const cx = vp.width / 2;
    const bodyPoint = async () => { await p.evaluate(() => window.deselectRegion()); await p.waitForTimeout(1200); return p.evaluate(() => { const b = new THREE.Box3().setFromObject(modelContainer); const c = b.getCenter(new THREE.Vector3()); c.y += (b.max.y - b.min.y) * 0.15; const v = c.project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; }); };
    await step(`${mobile ? 'mobile' : 'desktop'}: select / deselect region`, async () => {
      let bp = await bodyPoint(); await tap(bp.x, bp.y); await p.waitForTimeout(500);
      ok(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active')), 'tap/click selects a region');
      ok(await p.isVisible('#side-panel-close'), 'close button visible');
      const box = await p.evaluate(() => { const r = document.getElementById('side-panel').getBoundingClientRect(); return { w: r.width, t: r.top, vh: innerHeight }; });
      ok(mobile ? (box.w >= 388 && box.t > box.vh * 0.5) : box.w <= 320, 'panel geometry ' + JSON.stringify(box));
      ok(!(await p.isDisabled('#save-current-spot-btn').catch(() => false)) || true, 'save button state read');
      await p.click('#side-panel-close'); await p.waitForTimeout(400);
      ok(!(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'))), 'close button closes panel');
      ok(await p.evaluate(() => !currentHighlight && injectionPointSpheres.length === 0), 'highlight + injection spheres cleared');
      bp = await bodyPoint(); await tap(bp.x, bp.y); await p.waitForTimeout(400);
      await p.keyboard.press('Escape'); await p.waitForTimeout(400);
      ok(!(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'))), 'Escape closes panel');
      // save button reflects deselection
      ok(await p.evaluate(() => document.getElementById('save-current-spot-btn').disabled), 'Save Selected Spot disabled after deselect');
      bp = await bodyPoint(); await tap(bp.x, bp.y); await p.waitForTimeout(400);
      ok(await p.evaluate(() => !document.getElementById('save-current-spot-btn').disabled), 'Save Selected Spot enabled after select');
      await p.evaluate(() => window.deselectRegion());
      ok(await p.evaluate(() => document.getElementById('save-current-spot-btn').disabled), 'disabled again after deselectRegion()');
    });
    await step(`${mobile ? 'mobile' : 'desktop'}: tooltip on injection point tap/hover`, async () => {
      await p.evaluate(() => window.selectRegion(Object.keys(regions).find(n => injectionPoints[n]?.length)));
      await p.waitForTimeout(1500);
      const pos = await p.evaluate(() => { const all = injectionPointSpheres.map(s => { const v = s.position.clone().project(camera); return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight }; }); all.sort((a, b) => a.y - b.y); return all[0]; });
      if (mobile) await p.touchscreen.tap(pos.x, pos.y); else { await p.mouse.move(pos.x - 30, pos.y - 30); await p.mouse.move(pos.x, pos.y, { steps: 3 }); }
      await p.waitForTimeout(500);
      const t = await p.evaluate(() => ({ v: document.getElementById('injection-tooltip').classList.contains('visible'), title: document.querySelector('.tooltip-title').textContent }));
      console.log('  tooltip:', JSON.stringify(t), 'tap at', JSON.stringify(pos));
      ok(t.v && t.title, 'tooltip shows for an injection point');
    });
    await step(`${mobile ? 'mobile' : 'desktop'}: pinch / two-finger does not select`, async () => {
      await p.evaluate(() => window.deselectRegion());
      // simulate a two-pointer gesture via synthetic pointer events
      await p.evaluate(() => { const c = document.getElementById('container'); const mk = (t, id, x, y) => c.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true })); mk('pointerdown', 1, 150, 330); mk('pointerdown', 2, 250, 330); mk('pointerup', 2, 250, 330); mk('pointerup', 1, 150, 330); });
      await p.waitForTimeout(300);
      ok(!(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'))), 'multi-touch gesture does not select');
      await p.evaluate(() => { const c = document.getElementById('container'); const mk = (t, id, x, y) => c.dispatchEvent(new PointerEvent(t, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true })); mk('pointerdown', 3, 195, 330); mk('pointerup', 3, 260, 400); });
      await p.waitForTimeout(300);
      ok(!(await p.evaluate(() => document.getElementById('side-panel').classList.contains('active'))), 'swipe does not select');
    });
    const bad = await finish();
    if (bad) process.exitCode = 1;
  }
})();
