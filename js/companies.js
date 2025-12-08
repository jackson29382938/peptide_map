(function () {
  "use strict";

  const API_BASE = "php/api";

  // State
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
      vendors = await res.json();
      renderVendors();
    } catch (e) {
      console.error("Failed to load vendors", e);
      listEl.innerHTML = '<div class="error">Failed to load vendors.</div>';
    } finally {
      loading = false;
    }
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

    listEl.innerHTML = data.map((v) => renderVendorCard(v)).join("");
    // Attach handlers
    data.forEach((v) => attachCardHandlers(v.id));
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

  function getVendorBadges(v) {
    const badges = [];
    const avg = parseFloat(v.avg_rating) || 0;
    const total = parseInt(v.total_ratings) || 0;
    const comments = parseInt(v.total_comments) || 0;

    // Mock logic for badges
    if (avg >= 4.5 && total >= 5) {
      badges.push({ text: 'Community Trusted', class: 'badge-trusted', icon: '🛡️' });
    }
    if (total >= 10) {
      badges.push({ text: 'Verified', class: 'badge-verified', icon: '✅' });
    }
    // Random "Lab Tested" for demo purposes based on ID parity
    if (v.id % 3 === 0) {
      badges.push({ text: 'Lab Tested', class: 'badge-tested', icon: '🔬' });
    }

    return badges;
  }

  function renderVendorCard(v) {
    const safeName = escapeHtml(v.name || "");
    const safeUrl = escapeHtml(v.url || "");
    const avgRating = parseFloat(v.avg_rating) || 0;
    const totalRatings = parseInt(v.total_ratings) || 0;
    const totalComments = parseInt(v.total_comments) || 0;
    const badges = getVendorBadges(v);

    return `
        <div class="company-card" id="company-${v.id}" data-vendor-id="${v.id}">
            <div class="company-header">
                <div class="vendor-name-row">
                    <input class="company-name" data-id="${v.id}" value="${safeName}" readonly/>
                    <div class="vendor-badges">
                        ${badges.map(b => `<span class="vendor-badge ${b.class}" title="${b.text}">${b.icon} ${b.text}</span>`).join('')}
                    </div>
                </div>
                <button class="company-edit" data-id="${v.id}" title="Edit vendor">✏️</button>
            </div>
            <div class="vendor-url-row">
                <input class="company-url" data-id="${v.id}" value="${safeUrl}" readonly/>
                <a href="${safeUrl}" target="_blank" rel="noopener" class="company-visit" title="Visit website">🔗</a>
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
        '<div class="comment-form"><textarea class="comment-input" id="comment-input-${vendorId}" placeholder="Add your comment..." maxlength="2000"></textarea><button class="comment-submit" data-id="' +
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

    try {
      const res = await fetch(`${API_BASE}/companies.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...payload }),
      });
      if (!res.ok) throw new Error("Save failed");

      nameEl.readOnly = true;
      urlEl.readOnly = true;
      editBtn.textContent = "✏️";
      editBtn.title = "Edit vendor";

      await reloadVendor(id);
      alert("Changes saved!");
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    }
  }

  async function onAddVendor() {
    const name = prompt("Vendor name:");
    if (!name) return;
    const url = prompt("Vendor URL (include https://):");
    if (!url) return;
    try {
      const res = await fetch(`${API_BASE}/companies.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          name: name.trim(),
          url: url.trim(),
        }),
      });
      if (!res.ok) throw new Error("Add failed");
      await loadVendors();
      alert("Vendor added successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to add vendor");
    }
  }

  function escapeHtml(value) {
    return value
      ? value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;")
      : "";
  }

  window.initializeCompaniesPanel = initCompaniesPanel;
})();
