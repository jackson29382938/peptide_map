// Comprehensive Peptide Analysis Calculators

const CALC_DISCLAIMER_HTML = `
    <p class="text-gray-300 text-sm" style="margin-top: 12px; font-style: italic;">
        ⚠️ Educational estimate only, not medical advice or a prescription. Doses here come from simplified
        formulas and published ranges, not from your medical history. Confirm any dose with a qualified healthcare professional.
    </p>`;

// Reject values that are clearly typos before they feed a dose formula (weight/height in metric)
function inRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function initializePeptideAnalysis() {
  const analysisToggle = document.getElementById("peptide-analysis-toggle");
  const tabPanel = document.getElementById("tab-panel");

  if (!analysisToggle || !tabPanel || !document.querySelector('[data-tab="analysis"]')) {
    console.error("❌ Peptide analysis UI elements not found");
    return;
  }

  // Open tab panel and switch to analysis tab when button clicked.
  // The tab button is looked up on every click: the tab bar is rebuilt during startup, so a
  // reference captured here would point at a detached element and clicking it would do nothing.
  analysisToggle.addEventListener("click", () => {
    const tabToggle = document.getElementById("tab-toggle");
    const analysisTab = document.querySelector('.tab-btn[data-tab="analysis"]');
    if (!tabPanel || !tabToggle || !analysisTab) return;

    const isCollapsed = tabPanel.classList.contains("collapsed");
    const isAnalysisActive = analysisTab.classList.contains("active");

    if (isCollapsed) {
      // Panel is closed: open it via the main tab toggle and show analysis tab
      tabToggle.click();
      analysisTab.click();
      return;
    }

    if (!isAnalysisActive) {
      // Panel already open on another tab: just switch to analysis
      analysisTab.click();
      return;
    }

    // Panel is open and analysis tab is already active: close the panel
    tabToggle.click();
  });

  // Initialize all calculators
  initBPC157Calculator();
  initGHSCalculator();
  initGLP1Calculator();
  initAdvancedDosing();

  // Position peptide analysis button below theme toggle
  updatePeptideAnalysisPosition();
}

// BPC-157 Dosing Calculator
function initBPC157Calculator() {
  const weightInput = document.getElementById("bpc-weight");
  const severityInput = document.getElementById("bpc-severity");
  const conditionInput = document.getElementById("bpc-condition");
  const calculateBtn = document.getElementById("bpc-calculate");
  const resultsDiv = document.getElementById("bpc-results");

  if (!weightInput || !calculateBtn) return;

  calculateBtn.addEventListener("click", () => {
    const weightValue = parseFloat(weightInput.value);
    const severity = parseInt(severityInput.value);
    const condition = conditionInput.value;

    const weightKg = window.UnitConverter ? window.UnitConverter.getWeightInKg(weightValue) : weightValue;

    if (!inRange(weightKg, 30, 250)) {
      alert("Please enter a realistic weight (roughly 66-550 lbs / 30-250 kg).");
      return;
    }

    let baseDosePerKg = 6;

    if (condition === "musculoskeletal") {
      baseDosePerKg = 8;
      if (severity === 3) baseDosePerKg = 10;
    } else if (condition === "gut") {
      baseDosePerKg = 5;
    } else if (condition === "neurological") {
      baseDosePerKg = 7;
    }

    const singleDose = Math.round(weightKg * baseDosePerKg);
    const dailyDose = singleDose * 2;
    const injectionVolume = (singleDose / 1000).toFixed(2);

    resultsDiv.innerHTML = `
            <div class="calc-results active">
                <h3>BPC-157 Dosing Results:</h3>
                <div class="result-card">
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">SINGLE DOSE:</span>
                            <span class="result-value highlight">${singleDose} mcg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">DAILY DOSE:</span>
                            <span class="result-value">${dailyDose} mcg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">DOSING FREQUENCY:</span>
                            <span class="result-value">Twice daily</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">INJECTION VOLUME:</span>
                            <span class="result-value">${injectionVolume} ml</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">CONCENTRATION ASSUMED:</span>
                            <span class="result-value">1 mg/ml</span>
                        </div>
                    </div>
                </div>
                ${CALC_DISCLAIMER_HTML}
            </div>
        `;
    resultsDiv.style.display = "block";
  });
}

