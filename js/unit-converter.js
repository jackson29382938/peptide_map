// Global Unit Converter and State Management

const UnitConverter = (function() {
  'use strict';

  const state = {
    weightUnit: 'lbs',
    heightUnit: 'inches'
  };

  const CONVERSIONS = {
    KG_TO_LBS: 2.20462,
    LBS_TO_KG: 0.453592,
    CM_TO_INCHES: 0.393701,
    INCHES_TO_CM: 2.54
  };

  // Storage can be blocked (private mode, cookie settings); preferences just won't persist
  function safeStore(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function safeRead(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function kgToLbs(kg) {
    return kg * CONVERSIONS.KG_TO_LBS;
  }

  function lbsToKg(lbs) {
    return lbs * CONVERSIONS.LBS_TO_KG;
  }

  function cmToInches(cm) {
    return cm * CONVERSIONS.CM_TO_INCHES;
  }

  function inchesToCm(inches) {
    return inches * CONVERSIONS.INCHES_TO_CM;
  }

  function getWeightInKg(value) {
    return state.weightUnit === 'lbs' ? lbsToKg(value) : value;
  }

  function getHeightInCm(value) {
    return state.heightUnit === 'inches' ? inchesToCm(value) : value;
  }

  function setWeightUnit(unit) {
    if (unit !== 'kg' && unit !== 'lbs') {
      console.error('Invalid weight unit:', unit);
      return;
    }
    state.weightUnit = unit;
    safeStore('preferredWeightUnit', unit);
    window.dispatchEvent(new CustomEvent('weightUnitChanged', { detail: { unit } }));
  }

  function setHeightUnit(unit) {
    if (unit !== 'cm' && unit !== 'inches') {
      console.error('Invalid height unit:', unit);
      return;
    }
    state.heightUnit = unit;
    safeStore('preferredHeightUnit', unit);
    window.dispatchEvent(new CustomEvent('heightUnitChanged', { detail: { unit } }));
  }

  function getWeightUnit() {
    return state.weightUnit;
  }

  function getHeightUnit() {
    return state.heightUnit;
  }

  function updateInputAttributes(input, unit) {
    if (!input) return;
    
    if (unit === 'lbs' || unit === 'kg') {
      if (unit === 'lbs') {
        input.min = 100;
        input.max = 500;
        input.step = 1;
      } else {
        input.min = 40;
        input.max = 200;
        input.step = 1;
      }
    } else if (unit === 'inches' || unit === 'cm') {
      if (unit === 'inches') {
        input.min = 48;
        input.max = 84;
        input.step = 1;
      } else {
        input.min = 120;
        input.max = 230;
        input.step = 1;
      }
    }
  }

  function createUnitToggle(type, defaultValue) {
    const container = document.createElement('span');
    container.className = 'unit-toggle-container';
    container.style.cssText = 'display: inline-flex; gap: 4px; margin-left: 8px; font-size: 0.9em;';
    
    const units = type === 'weight' ? ['lbs', 'kg'] : ['inches', 'cm'];
    const currentUnit = type === 'weight' ? state.weightUnit : state.heightUnit;
    
    units.forEach(unit => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = unit;
      btn.className = 'unit-toggle-btn' + (unit === currentUnit ? ' active' : '');
      btn.dataset.unit = unit;
      btn.dataset.type = type;
      btn.style.cssText = `
        padding: 2px 8px;
        border: 1px solid var(--border-primary);
        background: ${unit === currentUnit ? 'var(--text-accent)' : 'transparent'};
        color: ${unit === currentUnit ? '#fff' : 'var(--text-secondary)'};
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85em;
        transition: all 0.2s ease;
      `;
      container.appendChild(btn);
    });
    
    return container;
  }

  // Every attached toggle: { toggle, inputId, type }. The unit is a single global setting, so a
  // change must convert and relabel EVERY field of that type -- otherwise one calculator could be
  // switched to kg while another still shows "200 lbs" but is computed as 200 kg.
  const attached = [];

  function paintToggle(toggle, unit) {
    toggle.querySelectorAll('.unit-toggle-btn').forEach(b => {
      const isActive = b.dataset.unit === unit;
      b.classList.toggle('active', isActive);
      b.style.background = isActive ? 'var(--text-accent)' : 'transparent';
      b.style.color = isActive ? '#fff' : 'var(--text-secondary)';
      b.setAttribute('aria-pressed', String(isActive));
    });
  }

  function convertValue(type, value, from, to) {
    if (from === to) return value;
    if (type === 'weight') return from === 'kg' ? kgToLbs(value) : lbsToKg(value);
    return from === 'cm' ? cmToInches(value) : inchesToCm(value);
  }

  function applyUnitChange(type, newUnit) {
    const oldUnit = type === 'weight' ? state.weightUnit : state.heightUnit;
    if (oldUnit === newUnit) return;

    // Prune toggles whose DOM was removed (e.g. quiz questions are re-rendered per step)
    for (let i = attached.length - 1; i >= 0; i--) {
      if (!attached[i].toggle.isConnected) attached.splice(i, 1);
    }

    if (type === 'weight') setWeightUnit(newUnit); else setHeightUnit(newUnit);

    attached.filter(a => a.type === type).forEach(({ toggle, inputId }) => {
      const input = document.getElementById(inputId);
      if (input) {
        const current = parseFloat(input.value);
        if (!isNaN(current)) {
          input.value = Math.round(convertValue(type, current, oldUnit, newUnit) * 10) / 10;
        }
        updateInputAttributes(input, newUnit);
      }
      paintToggle(toggle, newUnit);
    });
  }

  function attachUnitToggle(labelElement, inputId, type) {
    if (!labelElement) return;

    const toggle = createUnitToggle(type);
    labelElement.appendChild(toggle);
    attached.push({ toggle, inputId, type });
    paintToggle(toggle, type === 'weight' ? state.weightUnit : state.heightUnit);

    toggle.querySelectorAll('.unit-toggle-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        // The toggle lives inside a <label>; don't let the click also focus/activate the input
        e.preventDefault();
        applyUnitChange(type, this.dataset.unit);
      });
    });
  }

  function initializeAllToggles() {
    const weightInputs = [
      { labelId: null, inputId: 'bpc-weight', labelSelector: 'label[for="bpc-weight"]' },
      { labelId: null, inputId: 'ghs-weight', labelSelector: 'label[for="ghs-weight"]' },
      { labelId: null, inputId: 'glp1-weight', labelSelector: 'label[for="glp1-weight"]' },
      { labelId: null, inputId: 'adv-weight', labelSelector: 'label[for="adv-weight"]' }
    ];
    
    const heightInputs = [
      { labelId: null, inputId: 'adv-height', labelSelector: 'label[for="adv-height"]' }
    ];
    
    weightInputs.forEach(item => {
      const label = item.labelSelector ? document.querySelector(item.labelSelector) : document.getElementById(item.labelId);
      if (label && label.querySelector('.unit-toggle-container') === null) {
        attachUnitToggle(label, item.inputId, 'weight');
      }
    });
    
    heightInputs.forEach(item => {
      const label = item.labelSelector ? document.querySelector(item.labelSelector) : document.getElementById(item.labelId);
      if (label && label.querySelector('.unit-toggle-container') === null) {
        attachUnitToggle(label, item.inputId, 'height');
      }
    });
    
    // The HTML defaults (200 lbs, 70 in) are authored in imperial units. If the saved preference is
    // metric, convert them once so the number on screen matches the unit shown next to it.
    weightInputs.forEach(item => {
      const input = document.getElementById(item.inputId);
      if (input) {
        if (state.weightUnit === 'kg' && input.dataset.unitsApplied !== 'true') {
          input.value = Math.round(lbsToKg(parseFloat(input.value) || 0) * 10) / 10;
        }
        input.dataset.unitsApplied = 'true';
        updateInputAttributes(input, state.weightUnit);
      }
    });

    heightInputs.forEach(item => {
      const input = document.getElementById(item.inputId);
      if (input) {
        if (state.heightUnit === 'cm' && input.dataset.unitsApplied !== 'true') {
          input.value = Math.round(inchesToCm(parseFloat(input.value) || 0) * 10) / 10;
        }
        input.dataset.unitsApplied = 'true';
        updateInputAttributes(input, state.heightUnit);
      }
    });
  }

  function init() {
    const savedWeightUnit = safeRead('preferredWeightUnit');
    const savedHeightUnit = safeRead('preferredHeightUnit');
    
    if (savedWeightUnit === 'kg' || savedWeightUnit === 'lbs') {
      state.weightUnit = savedWeightUnit;
    }
    
    if (savedHeightUnit === 'cm' || savedHeightUnit === 'inches') {
      state.heightUnit = savedHeightUnit;
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeAllToggles);
    } else {
      setTimeout(initializeAllToggles, 100);
    }
  }

  return {
    init,
    kgToLbs,
    lbsToKg,
    cmToInches,
    inchesToCm,
    getWeightInKg,
    getHeightInCm,
    getWeightUnit,
    getHeightUnit,
    setWeightUnit,
    setHeightUnit,
    attachUnitToggle,
    initializeAllToggles
  };
})();

window.UnitConverter = UnitConverter;
