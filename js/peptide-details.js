(function() {
  'use strict';

  const peptideDetailsState = {
    currentPeptide: null,
  };

  // Ensure PEPTIDES_DATABASE is available
  if (typeof PEPTIDES_DATABASE === 'undefined') {
    console.error('❌ PEPTIDES_DATABASE not available - make sure search.js is loaded first');
    return;
  }

  /**
   * Open a peptide detail panel
   */
  function openPeptideDetails(peptideKey) {
    console.log(`🔬 openPeptideDetails called for: ${peptideKey}`);
    
    const peptide = PEPTIDES_DATABASE[peptideKey];
    if (!peptide) {
      console.error(`❌ Peptide not found: ${peptideKey}`);
      return;
    }

    peptideDetailsState.currentPeptide = peptideKey;

    // Generate and display the peptide details
    const panel = document.getElementById('peptide-details-panel');
    const content = document.getElementById('peptide-details-content');
    const title = document.getElementById('peptide-panel-title');

    if (!panel || !content || !title) {
      console.error('❌ Peptide details panel elements not found');
      return;
    }

    // Update title
    title.textContent = peptide.fullName;

    // Generate content
    content.innerHTML = generatePeptideDetailHTML(peptideKey, peptide);

    // Show panel
    panel.classList.remove('collapsed');
    const toggle = document.getElementById('peptide-details-toggle');
    if (toggle) {
      toggle.classList.remove('panel-collapsed');
      if (toggle.dataset.openIcon) {
        toggle.innerHTML = toggle.dataset.openIcon;
      }
    }

    console.log(`✅ Peptide details panel opened for: ${peptideKey}`);

    // Update floating controls
    if (typeof window.updateFloatingControls === 'function') {
      window.updateFloatingControls();
    }
  }

  /**
   * Generate detailed HTML for a peptide
   */
  function generatePeptideDetailHTML(peptideKey, peptide) {
    return `
      <div class="peptide-detail-card">
        <h3>Overview</h3>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Vial Amount</span>
          <span class="peptide-detail-value">${peptide.vialAmount}</span>
        </div>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Standard Dose</span>
          <span class="peptide-detail-value">${peptide.dose}</span>
        </div>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Strength</span>
          <span class="peptide-detail-value">${(peptide.strength * 100).toFixed(0)}%</span>
        </div>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Administration</span>
          <span class="peptide-detail-value">${peptide.administration}</span>
        </div>
      </div>

      <div class="peptide-detail-card">
        <h3>Key Benefits</h3>
        <ul class="peptide-benefits-list">
          ${peptide.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>

      <div class="peptide-detail-card">
        <h3>Available Forms</h3>
        <div class="peptide-forms-list">
          ${peptide.forms.map(f => `<span class="peptide-form-badge">${f}</span>`).join('')}
        </div>
      </div>

      <div class="peptide-detail-card">
        <h3>Reconstitution</h3>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Vial Amount</span>
          <span class="peptide-detail-value">${peptide.vialAmount}</span>
        </div>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Instructions</span>
          <span class="peptide-detail-value">${peptide.reconstitution}</span>
        </div>
      </div>

      <div class="peptide-detail-card">
        <h3>Quick Reference</h3>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Full Name</span>
          <span class="peptide-detail-value">${peptide.fullName}</span>
        </div>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Shortcuts</span>
          <span class="peptide-detail-value">${peptide.shortcuts.join(', ')}</span>
        </div>
        <div class="peptide-detail-row">
          <span class="peptide-detail-label">Identifier</span>
          <span class="peptide-detail-value">${peptideKey.toUpperCase()}</span>
        </div>
      </div>
    `;
  }

  /**
   * Close the peptide details panel
   */
  function closePeptideDetails() {
    console.log('❌ Closing peptide details panel');
    
    const panel = document.getElementById('peptide-details-panel');
    const toggle = document.getElementById('peptide-details-toggle');

    if (panel) {
      panel.classList.add('collapsed');
    }
    if (toggle) {
      toggle.classList.add('panel-collapsed');
      if (toggle.dataset.closedIcon) {
        toggle.innerHTML = toggle.dataset.closedIcon;
      }
    }

    peptideDetailsState.currentPeptide = null;

    // Update floating controls
    if (typeof window.updateFloatingControls === 'function') {
      window.updateFloatingControls();
    }
  }

  /**
   * Initialize peptide details system
   */
  function initializePeptideDetails() {
    console.log('🚀 Initializing Peptide Details System');
    
    // Expose API globally
    window.openPeptideDetails = openPeptideDetails;
    window.closePeptideDetails = closePeptideDetails;

    // Set up toggle button
    const toggle = document.getElementById('peptide-details-toggle');
    const panel = document.getElementById('peptide-details-panel');
    const closeBtn = document.getElementById('peptide-details-close');

    if (toggle && panel && !toggle.__bound) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 Peptide details toggle clicked');
        
        const isCollapsed = panel.classList.contains('collapsed');
        
        if (isCollapsed) {
          // Open panel only if a peptide is set
          if (peptideDetailsState.currentPeptide) {
            panel.classList.remove('collapsed');
            toggle.classList.remove('panel-collapsed');
            if (toggle.dataset.openIcon) {
              toggle.innerHTML = toggle.dataset.openIcon;
            }
          }
        } else {
          // Close panel
          closePeptideDetails();
        }

        if (typeof window.updateFloatingControls === 'function') {
          window.updateFloatingControls();
        }
      });
      toggle.__bound = true;
    }

    // Set up close button in header
    if (closeBtn && !closeBtn.__bound) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔘 Peptide details close button clicked');
        closePeptideDetails();
      });
      closeBtn.__bound = true;
    }

    // Set up drag handle
    const dragHandle = document.getElementById('peptide-details-drag-handle');
    let dragging = false;
    let startX = 0;
    let startWidth = 0;

    if (dragHandle && panel) {
      dragHandle.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
        startWidth = panel.offsetWidth;
        panel.style.transition = 'none';
        if (toggle) toggle.style.transition = 'none';
        e.preventDefault();
      });
    }

    document.addEventListener('mousemove', (e) => {
      if (dragging && panel) {
        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;
        const constrainedWidth = Math.max(300, Math.min(window.innerWidth * 0.6, newWidth));
        panel.style.width = `${constrainedWidth}px`;
        if (typeof window.updateFloatingControls === 'function') {
          window.updateFloatingControls();
        }
      }
    });

    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        panel.style.transition = 'transform 0.3s ease-in-out, background 0.3s ease';
        if (toggle) toggle.style.transition = 'left 0.3s ease-in-out, background 0.2s ease';
        if (typeof window.updateFloatingControls === 'function') {
          window.updateFloatingControls();
        }
      }
    });

    console.log('✅ Peptide Details System Initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePeptideDetails);
  } else {
    initializePeptideDetails();
  }
})();