// GHS Dosing Calculator
function initGHSCalculator() {
  const weightInput = document.getElementById("ghs-weight");
  const ageInput = document.getElementById("ghs-age");
  const expInput = document.getElementById("ghs-experience");
  const goalInput = document.getElementById("ghs-goal");
  const calculateBtn = document.getElementById("ghs-calculate");
  const resultsDiv = document.getElementById("ghs-results");

  if (!weightInput || !calculateBtn) return;

  calculateBtn.addEventListener("click", () => {
    const weightValue = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value);
    const experience = parseInt(expInput.value);
    const goal = goalInput.value;

    const weightKg = window.UnitConverter ? window.UnitConverter.getWeightInKg(weightValue) : weightValue;

    if (!inRange(weightKg, 30, 250) || !inRange(age, 18, 100)) {
      alert("Please enter a realistic weight and an age between 18 and 100.");
      return;
    }

    const goalMultipliers = {
      muscle_growth: 1.2,
      fat_loss: 1.0,
      recovery: 0.9,
      anti_aging: 0.8,
    };

    const experienceAdj = { 1: 0.7, 2: 1.0, 3: 1.3 };
    const ageAdj = Math.max(0.8, 1.0 - (Math.max(age, 25) - 25) * 0.01);

    const baseDosePerKg = 2.0;
    const adjustedDose =
      baseDosePerKg *
      goalMultipliers[goal] *
      experienceAdj[experience] *
      ageAdj;

    const singleDose = Math.round(weightKg * adjustedDose);
    const frequency = goal === "anti_aging" ? 2 : 3;
    const dailyDose = singleDose * frequency;

    const timings = {
      2: ["Pre-breakfast", "Pre-bed"],
      3: ["Pre-breakfast", "Pre-lunch", "Pre-bed"],
    };

    resultsDiv.innerHTML = `
            <div class="calc-results active">
                <h3>GHS Dosing Results:</h3>
                <div class="result-card">
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">SINGLE DOSE:</span>
                            <span class="result-value highlight">${singleDose} mcg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">DAILY DOSE:</span>
                            <span class="result-value">${dailyDose} mcg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">FREQUENCY:</span>
                            <span class="result-value">${frequency}x daily</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">RECOMMENDED TIMING:</span>
                            <span class="result-value">${timings[frequency].join(", ")}</span>
                        </div>
                    </div>
                </div>
                ${CALC_DISCLAIMER_HTML}
            </div>
        `;
    resultsDiv.style.display = "block";
  });
}

// GLP-1 Dosing Calculator
// Starting doses and maximums follow the published prescribing labels (weight-management schedules).
// Body weight, BMI and diabetes status do NOT raise a starting dose: these drugs are titrated up
// slowly from the label's starting dose to limit nausea and other GI effects. The only adjustment
// offered here is a slower escalation for people who expect poor tolerance.
const GLP1_LABEL = {
  semaglutide: { name: "Semaglutide", start: 0.25, max: 2.4, stepWeeks: 4, escalations: 4, unit: "mg", frequency: "weekly" },
  liraglutide: { name: "Liraglutide", start: 0.6, max: 3.0, stepWeeks: 1, escalations: 4, unit: "mg", frequency: "daily" },
  tirzepatide: { name: "Tirzepatide", start: 2.5, max: 15, stepWeeks: 4, escalations: 5, unit: "mg", frequency: "weekly" },
};

