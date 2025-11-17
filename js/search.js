// Search functionality for injury database with fuzzy matching
function initializeSearch() {
  // Check if required data is available
  if (typeof regions === "undefined" || typeof regionInjuries === "undefined") {
    console.error("❌ Cannot initialize search - region data not available");
    // Wait a bit and try again
    setTimeout(() => {
      if (
        typeof regions !== "undefined" &&
        typeof regionInjuries !== "undefined"
      ) {
        console.log("✅ Retrying search initialization");
        initializeSearch();
      } else {
        console.error(
          "❌ Search initialization failed - region data still not available",
        );
      }
    }, 100);
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
    console.error("❌ Search UI elements not found");
    return;
  }

  let currentResults = [];
  let selectedIndex = -1;
  const studiesData = Array.isArray(window.peptideStudies)
    ? window.peptideStudies
    : [];

  console.log("✅ Search initialized");

  // Toggle search expansion
  searchToggle.addEventListener("click", () => {
    const isExpanded = searchContainer.classList.contains("expanded");
    if (isExpanded) {
      clearSearch();
      return;
    }

    searchContainer.classList.remove("collapsed");
    searchContainer.classList.add("expanded");
    // Reset position for expanded state
    searchContainer.style.left = "50%";
    searchContainer.style.top = "20px";
    setTimeout(() => searchInput.focus(), 100);
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

    // Search through body parts/regions
    for (const regionName of Object.keys(regionInjuries)) {
      const matchResult = fuzzyMatch(regionName, query);
      if (matchResult.matched) {
        const injuries = regionInjuries[regionName];
        results.push({
          type: "region",
          injury: regionName,
          region: regionName,
          score: matchResult.score + 100, // Boost region matches
          isExact: matchResult.exactMatch,
          displayText: `📍 ${regionName} (Body Part)`,
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

    if (results.length === 0) {
      searchResults.innerHTML =
        '<div class="no-results">No injuries or body parts found.</div>';
      searchResults.classList.add("active");
      return;
    }

    results.forEach((result, index) => {
      const item = document.createElement("div");
      item.className = "search-result-item";
      item.dataset.index = index;

      if (result.type === "region") {
        item.innerHTML = `
                    <div class="result-injury">${highlightFuzzyMatch(result.injury, query, result.isExact)}</div>
                    <div class="result-region">Body Part</div>
                `;
      } else {
        if (result.type === "study") {
          item.innerHTML = `
                        <div class="result-injury">${highlightFuzzyMatch(result.studyName, query, result.isExact)}</div>
                        <div class="result-region">📚 ${escapeHtml(result.studySource)}</div>
                        <div class="result-snippet">${result.snippet}</div>
                    `;
        } else {
          item.innerHTML = `
                    <div class="result-injury">${highlightFuzzyMatch(result.injury, query, result.isExact)}</div>
                    <div class="result-region">📍 ${result.region}</div>
                `;
        }
      }

      // Click handler to highlight region
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
    if (result.type === "study") {
      selectStudyFromResult(result);
    } else {
      selectRegionFromResult(result);
    }
  }

  // Select region from search result
  function selectRegionFromResult(result) {
    selectRegion(result.region);
    // Clear and collapse search immediately
    clearSearch();
  }

  function selectStudyFromResult(result) {
    if (typeof showStudyDetails === "function") {
      showStudyDetails(result.studyId);
    } else {
      console.warn(
        "⚠️ Study selection requested but study panel is not available",
      );
    }
    clearSearch();
  }

  // Select and highlight a specific region
  function selectRegion(regionName) {
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

    document.getElementById("panel-title").textContent = muscle;
    const portionElement = document.getElementById("panel-portion");
    if (portion) {
      portionElement.textContent = `Portion: ${portion}`;
      portionElement.style.display = "block";
    } else {
      portionElement.style.display = "none";
    }

    const injuriesList = document.getElementById("panel-injuries");
    injuriesList.innerHTML = "";
    injuries.forEach((injury) => {
      const li = document.createElement("li");
      li.textContent = injury;
      injuriesList.appendChild(li);
    });

    // Update injection procedure data
    const procedure = regionProcedures[regionName];
    const procedureSection = document.getElementById("panel-procedure");
    if (procedure) {
      procedureSection.style.display = "block";
      document.getElementById("proc-technique").textContent =
        procedure.technique || "N/A";
      document.getElementById("proc-position").textContent =
        procedure.position || "N/A";
      document.getElementById("proc-landmark").textContent =
        procedure.landmark || "N/A";
      document.getElementById("proc-needle").textContent =
        procedure.needle || "N/A";
      document.getElementById("proc-angle").textContent =
        procedure.angleDepth || "N/A";
      document.getElementById("proc-volume").textContent =
        procedure.volume || "N/A";
      document.getElementById("proc-notes").textContent =
        procedure.notes || "N/A";
    } else {
      procedureSection.style.display = "none";
    }

    // Show side panel
    const panel = document.getElementById("side-panel");
    panel.classList.add("active");

    // Hide title card
    const titleCard = document.getElementById("title-card");
    titleCard.classList.add("hidden");

    // Hide info-box
    document.getElementById("info-box").style.display = "none";
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

    // Reset transform immediately
    searchContainer.style.transform = "none";

    // Calculate and set position based on panel state
    function setSearchPosition() {
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
