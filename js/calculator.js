// Peptide Reconstitution Calculator with instant updates (left panel mode)
function initializeCalculator() {
  const calcToggle = document.getElementById("calc-toggle");
  const calcPanel = document.getElementById("calc-panel");
  // calcClose button may not be visible in panel mode; optional
  const calcClose = document.getElementById("calc-close");

  if (!calcPanel) {
    console.error("❌ Calculator panel not found");
    return;
  }

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

  // Calculate normal mode with instant updates
  function calculateNormalMode() {
    const syringeVol = parseFloat(syringeVolume.value);
    const peptideMg = parseFloat(peptideAmount.value);
    const bacMl = parseFloat(bacWater.value);
    let dose = parseFloat(peptideDose.value);

    // Convert dose to mcg if in mg
    if (currentUnit === "mg") {
      dose = dose * 1000; // Convert mg to mcg
    }

    // Calculate concentration (mg/ml)
    const concMgMl = peptideMg / bacMl;

    // Calculate concentration (mcg/ml)
    const concMcgMl = concMgMl * 1000;

    // Calculate units per ml based on syringe volume
    // Standard: 0.3ml = 30 units, 0.5ml = 50 units, 1ml = 100 units
    const unitsPerMl = syringeVol * 100;

    // Calculate mcg per unit
    const mcgPerUnit = concMcgMl / unitsPerMl;

    // Calculate units needed for desired dose
    const unitsNeeded = dose / mcgPerUnit;

    // Calculate total doses in vial
    const totalDosesCount = Math.floor((peptideMg * 1000) / dose);

    // Update display
    const doseText =
      currentUnit === "mcg" ? `${dose} mcg` : `${dose / 1000} mg`;
    resultInstruction.textContent = `To have a dose of ${doseText}, pull the syringe to ${unitsNeeded.toFixed(1)} units.`;
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
    const syringeVol = parseFloat(syringeVolume.value);
    const unitsPerMl = syringeVol * 100;
    if (!isNaN(ml)) {
      convUnits.value = Math.round(ml * unitsPerMl);
    }
  });

  convUnits.addEventListener("input", () => {
    const units = parseFloat(convUnits.value);
    const syringeVol = parseFloat(syringeVolume.value);
    const unitsPerMl = syringeVol * 100;
    if (!isNaN(units)) {
      convMl.value = (units / unitsPerMl).toFixed(2);
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
    const blendHtml = `
            <div class="peptide-blend">
                <h4>Peptide ${blendCount}</h4>
                <div class="blend-row">
                    <label>Peptide Name:</label>
                    <input type="text" class="blend-name" placeholder="e.g., Ipamorelin">
                </div>
                <div class="blend-row">
                    <label>Amount (mg):</label>
                    <input type="number" class="blend-amount" value="5" min="1" step="0.1">
                </div>
                <div class="blend-row">
                    <label>Dosage (mcg):</label>
                    <input type="number" class="blend-dosage" value="250" min="1" step="1">
                </div>
                <div class="blend-row">
                    <label>BAC Used (ml):</label>
                    <input type="number" class="blend-bac" value="2" min="0.5" step="0.1">
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

    blends.forEach((blend, index) => {
      const name =
        blend.querySelector(".blend-name").value || `Peptide ${index + 1}`;
      const amount = parseFloat(blend.querySelector(".blend-amount").value);
      const dosage = parseFloat(blend.querySelector(".blend-dosage").value);
      const bac = parseFloat(blend.querySelector(".blend-bac").value);

      const syringeVol = parseFloat(syringeVolume.value);
      const unitsPerMl = syringeVol * 100;

      const concMgMl = amount / bac;
      const concMcgMl = concMgMl * 1000;
      const mcgPerUnit = concMcgMl / unitsPerMl;
      const unitsNeeded = dosage / mcgPerUnit;
      const totalDosesCount = Math.floor((amount * 1000) / dosage);

      resultsHtml += `
                <div class="result-card" style="margin-bottom: 20px;">
                    <h4 style="color: #ef4444; margin-bottom: 15px;">${name}</h4>
                    <p class="result-instruction">Pull syringe to ${unitsNeeded.toFixed(1)} units for ${dosage} mcg dose</p>
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