function initGLP1Calculator() {
  const weightInput = document.getElementById("glp1-weight");
  const bmiInput = document.getElementById("glp1-bmi");
  const diabetesInput = document.getElementById("glp1-diabetes");
  const toleranceInput = document.getElementById("glp1-tolerance");
  const calculateBtn = document.getElementById("glp1-calculate");
  const resultsDiv = document.getElementById("glp1-results");

  if (!weightInput || !calculateBtn) return;

  calculateBtn.addEventListener("click", () => {
    const weightValue = parseFloat(weightInput.value);
    const bmi = parseFloat(bmiInput.value);
    const diabetes = diabetesInput.value;
    const tolerance = toleranceInput.value;

    const weightKg = window.UnitConverter ? window.UnitConverter.getWeightInKg(weightValue) : weightValue;

    if (!inRange(weightKg, 30, 250) || !inRange(bmi, 10, 80)) {
      alert("Please enter a realistic weight and a BMI between 10 and 80.");
      return;
    }

    // Slower escalation (never a higher dose) when tolerance is expected to be low
    const slowFactor = tolerance === "low" ? 2 : 1;

    let resultsHtml =
      '<div class="calc-results active"><h3>GLP-1 Schedule (label-based):</h3>';

    if (bmi < 27) {
      resultsHtml += `<p class="text-gray-300 text-sm" style="margin-bottom: 12px;">
        ⚠️ A BMI under 27 is below the range where these drugs are approved for weight management
        (BMI ≥ 30, or ≥ 27 with a weight-related condition). Discuss with a clinician before considering them.</p>`;
    }
    if (diabetes === "type2") {
      resultsHtml += `<p class="text-gray-300 text-sm" style="margin-bottom: 12px;">
        ⚠️ With type 2 diabetes (especially alongside insulin or sulfonylureas) the dose and the rest of your
        medication need to be managed by your prescriber because of low-blood-sugar risk.</p>`;
    }

    for (const drug of Object.values(GLP1_LABEL)) {
      const stepWeeks = drug.stepWeeks * slowFactor;
      resultsHtml += `
                <div class="result-card" style="margin-bottom: 20px;">
                    <h4 style="color: var(--text-accent); margin-bottom: 15px;">${drug.name}</h4>
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">STARTING DOSE:</span>
                            <span class="result-value highlight">${drug.start} ${drug.unit} ${drug.frequency}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">LABEL MAXIMUM:</span>
                            <span class="result-value">${drug.max} ${drug.unit} ${drug.frequency}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">ESCALATE NO FASTER THAN:</span>
                            <span class="result-value">every ${stepWeeks} week${stepWeeks === 1 ? "" : "s"}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">TIME TO REACH MAX (earliest):</span>
                            <span class="result-value">~${stepWeeks * drug.escalations} weeks</span>
                        </div>
                    </div>
                </div>
            `;
    }

    resultsHtml += CALC_DISCLAIMER_HTML + "</div>";
    resultsDiv.innerHTML = resultsHtml;
    resultsDiv.style.display = "block";
  });
}

// Advanced Dosing Calculator
// Base dose per kg of lean body mass (mcg), keyed by peptide then condition. Only combinations
// listed here are offered; the condition dropdown is rebuilt from this table when the peptide changes.
const ADV_BASE_DOSING = {
  bpc157: { musculoskeletal: 8, gut: 5, neurological: 7 },
  tb500: { acute: 60, chronic: 35, maintenance: 20 },
  ghrp2: { anti_aging: 1.5, recovery: 2.0, muscle_growth: 2.5 },
  ipamorelin: { anti_aging: 1.2, recovery: 1.8, muscle_growth: 2.2 },
};
const ADV_CONDITION_LABELS = {
  musculoskeletal: "Musculoskeletal",
  gut: "Gut Health",
  neurological: "Neurological",
  acute: "Acute Injury",
  chronic: "Chronic",
  maintenance: "Maintenance",
  recovery: "Recovery",
  muscle_growth: "Muscle Growth",
  anti_aging: "Anti-Aging",
};

