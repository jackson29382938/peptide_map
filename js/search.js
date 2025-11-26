// Search functionality for injury database with fuzzy matching
function initializeSearch() {
  // Check if required data is available
  if (typeof regions === "undefined" || typeof regionInjuries === "undefined") {
    console.log("⏳ Waiting for region data to load...");
    // Wait for regionsReady event instead of just retrying once
    const handleRegionsReady = () => {
      if (
        typeof regions !== "undefined" &&
        typeof regionInjuries !== "undefined"
      ) {
        console.log("✅ Region data available, initializing search");
        window.removeEventListener('regionsReady', handleRegionsReady);
        window.removeEventListener('appReady', handleRegionsReady);
        initializeSearch();
      }
    };
    
    // Listen for regionsReady event
    window.addEventListener('regionsReady', handleRegionsReady, { once: true });
    // Also listen for appReady as a fallback
    window.addEventListener('appReady', handleRegionsReady, { once: true });
    
    // Fallback: retry after a delay if events don't fire
    setTimeout(() => {
      if (
        typeof regions !== "undefined" &&
        typeof regionInjuries !== "undefined"
      ) {
        console.log("✅ Retrying search initialization after timeout");
        window.removeEventListener('regionsReady', handleRegionsReady);
        window.removeEventListener('appReady', handleRegionsReady);
        initializeSearch();
      } else {
        console.warn(
          "⚠️ Search initialization delayed - region data still loading",
        );
      }
    }, 2000);
    return;
  }

  const searchContainer = document.getElementById("search-container");
  const searchToggle = document.getElementById("search-toggle");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  const searchResults = document.getElementById("search-results");

  if (
    !searchContainer ||
    !searchToggle ||
    !searchInput ||
    !searchClear ||
    !searchResults
  ) {
    console.error("❌ Search UI elements not found", {
      searchContainer: !!searchContainer,
      searchToggle: !!searchToggle,
      searchInput: !!searchInput,
      searchClear: !!searchClear,
      searchResults: !!searchResults
    });
    return;
  }

  let currentResults = [];
  let selectedIndex = -1;
  const studiesData = Array.isArray(window.peptideStudies)
    ? window.peptideStudies
    : [];

  console.log("✅ Search initialized");

  // Remove any existing listeners to prevent duplicates
  const newToggle = searchToggle.cloneNode(true);
  searchToggle.parentNode.replaceChild(newToggle, searchToggle);
  
  // Mark as bound to prevent duplicate listeners
  newToggle.__bound = true;

  // Toggle search expansion
  newToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔍 Search toggle clicked");
    
    const container = document.getElementById("search-container");
    if (!container) {
      console.error("❌ Search container not found");
      return;
    }
    
    const isExpanded = container.classList.contains("expanded");
    console.log("🔍 Search is expanded:", isExpanded);
    
    if (isExpanded) {
      clearSearch();
      return;
    }

    container.classList.remove("collapsed");
    container.classList.add("expanded");
    // Center the search bar when expanded
    container.style.left = "50%";
    container.style.top = "20px";
    container.style.transform = "translateX(-50%)";
    
    const input = document.getElementById("search-input");
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
    console.log("✅ Search expanded");
  });

  // Debounce function to limit search frequency
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Fuzzy matching algorithm - calculates similarity score
  function fuzzyMatch(text, query) {
    text = text.toLowerCase();
    query = query.toLowerCase();

    // Exact match gets highest score
    if (text.includes(query)) {
      const index = text.indexOf(query);
      return { score: 1000 - index, matched: true, exactMatch: true };
    }

    // Fuzzy matching - allows for typos
    let score = 0;
    let queryIndex = 0;
    let lastMatchIndex = -1;
    const matches = [];

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        matches.push(i);
        // Bonus for consecutive matches
        if (i === lastMatchIndex + 1) {
          score += 5;
        }
        score += 10;
        lastMatchIndex = i;
        queryIndex++;
      }
    }

    // All characters must be found
    if (queryIndex === query.length) {
      // Bonus for match at start
      if (matches[0] === 0) score += 20;
      // Penalty for spread out matches
      const spread = matches[matches.length - 1] - matches[0];
      score -= spread;

      return { score, matched: true, exactMatch: false, matches };
    }

    return { score: 0, matched: false };
  }

  // Highlight fuzzy matches in text
  function highlightFuzzyMatch(text, query, isExact) {
    if (isExact) {
      const regex = new RegExp(`(${query})`, "gi");
      return text.replace(regex, '<strong class="result-match">$1</strong>');
    }

    // For fuzzy matches, highlight matched characters
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let result = "";
    let queryIndex = 0;

    for (let i = 0; i < text.length; i++) {
      if (
        queryIndex < lowerQuery.length &&
        lowerText[i] === lowerQuery[queryIndex]
      ) {
        result += `<strong class="result-match">${text[i]}</strong>`;
        queryIndex++;
      } else {
        result += text[i];
      }
    }

    return result;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function createHighlightedSnippet(text, query, maxLength = 140) {
    if (!text) return "";
    if (!query) {
      const truncated =
        text.length > maxLength ? `${text.substring(0, maxLength)}…` : text;
      return escapeHtml(truncated);
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    let startIndex = lowerText.indexOf(lowerQuery);

    if (startIndex === -1) {
      const truncated =
        text.length > maxLength ? `${text.substring(0, maxLength)}…` : text;
      return escapeHtml(truncated);
    }

    const halfWindow = Math.floor(maxLength / 2);
    const start = Math.max(0, startIndex - halfWindow);
    const end = Math.min(
      text.length,
      startIndex + lowerQuery.length + halfWindow,
    );
    const snippet = text.substring(start, end);
    const prefix = start > 0 ? "…" : "";
    const suffix = end < text.length ? "…" : "";
    const regex = new RegExp(`(${escapeRegExp(query)})`, "ig");

    return (
      prefix +
      escapeHtml(snippet).replace(
        regex,
        '<strong class="result-match">$1</strong>',
      ) +
      suffix
    );
  }

  function escapeHtml(value) {
    return value
      ? value
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
      : "";
  }

  // Search through injuries and body parts
  function searchInjuries(query) {
    if (!query || query.length < 1) {
      searchResults.classList.remove("active");
      selectedIndex = -1;
      return;
    }

    const results = [];

    // Search through body parts/regions (highest priority: +100)
    for (const regionName of Object.keys(regionInjuries)) {
      const matchResult = fuzzyMatch(regionName, query);
      if (matchResult.matched) {
        results.push({
          type: "region",
          injury: regionName,
          region: regionName,
          score: matchResult.score + 100,
          isExact: matchResult.exactMatch,
        });
      }
    }

    // Search through injuries
    for (const [region, injuries] of Object.entries(regionInjuries)) {
      injuries.forEach((injury) => {
        const matchResult = fuzzyMatch(injury, query);
        if (matchResult.matched) {
          results.push({
            type: "injury",
            injury: injury,
            region: region,
            score: matchResult.score,
            isExact: matchResult.exactMatch,
          });
        }
      });
    }

    // Search research studies (+80 priority)
    if (studiesData.length > 0) {
      studiesData.forEach((study) => {
        const combinedText = `${study.name} ${study.description} ${study.summary || ""} ${study.source}`;
        const matchResult = fuzzyMatch(combinedText, query);
        if (matchResult.matched) {
          results.push({
            type: "study",
            studyId: study.id,
            studyName: study.name,
            studySource: study.source,
            snippet: createHighlightedSnippet(
              `${study.description} ${study.summary || ""}`,
              query,
            ),
            score: matchResult.score + 80,
            isExact: matchResult.exactMatch,
          });
        }
      });
    }

    // Search peptides database (+95 priority - just below regions)
    if (typeof window.PEPTIDES_DATABASE !== 'undefined') {
      Object.entries(window.PEPTIDES_DATABASE).forEach(([key, peptide]) => {
        const searchableFields = [
          peptide.fullName || '',
          ...(peptide.shortcuts || []),
          ...(Array.isArray(peptide.benefits) ? peptide.benefits : []),
          peptide.category || '',
          peptide.dose || '',
          peptide.vialAmount || ''
        ];
        const combinedText = searchableFields.join(' ');
        const matchResult = fuzzyMatch(combinedText, query);
        if (matchResult.matched) {
          const displayName = peptide.fullName || key;
          const shortcutsStr = peptide.shortcuts && peptide.shortcuts.length > 0 
            ? ` (${peptide.shortcuts.join(', ')})` 
            : '';
          results.push({
            type: "peptide",
            peptideKey: key,
            peptideName: displayName + shortcutsStr,
            category: peptide.category || 'Peptide',
            snippet: createHighlightedSnippet(
              (Array.isArray(peptide.benefits) && peptide.benefits.length > 0 
                ? peptide.benefits[0] 
                : peptide.dose || ''), 
              query
            ),
            score: matchResult.score + 95,
            isExact: matchResult.exactMatch,
          });
        }
      });
    }

    // Sort by relevance (higher score = better match)
    results.sort((a, b) => b.score - a.score);

    // Limit results
    currentResults = results.slice(0, 15);
    selectedIndex = -1;

    displayResults(currentResults, query);
  }

  // Display search results
  function displayResults(results, query) {
    searchResults.innerHTML = "";

    // Add close button
    const closeButton = document.createElement("button");
    closeButton.id = "search-results-close";
    closeButton.innerHTML = "✕";
    closeButton.title = "Close search results";
    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearSearch();
    });
    searchResults.appendChild(closeButton);

    if (results.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.textContent = "No injuries, body parts, peptides, or studies found.";
      searchResults.appendChild(noResults);
      searchResults.classList.add("active");
      return;
    }

    results.forEach((result, index) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.dataset.index = index;

      let injuryHtml, regionHtml, snippetHtml = '';

      if (result.type === "region") {
        injuryHtml = highlightFuzzyMatch(result.injury, query, result.isExact);
        regionHtml = 'Body Part';
      } else if (result.type === "peptide") {
        injuryHtml = highlightFuzzyMatch(result.peptideName, query, result.isExact);
        regionHtml = `💊 ${escapeHtml(result.category)}`;
        snippetHtml = result.snippet;
      } else if (result.type === "study") {
        injuryHtml = highlightFuzzyMatch(result.studyName, query, result.isExact);
        regionHtml = `📚 ${escapeHtml(result.studySource)}`;
        snippetHtml = result.snippet;
      } else { // injury
        injuryHtml = highlightFuzzyMatch(result.injury, query, result.isExact);
        regionHtml = `📍 ${result.region}`;
      }

      item.innerHTML = `
        <div class="result-injury">${injuryHtml}</div>
        <div class="result-region">${regionHtml}</div>
        ${snippetHtml ? `<div class="result-snippet">${snippetHtml}</div>` : ''}
      `;

      // Click handler
      item.addEventListener("click", () => {
        handleResultSelection(result);
      });

      searchResults.appendChild(item);
    });

    searchResults.classList.add("active");
  }

  // Update selected item highlight
  function updateSelection() {
    const items = searchResults.querySelectorAll(".search-result-item");
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add("highlighted");
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove("highlighted");
      }
    });
  }

  function handleResultSelection(result) {
    if (!result) return;

    if (result.type === "peptide") {
      selectPeptideFromResult(result);
      return;
    }
    if (result.type === "study") {
      selectStudyFromResult(result);
      return;
    }
    // region or injury
    selectRegionFromResult(result);
  }

  // Select peptide from search result
  function selectPeptideFromResult(result) {
    if (typeof showPeptideDetails === "function") {
      showPeptideDetails(result.peptideKey);
    } else {
      console.warn("⚠️ Peptide selection requested but peptide panel is not available");
    }
    clearSearch();
  }

  // Select study from search result
  function selectStudyFromResult(result) {
    openResearchPanelAndScroll(result.studyId, result.studyName);
    clearSearch();
  }

  // Open research panel and scroll to specific study
  function openResearchPanelAndScroll(studyId, studyName) {
    // Get the studies panel and toggle
    const studiesPanel = document.getElementById("studies-panel");
    const studiesToggle = document.getElementById("studies-toggle");
    const studiesList = document.getElementById("studies-list");

    if (!studiesPanel || !studiesToggle || !studiesList) {
      console.warn("⚠️ Studies panel elements not found", {
        studiesPanel: !!studiesPanel,
        studiesToggle: !!studiesToggle,
        studiesList: !!studiesList
      });
      return;
    }

    // Check if studies panel is collapsed, if so open it
    const wasCollapsed = studiesPanel.classList.contains("collapsed");
    if (wasCollapsed) {
      studiesPanel.classList.remove("collapsed");
      studiesToggle.classList.remove("panel-collapsed");
      if (studiesToggle.dataset.openIcon) {
        studiesToggle.innerHTML = studiesToggle.dataset.openIcon;
      }
      console.log('✅ Studies panel opened');
    }

    // Wait for panel to fully render/open, then search for the study
    setTimeout(() => {
      // Find the study card - look for data-study-id attribute
      let studyCard = studiesList.querySelector(`[data-study-id="${studyId}"]`);
      
      // If not found by ID, try searching by study name in the content
      if (!studyCard) {
        console.log(`🔍 Study not found by ID ${studyId}, searching by name...`);
        const allStudyItems = studiesList.querySelectorAll(".study-item, [data-study-id], .research-study");
        studyCard = Array.from(allStudyItems).find(item => {
          const textContent = item.textContent || '';
          return textContent.includes(studyName);
        });
      }

      if (studyCard) {
        // Add temporary highlight class
        studyCard.classList.add("highlighted");
        console.log(`✅ Found study card, scrolling to: ${studyName}`);
        
        // Scroll into view with smooth behavior
        studyCard.scrollIntoView({ behavior: "smooth", block: "center" });

        // Remove highlight after 5 seconds
        setTimeout(() => {
          studyCard.classList.remove("highlighted");
        }, 5000);
      } else {
        console.warn(`⚠️ Study card not found for: ${studyName} (ID: ${studyId})`);
        console.log('📋 Available study items:', studiesList.querySelectorAll(".study-item, [data-study-id], .research-study").length);
      }
    }, 350); // Wait for panel transition/animation to complete
  }

  // Select region from search result
  function selectRegionFromResult(result) {
    const regionName = result.region || result.injury;
    const highlightInjury = result.type === "injury" ? result.injury : null;
    selectRegion(regionName, highlightInjury);
    clearSearch();
  }

  // Select and highlight a specific region
  function selectRegion(regionName, highlightInjury = null) {
    // Readiness check
    if (!initState.allReady) {
      console.warn("⚠️ Cannot select region - systems not ready");
      return;
    }

    // Validate required globals
    if (typeof regions === "undefined" || !scene || !camera) {
      console.error("❌ Missing required globals for region selection");
      return;
    }

    // Find the center point of the region
    const regionBox = regions[regionName];
    if (!regionBox) {
      console.warn(`⚠️ Region "${regionName}" not found in regions data`);
      return;
    }

    const center = new THREE.Vector3();
    regionBox.getCenter(center);

    // Simulate a click on that region
    removeCurrentHighlight();
    hideSidePanel();

    // Add highlight
    addHighlightSphere(center, regionName);

    // Update side panel with region info
    const parts = regionName.split(" - ");
    const muscle = parts[0];
    const portion = parts[1];
    const injuries = regionInjuries[regionName] || ["No injuries listed"];

    const panelTitle = document.getElementById("panel-title");
    if (panelTitle) {
      panelTitle.textContent = muscle;
    }
    const portionElement = document.getElementById("panel-portion");
    if (portionElement) {
      if (portion) {
        portionElement.textContent = `Portion: ${portion}`;
        portionElement.style.display = "block";
      } else {
        portionElement.style.display = "none";
      }
    }

    const injuriesList = document.getElementById("panel-injuries");
    if (injuriesList) {
      injuriesList.innerHTML = "";
      injuries.forEach((injury) => {
        const li = document.createElement("li");
        li.textContent = injury;
        injuriesList.appendChild(li);
      });
    }

    // Update injection procedure data
    const procedure = regionProcedures[regionName];
    const procedureSection = document.getElementById("panel-procedure");
    if (procedureSection) {
      if (procedure) {
        procedureSection.style.display = "block";
        const procTechnique = document.getElementById("proc-technique");
        const procPosition = document.getElementById("proc-position");
        const procLandmark = document.getElementById("proc-landmark");
        const procNeedle = document.getElementById("proc-needle");
        const procAngle = document.getElementById("proc-angle");
        const procVolume = document.getElementById("proc-volume");
        const procNotes = document.getElementById("proc-notes");
        
        if (procTechnique) procTechnique.textContent = procedure.technique || "N/A";
        if (procPosition) procPosition.textContent = procedure.position || "N/A";
        if (procLandmark) procLandmark.textContent = procedure.landmark || "N/A";
        if (procNeedle) procNeedle.textContent = procedure.needle || "N/A";
        if (procAngle) procAngle.textContent = procedure.angleDepth || "N/A";
        if (procVolume) procVolume.textContent = procedure.volume || "N/A";
        if (procNotes) procNotes.textContent = procedure.notes || "N/A";
      } else {
        procedureSection.style.display = "none";
      }
    }

    // Show side panel
    const panel = document.getElementById("side-panel");
    if (panel) {
      panel.classList.add("active");
      // Ensure panel is scrolled to top initially
      panel.scrollTop = 0;
    }

    // If there's a specific injury to highlight, find and scroll to it
    if (highlightInjury && injuriesList) {
      const targetLi = Array.from(injuriesList.querySelectorAll("li")).find(
        li => li.textContent.trim() === highlightInjury
      );
      if (targetLi) {
        // Add temporary highlight
        targetLi.classList.add("highlighted");
        setTimeout(() => {
          targetLi.classList.remove("highlighted");
        }, 5000); // Remove after 5 seconds

        // Scroll to the injury in the list
        setTimeout(() => {
          targetLi.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300); // Small delay to allow panel to fully open/animate
      }
    }

    // Hide title card
    const titleCard = document.getElementById("title-card");
    if (titleCard) {
      titleCard.classList.add("hidden");
    }

    // Hide info-box
    const infoBox = document.getElementById("info-box");
    if (infoBox) {
      infoBox.style.display = "none";
    }
  }

  // Clear search and collapse
  function clearSearch() {
    searchInput.value = "";
    searchResults.classList.remove("active");
    searchClear.style.display = "none";
    selectedIndex = -1;
    currentResults = [];
    searchContainer.classList.remove("expanded");
    searchContainer.classList.add("collapsed");

    // Calculate and set position based on panel state
    function setSearchPosition() {
      if (searchContainer.classList.contains("collapsed")) {
        // Position on the left when collapsed
        const tabPanel = document.getElementById("tab-panel");
        let toggleLeft;
        if (typeof getLeftControlBase === "function") {
          toggleLeft = getLeftControlBase();
        } else if (tabPanel && !tabPanel.classList.contains("collapsed")) {
          toggleLeft = tabPanel.offsetWidth + 20;
        } else {
          toggleLeft = 20;
        }
        searchContainer.style.left = `${toggleLeft}px`;
        searchContainer.style.top = "60px";
        searchContainer.style.transform = "none";
        return;
      }
      
      // When expanded, it's already centered by CSS
    }

    // Set position immediately, then update again after transition
    setSearchPosition();
    setTimeout(() => {
      setSearchPosition();
      // Also call the global function if it exists to update other buttons
      if (typeof updateSearchPosition === "function") {
        updateSearchPosition();
      }
    }, 350); // Wait for transition to complete (0.3s + small buffer)
  }

  // Keyboard navigation
  searchInput.addEventListener("keydown", (e) => {
    const resultsVisible = searchResults.classList.contains("active");
    const hasResults = currentResults.length > 0;

    if (!resultsVisible || !hasResults) {
      if (e.key === "Escape") {
        clearSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % currentResults.length;
        updateSelection();
        break;

      case "ArrowUp":
        e.preventDefault();
        selectedIndex =
          selectedIndex <= 0 ? currentResults.length - 1 : selectedIndex - 1;
        updateSelection();
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
          handleResultSelection(currentResults[selectedIndex]);
        } else if (currentResults.length > 0) {
          // If nothing selected, select first result
          handleResultSelection(currentResults[0]);
        }
        break;

      case "Escape":
        clearSearch();
        break;
    }
  });

  // Event listeners
  const debouncedSearch = debounce((e) => {
    const query = e.target.value.trim();
    searchInjuries(query);
    searchClear.style.display = query ? "block" : "none";
  }, 200);

  searchInput.addEventListener("input", debouncedSearch);

  searchClear.addEventListener("click", clearSearch);

  // Close results when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      if (searchContainer.classList.contains("expanded")) {
        clearSearch();
      }
    }
  });

  // Prevent closing when clicking inside search container
  searchContainer.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}