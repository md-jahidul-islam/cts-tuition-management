/**
 * Chittagong Tutor Service (CTS) - Admin Dashboard Controller
 * Vanilla JavaScript UI orchestration, rendering, filters, modals, and event handling.
 */

(function () {
  'use strict';

  // Global state references
  const store = window.CTSStore.instance;
  const matchingEngine = window.CTSMatching;
  const postGen = window.CTSPostGenerator;

  // App UI State
  const state = {
    currentView: 'dashboard',
    activeFilters: {
      tutors: { search: '', verification: '', availability: '', area: '', gender: '' },
      requests: { search: '', status: '', area: '', curriculum: '' },
      accounts: { search: '', status: '', type: '' },
      followups: { search: '', status: '', overdueOnly: false },
      reviews: { status: '' }
    },
    activeMatchRequestId: null,
    activePostRequestId: null,
    modalPendingAction: null
  };

  // Toast Notification System
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-slate-900 border-l-4 border-amber-500 text-white',
      error: 'bg-rose-900 border-l-4 border-rose-500 text-white',
      warning: 'bg-amber-900 border-l-4 border-amber-400 text-white',
      info: 'bg-blue-950 border-l-4 border-blue-400 text-white'
    };

    toast.className = `p-4 rounded shadow-xl flex items-center justify-between min-w-[300px] max-w-md transition-all duration-300 transform translate-y-2 opacity-0 text-sm ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="font-medium">${escapeHtml(message)}</span>
      </div>
      <button class="ml-4 text-slate-400 hover:text-white" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // HTML sanitizer helper
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Format currency in BDT
  function formatBDT(amount) {
    return '৳ ' + (parseFloat(amount) || 0).toLocaleString('en-US');
  }

  // --- View Switcher ---
  function switchView(viewName) {
    state.currentView = viewName;

    // Update navigation sidebar active state
    document.querySelectorAll('.nav-link').forEach(link => {
      const target = link.getAttribute('data-view');
      if (target === viewName) {
        link.classList.add('bg-slate-800', 'text-amber-400', 'font-semibold', 'border-l-4', 'border-amber-400');
        link.classList.remove('text-slate-300', 'hover:bg-slate-800/60');
      } else {
        link.classList.remove('bg-slate-800', 'text-amber-400', 'font-semibold', 'border-l-4', 'border-amber-400');
        link.classList.add('text-slate-300', 'hover:bg-slate-800/60');
      }
    });

    // Hide all view panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    // Show target view panel
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full');
    }

    // Render corresponding view data
    renderCurrentView();
  }

  function renderCurrentView() {
    switch (state.currentView) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'tutors':
        renderTutorsList();
        break;
      case 'requests':
        renderRequestsList();
        break;
      case 'matching':
        renderMatchingDesk();
        break;
      case 'pipeline':
        renderPipelineView();
        break;
      case 'post-gen':
        renderPostGeneratorView();
        break;
      case 'accounts':
        renderAccountsView();
        break;
      case 'followups':
        renderFollowUpsView();
        break;
      case 'reviews':
        renderReviewsView();
        break;
      case 'reports':
        renderReportsView();
        break;
      case 'settings':
        renderSettingsView();
        break;
    }
  }

  // ==========================================
  // 1. DASHBOARD VIEW
  // ==========================================
  function renderDashboard() {
    const metrics = store.getMetrics();
    const settings = store.getSettings();

    // Summary Card Metrics
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('kpi-total-tutors', metrics.totalTutors);
    setText('kpi-verified-tutors', metrics.verifiedTutors);
    setText('kpi-available-tutors', metrics.availableTutors);
    setText('kpi-new-requests', metrics.newRequests);
    setText('kpi-matching-progress', metrics.matchingInProgress);
    setText('kpi-confirmed-tuitions', metrics.confirmedTuitions);
    setText('kpi-completed-tuitions', metrics.completedTuitions);
    setText('kpi-fees-collected', formatBDT(metrics.mediaFeesCollected));
    setText('kpi-fees-due', formatBDT(metrics.mediaFeesDue));
    setText('kpi-conversion-rate', `${metrics.conversionRate}%`);

    // Render Recent Activity Stream
    const activityContainer = document.getElementById('dashboard-activities');
    if (activityContainer) {
      if (metrics.recentActivities.length === 0) {
        activityContainer.innerHTML = `<div class="text-slate-400 text-sm py-4">No recent activity recorded yet.</div>`;
      } else {
        activityContainer.innerHTML = metrics.recentActivities.map(act => `
          <div class="flex items-start space-x-3 text-sm py-2.5 border-b border-slate-100 last:border-none">
            <span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">${escapeHtml(act.type)}</span>
            <div class="flex-1">
              <p class="text-slate-800 font-medium">${escapeHtml(act.text)}</p>
              <span class="text-xs text-slate-400">${escapeHtml(act.timestamp)}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Urgent Follow-ups Preview
    const urgentFollowUpsContainer = document.getElementById('dashboard-urgent-followups');
    if (urgentFollowUpsContainer) {
      const followups = store.getFollowUps().filter(f => f.status === 'Pending').slice(0, 4);
      if (followups.length === 0) {
        urgentFollowUpsContainer.innerHTML = `<div class="text-emerald-600 text-sm py-4">✓ All communication follow-ups are up to date!</div>`;
      } else {
        urgentFollowUpsContainer.innerHTML = followups.map(f => `
          <div class="p-3 mb-2 rounded border ${f.isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-slate-800 text-sm">${escapeHtml(f.targetName)}</span>
                <span class="text-xs px-2 py-0.5 rounded ${f.isOverdue ? 'bg-rose-600 text-white' : 'bg-amber-100 text-amber-800'}">
                  ${f.isOverdue ? 'OVERDUE' : escapeHtml(f.scheduledDate)}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1">${escapeHtml(f.reason)} (${escapeHtml(f.channel)})</p>
            </div>
            <button class="px-2.5 py-1 text-xs font-medium rounded bg-slate-900 text-amber-400 hover:bg-slate-800" onclick="window.CTSApp.openFollowUpModal('${f.id}')">
              Review
            </button>
          </div>
        `).join('');
      }
    }
  }

  // ==========================================
  // 2. TUTOR MANAGEMENT VIEW
  // ==========================================
  function renderTutorsList() {
    const tutors = store.getTutors();
    const filter = state.activeFilters.tutors;

    let filtered = tutors.filter(t => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchesQuery = (
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q)) ||
          (t.phone && t.phone.includes(q)) ||
          (t.university && t.university.toLowerCase().includes(q)) ||
          (t.preferredSubjects && t.preferredSubjects.join(' ').toLowerCase().includes(q))
        );
        if (!matchesQuery) return false;
      }
      if (filter.verification && t.verificationStatus !== filter.verification) return false;
      if (filter.availability && t.availability !== filter.availability) return false;
      if (filter.gender && t.gender !== filter.gender) return false;
      if (filter.area && (!t.preferredAreas || !t.preferredAreas.includes(filter.area))) return false;
      return true;
    });

    const countEl = document.getElementById('tutors-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} of ${tutors.length} Tutors`;

    const tableBody = document.getElementById('tutors-table-body');
    if (!tableBody) return;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400">
            No tutor profiles match your current search filters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(t => {
      // Verification badge styling
      let verBadge = 'bg-slate-100 text-slate-600 border border-slate-200';
      if (t.verificationStatus === 'Verified') {
        verBadge = 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold';
      } else if (t.verificationStatus === 'Under Review') {
        verBadge = 'bg-amber-100 text-amber-800 border border-amber-300';
      } else if (t.verificationStatus === 'Rejected') {
        verBadge = 'bg-rose-100 text-rose-800 border border-rose-300';
      }

      // Availability badge styling
      let availBadge = 'bg-emerald-50 text-emerald-700';
      if (t.availability === 'Busy') availBadge = 'bg-amber-50 text-amber-700';
      if (t.availability === 'Inactive') availBadge = 'bg-slate-100 text-slate-500';

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-200 text-sm">
          <td class="py-3 px-4">
            <span class="font-mono font-bold text-slate-900">${escapeHtml(t.id)}</span>
            <div class="text-xs text-slate-400">Reg: ${escapeHtml(t.registeredDate || 'N/A')}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-900 cursor-pointer hover:text-amber-600" onclick="window.CTSApp.viewTutorProfile('${t.id}')">
              ${escapeHtml(t.name)}
            </div>
            <div class="text-xs text-slate-500">${escapeHtml(t.displayPhone || t.phone)} (${escapeHtml(t.gender)})</div>
            <div class="text-xs text-slate-400">${escapeHtml(t.email || '')}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-medium text-slate-800">${escapeHtml(t.university)}</div>
            <div class="text-xs text-slate-500">${escapeHtml(t.department)} | CGPA: <span class="font-bold text-slate-700">${t.cgpa ? t.cgpa.toFixed(2) : 'N/A'}</span></div>
          </td>
          <td class="py-3 px-4">
            <div class="flex flex-wrap gap-1 max-w-xs">
              ${(t.preferredAreas || []).slice(0, 3).map(a => `<span class="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">${escapeHtml(a)}</span>`).join('')}
              ${(t.preferredAreas || []).length > 3 ? `<span class="text-xs text-slate-400">+${t.preferredAreas.length - 3} more</span>` : ''}
            </div>
            <div class="text-xs text-slate-500 mt-1">Exp: ${t.experienceYears || 0} yrs</div>
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center space-x-1.5">
              <span class="px-2 py-0.5 rounded text-xs ${verBadge}">
                ${t.verificationStatus === 'Verified' ? '✓ ' : ''}${escapeHtml(t.verificationStatus)}
              </span>
            </div>
            <div class="w-24 bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div class="bg-amber-500 h-1.5 rounded-full" style="width: ${t.profileCompleteness || 0}%"></div>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${t.profileCompleteness || 0}% complete</div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium ${availBadge}">
              ● ${escapeHtml(t.availability)}
            </span>
            <div class="text-xs text-slate-600 font-medium mt-1">
              ৳${(t.expectedSalaryMin || 0).toLocaleString()} - ${(t.expectedSalaryMax || 0).toLocaleString()}
            </div>
          </td>
          <td class="py-3 px-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end space-x-2">
              <button class="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium" onclick="window.CTSApp.viewTutorProfile('${t.id}')">
                Profile
              </button>
              <button class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 rounded font-medium" onclick="window.CTSApp.openEditTutorModal('${t.id}')">
                Edit
              </button>
              <button class="px-2 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 rounded" onclick="window.CTSApp.confirmDeleteTutor('${t.id}')" title="Delete Tutor">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 3. GUARDIAN & TUITION REQUIREMENTS VIEW
  // ==========================================
  function renderRequestsList() {
    const requests = store.getRequests();
    const filter = state.activeFilters.requests;

    let filtered = requests.filter(r => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchesQuery = (
          (r.id && r.id.toLowerCase().includes(q)) ||
          (r.guardianName && r.guardianName.toLowerCase().includes(q)) ||
          (r.studentName && r.studentName.toLowerCase().includes(q)) ||
          (r.phone && r.phone.includes(q)) ||
          (r.subjects && r.subjects.join(' ').toLowerCase().includes(q)) ||
          (r.area && r.area.toLowerCase().includes(q))
        );
        if (!matchesQuery) return false;
      }
      if (filter.status && r.status !== filter.status) return false;
      if (filter.area && r.area !== filter.area) return false;
      if (filter.curriculum && r.curriculum !== filter.curriculum) return false;
      return true;
    });

    const countEl = document.getElementById('requests-count-badge');
    if (countEl) countEl.textContent = `${filtered.length} of ${requests.length} Requests`;

    const tableBody = document.getElementById('requests-table-body');
    if (!tableBody) return;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400">
            No tuition requirements match your filters.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(r => {
      // Stage badge color
      let stageColor = 'bg-blue-50 text-blue-700 border-blue-200';
      if (r.status === 'NEW REQUEST') stageColor = 'bg-sky-100 text-sky-800 border-sky-300 font-bold';
      if (r.status === 'TRIAL CLASS') stageColor = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      if (r.status === 'CONFIRM TUITION' || r.status === 'COMPLETE') stageColor = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      if (r.status === 'COLLECT MEDIA FEE') stageColor = 'bg-purple-100 text-purple-800 border-purple-300 font-bold';

      const tutor = r.assignedTutorId ? store.getTutor(r.assignedTutorId) : null;

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-200 text-sm">
          <td class="py-3 px-4">
            <span class="font-mono font-bold text-slate-900">${escapeHtml(r.id)}</span>
            <div class="text-xs text-slate-400">${escapeHtml(r.postingDate || 'N/A')}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-900 cursor-pointer hover:text-amber-600" onclick="window.CTSApp.viewRequestDetails('${r.id}')">
              ${escapeHtml(r.guardianName)}
            </div>
            <div class="text-xs text-slate-600">Student: ${escapeHtml(r.studentName)} (${escapeHtml(r.studentGender || 'N/A')})</div>
            <div class="text-xs text-slate-400">${escapeHtml(r.displayPhone || r.phone)}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-medium text-slate-800">${escapeHtml(r.classLevel)}</div>
            <div class="text-xs text-amber-700 font-semibold">${escapeHtml(r.curriculum)}</div>
            <div class="text-xs text-slate-500 mt-0.5">${(r.subjects || []).join(', ')}</div>
          </td>
          <td class="py-3 px-4">
            <div class="font-medium text-slate-800 flex items-center">
              📍 ${escapeHtml(r.area)}
            </div>
            <div class="text-xs text-slate-500">${r.daysPerWeek ? r.daysPerWeek + ' days/wk' : 'Days flexible'} | ${escapeHtml(r.preferredTime || '')}</div>
            <div class="text-xs text-emerald-700 font-bold mt-1">Budget: ৳${(r.salaryBudget || 0).toLocaleString()}</div>
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 rounded text-xs border ${stageColor}">
              ${escapeHtml(r.status)}
            </span>
            <div class="text-xs text-slate-500 mt-1.5">
              ${tutor ? `Assigned: <strong class="text-slate-800">${escapeHtml(tutor.name)}</strong>` : '<span class="text-slate-400 italic">No tutor assigned</span>'}
            </div>
          </td>
          <td class="py-3 px-4">
            <div class="text-xs">
              <span class="text-slate-500">CTS Fee:</span> <strong>৳${(r.mediaFeeAgreed || 0).toLocaleString()}</strong>
            </div>
            <div class="text-xs mt-0.5">
              <span class="px-1.5 py-0.5 rounded text-[11px] ${r.mediaFeeStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : (r.mediaFeeStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')}">
                ${escapeHtml(r.mediaFeeStatus || 'Due')}
              </span>
            </div>
          </td>
          <td class="py-3 px-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end space-x-1.5">
              <button class="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded" onclick="window.CTSApp.launchMatchingDesk('${r.id}')" title="Find Tutor Match">
                ⚡ Match
              </button>
              <button class="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 rounded" onclick="window.CTSApp.launchPostGenerator('${r.id}')" title="Generate Ad Post">
                📢 Post
              </button>
              <button class="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium" onclick="window.CTSApp.viewRequestDetails('${r.id}')">
                Details
              </button>
              <button class="px-2 py-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 rounded" onclick="window.CTSApp.confirmDeleteRequest('${r.id}')" title="Delete Request">
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // 4. TUTOR MATCHING ENGINE DESK
  // ==========================================
  function renderMatchingDesk() {
    const requests = store.getRequests();
    const selectEl = document.getElementById('match-request-selector');
    if (!selectEl) return;

    // Populate Request dropdown
    selectEl.innerHTML = requests.map(r => `
      <option value="${r.id}" ${r.id === state.activeMatchRequestId ? 'selected' : ''}>
        ${r.id} - ${r.area} | ${r.classLevel} (${r.curriculum}) | Budget: ৳${(r.salaryBudget || 0).toLocaleString()}
      </option>
    `).join('');

    if (!state.activeMatchRequestId && requests.length > 0) {
      state.activeMatchRequestId = requests[0].id;
      selectEl.value = requests[0].id;
    }

    const currentReq = store.getRequest(state.activeMatchRequestId);
    const reqDetailsCard = document.getElementById('match-request-summary');
    const matchResultsContainer = document.getElementById('matching-results-list');

    if (!currentReq) {
      if (reqDetailsCard) reqDetailsCard.innerHTML = `<p class="text-slate-400">Select a tuition requirement to calculate candidate matches.</p>`;
      if (matchResultsContainer) matchResultsContainer.innerHTML = '';
      return;
    }

    // Display Request Summary
    if (reqDetailsCard) {
      reqDetailsCard.innerHTML = `
        <div class="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-md">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
            <div>
              <span class="text-amber-400 font-mono font-bold text-lg">${escapeHtml(currentReq.id)}</span>
              <span class="text-slate-400 text-xs ml-2">Posted: ${escapeHtml(currentReq.postingDate)}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="px-2.5 py-1 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ${escapeHtml(currentReq.status)}
              </span>
              <button class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded" onclick="window.CTSApp.viewRequestDetails('${currentReq.id}')">
                View Full Form
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-slate-400 text-xs block">Area & Location</span>
              <strong class="text-slate-200">📍 ${escapeHtml(currentReq.area)}, ${escapeHtml(currentReq.city)}</strong>
            </div>
            <div>
              <span class="text-slate-400 text-xs block">Class & Medium</span>
              <strong class="text-slate-200">${escapeHtml(currentReq.classLevel)} (${escapeHtml(currentReq.curriculum)})</strong>
            </div>
            <div>
              <span class="text-slate-400 text-xs block">Subjects</span>
              <strong class="text-amber-400">${(currentReq.subjects || []).join(', ')}</strong>
            </div>
            <div>
              <span class="text-slate-400 text-xs block">Budget & Days</span>
              <strong class="text-emerald-400">৳${(currentReq.salaryBudget || 0).toLocaleString()} / mo (${currentReq.daysPerWeek} days)</strong>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap gap-4">
            <div>Preferred Gender: <strong class="text-slate-200">${escapeHtml(currentReq.preferredTutorGender || 'Any')}</strong></div>
            <div>Preferred University: <strong class="text-slate-200">${escapeHtml(currentReq.preferredTutorUniversity || 'Any')}</strong></div>
            <div>Current Assigned Tutor: <strong class="text-amber-300">${currentReq.assignedTutorId ? (store.getTutor(currentReq.assignedTutorId)?.name || currentReq.assignedTutorId) : 'None'}</strong></div>
          </div>
        </div>
      `;
    }

    // Run Matching Algorithm
    const allTutors = store.getTutors();
    const matches = matchingEngine.findMatches(currentReq, allTutors);

    if (matchResultsContainer) {
      if (matches.length === 0) {
        matchResultsContainer.innerHTML = `<div class="p-6 text-center text-slate-400">No tutors currently registered in database.</div>`;
        return;
      }

      matchResultsContainer.innerHTML = matches.map(m => {
        const t = m.tutor;
        const isAssigned = currentReq.assignedTutorId === t.id;
        const isShortlisted = (currentReq.shortlistedTutors || []).includes(t.id);

        return `
          <div class="p-4 mb-4 rounded-lg border ${isAssigned ? 'border-2 border-emerald-500 bg-emerald-50/20' : (isShortlisted ? 'border-amber-300 bg-amber-50/10' : 'border-slate-200 bg-white')} shadow-sm transition hover:shadow-md">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="flex items-start space-x-3">
                <div class="w-12 h-12 rounded-lg bg-slate-900 text-amber-400 flex flex-col items-center justify-center font-bold text-sm">
                  <span>${m.score}%</span>
                  <span class="text-[9px] uppercase font-normal text-slate-400">Match</span>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <h4 class="font-bold text-slate-900 text-base hover:text-amber-600 cursor-pointer" onclick="window.CTSApp.viewTutorProfile('${t.id}')">
                      ${escapeHtml(t.name)}
                    </h4>
                    <span class="text-xs font-mono text-slate-400 font-bold">${t.id}</span>
                    <span class="text-xs px-2 py-0.5 rounded border ${m.badgeColor}">${m.grade}</span>
                    ${isAssigned ? '<span class="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-bold">✓ ASSIGNED CANDIDATE</span>' : ''}
                  </div>
                  <p class="text-xs text-slate-600 mt-0.5">
                    <strong>${escapeHtml(t.university)}</strong> | ${escapeHtml(t.department)} | CGPA: <strong>${t.cgpa ? t.cgpa.toFixed(2) : 'N/A'}</strong> | Exp: ${t.experienceYears || 0} yrs
                  </p>
                  <p class="text-xs text-slate-500 mt-0.5">
                    📱 Phone: <strong>${escapeHtml(t.displayPhone || t.phone)}</strong> | Expected Salary: <strong>৳${(t.expectedSalaryMin || 0).toLocaleString()} - ${(t.expectedSalaryMax || 0).toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-wrap items-center gap-2">
                <button class="px-3 py-1.5 text-xs font-semibold rounded border ${isShortlisted ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'}" onclick="window.CTSApp.toggleShortlist('${currentReq.id}', '${t.id}')">
                  ${isShortlisted ? '★ Shortlisted' : '☆ Shortlist'}
                </button>
                <button class="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-amber-400 hover:bg-slate-700" onclick="window.CTSApp.openContactTutorModal('${currentReq.id}', '${t.id}')">
                  📞 Log Contact
                </button>
                <button class="px-3 py-1.5 text-xs font-semibold rounded ${isAssigned ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}" onclick="window.CTSApp.assignTutorToTuition('${currentReq.id}', '${t.id}')">
                  ${isAssigned ? '✓ Selected Tutor' : 'Select as Tutor'}
                </button>
              </div>
            </div>

            <!-- Match Reasons and Warning Breakdown -->
            <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div class="bg-emerald-50/60 p-2.5 rounded border border-emerald-100">
                <strong class="text-emerald-800 block mb-1">✓ Compatibility Points:</strong>
                <ul class="space-y-1 text-emerald-950">
                  ${m.reasons.map(r => `<li>• ${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>
              <div class="bg-slate-50 p-2.5 rounded border border-slate-200">
                <strong class="text-slate-700 block mb-1">⚠ Points of Caution / Gaps:</strong>
                ${m.mismatches.length > 0 ? `
                  <ul class="space-y-1 text-rose-700">
                    ${m.mismatches.map(w => `<li>• ${escapeHtml(w)}</li>`).join('')}
                  </ul>
                ` : `<span class="text-emerald-600">No notable criteria conflicts detected.</span>`}
              </div>
            </div>

            <!-- Contact response info if logged -->
            ${m.contactInfo ? `
              <div class="mt-2 text-xs bg-slate-100 p-2 rounded flex items-center justify-between text-slate-700">
                <div>
                  <strong>Staff Contact Log (${escapeHtml(m.contactInfo.date)}):</strong> [${escapeHtml(m.contactInfo.status)}] ${escapeHtml(m.contactInfo.notes || '')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  // ==========================================
  // 5. 11-STAGE VISUAL TUITION PIPELINE
  // ==========================================
  function renderPipelineView() {
    const requests = store.getRequests();
    const stages = window.CTSStore.PIPELINE_STAGES;
    const container = document.getElementById('pipeline-columns-container');
    if (!container) return;

    container.innerHTML = stages.map((stage, idx) => {
      const stageRequests = requests.filter(r => r.status === stage);

      return `
        <div class="pipeline-column min-w-[270px] max-w-[300px] bg-slate-100 rounded-lg p-3 flex flex-col border border-slate-200">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-300">
            <div class="flex items-center space-x-1.5">
              <span class="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold text-[10px] flex items-center justify-center">
                ${idx + 1}
              </span>
              <h4 class="font-bold text-slate-800 text-xs tracking-tight">${escapeHtml(stage)}</h4>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
              ${stageRequests.length}
            </span>
          </div>

          <div class="space-y-2 flex-1 overflow-y-auto max-h-[600px] pr-1">
            ${stageRequests.length === 0 ? `
              <div class="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-300 rounded">
                No requests in stage
              </div>
            ` : stageRequests.map(r => {
              const tutor = r.assignedTutorId ? store.getTutor(r.assignedTutorId) : null;
              return `
                <div class="bg-white p-3 rounded-md border border-slate-200 shadow-sm hover:border-amber-400 transition cursor-pointer" onclick="window.CTSApp.viewRequestDetails('${r.id}')">
                  <div class="flex items-center justify-between">
                    <span class="font-mono font-bold text-xs text-slate-900">${escapeHtml(r.id)}</span>
                    <span class="text-xs font-bold text-emerald-700">৳${(r.salaryBudget || 0).toLocaleString()}</span>
                  </div>
                  <div class="font-semibold text-slate-900 text-xs mt-1 truncate">${escapeHtml(r.guardianName)}</div>
                  <div class="text-[11px] text-slate-600">${escapeHtml(r.classLevel)} • ${escapeHtml(r.area)}</div>
                  <div class="text-[11px] text-amber-700 font-medium">${(r.subjects || []).join(', ')}</div>
                  ${tutor ? `
                    <div class="mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-700 flex items-center justify-between">
                      <span>Tutor: <strong>${escapeHtml(tutor.name.split(' ')[0])}</strong></span>
                      <span class="text-emerald-600 font-bold">✓ Assigned</span>
                    </div>
                  ` : ''}

                  <!-- Stage change button -->
                  <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between" onclick="event.stopPropagation()">
                    <button class="text-[11px] text-slate-600 hover:text-amber-600 font-medium" onclick="window.CTSApp.openPipelineTransitionModal('${r.id}')">
                      Move Stage ➔
                    </button>
                    <button class="text-[11px] text-amber-600 hover:text-amber-700 font-bold" onclick="window.CTSApp.launchMatchingDesk('${r.id}')">
                      Match
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 6. TUITION POST GENERATOR VIEW
  // ==========================================
  function renderPostGeneratorView() {
    const requests = store.getRequests();
    const selectEl = document.getElementById('post-request-selector');
    if (!selectEl) return;

    selectEl.innerHTML = requests.map(r => `
      <option value="${r.id}" ${r.id === state.activePostRequestId ? 'selected' : ''}>
        ${r.id} - ${r.area} | ${r.classLevel} (${r.curriculum}) | ৳${(r.salaryBudget || 0).toLocaleString()}
      </option>
    `).join('');

    if (!state.activePostRequestId && requests.length > 0) {
      state.activePostRequestId = requests[0].id;
      selectEl.value = requests[0].id;
    }

    updatePostPreview();
  }

  function updatePostPreview() {
    const currentReq = store.getRequest(state.activePostRequestId);
    const previewEl = document.getElementById('post-preview-content');
    if (!previewEl || !currentReq) return;

    const useEmoji = document.getElementById('post-opt-emoji')?.checked ?? true;
    const includePolicy = document.getElementById('post-opt-policy')?.checked ?? true;
    const includeHotline = document.getElementById('post-opt-hotline')?.checked ?? true;
    const settings = store.getSettings();

    const postContent = postGen.generatePost(currentReq, {
      useEmoji: useEmoji,
      includePolicy: includePolicy,
      includeHotline: includeHotline,
      businessName: settings.businessName,
      hotline: settings.contactPhone,
      mediaFeePercent: settings.defaultMediaFeePercent
    });

    previewEl.value = postContent;
  }

  // ==========================================
  // 7. ACCOUNTS & FINANCIAL LEDGER
  // ==========================================
  function renderAccountsView() {
    const metrics = store.getMetrics();
    const requests = store.getRequests();
    const transactions = store.getTransactions();
    const settings = store.getSettings();

    // Summary boxes
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('acc-total-collected', formatBDT(metrics.mediaFeesCollected));
    setText('acc-total-due', formatBDT(metrics.mediaFeesDue));
    setText('acc-referral-paid', formatBDT(metrics.referralCommissionsPaid));
    setText('acc-referral-pending', formatBDT(metrics.referralCommissionsPending));

    // Render Tuition Fee Status Ledger
    const feeStatusBody = document.getElementById('accounts-tuition-fees-body');
    if (feeStatusBody) {
      const activeFilter = state.activeFilters.accounts.status;
      let displayReqs = requests;
      if (activeFilter) {
        displayReqs = requests.filter(r => r.mediaFeeStatus === activeFilter);
      }

      if (displayReqs.length === 0) {
        feeStatusBody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No tuition fee records found.</td></tr>`;
      } else {
        feeStatusBody.innerHTML = displayReqs.map(r => {
          let statusColor = 'bg-rose-100 text-rose-800';
          if (r.mediaFeeStatus === 'Paid') statusColor = 'bg-emerald-100 text-emerald-800 font-bold';
          if (r.mediaFeeStatus === 'Partially Paid') statusColor = 'bg-amber-100 text-amber-800 font-bold';

          return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-200 text-sm">
              <td class="py-3 px-4 font-mono font-bold text-slate-900">${escapeHtml(r.id)}</td>
              <td class="py-3 px-4">
                <div class="font-semibold text-slate-800">${escapeHtml(r.guardianName)}</div>
                <div class="text-xs text-slate-500">${escapeHtml(r.area)} • ৳${(r.salaryBudget || 0).toLocaleString()} salary</div>
              </td>
              <td class="py-3 px-4 font-bold text-slate-900">৳${(r.mediaFeeAgreed || 0).toLocaleString()}</td>
              <td class="py-3 px-4 text-emerald-700 font-bold">৳${(r.mediaFeeReceived || 0).toLocaleString()}</td>
              <td class="py-3 px-4 text-rose-700 font-bold">৳${(r.mediaFeeDue || 0).toLocaleString()}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-1 text-xs rounded ${statusColor}">
                  ${escapeHtml(r.mediaFeeStatus || 'Due')}
                </span>
                ${r.referralAmount ? `
                  <div class="text-xs text-slate-500 mt-1">
                    Ref: ৳${r.referralAmount.toLocaleString()} (${escapeHtml(r.referralStatus || 'Unpaid')})
                  </div>
                ` : ''}
              </td>
              <td class="py-3 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end space-x-1.5">
                  <button class="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded" onclick="window.CTSApp.openRecordPaymentModal('${r.id}')">
                    + Collect Fee
                  </button>
                  ${r.referralAmount && r.referralStatus !== 'Paid' ? `
                    <button class="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded" onclick="window.CTSApp.openReferralPayoutModal('${r.id}')">
                      Pay Ref (৳${r.referralAmount})
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Transactions Ledger
    const trxBody = document.getElementById('accounts-transactions-body');
    if (trxBody) {
      if (transactions.length === 0) {
        trxBody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No transactions recorded yet.</td></tr>`;
      } else {
        trxBody.innerHTML = transactions.map(trx => `
          <tr class="hover:bg-slate-50 transition border-b border-slate-200 text-xs">
            <td class="py-2.5 px-4 font-mono font-bold text-slate-800">${escapeHtml(trx.id)}</td>
            <td class="py-2.5 px-4 text-slate-500">${escapeHtml(trx.date)}</td>
            <td class="py-2.5 px-4">
              <span class="px-2 py-0.5 rounded font-semibold ${trx.type.includes('Collection') ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'}">
                ${escapeHtml(trx.type)}
              </span>
            </td>
            <td class="py-2.5 px-4 font-bold ${trx.type.includes('Collection') ? 'text-emerald-700' : 'text-slate-800'}">
              ${trx.type.includes('Collection') ? '+' : '-'}৳${(trx.amount || 0).toLocaleString()}
            </td>
            <td class="py-2.5 px-4 font-mono text-slate-600">${escapeHtml(trx.method)} (${escapeHtml(trx.trxId)})</td>
            <td class="py-2.5 px-4 text-slate-700">${escapeHtml(trx.payerName || trx.recipientName)}</td>
            <td class="py-2.5 px-4 text-slate-500">${escapeHtml(trx.notes)}</td>
          </tr>
        `).join('');
      }
    }
  }

  // ==========================================
  // 8. FOLLOW-UP & COMMUNICATION LOGS
  // ==========================================
  function renderFollowUpsView() {
    const followups = store.getFollowUps();
    const filter = state.activeFilters.followups;

    let filtered = followups.filter(f => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!f.targetName.toLowerCase().includes(q) && !f.reason.toLowerCase().includes(q)) return false;
      }
      if (filter.status && f.status !== filter.status) return false;
      if (filter.overdueOnly && !f.isOverdue) return false;
      return true;
    });

    const bodyEl = document.getElementById('followups-table-body');
    if (!bodyEl) return;

    if (filtered.length === 0) {
      bodyEl.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No communication follow-ups found.</td></tr>`;
      return;
    }

    bodyEl.innerHTML = filtered.map(f => `
      <tr class="hover:bg-slate-50 transition border-b border-slate-200 text-sm">
        <td class="py-3 px-4 font-mono font-bold text-slate-900">${escapeHtml(f.id)}</td>
        <td class="py-3 px-4">
          <div class="font-semibold text-slate-900">${escapeHtml(f.targetName)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(f.targetType)} • ${escapeHtml(f.targetPhone)}</div>
        </td>
        <td class="py-3 px-4">
          <div class="font-medium text-slate-800">${escapeHtml(f.reason)}</div>
          <div class="text-xs text-slate-500">${escapeHtml(f.channel)} • Staff: ${escapeHtml(f.staffMember)}</div>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-xs font-bold ${f.isOverdue ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'}">
            ${f.isOverdue ? '⚠ OVERDUE: ' : ''}${escapeHtml(f.scheduledDate)}
          </span>
        </td>
        <td class="py-3 px-4">
          <p class="text-xs text-slate-600 max-w-xs">${escapeHtml(f.response || f.notes || 'Awaiting conversation')}</p>
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-xs font-bold ${f.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${escapeHtml(f.status)}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="flex items-center justify-end space-x-2">
            <button class="px-2 py-1 text-xs bg-slate-800 text-amber-400 rounded hover:bg-slate-700" onclick="window.CTSApp.openFollowUpModal('${f.id}')">
              Edit
            </button>
            <button class="px-2 py-1 text-xs bg-rose-50 text-rose-600 rounded hover:bg-rose-100" onclick="window.CTSApp.deleteFollowUp('${f.id}')">
              ✕
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // ==========================================
  // 9. REVIEWS & SERVICE QUALITY
  // ==========================================
  function renderReviewsView() {
    const reviews = store.getReviews(false);
    const filter = state.activeFilters.reviews.status;

    let filtered = reviews;
    if (filter) {
      filtered = reviews.filter(r => r.moderationStatus === filter);
    }

    const container = document.getElementById('reviews-grid-container');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400">No reviews found in this moderation queue.</div>`;
      return;
    }

    container.innerHTML = filtered.map(rev => {
      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      const isApproved = rev.moderationStatus === 'Approved';

      return `
        <div class="p-4 rounded-lg border ${isApproved ? 'border-emerald-200 bg-white' : 'border-amber-200 bg-amber-50/20'} shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-amber-500 text-base font-bold tracking-wider">${stars}</span>
              <span class="px-2 py-0.5 rounded text-xs font-bold ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${escapeHtml(rev.moderationStatus)}
              </span>
            </div>
            <p class="text-slate-700 text-sm italic mb-3">"${escapeHtml(rev.feedback)}"</p>
            <div class="text-xs text-slate-500">
              <strong class="text-slate-900">${escapeHtml(rev.reviewerName)}</strong> (${escapeHtml(rev.reviewerRole)})
              <div>Ref: ${escapeHtml(rev.tuitionId || 'General')} • ${escapeHtml(rev.reviewDate)}</div>
              ${rev.isDemo ? '<span class="text-[10px] text-slate-400 font-mono">[Demo Testimonial]</span>' : ''}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button class="px-2.5 py-1 text-xs font-bold rounded ${isApproved ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}" onclick="window.CTSApp.toggleReviewModeration('${rev.id}')">
              ${isApproved ? 'Withdraw Approval' : '✓ Approve for Public'}
            </button>
            <button class="text-xs text-rose-600 hover:underline" onclick="window.CTSApp.deleteReview('${rev.id}')">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 10. REPORTS & ANALYTICS
  // ==========================================
  function renderReportsView() {
    const metrics = store.getMetrics();
    const requests = store.getRequests();
    const tutors = store.getTutors();

    // Area-wise breakdown
    const areaCounts = {};
    requests.forEach(r => {
      const a = r.area || 'Unknown';
      areaCounts[a] = (areaCounts[a] || 0) + 1;
    });

    const areaBreakdownEl = document.getElementById('report-area-breakdown');
    if (areaBreakdownEl) {
      areaBreakdownEl.innerHTML = Object.entries(areaCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([area, count]) => `
          <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span class="text-slate-700 font-medium">${escapeHtml(area)}</span>
            <span class="font-bold text-slate-900">${count} requests</span>
          </div>
        `).join('');
    }

    // Curriculum demand breakdown
    const curCounts = {};
    requests.forEach(r => {
      const c = r.curriculum || 'Bangla Medium';
      curCounts[c] = (curCounts[c] || 0) + 1;
    });

    const curBreakdownEl = document.getElementById('report-curriculum-breakdown');
    if (curBreakdownEl) {
      curBreakdownEl.innerHTML = Object.entries(curCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([cur, count]) => `
          <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span class="text-slate-700 font-medium">${escapeHtml(cur)}</span>
            <span class="font-bold text-slate-900">${count} (${Math.round((count / requests.length) * 100)}%)</span>
          </div>
        `).join('');
    }

    // Set numbers
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('rep-total-inquiries', requests.length);
    setText('rep-confirmed', metrics.confirmedTuitions);
    setText('rep-conversion', `${metrics.conversionRate}%`);
    setText('rep-media-fees', formatBDT(metrics.mediaFeesCollected));
    setText('rep-outstanding', formatBDT(metrics.mediaFeesDue));
    setText('rep-referrals-paid', formatBDT(metrics.referralCommissionsPaid));
  }

  // ==========================================
  // 11. SETTINGS & DATA BACKUP VIEW
  // ==========================================
  function renderSettingsView() {
    const settings = store.getSettings();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('cfg-business-name', settings.businessName || '');
    setVal('cfg-tagline', settings.brandTagline || '');
    setVal('cfg-contact-phone', settings.contactPhone || '');
    setVal('cfg-whatsapp', settings.whatsappNumber || '');
    setVal('cfg-email', settings.contactEmail || '');
    setVal('cfg-address', settings.officeAddress || '');
    setVal('cfg-media-fee-percent', settings.defaultMediaFeePercent || 50);
    setVal('cfg-referral-percent', settings.defaultReferralPercent || 20);
    setVal('cfg-post-template', settings.tuitionPostTemplate || '');
  }

  // ==========================================
  // CSV EXPORT UTILITIES
  // ==========================================
  function exportCSV(filename, rows) {
    if (!rows || !rows.length) {
      showToast('No records available to export.', 'warning');
      return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = Array.isArray(cell) ? cell.join('; ') : String(cell);
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${filename}`, 'success');
  }

  function exportTutorsCSV() {
    const tutors = store.getTutors();
    const rows = tutors.map(t => ({
      ID: t.id,
      Name: t.name,
      Phone: t.phone,
      Email: t.email,
      Gender: t.gender,
      University: t.university,
      Department: t.department,
      CGPA: t.cgpa,
      Areas: t.preferredAreas,
      Mediums: t.preferredMediums,
      Subjects: t.preferredSubjects,
      MinSalary: t.expectedSalaryMin,
      MaxSalary: t.expectedSalaryMax,
      Availability: t.availability,
      VerificationStatus: t.verificationStatus,
      Completeness: t.profileCompleteness
    }));
    exportCSV(`CTS_Tutors_${Date.now()}.csv`, rows);
  }

  function exportRequestsCSV() {
    const requests = store.getRequests();
    const rows = requests.map(r => ({
      ID: r.id,
      GuardianName: r.guardianName,
      StudentName: r.studentName,
      Phone: r.phone,
      Area: r.area,
      Class: r.classLevel,
      Curriculum: r.curriculum,
      Subjects: r.subjects,
      Budget: r.salaryBudget,
      Status: r.status,
      AssignedTutor: r.assignedTutorId,
      MediaFeeAgreed: r.mediaFeeAgreed,
      MediaFeeReceived: r.mediaFeeReceived,
      MediaFeeDue: r.mediaFeeDue,
      MediaFeeStatus: r.mediaFeeStatus,
      PostingDate: r.postingDate
    }));
    exportCSV(`CTS_Tuition_Requests_${Date.now()}.csv`, rows);
  }

  function exportTransactionsCSV() {
    const transactions = store.getTransactions();
    const rows = transactions.map(t => ({
      ID: t.id,
      Date: t.date,
      TuitionCode: t.tuitionCode,
      Type: t.type,
      Amount: t.amount,
      Method: t.method,
      TrxID: t.trxId,
      Party: t.payerName || t.recipientName,
      Staff: t.receiverStaff || t.payerStaff,
      Notes: t.notes
    }));
    exportCSV(`CTS_Transactions_${Date.now()}.csv`, rows);
  }

  // ==========================================
  // MODAL HANDLERS
  // ==========================================

  // Open & Close Modals
  function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  }

  // View Tutor Profile with Verification Checklist toggles
  function viewTutorProfile(tutorId) {
    const tutor = store.getTutor(tutorId);
    if (!tutor) return;

    const modalContent = document.getElementById('view-tutor-content');
    if (!modalContent) return;

    const checklist = tutor.verificationChecklist || {};

    modalContent.innerHTML = `
      <div class="flex items-start justify-between border-b border-slate-200 pb-4">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-xl font-bold text-slate-900">${escapeHtml(tutor.name)}</h3>
            <span class="font-mono text-sm bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">${tutor.id}</span>
          </div>
          <p class="text-sm text-slate-500">${escapeHtml(tutor.university)} • ${escapeHtml(tutor.department)}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 text-xs rounded-full font-bold ${tutor.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
            ${escapeHtml(tutor.verificationStatus)}
          </span>
          <div class="text-xs text-slate-400 mt-1">Profile: ${tutor.profileCompleteness || 0}% Complete</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-sm">
        <div class="bg-slate-50 p-3.5 rounded border border-slate-200">
          <h4 class="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Contact & Personal Details</h4>
          <div class="space-y-1.5 text-xs">
            <div>Phone: <strong>${escapeHtml(tutor.displayPhone || tutor.phone)}</strong></div>
            <div>Email: <strong>${escapeHtml(tutor.email || 'None')}</strong></div>
            <div>Gender: <strong>${escapeHtml(tutor.gender)}</strong></div>
            <div>Registered: <strong>${escapeHtml(tutor.registeredDate)}</strong></div>
            <div>Availability: <span class="font-bold text-emerald-700">${escapeHtml(tutor.availability)}</span></div>
          </div>
        </div>

        <div class="bg-slate-50 p-3.5 rounded border border-slate-200">
          <h4 class="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Academic Credentials</h4>
          <div class="space-y-1.5 text-xs">
            <div>University: <strong>${escapeHtml(tutor.university)}</strong></div>
            <div>Department: <strong>${escapeHtml(tutor.department)}</strong></div>
            <div>Session/Year: <strong>${escapeHtml(tutor.session || 'N/A')}</strong></div>
            <div>Honors CGPA: <strong class="text-slate-900">${tutor.cgpa ? tutor.cgpa.toFixed(2) : 'N/A'}</strong></div>
            <div>HSC GPA: <strong>${tutor.hscGpa || 'N/A'}</strong> | SSC GPA: <strong>${tutor.sscGpa || 'N/A'}</strong></div>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 p-3.5 rounded border border-slate-200 text-sm mb-4">
        <h4 class="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Tuition Preferences</h4>
        <div class="text-xs space-y-1.5">
          <div>Preferred Areas: <strong>${(tutor.preferredAreas || []).join(', ')}</strong></div>
          <div>Preferred Mediums: <strong>${(tutor.preferredMediums || []).join(', ')}</strong></div>
          <div>Preferred Subjects: <strong class="text-amber-800">${(tutor.preferredSubjects || []).join(', ')}</strong></div>
          <div>Expected Salary: <strong>৳${(tutor.expectedSalaryMin || 0).toLocaleString()} - ${(tutor.expectedSalaryMax || 0).toLocaleString()} / month</strong></div>
          <div>Experience: <strong>${tutor.experienceYears || 0} years tutoring</strong></div>
        </div>
      </div>

      <!-- Admin Verification Checklist Form -->
      <div class="bg-amber-50/50 p-4 rounded border border-amber-200 mb-4">
        <h4 class="font-bold text-amber-950 mb-1 text-sm">CTS Admin Verification Checklist</h4>
        <p class="text-xs text-amber-800 mb-3">Tutors must only be marked "Verified" after confirming physical or scanned credentials.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="chk-nid" ${checklist.nid ? 'checked' : ''} class="rounded text-amber-600 focus:ring-amber-500">
            <span>National ID (NID / Smart Card) Verified</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="chk-studentId" ${checklist.studentId ? 'checked' : ''} class="rounded text-amber-600 focus:ring-amber-500">
            <span>University Student ID Card Checked</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="chk-certificates" ${checklist.certificates ? 'checked' : ''} class="rounded text-amber-600 focus:ring-amber-500">
            <span>SSC / HSC / Honors Marksheets Checked</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="chk-address" ${checklist.policeOrAddress ? 'checked' : ''} class="rounded text-amber-600 focus:ring-amber-500">
            <span>Present Address Proof / Police Record Checked</span>
          </label>
          <label class="flex items-center space-x-2 sm:col-span-2">
            <input type="checkbox" id="chk-interview" ${checklist.interview ? 'checked' : ''} class="rounded text-amber-600 focus:ring-amber-500">
            <span>CTS Coordinator Phone / In-Person Interview Completed</span>
          </label>
        </div>

        <div class="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-slate-700">Set Status:</span>
            <select id="modal-tutor-ver-status" class="text-xs p-1 rounded border border-slate-300">
              <option value="Under Review" ${tutor.verificationStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
              <option value="Verified" ${tutor.verificationStatus === 'Verified' ? 'selected' : ''}>Verified (Official CTS Verified)</option>
              <option value="Pending" ${tutor.verificationStatus === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Rejected" ${tutor.verificationStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
            </select>
          </div>
          <button class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded" onclick="window.CTSApp.saveTutorVerification('${tutor.id}')">
            Update Verification
          </button>
        </div>
      </div>

      ${tutor.notes ? `
        <div class="p-3 bg-slate-100 rounded text-xs text-slate-700">
          <strong>Staff Notes:</strong> ${escapeHtml(tutor.notes)}
        </div>
      ` : ''}
    `;

    openModal('modal-view-tutor');
  }

  function saveTutorVerification(tutorId) {
    const tutor = store.getTutor(tutorId);
    if (!tutor) return;

    const checklist = {
      nid: document.getElementById('chk-nid')?.checked || false,
      studentId: document.getElementById('chk-studentId')?.checked || false,
      certificates: document.getElementById('chk-certificates')?.checked || false,
      policeOrAddress: document.getElementById('chk-address')?.checked || false,
      interview: document.getElementById('chk-interview')?.checked || false
    };

    const newStatus = document.getElementById('modal-tutor-ver-status')?.value || tutor.verificationStatus;

    // Safety rule: Warn if marking verified without student ID and NID
    if (newStatus === 'Verified' && (!checklist.nid || !checklist.studentId)) {
      if (!confirm('Warning: Admin verification checklist does not have NID or Student ID checked. Are you sure you want to approve verification?')) {
        return;
      }
    }

    tutor.verificationChecklist = checklist;
    tutor.verificationStatus = newStatus;

    store.saveTutor(tutor);
    showToast(`Verification status updated for ${tutor.name}`, 'success');
    closeModal('modal-view-tutor');
    renderTutorsList();
  }

  // Add / Edit Tutor Modal
  function openAddTutorModal() {
    document.getElementById('tutor-form').reset();
    document.getElementById('tutor-modal-id').value = '';
    document.getElementById('tutor-modal-title').textContent = 'Add New Tutor Profile';
    openModal('modal-tutor-form');
  }

  function openEditTutorModal(tutorId) {
    const tutor = store.getTutor(tutorId);
    if (!tutor) return;

    document.getElementById('tutor-modal-id').value = tutor.id;
    document.getElementById('tutor-modal-title').textContent = `Edit Tutor: ${tutor.name} (${tutor.id})`;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('tut-name', tutor.name || '');
    setVal('tut-phone', tutor.phone || '');
    setVal('tut-email', tutor.email || '');
    setVal('tut-gender', tutor.gender || 'Male');
    setVal('tut-university', tutor.university || '');
    setVal('tut-department', tutor.department || '');
    setVal('tut-session', tutor.session || '');
    setVal('tut-cgpa', tutor.cgpa || '');
    setVal('tut-ssc', tutor.sscGpa || '');
    setVal('tut-hsc', tutor.hscGpa || '');
    setVal('tut-exp', tutor.experienceYears || 0);
    setVal('tut-salary-min', tutor.expectedSalaryMin || 8000);
    setVal('tut-salary-max', tutor.expectedSalaryMax || 12000);
    setVal('tut-availability', tutor.availability || 'Available');
    setVal('tut-ver-status', tutor.verificationStatus || 'Pending');
    setVal('tut-areas', (tutor.preferredAreas || []).join(', '));
    setVal('tut-mediums', (tutor.preferredMediums || []).join(', '));
    setVal('tut-subjects', (tutor.preferredSubjects || []).join(', '));
    setVal('tut-notes', tutor.notes || '');

    openModal('modal-tutor-form');
  }

  function handleSaveTutor(e) {
    e.preventDefault();
    const id = document.getElementById('tutor-modal-id').value;
    const phone = document.getElementById('tut-phone').value.trim();
    const email = document.getElementById('tut-email').value.trim();

    // Check duplicate
    if (store.checkDuplicateTutor(phone, email, id || null)) {
      if (!confirm('A tutor with this phone number or email already exists in CTS. Do you still want to proceed?')) {
        return;
      }
    }

    const tutorData = {
      id: id || undefined,
      name: document.getElementById('tut-name').value.trim(),
      phone: phone,
      email: email,
      gender: document.getElementById('tut-gender').value,
      university: document.getElementById('tut-university').value.trim(),
      department: document.getElementById('tut-department').value.trim(),
      session: document.getElementById('tut-session').value.trim(),
      cgpa: parseFloat(document.getElementById('tut-cgpa').value) || 0,
      sscGpa: parseFloat(document.getElementById('tut-ssc').value) || 0,
      hscGpa: parseFloat(document.getElementById('tut-hsc').value) || 0,
      experienceYears: parseInt(document.getElementById('tut-exp').value, 10) || 0,
      expectedSalaryMin: parseFloat(document.getElementById('tut-salary-min').value) || 0,
      expectedSalaryMax: parseFloat(document.getElementById('tut-salary-max').value) || 0,
      availability: document.getElementById('tut-availability').value,
      verificationStatus: document.getElementById('tut-ver-status').value,
      preferredAreas: document.getElementById('tut-areas').value.split(',').map(s => s.trim()).filter(Boolean),
      preferredMediums: document.getElementById('tut-mediums').value.split(',').map(s => s.trim()).filter(Boolean),
      preferredSubjects: document.getElementById('tut-subjects').value.split(',').map(s => s.trim()).filter(Boolean),
      notes: document.getElementById('tut-notes').value.trim()
    };

    try {
      const saved = store.saveTutor(tutorData);
      showToast(`Tutor ${saved.name} (${saved.id}) saved successfully!`, 'success');
      closeModal('modal-tutor-form');
      renderTutorsList();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function confirmDeleteTutor(tutorId) {
    const tutor = store.getTutor(tutorId);
    if (!tutor) return;

    if (confirm(`Are you sure you want to delete tutor "${tutor.name}" (${tutor.id})? This action cannot be undone.`)) {
      store.deleteTutor(tutorId);
      showToast(`Tutor ${tutor.name} was deleted.`, 'info');
      renderTutorsList();
    }
  }

  // Add / Edit Tuition Requirement Modal
  function openAddRequestModal() {
    document.getElementById('request-form').reset();
    document.getElementById('request-modal-id').value = '';
    document.getElementById('request-modal-title').textContent = 'Create New Tuition Requirement';
    openModal('modal-request-form');
  }

  function openEditRequestModal(reqId) {
    const req = store.getRequest(reqId);
    if (!req) return;

    document.getElementById('request-modal-id').value = req.id;
    document.getElementById('request-modal-title').textContent = `Edit Tuition Requirement: ${req.id}`;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('req-guardian', req.guardianName || '');
    setVal('req-student', req.studentName || '');
    setVal('req-phone', req.phone || '');
    setVal('req-address', req.privateAddress || '');
    setVal('req-city', req.city || 'Chittagong');
    setVal('req-area', req.area || 'Nasirabad');
    setVal('req-class', req.classLevel || 'Class 9');
    setVal('req-curriculum', req.curriculum || 'Bangla Medium');
    setVal('req-subjects', (req.subjects || []).join(', '));
    setVal('req-student-gender', req.studentGender || 'Male');
    setVal('req-pref-gender', req.preferredTutorGender || 'Any');
    setVal('req-pref-uni', req.preferredTutorUniversity || '');
    setVal('req-days', req.daysPerWeek || 3);
    setVal('req-time', req.preferredTime || '');
    setVal('req-salary', req.salaryBudget || 8000);
    setVal('req-type', req.tuitionType || 'Home Tutoring');
    setVal('req-status', req.status || 'NEW REQUEST');
    setVal('req-referral-person', req.referralPerson || '');
    setVal('req-notes', req.privateNotes || '');

    openModal('modal-request-form');
  }

  function handleSaveRequest(e) {
    e.preventDefault();
    const id = document.getElementById('request-modal-id').value;
    const phone = document.getElementById('req-phone').value.trim();
    const area = document.getElementById('req-area').value;
    const classLevel = document.getElementById('req-class').value;

    if (store.checkDuplicateRequest(phone, classLevel, area, id || null)) {
      if (!confirm(`A tuition request for this phone number, class (${classLevel}), and area (${area}) already exists. Proceed anyway?`)) {
        return;
      }
    }

    const reqData = {
      id: id || undefined,
      guardianName: document.getElementById('req-guardian').value.trim(),
      studentName: document.getElementById('req-student').value.trim(),
      phone: phone,
      privateAddress: document.getElementById('req-address').value.trim(),
      city: document.getElementById('req-city').value.trim(),
      area: area,
      classLevel: classLevel,
      curriculum: document.getElementById('req-curriculum').value,
      subjects: document.getElementById('req-subjects').value.split(',').map(s => s.trim()).filter(Boolean),
      studentGender: document.getElementById('req-student-gender').value,
      preferredTutorGender: document.getElementById('req-pref-gender').value,
      preferredTutorUniversity: document.getElementById('req-pref-uni').value.trim(),
      daysPerWeek: parseInt(document.getElementById('req-days').value, 10) || 3,
      preferredTime: document.getElementById('req-time').value.trim(),
      salaryBudget: parseFloat(document.getElementById('req-salary').value) || 0,
      tuitionType: document.getElementById('req-type').value,
      status: document.getElementById('req-status').value,
      referralPerson: document.getElementById('req-referral-person').value.trim(),
      privateNotes: document.getElementById('req-notes').value.trim()
    };

    try {
      const saved = store.saveRequest(reqData);
      showToast(`Tuition request ${saved.id} saved successfully!`, 'success');
      closeModal('modal-request-form');
      renderRequestsList();
      if (state.currentView === 'pipeline') renderPipelineView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function confirmDeleteRequest(reqId) {
    if (confirm(`Are you sure you want to delete tuition requirement ${reqId}? This will remove its history and status.`)) {
      store.deleteRequest(reqId);
      showToast(`Tuition requirement ${reqId} deleted.`, 'info');
      renderRequestsList();
      if (state.currentView === 'pipeline') renderPipelineView();
    }
  }

  // View Tuition Requirement Details Modal
  function viewRequestDetails(reqId) {
    const req = store.getRequest(reqId);
    if (!req) return;

    const modalContent = document.getElementById('view-request-content');
    if (!modalContent) return;

    const assignedTutor = req.assignedTutorId ? store.getTutor(req.assignedTutorId) : null;

    modalContent.innerHTML = `
      <div class="flex flex-wrap items-start justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <div class="flex items-center space-x-2">
            <h3 class="text-xl font-bold font-mono text-slate-900">${escapeHtml(req.id)}</h3>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-900 border border-amber-300">
              ${escapeHtml(req.status)}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Posted: ${escapeHtml(req.postingDate)} • Area: <strong>${escapeHtml(req.area)}, ${escapeHtml(req.city)}</strong></p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded" onclick="closeModal('modal-view-request'); window.CTSApp.launchMatchingDesk('${req.id}')">
            ⚡ Find Tutors
          </button>
          <button class="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded" onclick="closeModal('modal-view-request'); window.CTSApp.launchPostGenerator('${req.id}')">
            📢 Post Generator
          </button>
          <button class="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold" onclick="closeModal('modal-view-request'); window.CTSApp.openEditRequestModal('${req.id}')">
            Edit
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-sm">
        <div class="bg-slate-50 p-3.5 rounded border border-slate-200">
          <h4 class="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Private Guardian & Address (Admin Only)</h4>
          <div class="space-y-1.5 text-xs">
            <div>Guardian Name: <strong>${escapeHtml(req.guardianName)}</strong></div>
            <div>Student Name: <strong>${escapeHtml(req.studentName)}</strong> (${escapeHtml(req.studentGender || 'N/A')})</div>
            <div>Phone: <strong>${escapeHtml(req.displayPhone || req.phone)}</strong></div>
            <div>Private Address: <span class="text-rose-900 font-medium">${escapeHtml(req.privateAddress || 'Confidential')}</span></div>
            <div>Private Notes: <em>${escapeHtml(req.privateNotes || 'None')}</em></div>
          </div>
        </div>

        <div class="bg-slate-50 p-3.5 rounded border border-slate-200">
          <h4 class="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">Tuition Specification</h4>
          <div class="space-y-1.5 text-xs">
            <div>Class & Curriculum: <strong>${escapeHtml(req.classLevel)} (${escapeHtml(req.curriculum)})</strong></div>
            <div>Subjects: <strong class="text-amber-800">${(req.subjects || []).join(', ')}</strong></div>
            <div>Schedule: <strong>${req.daysPerWeek} days/week | ${escapeHtml(req.preferredTime || 'Flexible')}</strong></div>
            <div>Monthly Remuneration: <strong class="text-emerald-700">৳${(req.salaryBudget || 0).toLocaleString()}</strong></div>
            <div>Tutoring Mode: <strong>${escapeHtml(req.tuitionType)}</strong></div>
            <div>Preferred Tutor: <strong>${escapeHtml(req.preferredTutorGender || 'Any')} (${escapeHtml(req.preferredTutorUniversity || 'Any University')})</strong></div>
          </div>
        </div>
      </div>

      <!-- Financial Summary & Assignment Card -->
      <div class="bg-slate-900 text-white p-4 rounded-lg mb-4 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-2 border-b border-slate-800 pb-2">
          <div class="flex items-center space-x-2">
            <span class="text-slate-400">Assigned Tutor:</span>
            ${assignedTutor ? `
              <strong class="text-amber-400 text-sm">${escapeHtml(assignedTutor.name)} (${assignedTutor.id})</strong>
            ` : `<span class="text-slate-500 italic">No tutor assigned yet</span>`}
          </div>
          <div>
            <button class="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded text-xs" onclick="window.CTSApp.openPipelineTransitionModal('${req.id}')">
              Transition Stage ➔
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <span class="text-slate-400 block">CTS Media Fee:</span>
            <strong class="text-slate-100 text-sm">৳${(req.mediaFeeAgreed || 0).toLocaleString()}</strong>
          </div>
          <div>
            <span class="text-slate-400 block">Collected So Far:</span>
            <strong class="text-emerald-400 text-sm">৳${(req.mediaFeeReceived || 0).toLocaleString()}</strong>
          </div>
          <div>
            <span class="text-slate-400 block">Balance Due:</span>
            <strong class="text-rose-400 text-sm">৳${(req.mediaFeeDue || 0).toLocaleString()}</strong>
          </div>
          <div>
            <span class="text-slate-400 block">Fee Status:</span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold ${req.mediaFeeStatus === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'}">
              ${escapeHtml(req.mediaFeeStatus || 'Due')}
            </span>
          </div>
        </div>
      </div>

      <!-- Activity & Pipeline History -->
      <div>
        <h4 class="font-bold text-slate-800 mb-2 text-xs">Tuition Activity & Stage Log</h4>
        <div class="space-y-1.5 max-h-40 overflow-y-auto bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          ${(req.activityLog || []).map(a => `
            <div class="flex items-start space-x-2 text-slate-700">
              <span class="text-slate-400 font-mono text-[10px] whitespace-nowrap">${escapeHtml(a.date)}</span>
              <span>• ${escapeHtml(a.text)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    openModal('modal-view-request');
  }

  // Pipeline Stage Transition Modal
  function openPipelineTransitionModal(reqId) {
    const req = store.getRequest(reqId);
    if (!req) return;

    document.getElementById('trans-req-id').value = req.id;
    document.getElementById('trans-req-code').textContent = req.id;
    document.getElementById('trans-current-stage').textContent = req.status;

    const selectEl = document.getElementById('trans-next-stage');
    if (selectEl) {
      selectEl.innerHTML = window.CTSStore.PIPELINE_STAGES.map(s => `
        <option value="${s}" ${s === req.status ? 'selected' : ''}>${s}</option>
      `).join('');
    }

    document.getElementById('trans-note').value = '';
    openModal('modal-pipeline-trans');
  }

  function handleSavePipelineTransition(e) {
    e.preventDefault();
    const reqId = document.getElementById('trans-req-id').value;
    const newStage = document.getElementById('trans-next-stage').value;
    const note = document.getElementById('trans-note').value.trim();

    try {
      store.updatePipelineStage(reqId, newStage, note, 'CTS Admin');
      showToast(`Tuition ${reqId} transitioned to ${newStage}`, 'success');
      closeModal('modal-pipeline-trans');
      renderCurrentView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Quick launch helper methods
  function launchMatchingDesk(reqId) {
    state.activeMatchRequestId = reqId;
    switchView('matching');
  }

  function launchPostGenerator(reqId) {
    state.activePostRequestId = reqId;
    switchView('post-gen');
  }

  function toggleShortlist(reqId, tutorId) {
    store.toggleShortlistTutor(reqId, tutorId);
    renderMatchingDesk();
  }

  function assignTutorToTuition(reqId, tutorId) {
    const tutor = store.getTutor(tutorId);
    if (!tutor) return;

    if (confirm(`Assign ${tutor.name} (${tutor.id}) as primary tutor candidate for tuition ${reqId}?`)) {
      store.assignTutorToRequest(reqId, tutorId);
      showToast(`Assigned ${tutor.name} to ${reqId}`, 'success');
      renderMatchingDesk();
    }
  }

  function openContactTutorModal(reqId, tutorId) {
    const tutor = store.getTutor(tutorId);
    if (!tutor) return;

    document.getElementById('contact-req-id').value = reqId;
    document.getElementById('contact-tutor-id').value = tutorId;
    document.getElementById('contact-modal-title').textContent = `Log Tutor Contact: ${tutor.name}`;
    document.getElementById('contact-tutor-phone').textContent = tutor.displayPhone || tutor.phone;
    document.getElementById('contact-notes').value = '';

    openModal('modal-contact-tutor');
  }

  function handleSaveContactTutor(e) {
    e.preventDefault();
    const reqId = document.getElementById('contact-req-id').value;
    const tutorId = document.getElementById('contact-tutor-id').value;
    const status = document.getElementById('contact-status').value;
    const notes = document.getElementById('contact-notes').value.trim();

    store.recordTutorContact(reqId, tutorId, status, notes);
    showToast('Tutor communication response logged.', 'success');
    closeModal('modal-contact-tutor');
    renderMatchingDesk();
  }

  // Financial Payment Modal
  function openRecordPaymentModal(reqId) {
    const req = store.getRequest(reqId);
    if (!req) return;

    document.getElementById('pay-req-id').value = req.id;
    document.getElementById('pay-modal-title').textContent = `Record Media Fee: ${req.id}`;
    document.getElementById('pay-total-agreed').textContent = formatBDT(req.mediaFeeAgreed);
    document.getElementById('pay-current-received').textContent = formatBDT(req.mediaFeeReceived);
    document.getElementById('pay-balance-due').textContent = formatBDT(req.mediaFeeDue);

    document.getElementById('pay-amount').value = req.mediaFeeDue > 0 ? req.mediaFeeDue : 0;
    document.getElementById('pay-payer').value = req.guardianName || '';
    document.getElementById('pay-trx-id').value = '';
    document.getElementById('pay-notes').value = '';

    openModal('modal-payment-form');
  }

  function handleSavePayment(e) {
    e.preventDefault();
    const reqId = document.getElementById('pay-req-id').value;
    const amount = parseFloat(document.getElementById('pay-amount').value) || 0;
    const method = document.getElementById('pay-method').value;
    const trxId = document.getElementById('pay-trx-id').value.trim();
    const payer = document.getElementById('pay-payer').value.trim();
    const notes = document.getElementById('pay-notes').value.trim();

    try {
      store.recordMediaFeePayment(reqId, {
        amount,
        method,
        trxId: trxId || 'Cash/Manual',
        payerName: payer,
        notes
      });
      showToast(`Recorded payment of ৳${amount.toLocaleString()} for ${reqId}`, 'success');
      closeModal('modal-payment-form');
      renderAccountsView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function openReferralPayoutModal(reqId) {
    const req = store.getRequest(reqId);
    if (!req || !req.referralAmount) return;

    if (confirm(`Confirm disbursement of ৳${req.referralAmount.toLocaleString()} referral commission to ${req.referralPerson || 'Referral Partner'} for tuition ${req.id}?`)) {
      try {
        store.recordReferralPayout(reqId, {
          amount: req.referralAmount,
          method: 'bKash',
          recipientName: req.referralPerson,
          notes: `Referral commission payout for ${req.id}`
        });
        showToast(`Disbursed referral commission for ${req.id}`, 'success');
        renderAccountsView();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  }

  // Follow-up Modals
  function openAddFollowUpModal() {
    document.getElementById('flw-form').reset();
    document.getElementById('flw-id').value = '';
    document.getElementById('flw-modal-title').textContent = 'Create New Follow-up Task';
    document.getElementById('flw-date').value = new Date().toISOString().substring(0, 10);
    openModal('modal-followup-form');
  }

  function openFollowUpModal(id) {
    const f = store.getFollowUps().find(item => item.id === id);
    if (!f) return;

    document.getElementById('flw-id').value = f.id;
    document.getElementById('flw-modal-title').textContent = `Follow-up: ${f.targetName} (${f.id})`;
    document.getElementById('flw-target-name').value = f.targetName || '';
    document.getElementById('flw-target-phone').value = f.targetPhone || '';
    document.getElementById('flw-target-type').value = f.targetType || 'Guardian';
    document.getElementById('flw-channel').value = f.channel || 'Phone Call';
    document.getElementById('flw-reason').value = f.reason || '';
    document.getElementById('flw-date').value = f.scheduledDate || '';
    document.getElementById('flw-staff').value = f.staffMember || 'CTS Admin';
    document.getElementById('flw-response').value = f.response || '';
    document.getElementById('flw-notes').value = f.notes || '';
    document.getElementById('flw-status').value = f.status || 'Pending';

    openModal('modal-followup-form');
  }

  function handleSaveFollowUp(e) {
    e.preventDefault();
    const id = document.getElementById('flw-id').value;

    const data = {
      id: id || undefined,
      targetName: document.getElementById('flw-target-name').value.trim(),
      targetPhone: document.getElementById('flw-target-phone').value.trim(),
      targetType: document.getElementById('flw-target-type').value,
      channel: document.getElementById('flw-channel').value,
      reason: document.getElementById('flw-reason').value.trim(),
      scheduledDate: document.getElementById('flw-date').value,
      staffMember: document.getElementById('flw-staff').value.trim(),
      response: document.getElementById('flw-response').value.trim(),
      notes: document.getElementById('flw-notes').value.trim(),
      status: document.getElementById('flw-status').value
    };

    store.saveFollowUp(data);
    showToast('Follow-up task saved.', 'success');
    closeModal('modal-followup-form');
    if (state.currentView === 'followups') renderFollowUpsView();
    if (state.currentView === 'dashboard') renderDashboard();
  }

  function deleteFollowUp(id) {
    if (confirm('Delete this communication record?')) {
      store.deleteFollowUp(id);
      showToast('Follow-up deleted.', 'info');
      renderFollowUpsView();
    }
  }

  // Reviews Moderation
  function toggleReviewModeration(id) {
    const updated = store.toggleReviewApproval(id);
    if (updated) {
      showToast(`Review is now marked as ${updated.moderationStatus}`, 'success');
      renderReviewsView();
    }
  }

  function deleteReview(id) {
    if (confirm('Delete this review?')) {
      store.deleteReview(id);
      showToast('Review removed.', 'info');
      renderReviewsView();
    }
  }

  // Settings & Backup
  function handleSaveSettings(e) {
    e.preventDefault();
    const newSettings = {
      businessName: document.getElementById('cfg-business-name').value.trim(),
      brandTagline: document.getElementById('cfg-tagline').value.trim(),
      contactPhone: document.getElementById('cfg-contact-phone').value.trim(),
      whatsappNumber: document.getElementById('cfg-whatsapp').value.trim(),
      contactEmail: document.getElementById('cfg-email').value.trim(),
      officeAddress: document.getElementById('cfg-address').value.trim(),
      defaultMediaFeePercent: parseFloat(document.getElementById('cfg-media-fee-percent').value) || 50,
      defaultReferralPercent: parseFloat(document.getElementById('cfg-referral-percent').value) || 20,
      tuitionPostTemplate: document.getElementById('cfg-post-template').value
    };

    store.saveSettings(newSettings);
    showToast('Business settings saved successfully!', 'success');
  }

  function exportDataBackup() {
    const jsonStr = store.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `CTS_Backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full CTS backup JSON downloaded.', 'success');
  }

  function importDataBackup() {
    const fileInput = document.getElementById('import-file-input');
    if (!fileInput || !fileInput.files.length) {
      showToast('Please select a JSON backup file first.', 'warning');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        store.importDataJSON(e.target.result);
        showToast('CTS database restored successfully!', 'success');
        renderCurrentView();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  function confirmResetDemoData() {
    if (confirm('Are you sure you want to reset all CTS records to the clean demo dataset? Any new records you created in this browser will be replaced.')) {
      store.resetDemoData();
      showToast('System reset to original CTS demo dataset.', 'info');
      renderCurrentView();
    }
  }

  // ==========================================
  // EVENT LISTENERS & INITIALIZATION
  // ==========================================
  function setupEventListeners() {
    // Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar-btn');

    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
      });
    }
    if (closeSidebar && sidebar) {
      closeSidebar.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
      });
    }

    // Forms
    const tutorForm = document.getElementById('tutor-form');
    if (tutorForm) tutorForm.addEventListener('submit', handleSaveTutor);

    const reqForm = document.getElementById('request-form');
    if (reqForm) reqForm.addEventListener('submit', handleSaveRequest);

    const transForm = document.getElementById('pipeline-trans-form');
    if (transForm) transForm.addEventListener('submit', handleSavePipelineTransition);

    const payForm = document.getElementById('payment-form');
    if (payForm) payForm.addEventListener('submit', handleSavePayment);

    const contactForm = document.getElementById('contact-tutor-form');
    if (contactForm) contactForm.addEventListener('submit', handleSaveContactTutor);

    const flwForm = document.getElementById('flw-form');
    if (flwForm) flwForm.addEventListener('submit', handleSaveFollowUp);

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', handleSaveSettings);

    // Tutor Filters
    const tutorSearch = document.getElementById('tutor-filter-search');
    if (tutorSearch) {
      tutorSearch.addEventListener('input', e => {
        state.activeFilters.tutors.search = e.target.value;
        renderTutorsList();
      });
    }

    const tutorVer = document.getElementById('tutor-filter-verification');
    if (tutorVer) {
      tutorVer.addEventListener('change', e => {
        state.activeFilters.tutors.verification = e.target.value;
        renderTutorsList();
      });
    }

    const tutorAvail = document.getElementById('tutor-filter-availability');
    if (tutorAvail) {
      tutorAvail.addEventListener('change', e => {
        state.activeFilters.tutors.availability = e.target.value;
        renderTutorsList();
      });
    }

    const tutorGender = document.getElementById('tutor-filter-gender');
    if (tutorGender) {
      tutorGender.addEventListener('change', e => {
        state.activeFilters.tutors.gender = e.target.value;
        renderTutorsList();
      });
    }

    // Request Filters
    const reqSearch = document.getElementById('request-filter-search');
    if (reqSearch) {
      reqSearch.addEventListener('input', e => {
        state.activeFilters.requests.search = e.target.value;
        renderRequestsList();
      });
    }

    const reqStatus = document.getElementById('request-filter-status');
    if (reqStatus) {
      reqStatus.addEventListener('change', e => {
        state.activeFilters.requests.status = e.target.value;
        renderRequestsList();
      });
    }

    const reqCurriculum = document.getElementById('request-filter-curriculum');
    if (reqCurriculum) {
      reqCurriculum.addEventListener('change', e => {
        state.activeFilters.requests.curriculum = e.target.value;
        renderRequestsList();
      });
    }

    // Matching Selector
    const matchSel = document.getElementById('match-request-selector');
    if (matchSel) {
      matchSel.addEventListener('change', e => {
        state.activeMatchRequestId = e.target.value;
        renderMatchingDesk();
      });
    }

    // Post Gen Selector & Toggles
    const postSel = document.getElementById('post-request-selector');
    if (postSel) {
      postSel.addEventListener('change', e => {
        state.activePostRequestId = e.target.value;
        updatePostPreview();
      });
    }

    ['post-opt-emoji', 'post-opt-policy', 'post-opt-hotline'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updatePostPreview);
    });

    const copyPostBtn = document.getElementById('copy-post-btn');
    if (copyPostBtn) {
      copyPostBtn.addEventListener('click', async () => {
        const text = document.getElementById('post-preview-content')?.value;
        const ok = await postGen.copyToClipboard(text);
        if (ok) {
          showToast('Tuition post copied to clipboard!', 'success');
        } else {
          showToast('Failed to copy to clipboard automatically.', 'error');
        }
      });
    }

    // Accounts Filters
    const accStatus = document.getElementById('acc-filter-status');
    if (accStatus) {
      accStatus.addEventListener('change', e => {
        state.activeFilters.accounts.status = e.target.value;
        renderAccountsView();
      });
    }

    // Follow-ups Filters
    const flwOverdue = document.getElementById('flw-filter-overdue');
    if (flwOverdue) {
      flwOverdue.addEventListener('change', e => {
        state.activeFilters.followups.overdueOnly = e.target.checked;
        renderFollowUpsView();
      });
    }

    // Reviews Filter
    const revFilter = document.getElementById('reviews-filter-status');
    if (revFilter) {
      revFilter.addEventListener('change', e => {
        state.activeFilters.reviews.status = e.target.value;
        renderReviewsView();
      });
    }

    // Clickable KPI Metrics Navigation
    const kpiBindings = [
      { id: 'card-kpi-tutors', view: 'tutors', filter: () => { state.activeFilters.tutors.verification = ''; } },
      { id: 'card-kpi-verified', view: 'tutors', filter: () => { state.activeFilters.tutors.verification = 'Verified'; const el = document.getElementById('tutor-filter-verification'); if (el) el.value = 'Verified'; } },
      { id: 'card-kpi-available', view: 'tutors', filter: () => { state.activeFilters.tutors.availability = 'Available'; const el = document.getElementById('tutor-filter-availability'); if (el) el.value = 'Available'; } },
      { id: 'card-kpi-new-reqs', view: 'requests', filter: () => { state.activeFilters.requests.status = 'NEW REQUEST'; const el = document.getElementById('request-filter-status'); if (el) el.value = 'NEW REQUEST'; } },
      { id: 'card-kpi-matching', view: 'pipeline', filter: () => {} },
      { id: 'card-kpi-confirmed', view: 'requests', filter: () => { state.activeFilters.requests.status = 'CONFIRM TUITION'; const el = document.getElementById('request-filter-status'); if (el) el.value = 'CONFIRM TUITION'; } },
      { id: 'card-kpi-fees-collected', view: 'accounts', filter: () => { state.activeFilters.accounts.status = ''; } },
      { id: 'card-kpi-fees-due', view: 'accounts', filter: () => { state.activeFilters.accounts.status = 'Due'; const el = document.getElementById('acc-filter-status'); if (el) el.value = 'Due'; } }
    ];

    kpiBindings.forEach(b => {
      const el = document.getElementById(b.id);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          b.filter();
          switchView(b.view);
        });
      }
    });
  }

  // App Initialization
  function init() {
    setupEventListeners();
    switchView('dashboard');
  }

  // Public Interface for window.CTSApp
  window.CTSApp = {
    init,
    switchView,
    showToast,
    openModal,
    closeModal,
    viewTutorProfile,
    saveTutorVerification,
    openAddTutorModal,
    openEditTutorModal,
    confirmDeleteTutor,
    openAddRequestModal,
    openEditRequestModal,
    confirmDeleteRequest,
    viewRequestDetails,
    openPipelineTransitionModal,
    launchMatchingDesk,
    launchPostGenerator,
    toggleShortlist,
    assignTutorToTuition,
    openContactTutorModal,
    openRecordPaymentModal,
    openReferralPayoutModal,
    openAddFollowUpModal,
    openFollowUpModal,
    deleteFollowUp,
    toggleReviewModeration,
    deleteReview,
    exportTutorsCSV,
    exportRequestsCSV,
    exportTransactionsCSV,
    exportDataBackup,
    importDataBackup,
    confirmResetDemoData
  };

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
