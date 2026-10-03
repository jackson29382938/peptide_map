// Theme management with system preference detection
(function () {
  // localStorage can throw (blocked cookies, some private modes); the theme must still work
  function readStoredTheme() {
    try {
      const saved = localStorage.getItem("theme");
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* preference just won't persist */
    }
  }

  // Get saved theme preference or detect system preference
  function getInitialTheme() {
    const saved = readStoredTheme();
    if (saved) {
      return saved;
    }
    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }
    return "dark";
  }

  // Apply theme
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    storeTheme(theme);
    updateThemeIcon(theme);

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute("content", theme === "light" ? "#f9fafb" : "#1f2937");

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent("themeChanged", { detail: { theme } }),
    );
  }

  // Update theme toggle icon based on current theme
  function updateThemeIcon(theme) {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    const icon = themeToggle.querySelector(".theme-icon");
    if (!icon) return;

    // If dark mode, show sun icon (to switch to light)
    // If light mode, show moon icon (to switch to dark)
    if (theme === "dark") {
      icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
      themeToggle.title = "Switch to light mode";
      themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
      icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
      themeToggle.title = "Switch to dark mode";
      themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
  }

  // Toggle theme
  function toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
  }

  // Position theme toggle button below calculator button
  function updateThemePosition() {
    const themeToggle = document.getElementById("theme-toggle");
    const searchContainer = document.getElementById("search-container");

    if (
      themeToggle &&
      searchContainer &&
      searchContainer.classList.contains("collapsed")
    ) {
      // Use the same logic as search position - follow toggle button
      let toggleLeft = 20;
      if (typeof getLeftControlBase === "function") {
        toggleLeft = getLeftControlBase();
      } else {
        toggleLeft = parseInt(searchContainer.style.left, 10) || 20;
      }
      themeToggle.style.left = `${toggleLeft}px`;
      themeToggle.style.top = "160px"; // 10px below calculator button

      // Also update peptide analysis position
      if (typeof updatePeptideAnalysisPosition === "function") {
        updatePeptideAnalysisPosition();
      }
    }
  }

  // Initialize theme on page load
  function initTheme() {
    const theme = getInitialTheme();
    applyTheme(theme);

    // Set up toggle button
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    // Position theme toggle button
    updateThemePosition();

    // Expose position update function globally
    window.updateThemePosition = updateThemePosition;

    // Listen for system theme changes (if no manual preference is set)
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      mediaQuery.addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!readStoredTheme()) {
          applyTheme(e.matches ? "light" : "dark");
        }
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }

  // Expose toggle function globally if needed
  window.toggleTheme = toggleTheme;
})();
