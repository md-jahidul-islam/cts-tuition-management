/**
 * Chittagong Tutor Service (CTS) - Public Portal Controller
 * Controls category filtering, public inquiry submissions, tutor applications,
 * and rendering public-safe previews.
 */

(function () {
  'use strict';

  const store = window.CTSStore.instance;

  function showPublicToast(message, type = 'success') {
    const container = document.getElementById('public-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'bg-slate-900 border-l-4 border-amber-500 text-white',
      error: 'bg-rose-900 border-l-4 border-rose-500 text-white',
      info: 'bg-blue-950 border-l-4 border-blue-400 text-white'
    };

    toast.className = `p-4 rounded shadow-xl flex items-center justify-between min-w-[300px] max-w-md transition-all duration-300 transform translate-y-2 opacity-0 text-sm ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="font-medium">${message}</span>
      </div>
      <button class="ml-4 text-slate-400 hover:text-white" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Render Public Available Tuitions (Privacy Preserved)
  function renderPublicTuitionBoard() {
    const boardEl = document.getElementById('public-tuitions-board');
    if (!boardEl) return;

    const requests = store.getRequests().filter(r => ['NEW REQUEST', 'FIND TUTORS', 'CONTACT TUTORS'].includes(r.status));
    
    if (requests.length === 0) {
      boardEl.innerHTML = `
        <div class="col-span-full text-center py-10 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-sm">
          No new tuition vacancies currently open for application. Check back shortly!
        </div>
      `;
      return;
    }

    boardEl.innerHTML = requests.slice(0, 6).map(req => `
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition hover:border-amber-400 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <span class="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ${req.id}
            </span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              ৳${(req.salaryBudget || 0).toLocaleString()} / mo
            </span>
          </div>

          <div class="mt-3">
            <h4 class="font-bold text-brand-950 text-base">${req.classLevel} (${req.curriculum})</h4>
            <div class="text-xs text-slate-500 mt-0.5 flex items-center">
              📍 Area: <strong class="text-slate-800 ml-1">${req.area}, Chittagong</strong>
            </div>
            <div class="text-xs text-amber-800 font-semibold mt-2">
              Subjects: ${(req.subjects || []).join(', ')}
            </div>
            <div class="text-xs text-slate-600 mt-1">
              Schedule: ${req.daysPerWeek} days/week • ${req.preferredTime || 'Flexible'}
            </div>
            <div class="text-xs text-slate-500 mt-1">
              Pref: ${req.preferredTutorGender || 'Any'} Tutor (${req.preferredTutorUniversity || 'Any University'})
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-400">🛡️ Verified by CTS</span>
          <button onclick="window.CTSPublic.openApplyTutorModal('${req.id}')" class="px-3 py-1.5 bg-brand-950 hover:bg-brand-900 text-amber-400 font-bold rounded shadow transition">
            Apply for Tuition
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render Public Tutor Directory (Only Verified, strictly hiding personal contacts)
  function renderPublicTutors() {
    const container = document.getElementById('public-tutors-showcase');
    if (!container) return;

    const tutors = store.getTutors().filter(t => t.verificationStatus === 'Verified' && t.availability === 'Available');

    container.innerHTML = tutors.slice(0, 6).map(tutor => `
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition text-center flex flex-col justify-between">
        <div>
          <div class="w-16 h-16 mx-auto rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl mb-3 border-2 border-amber-400">
            ${tutor.name.charAt(0)}
          </div>
          <h4 class="font-bold text-slate-900 text-base">${tutor.name}</h4>
          <span class="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 border border-emerald-200">
            ✓ Verified CTS Mentor
          </span>
          <p class="text-xs text-slate-600 font-medium mt-2">${tutor.university}</p>
          <p class="text-xs text-slate-500">${tutor.department} • CGPA: <strong>${tutor.cgpa ? tutor.cgpa.toFixed(2) : '3.80'}</strong></p>
          
          <div class="mt-3 text-xs bg-slate-50 p-2 rounded text-slate-700">
            <strong>Teaches:</strong> ${(tutor.preferredSubjects || []).slice(0, 3).join(', ')}
          </div>
          <div class="mt-1 text-[11px] text-slate-500">
            Areas: ${(tutor.preferredAreas || []).slice(0, 3).join(', ')}
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100">
          <button onclick="window.CTSPublic.openRequestTutorModal('${tutor.id}')" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition">
            Request This Mentor
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render Approved Testimonials
  function renderPublicTestimonials() {
    const container = document.getElementById('public-testimonials-container');
    if (!container) return;

    const approvedReviews = store.getReviews(true);

    if (approvedReviews.length === 0) {
      container.innerHTML = `<div class="text-center text-slate-400 py-6">No testimonials published yet.</div>`;
      return;
    }

    container.innerHTML = approvedReviews.slice(0, 3).map(rev => {
      const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
      return `
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div class="text-amber-500 text-lg mb-2">${stars}</div>
            <p class="text-slate-700 text-sm italic mb-4">"${rev.feedback}"</p>
          </div>
          <div class="pt-3 border-t border-slate-100">
            <h5 class="font-bold text-brand-950 text-sm">${rev.reviewerName}</h5>
            <span class="text-xs text-slate-500">${rev.reviewerRole} • Chittagong</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Modals Controller
  function openPublicModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  }

  function closePublicModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  // Handle Guardian Request Submission
  function handleGuardianRequest(e) {
    e.preventDefault();

    const guardianName = document.getElementById('pub-guard-name').value.trim();
    const studentName = document.getElementById('pub-stud-name').value.trim();
    const phone = document.getElementById('pub-phone').value.trim();
    const area = document.getElementById('pub-area').value;
    const classLevel = document.getElementById('pub-class').value;
    const curriculum = document.getElementById('pub-curriculum').value;
    const subjects = document.getElementById('pub-subjects').value.split(',').map(s => s.trim()).filter(Boolean);
    const salary = parseFloat(document.getElementById('pub-salary').value) || 8000;
    const days = parseInt(document.getElementById('pub-days').value, 10) || 3;
    const genderPref = document.getElementById('pub-gender-pref').value;

    try {
      const saved = store.saveRequest({
        guardianName,
        studentName,
        phone,
        area,
        city: 'Chittagong',
        classLevel,
        curriculum,
        subjects,
        salaryBudget: salary,
        daysPerWeek: days,
        preferredTutorGender: genderPref,
        tuitionType: 'Home Tutoring',
        status: 'NEW REQUEST',
        privateNotes: 'Submitted via CTS Public Website Portal.'
      });

      closePublicModal('modal-public-request-tutor');
      showPublicToast(`Tuition Request ${saved.id} submitted successfully! Our Chittagong desk will contact you within 24 hours.`, 'success');
      renderPublicTuitionBoard();
      
      // Informative alert modal
      alert(`🎉 Request Submitted!\n\nYour Tuition Tracking ID is: ${saved.id}\nArea: ${saved.area}\n\n[MVP Single-Browser Note]: This request was recorded in your browser's LocalStorage and is now visible immediately in the CTS Admin Dashboard!`);
    } catch (err) {
      showPublicToast(err.message, 'error');
    }
  }

  // Handle Tutor Application Submission
  function handleTutorApplication(e) {
    e.preventDefault();

    const name = document.getElementById('pub-tut-name').value.trim();
    const phone = document.getElementById('pub-tut-phone').value.trim();
    const email = document.getElementById('pub-tut-email').value.trim();
    const gender = document.getElementById('pub-tut-gender').value;
    const university = document.getElementById('pub-tut-uni').value.trim();
    const department = document.getElementById('pub-tut-dept').value.trim();
    const cgpa = parseFloat(document.getElementById('pub-tut-cgpa').value) || 0;
    const areas = document.getElementById('pub-tut-areas').value.split(',').map(s => s.trim()).filter(Boolean);
    const subjects = document.getElementById('pub-tut-subjects').value.split(',').map(s => s.trim()).filter(Boolean);
    const minSalary = parseFloat(document.getElementById('pub-tut-salary').value) || 7000;

    try {
      const saved = store.saveTutor({
        name,
        phone,
        email,
        gender,
        university,
        department,
        cgpa,
        preferredAreas: areas,
        preferredMediums: ['Bangla Medium', 'English Version'],
        preferredSubjects: subjects,
        expectedSalaryMin: minSalary,
        expectedSalaryMax: minSalary + 4000,
        availability: 'Available',
        verificationStatus: 'Pending',
        notes: 'Applied through CTS public portal application form.'
      });

      closePublicModal('modal-public-become-tutor');
      showPublicToast(`Application submitted! Your CTS Tutor ID is ${saved.id}. Pending Admin Verification.`, 'success');
      
      alert(`🎉 Application Received!\n\nYour CTS Tutor ID is: ${saved.id}\nStatus: Pending Verification\n\n[MVP Single-Browser Note]: Profile saved locally. The CTS Admin can now verify your documents in the Admin Dashboard!`);
    } catch (err) {
      showPublicToast(err.message, 'error');
    }
  }

  function init() {
    renderPublicTuitionBoard();
    renderPublicTutors();
    renderPublicTestimonials();

    const reqForm = document.getElementById('public-request-form');
    if (reqForm) reqForm.addEventListener('submit', handleGuardianRequest);

    const tutForm = document.getElementById('public-tutor-form');
    if (tutForm) tutForm.addEventListener('submit', handleTutorApplication);
  }

  window.CTSPublic = {
    init,
    openRequestTutorModal: () => openPublicModal('modal-public-request-tutor'),
    openBecomeTutorModal: () => openPublicModal('modal-public-become-tutor'),
    openApplyTutorModal: (tuitionId) => {
      alert(`To apply for tuition ${tuitionId}, please complete your tutor profile registration first or message CTS Hotline with this code.`);
      openPublicModal('modal-public-become-tutor');
    },
    closeModal: closePublicModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