function initAdvancedDosing() {
  const weightInput = document.getElementById("adv-weight");
  const heightInput = document.getElementById("adv-height");
  const ageInput = document.getElementById("adv-age");
  const bfInput = document.getElementById("adv-bodyfat");
  const activityInput = document.getElementById("adv-activity");
  const peptideInput = document.getElementById("adv-peptide");
  const conditionInput = document.getElementById("adv-condition");
  const calculateBtn = document.getElementById("adv-calculate");
  const resultsDiv = document.getElementById("adv-results");

  if (!weightInput || !calculateBtn) return;

  // Offer only the conditions that have dosing data for the chosen peptide
  function syncConditionOptions() {
    const supported = Object.keys(ADV_BASE_DOSING[peptideInput.value] || {});
    const previous = conditionInput.value;
    conditionInput.innerHTML = supported
      .map((c) => `<option value="${c}">${ADV_CONDITION_LABELS[c] || c}</option>`)
      .join("");
    if (supported.includes(previous)) conditionInput.value = previous;
    resultsDiv.style.display = "none";
  }
  peptideInput.addEventListener("change", syncConditionOptions);
  syncConditionOptions();

  calculateBtn.addEventListener("click", () => {
    const weightValue = parseFloat(weightInput.value);
    const heightValue = parseFloat(heightInput.value);
    const age = parseInt(ageInput.value);
    const bodyFat = parseFloat(bfInput.value);
    const activity = parseInt(activityInput.value);
    const peptide = peptideInput.value;
    const condition = conditionInput.value;

    const weightKg = window.UnitConverter ? window.UnitConverter.getWeightInKg(weightValue) : weightValue;
    const heightCm = window.UnitConverter ? window.UnitConverter.getHeightInCm(heightValue) : heightValue;

    if (!inRange(weightKg, 30, 250) || !inRange(heightCm, 120, 230) || !inRange(age, 18, 100)) {
      alert("Please enter a realistic weight, height and an age between 18 and 100.");
      return;
    }

    const lbm = 0.407 * weightKg + 0.267 * heightCm - 19.2;

    const activityFactor = { 1: 0.9, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3 };
    const ageFactor = Math.max(0.7, 1.0 - (Math.max(age, 30) - 30) * 0.01);

    const baseDose = ADV_BASE_DOSING[peptide]?.[condition];
    if (baseDose === undefined) {
      // Never invent a number for a peptide/condition pair that has no dosing data
      resultsDiv.innerHTML = `<div class="calc-results active"><p class="text-gray-300 text-sm">No dosing data for this peptide and condition combination. Choose one of the listed conditions.</p></div>`;
      resultsDiv.style.display = "block";
      return;
    }
    const adjustedDose = Math.round(
      baseDose * lbm * activityFactor[activity] * ageFactor,
    );

    resultsDiv.innerHTML = `
            <div class="calc-results active">
                <h3>Advanced Dosing Results:</h3>
                <div class="result-card">
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">LEAN BODY MASS:</span>
                            <span class="result-value">${lbm.toFixed(1)} kg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">ADJUSTED DOSE:</span>
                            <span class="result-value highlight">${adjustedDose} mcg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">ACTIVITY MULTIPLIER:</span>
                            <span class="result-value">${activityFactor[activity]}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">AGE MULTIPLIER:</span>
                            <span class="result-value">${ageFactor.toFixed(2)}</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">LBM % OF TOTAL:</span>
                            <span class="result-value">${Math.round((lbm / weightKg) * 100)}%</span>
                        </div>
                    </div>
                </div>
                ${CALC_DISCLAIMER_HTML}
            </div>
        `;
    resultsDiv.style.display = "block";
  });
}

// Position peptide analysis button
function updatePeptideAnalysisPosition() {
  const btn = document.getElementById("peptide-analysis-toggle");

  if (!btn) return;

  let toggleLeft = 20;
  if (typeof getLeftControlBase === "function") {
    toggleLeft = getLeftControlBase();
  }

  btn.style.left = `${toggleLeft}px`;
  btn.style.top = "210px";
}

// Expose function globally
window.updatePeptideAnalysisPosition = updatePeptideAnalysisPosition;
