(function () {
  "use strict";

  const API_BASE = "php/api";

  // Seed directory used when the ratings backend (PHP/MySQL) is unreachable, e.g. on the static
  // Vercel deployment. Read-only: no ratings, comments or edits.
  const FALLBACK_VENDORS = [
    ["Peptide Sciences", "https://www.peptidesciences.com"],
    ["Science.bio", "https://science.bio"],
    ["Pure Rawz", "https://purerawz.com"],
    ["Limitless Life Nootropics (Limitless Biotech)", "https://www.limitlesslifenootropics.com"],
    ["Soma Chems", "https://somachems.com"],
    ["Core Peptides", "https://www.corepeptides.com"],
    ["Biotech Peptides", "https://biotechpeptides.com"],
    ["Phoenix Pharmaceuticals", "https://phoenixpeptide.com"],
    ["Bachem", "https://www.bachem.com"],
    ["NuScience Peptides", "https://nusciencepeptides.com"],
    ["Direct Peptides", "https://directpeptides.com"],
    ["AmbioPharm", "https://www.ambiopharm.com"],
    ["PolyPeptide Group", "https://www.polypeptide.com"],
    ["Chinese Peptide Company", "https://www.chinesepeptide.com"],
    ["rPeptide", "https://www.rpeptide.com"],
    ["AAPPTec", "https://www.aapptec.com"],
    ["CPC Scientific", "https://www.cpcscientific.com"],
    ["BCN Peptides", "https://www.bcnpeptides.com"],
    ["Auspep", "https://www.auspep.com.au"],
    ["GenScript", "https://www.genscript.com"],
    ["Advanced Peptides", "https://advancedpeptides.com"],
    ["QYAOBio (China Peptides)", "https://www.qyaobio.com"],
    ["Synpeptide", "https://www.synpeptide.com"],
    ["Synbio Technologies", "https://www.synbio-tech.com"],
    ["Peptide Institute", "https://www.peptide.co.jp"],
    ["LifeTein", "https://www.lifetein.com"],
    ["Thermo Fisher Scientific", "https://www.thermofisher.com"],
    ["AnaSpec", "https://www.anaspec.com"],
    ["Activotec", "https://www.activotec.com"],
    ["Bio-Synthesis (BSI)", "https://www.biosyn.com"],
    ["CSBio", "https://www.csbio.com"],
    ["CordenPharma", "https://www.cordenpharma.com"],
  ].map(([name, url], i) => ({ id: i + 1, name, url }));

  // Vendor add/edit is admin-only: the server checks an X-Admin-Token header. The token is kept
  // for this tab only (sessionStorage) and never written to disk.
  function getAdminToken(forcePrompt) {
    let token = "";
    try { token = sessionStorage.getItem("vendorAdminToken") || ""; } catch (e) { /* ignore */ }
    if (!token || forcePrompt) {
      token = (prompt("Admin token required to change vendors:") || "").trim();
      try { sessionStorage.setItem("vendorAdminToken", token); } catch (e) { /* ignore */ }
    }
    return token;
  }

  async function adminPost(payload) {
    const token = getAdminToken(false);
    if (!token) throw new Error("cancelled");
    const res = await fetch(`${API_BASE}/companies.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(payload),
    });
    if (res.status === 403) {
      try { sessionStorage.removeItem("vendorAdminToken"); } catch (e) { /* ignore */ }
      throw new Error("Admin token rejected");
    }
    if (!res.ok) throw new Error("Request failed");
    return res;
  }

  // State
  let offline = false;
  let vendors = [];
  let loading = false;
  let expandedComments = new Set();

  // Elements
  let panel, toggleBtn, listEl, filterInput, clearFilterBtn, addBtn;

  // Function to adjust toggle button position based on open panels
  function adjustTogglePosition() {
    if (!toggleBtn) return;

    let toggleLeft = 20;
    if (typeof getLeftControlBase === "function") {
      toggleLeft = getLeftControlBase();
    }
    toggleBtn.style.left = `${toggleLeft}px`;
  }

  function initCompaniesPanel() {
    panel = document.getElementById("companies-panel");
    toggleBtn = document.getElementById("companies-toggle");
    listEl = document.getElementById("companies-list");
    filterInput = document.getElementById("companies-filter");
    clearFilterBtn = document.getElementById("companies-clear-filter");
    addBtn = document.getElementById("companies-add");

    if (
      !panel ||
      !toggleBtn ||
      !listEl ||
      !filterInput ||
      !clearFilterBtn ||
      !addBtn
    ) {
      console.warn("Companies panel elements missing");
      return;
    }

    // Only set up listener if not already bound (to avoid duplicates)
    if (!toggleBtn.__bound) {
      toggleBtn.addEventListener("click", () => {
        const wasCollapsed = panel.classList.contains("collapsed");

        // Prefer centralized panel control to keep all toggles/panels in sync
        const tabPanel = document.getElementById("tab-panel");
        const tabToggle = document.getElementById("tab-toggle");
        const studiesPanel = document.getElementById("studies-panel");
        const studiesToggle = document.getElementById("studies-toggle");
        const quizPanel = document.getElementById("quiz-panel");
        const quizToggle = document.getElementById("quiz-toggle");
        const calcPanel = document.getElementById("calc-panel");
        const calcToggle = document.getElementById("calc-toggle");
        const contactPanel = document.getElementById("contact-panel");
        const contactToggle = document.getElementById("contact-toggle");
        const newPanel = document.getElementById("new-panel");
        const newPanelToggle = document.getElementById("new-panel-toggle");

        if (typeof window.togglePanel === "function") {
          window.togglePanel(panel, toggleBtn, [
            { panel: tabPanel, toggle: tabToggle },
            { panel: studiesPanel, toggle: studiesToggle },
            { panel: quizPanel, toggle: quizToggle },
            { panel: calcPanel, toggle: calcToggle },
            { panel: contactPanel, toggle: contactToggle },
            { panel: newPanel, toggle: newPanelToggle },
          ]);
        } else {
          panel.classList.toggle("collapsed");
          toggleBtn.textContent = wasCollapsed ? "✕" : "🏢";
        }

        if (wasCollapsed) loadVendors();

        // Adjust toggle positions after panel state change
        setTimeout(() => {
          if (typeof window.updateFloatingControls === "function") {
            window.updateFloatingControls();
          } else {
            adjustTogglePosition();
          }
        }, 50);
      });
      toggleBtn.__bound = true;
    } else {
      console.log('ℹ️ Companies toggle already bound, skipping duplicate listener');
    }

    filterInput.addEventListener("input", () => renderVendors());
    clearFilterBtn.addEventListener("click", () => {
      filterInput.value = "";
      renderVendors();
    });
    addBtn.addEventListener("click", onAddVendor);

    // Initial fetch if panel starts open
    if (!panel.classList.contains("collapsed")) loadVendors();

    // Set initial toggle button position
    adjustTogglePosition();

    // Listen for panel state changes from other panels
    const observer = new MutationObserver(() => {
      adjustTogglePosition();
    });

    const tabPanel = document.getElementById("tab-panel");
    const studiesPanel = document.getElementById("studies-panel");
    const newPanel = document.getElementById("new-panel");

    if (tabPanel) {
      observer.observe(tabPanel, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    if (studiesPanel) {
      observer.observe(studiesPanel, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
    if (newPanel) {
      observer.observe(newPanel, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  async function loadVendors() {
    if (loading) return;
    loading = true;
    listEl.innerHTML = '<div class="loading">Loading vendors…</div>';
    try {
      const res = await fetch(`${API_BASE}/companies.php`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response");
      vendors = data;
      offline = false;
    } catch (e) {
      console.warn("Vendor ratings service unavailable, showing static directory", e);
      vendors = FALLBACK_VENDORS;
      offline = true;
    } finally {
      loading = false;
    }
    renderVendors();
  }

  function getFiltered() {
    const q = (filterInput.value || "").toLowerCase().trim();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.url && v.url.toLowerCase().includes(q)),
    );
  }

  function renderVendors() {
    if (addBtn) {
      addBtn.disabled = offline;
      addBtn.title = offline ? "Adding vendors is unavailable right now" : "Add vendor";
    }
    const data = getFiltered()
      .slice()
      .sort((a, b) => {
        // Sort by avg_rating desc, then total_ratings desc, then name
        const r =
          (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0);
        if (r !== 0) return r;
        const tr =
          (parseInt(b.total_ratings) || 0) - (parseInt(a.total_ratings) || 0);
        if (tr !== 0) return tr;
        return (a.name || "").localeCompare(b.name || "");
      });

    if (data.length === 0) {
      listEl.innerHTML = '<div class="no-results">No vendors found.</div>';
      return;
    }

    const notice = offline
      ? '<div class="no-results" style="margin-bottom:12px;padding:12px 16px;text-align:left;font-size:0.85rem;font-style:normal;">Community ratings and comments are unavailable right now, so this is the plain vendor directory. Listings are not endorsements and are not vetted for quality, legality or purity; see the Links Disclaimer.</div>'
      : "";
    listEl.innerHTML = notice + data.map((v) => (offline ? renderOfflineCard(v) : renderVendorCard(v))).join("");
    // Attach handlers
    if (!offline) data.forEach((v) => attachCardHandlers(v.id));
  }

  function renderStars(avgRating, totalRatings) {
    const rating = parseFloat(avgRating) || 0;
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    let html =
      '<div class="star-rating" title="' + rating.toFixed(1) + ' out of 5">';
    for (let i = 0; i < fullStars; i++) html += "★";
    if (hasHalf) html += "⯨";
    for (let i = 0; i < emptyStars; i++) html += "☆";
    html +=
      ' <span class="rating-text">' +
      rating.toFixed(1) +
      " (" +
      totalRatings +
      ")</span>";
    html += "</div>";
    return html;
  }

  // Only http(s) links are ever rendered as hrefs (blocks javascript: and data: URLs
  // that could be stored through the add/edit vendor API)
  function safeHref(url) {
    return /^https?:\/\//i.test(url || "") ? url : "#";
  }

  function renderOfflineCard(v) {
    return `
        <div class="company-card" id="company-${v.id}" data-vendor-id="${v.id}">
            <div class="company-header">
                <div class="vendor-name-row">
                    <span class="company-name">${escapeHtml(v.name || "")}</span>
                </div>
            </div>
            <div class="vendor-url-row">
                <a href="${escapeHtml(safeHref(v.url))}" target="_blank" rel="noopener noreferrer" class="company-visit">${escapeHtml((v.url || "").replace(/^https?:\/\//i, ""))} 🔗</a>
            </div>
        </div>`;
  }

  function renderVendorCard(v) {
    const safeName = escapeHtml(v.name || "");
    const safeUrl = escapeHtml(v.url || "");
    const avgRating = parseFloat(v.avg_rating) || 0;
    const totalRatings = parseInt(v.total_ratings) || 0;
    const totalComments = parseInt(v.total_comments) || 0;

    return `
        <div class="company-card" id="company-${v.id}" data-vendor-id="${v.id}">
            <div class="company-header">
                <div class="vendor-name-row">
                    <input class="company-name" data-id="${v.id}" value="${safeName}" readonly/>
                </div>
                <button class="company-edit" data-id="${v.id}" title="Edit vendor">✏️</button>
            </div>
            <div class="vendor-url-row">
                <input class="company-url" data-id="${v.id}" value="${safeUrl}" readonly/>
                <a href="${escapeHtml(safeHref(v.url))}" target="_blank" rel="noopener noreferrer" class="company-visit" title="Visit website">🔗</a>
            </div>
            <div class="company-rating">
                ${renderStars(avgRating, totalRatings)}
                <div class="rating-breakdown">
                    <div class="breakdown-row"><span>5★</span><div class="bar"><div class="fill" style="width:${totalRatings > 0 ? (v.star_5 / totalRatings) * 100 : 0}%"></div></div><span>${v.star_5 || 0}</span></div>
                    <div class="breakdown-row"><span>4★</span><div class="bar"><div class="fill" style="width:${totalRatings > 0 ? (v.star_4 / totalRatings) * 100 : 0}%"></div></div><span>${v.star_4 || 0}</span></div>
                    <div class="breakdown-row"><span>3★</span><div class="bar"><div class="fill" style="width:${totalRatings > 0 ? (v.star_3 / totalRatings) * 100 : 0}%"></div></div><span>${v.star_3 || 0}</span></div>
                    <div class="breakdown-row"><span>2★</span><div class="bar"><div class="fill" style="width:${totalRatings > 0 ? (v.star_2 / totalRatings) * 100 : 0}%"></div></div><span>${v.star_2 || 0}</span></div>
                    <div class="breakdown-row"><span>1★</span><div class="bar"><div class="fill" style="width:${totalRatings > 0 ? (v.star_1 / totalRatings) * 100 : 0}%"></div></div><span>${v.star_1 || 0}</span></div>
                </div>
            </div>
            <div class="company-actions">
                <div class="star-buttons">
                    <button class="star-btn" data-id="${v.id}" data-rating="5" title="5 stars">★★★★★</button>
                    <button class="star-btn" data-id="${v.id}" data-rating="4" title="4 stars">★★★★</button>
                    <button class="star-btn" data-id="${v.id}" data-rating="3" title="3 stars">★★★</button>
                    <button class="star-btn" data-id="${v.id}" data-rating="2" title="2 stars">★★</button>
                    <button class="star-btn" data-id="${v.id}" data-rating="1" title="1 star">★</button>
                </div>
                <button class="comment-btn" data-id="${v.id}">💬 Add Comment${totalComments > 0 ? " (" + totalComments + ")" : ""}</button>
            </div>
            <div class="comments-section" id="comments-${v.id}" style="display:none;">
                <div class="comments-loading">Loading comments...</div>
            </div>
        </div>`;
  }

  function attachCardHandlers(id) {
    // Star rating buttons
    document.querySelectorAll(`.star-btn[data-id="${id}"]`).forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const rating = parseInt(
          e.currentTarget.getAttribute("data-rating"),
          10,
        );
        await submitRating(id, rating);
      });
    });

    // Edit button
    const editBtn = document.querySelector(`.company-edit[data-id="${id}"]`);
    if (editBtn) editBtn.addEventListener("click", () => enableEdit(id));

    // Comment button
    const commentBtn = document.querySelector(`.comment-btn[data-id="${id}"]`);
    if (commentBtn)
      commentBtn.addEventListener("click", () => toggleComments(id));
  }

  function enableEdit(id) {
    const nameEl = document.querySelector(`.company-name[data-id="${id}"]`);
    const urlEl = document.querySelector(`.company-url[data-id="${id}"]`);
    const editBtn = document.querySelector(`.company-edit[data-id="${id}"]`);

    if (!nameEl || !urlEl || !editBtn) return;

    if (nameEl.readOnly) {
      // Enable editing
      nameEl.readOnly = false;
      urlEl.readOnly = false;
      nameEl.focus();
      editBtn.textContent = "💾";
      editBtn.title = "Save changes";
    } else {
      // Save changes
      saveEdits(id);
    }
  }

  async function submitRating(vendorId, rating) {
    try {
      const res = await fetch(`${API_BASE}/ratings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_id: vendorId, rating }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit rating");
        return;
      }
      await reloadVendor(vendorId);
      alert("Rating submitted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit rating.");
    }
  }

  async function toggleComments(id) {
    const commentsEl = document.getElementById(`comments-${id}`);
    if (!commentsEl) return;

    if (expandedComments.has(id)) {
      commentsEl.style.display = "none";
      expandedComments.delete(id);
    } else {
      commentsEl.style.display = "block";
      expandedComments.add(id);
      await loadComments(id);
    }
  }

  async function loadComments(vendorId) {
    const commentsEl = document.getElementById(`comments-${vendorId}`);
    if (!commentsEl) return;

    try {
      const res = await fetch(
        `${API_BASE}/comments.php?vendor_id=${vendorId}&limit=20`,
      );
      const comments = await res.json();

      let html =
        '<div class="comment-form"><textarea class="comment-input" id="comment-input-' + vendorId + '" placeholder="Add your comment..." maxlength="2000" aria-label="Add your comment"></textarea><button class="comment-submit" data-id="' +
        vendorId +
        '">Post Comment</button></div>';

      if (comments.length > 0) {
        html += '<div class="comments-list">';
        comments.forEach((c) => {
          const date = new Date(c.created_at).toLocaleDateString();
          html += `<div class="comment-item"><div class="comment-text">${escapeHtml(c.comment)}</div><div class="comment-date">${date}</div></div>`;
        });
        html += "</div>";
      } else {
        html +=
          '<div class="no-comments">No comments yet. Be the first to comment!</div>';
      }

      commentsEl.innerHTML = html;

      // Attach submit handler
      const submitBtn = commentsEl.querySelector(".comment-submit");
      if (submitBtn) {
        submitBtn.addEventListener("click", async () => {
          const input = commentsEl.querySelector(".comment-input");
          const comment = input?.value?.trim();
          if (!comment) {
            alert("Please enter a comment");
            return;
          }
          await submitComment(vendorId, comment);
          input.value = "";
        });
      }
    } catch (e) {
      console.error("Failed to load comments", e);
      commentsEl.innerHTML = '<div class="error">Failed to load comments</div>';
    }
  }

  async function submitComment(vendorId, comment) {
    try {
      const res = await fetch(`${API_BASE}/comments.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor_id: vendorId, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit comment");
        return;
      }
      await loadComments(vendorId);
      await reloadVendor(vendorId);
      alert("Comment posted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit comment.");
    }
  }

  async function reloadVendor(id) {
    try {
      const res = await fetch(
        `${API_BASE}/companies.php?id=${encodeURIComponent(id)}`,
      );
      const item = await res.json();
      const idx = vendors.findIndex((v) => v.id === id);
      if (idx >= 0) vendors[idx] = item;
      else vendors.push(item);
      renderVendors();
    } catch (e) {
      console.error("Failed to refresh vendor", e);
      loadVendors();
    }
  }

  async function saveEdits(id) {
    const nameEl = document.querySelector(`.company-name[data-id="${id}"]`);
    const urlEl = document.querySelector(`.company-url[data-id="${id}"]`);
    const editBtn = document.querySelector(`.company-edit[data-id="${id}"]`);
    const payload = {
      id,
      name: (nameEl?.value || "").trim(),
      url: (urlEl?.value || "").trim(),
    };

    if (!payload.name || !payload.url) {
      alert("Name and URL are required");
      return;
    }
    if (!/^https?:\/\//i.test(payload.url)) {
      alert("The vendor URL must start with http:// or https://");
      return;
    }

    try {
      await adminPost({ action: "update", ...payload });

      nameEl.readOnly = true;
      urlEl.readOnly = true;
      editBtn.textContent = "✏️";
      editBtn.title = "Edit vendor";

      await reloadVendor(id);
      alert("Changes saved!");
    } catch (e) {
      console.error(e);
      if (e.message !== "cancelled") alert(e.message === "Admin token rejected" ? e.message : "Failed to save");
    }
  }

  async function onAddVendor() {
    if (offline) {
      alert("Adding vendors is unavailable right now.");
      return;
    }
    const name = prompt("Vendor name:");
    if (!name) return;
    const url = prompt("Vendor URL (include https://):");
    if (!url) return;
    if (!/^https?:\/\//i.test(url.trim())) {
      alert("The vendor URL must start with http:// or https://");
      return;
    }
    try {
      await adminPost({ action: "add", name: name.trim(), url: url.trim() });
      await loadVendors();
      alert("Vendor added successfully!");
    } catch (e) {
      console.error(e);
      if (e.message !== "cancelled") alert(e.message === "Admin token rejected" ? e.message : "Failed to add vendor");
    }
  }

  function escapeHtml(value) {
    return value
      ? String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;")
      : "";
  }

  window.initializeCompaniesPanel = initCompaniesPanel;
})();
