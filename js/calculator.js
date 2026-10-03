// Peptide Reconstitution Calculator with instant updates (left panel mode)
function initializeCalculator() {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const calcToggle = document.getElementById("calc-toggle");
  const calcPanel = document.getElementById("calc-panel");
  // calcClose button may not be visible in panel mode; optional
  const calcClose = document.getElementById("calc-close");

  if (!calcPanel) {
    console.error("❌ Calculator panel not found");
    return;
  }
  // Guard against double initialisation (would stack duplicate listeners)
  if (calcPanel.dataset.calcInitialized === "true") return;
  calcPanel.dataset.calcInitialized = "true";

  // Normal mode elements
  const syringeVolume = document.getElementById("syringe-volume");
  const peptideAmount = document.getElementById("peptide-amount");
  const bacWater = document.getElementById("bac-water");
  const peptideDose = document.getElementById("peptide-dose");
  const unitButtons = document.querySelectorAll(".unit-btn");

  // Result elements
  const resultInstruction = document.getElementById("result-instruction");
  const doseDisplay = document.getElementById("dose-display");
  const syringeUnits = document.getElementById("syringe-units");
  const totalDoses = document.getElementById("total-doses");
  const concentration = document.getElementById("concentration");

  // Mode toggle
  const modeButtons = document.querySelectorAll(".mode-btn");
  const normalMode = document.getElementById("normal-mode");
  const advancedMode = document.getElementById("advanced-mode");

  // Current unit state
  let currentUnit = "mcg";

  // In panel mode, opening/closing is handled by central togglePanel wiring in index.html.
  // Ensure first render happens so results are visible immediately when panel opens.
  // Also re-run when the calc panel is opened (via a MutationObserver).

  // Mode switching
  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      if (mode === "normal") {
        normalMode.classList.add("active");
        advancedMode.classList.remove("active");
      } else {
        normalMode.classList.remove("active");
        advancedMode.classList.add("active");
      }
    });
  });

  // Unit toggle
  unitButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      unitButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentUnit = btn.dataset.unit;
      calculateNormalMode();
    });
  });

  // Insulin syringes are always U-100: 100 units = 1 ml, so 1 unit = 0.01 ml
  // regardless of the syringe's capacity. Capacity (0.3 / 0.5 / 1 ml) only
  // limits how many units can physically be drawn (30 / 50 / 100).
  const UNITS_PER_ML = 100;

  function isPositive(n) {
    return Number.isFinite(n) && n > 0;
  }

  // Units to draw for a dose, or null when the inputs can't produce a result.
  function unitsForDose(vialMg, bacMl, doseMcg) {
    if (!isPositive(vialMg) || !isPositive(bacMl) || !isPositive(doseMcg)) return null;
    const mcgPerMl = (vialMg * 1000) / bacMl;
    const mlNeeded = doseMcg / mcgPerMl;
    return mlNeeded * UNITS_PER_ML;
  }

  function capacityWarning(units, syringeVol) {
    const capacity = syringeVol * UNITS_PER_ML;
    if (units > capacity) {
      return `⚠️ ${units.toFixed(1)} units is more than a ${syringeVol} ml syringe holds (${capacity} units). Use a larger syringe or reconstitute with less water.`;
    }
    return "";
  }

  // Calculate normal mode with instant updates
  function calculateNormalMode() {
    const syringeVol = parseFloat(syringeVolume.value);
    const peptideMg = parseFloat(peptideAmount.value);
    const bacMl = parseFloat(bacWater.value);
    let dose = parseFloat(peptideDose.value);

    // Convert dose to mcg if in mg
    if (currentUnit === "mg") {
      dose = dose * 1000;
    }

    const unitsNeeded = unitsForDose(peptideMg, bacMl, dose);

    if (unitsNeeded === null) {
      resultInstruction.textContent = "Enter a positive peptide amount, water volume and dose to see results.";
      doseDisplay.textContent = "—";
      syringeUnits.textContent = "—";
      totalDoses.textContent = "—";
      concentration.textContent = "—";
      return;
    }

    const concMgMl = peptideMg / bacMl;
    const totalDosesCount = Math.floor((peptideMg * 1000) / dose);
    const doseText =
      currentUnit === "mcg" ? `${dose} mcg` : `${dose / 1000} mg`;
    const warning = capacityWarning(unitsNeeded, syringeVol);

    resultInstruction.textContent =
      `To have a dose of ${doseText}, pull the syringe to ${unitsNeeded.toFixed(1)} units.` +
      (warning ? ` ${warning}` : "");
    doseDisplay.textContent = doseText;
    syringeUnits.textContent = `${unitsNeeded.toFixed(1)} units`;
    totalDoses.textContent = `${totalDosesCount} doses`;
    concentration.textContent = `${concMgMl.toFixed(2)} mg/ml`;
  }

  // Add instant update listeners to all inputs
  syringeVolume.addEventListener("change", calculateNormalMode);
  peptideAmount.addEventListener("input", calculateNormalMode);
  bacWater.addEventListener("input", calculateNormalMode);
  peptideDose.addEventListener("input", calculateNormalMode);

  // Unit converters
  const convMcg = document.getElementById("conv-mcg");
  const convMg = document.getElementById("conv-mg");
  const convMl = document.getElementById("conv-ml");
  const convUnits = document.getElementById("conv-units");

  // Mcg <-> Mg converter
  convMcg.addEventListener("input", () => {
    const mcg = parseFloat(convMcg.value);
    if (!isNaN(mcg)) {
      convMg.value = (mcg / 1000).toFixed(3);
    }
  });

  convMg.addEventListener("input", () => {
    const mg = parseFloat(convMg.value);
    if (!isNaN(mg)) {
      convMcg.value = (mg * 1000).toFixed(2);
    }
  });

  // Ml <-> Units converter
  convMl.addEventListener("input", () => {
    const ml = parseFloat(convMl.value);
    if (!isNaN(ml)) {
      convUnits.value = Math.round(ml * UNITS_PER_ML * 10) / 10;
    }
  });

  convUnits.addEventListener("input", () => {
    const units = parseFloat(convUnits.value);
    if (!isNaN(units)) {
      convMl.value = (units / UNITS_PER_ML).toFixed(2);
    }
  });

  // Advanced mode - Add blend functionality
  const addBlendBtn = document.getElementById("add-blend");
  const peptideBlends = document.getElementById("peptide-blends");
  let blendCount = 2;

  addBlendBtn.addEventListener("click", () => {
    if (blendCount >= 4) {
      alert("Maximum 4 peptides in a blend");
      return;
    }

    blendCount++;
    const n = blendCount;
    const blendHtml = `
            <div class="peptide-blend">
                <h4>Peptide ${n}</h4>
                <div class="blend-row">
                    <label for="blend-name-${n}">Peptide Name:</label>
                    <input type="text" id="blend-name-${n}" class="blend-name" placeholder="e.g., Ipamorelin">
                </div>
                <div class="blend-row">
                    <label for="blend-amount-${n}">Amount (mg):</label>
                    <input type="number" id="blend-amount-${n}" class="blend-amount" value="5" min="0.1" step="0.1">
                </div>
                <div class="blend-row">
                    <label for="blend-dosage-${n}">Dosage (mcg):</label>
                    <input type="number" id="blend-dosage-${n}" class="blend-dosage" value="250" min="1" step="1">
                </div>
                <div class="blend-row">
                    <label for="blend-bac-${n}">BAC Used (ml):</label>
                    <input type="number" id="blend-bac-${n}" class="blend-bac" value="2" min="0.1" step="0.1">
                </div>
            </div>
        `;
    peptideBlends.insertAdjacentHTML("beforeend", blendHtml);
  });

  // Calculate blend
  const calculateBlendBtn = document.getElementById("calculate-blend");
  const blendResults = document.getElementById("blend-results");
  const blendResultsContent = document.getElementById("blend-results-content");

  calculateBlendBtn.addEventListener("click", () => {
    const blends = document.querySelectorAll(".peptide-blend");
    let resultsHtml = "";

    const syringeVol = parseFloat(syringeVolume.value);

    blends.forEach((blend, index) => {
      const name =
        blend.querySelector(".blend-name").value.trim() || `Peptide ${index + 1}`;
      const amount = parseFloat(blend.querySelector(".blend-amount").value);
      const dosage = parseFloat(blend.querySelector(".blend-dosage").value);
      const bac = parseFloat(blend.querySelector(".blend-bac").value);

      const unitsNeeded = unitsForDose(amount, bac, dosage);
      if (unitsNeeded === null) {
        resultsHtml += `
                <div class="result-card" style="margin-bottom: 20px;">
                    <h4 style="color: #ef4444; margin-bottom: 15px;">${escapeHtml(name)}</h4>
                    <p class="result-instruction">Enter a positive amount, dosage and BAC volume to calculate.</p>
                </div>`;
        return;
      }

      const concMgMl = amount / bac;
      const totalDosesCount = Math.floor((amount * 1000) / dosage);
      const warning = capacityWarning(unitsNeeded, syringeVol);

      resultsHtml += `
                <div class="result-card" style="margin-bottom: 20px;">
                    <h4 style="color: #ef4444; margin-bottom: 15px;">${escapeHtml(name)}</h4>
                    <p class="result-instruction">Pull syringe to ${unitsNeeded.toFixed(1)} units for ${dosage} mcg dose${warning ? ` ${escapeHtml(warning)}` : ""}</p>
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">DRAW SYRINGE TO:</span>
                            <span class="result-value highlight">${unitsNeeded.toFixed(1)} units</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">VIAL CONTAINS:</span>
                            <span class="result-value">${totalDosesCount} doses</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">CONCENTRATION:</span>
                            <span class="result-value">${concMgMl.toFixed(2)} mg/ml</span>
                        </div>
                    </div>
                </div>
            `;
    });

    blendResultsContent.innerHTML = resultsHtml;
    blendResults.classList.remove("hidden");
  });

  // Initial compute
  calculateNormalMode();

  // Recompute when panel becomes visible (opened)
  try {
    const obs = new MutationObserver(() => {
      const isCollapsed = calcPanel.classList.contains('collapsed');
      if (!isCollapsed) calculateNormalMode();
    });
    obs.observe(calcPanel, { attributes: true, attributeFilter: ['class'] });
  } catch (e) {
    // no-op if MutationObserver not available
  }
}
