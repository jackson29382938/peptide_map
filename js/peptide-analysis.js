// Comprehensive Peptide Analysis Calculators

function initializePeptideAnalysis() {
  const analysisToggle = document.getElementById("peptide-analysis-toggle");
  const tabPanel = document.getElementById("tab-panel");
  const analysisTab = document.querySelector('[data-tab="analysis"]');

  if (!analysisToggle || !tabPanel || !analysisTab) {
    console.error("❌ Peptide analysis UI elements not found");
    return;
  }

  // Open tab panel and switch to analysis tab when button clicked
  analysisToggle.addEventListener("click", () => {
    const tabToggle = document.getElementById("tab-toggle");
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
    const weight = parseFloat(weightInput.value);
    const severity = parseInt(severityInput.value);
    const condition = conditionInput.value;

    if (isNaN(weight) || weight <= 0) {
      alert("Please enter a valid weight");
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

    const singleDose = Math.round(weight * baseDosePerKg);
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
    const weight = parseFloat(weightInput.value);
    const age = parseInt(ageInput.value);
    const experience = parseInt(expInput.value);
    const goal = goalInput.value;

    if (isNaN(weight) || weight <= 0 || isNaN(age) || age <= 0) {
      alert("Please enter valid weight and age");
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

    const singleDose = Math.round(weight * adjustedDose);
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
            </div>
        `;
    resultsDiv.style.display = "block";
  });
}

// GLP-1 Dosing Calculator
function initGLP1Calculator() {
  const weightInput = document.getElementById("glp1-weight");
  const bmiInput = document.getElementById("glp1-bmi");
  const diabetesInput = document.getElementById("glp1-diabetes");
  const toleranceInput = document.getElementById("glp1-tolerance");
  const calculateBtn = document.getElementById("glp1-calculate");
  const resultsDiv = document.getElementById("glp1-results");

  if (!weightInput || !calculateBtn) return;

  calculateBtn.addEventListener("click", () => {
    const weight = parseFloat(weightInput.value);
    const bmi = parseFloat(bmiInput.value);
    const diabetes = diabetesInput.value;
    const tolerance = toleranceInput.value;

    if (isNaN(weight) || weight <= 0 || isNaN(bmi) || bmi <= 0) {
      alert("Please enter valid weight and BMI");
      return;
    }

    const baseDoses = {
      semaglutide: 0.25,
      liraglutide: 0.6,
      tirzepatide: 2.5,
    };

    const bmiFactor = Math.min(2.0, bmi / 25);
    const diabetesFactor = { none: 1.0, pre: 1.1, type2: 1.2 };
    const toleranceFactor = { low: 0.8, medium: 1.0, high: 1.2 };

    let resultsHtml =
      '<div class="calc-results active"><h3>GLP-1 Dosing Recommendations:</h3>';

    for (const [peptide, baseDose] of Object.entries(baseDoses)) {
      const adjustedDose = (
        baseDose *
        bmiFactor *
        diabetesFactor[diabetes] *
        toleranceFactor[tolerance]
      ).toFixed(2);
      const maxDose = (parseFloat(adjustedDose) * 8).toFixed(2);
      const titrationWeeks = tolerance === "high" ? 4 : 6;

      const peptideName = peptide.charAt(0).toUpperCase() + peptide.slice(1);

      resultsHtml += `
                <div class="result-card" style="margin-bottom: 20px;">
                    <h4 style="color: var(--text-accent); margin-bottom: 15px;">${peptideName}</h4>
                    <div class="result-details">
                        <div class="result-item">
                            <span class="result-label">STARTING DOSE:</span>
                            <span class="result-value highlight">${adjustedDose} mg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">MAX DOSE:</span>
                            <span class="result-value">${maxDose} mg</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">TITRATION PERIOD:</span>
                            <span class="result-value">${titrationWeeks} weeks</span>
                        </div>
                    </div>
                </div>
            `;
    }

    resultsHtml += "</div>";
    resultsDiv.innerHTML = resultsHtml;
    resultsDiv.style.display = "block";
  });
}

// Advanced Dosing Calculator
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

  calculateBtn.addEventListener("click", () => {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const age = parseInt(ageInput.value);
    const bodyFat = parseFloat(bfInput.value);
    const activity = parseInt(activityInput.value);
    const peptide = peptideInput.value;
    const condition = conditionInput.value;

    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
      alert("Please enter valid values");
      return;
    }

    // Calculate Lean Body Mass (Boer formula for men)
    const lbm = 0.407 * weight + 0.267 * height - 19.2;

    const activityFactor = { 1: 0.9, 2: 1.0, 3: 1.1, 4: 1.2, 5: 1.3 };
    const ageFactor = Math.max(0.7, 1.0 - (Math.max(age, 30) - 30) * 0.01);

    const baseDosing = {
      bpc157: { musculoskeletal: 8, gut: 5, neurological: 7 },
      tb500: { acute: 60, chronic: 35, maintenance: 20 },
      ghrp2: { anti_aging: 1.5, recovery: 2.0, muscle_growth: 2.5 },
      ipamorelin: { anti_aging: 1.2, recovery: 1.8, muscle_growth: 2.2 },
    };

    const baseDose = baseDosing[peptide]?.[condition] || 1.0;
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
                            <span class="result-value">${Math.round((lbm / weight) * 100)}%</span>
                        </div>
                    </div>
                </div>
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
