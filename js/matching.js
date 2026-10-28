/**
 * Chittagong Tutor Service (CTS) - Matching Engine
 * Calculates algorithmic match score (0-100%) between a tuition request and tutors.
 * Generates transparent match reasons, warning flags, and mismatch breakdowns.
 * Matching is strictly a suggestion to assist admin decision-making.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CTSMatching = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Nearby Chittagong zone clusters for partial area matches
  const AREA_CLUSTERS = {
    'Nasirabad': ['GEC Circle', 'Panchlaish', 'Khulshi', 'Muradpur', 'Lalkhan Bazar'],
    'GEC Circle': ['Nasirabad', 'Khulshi', 'Lalkhan Bazar', 'Panchlaish', 'Dampara'],
    'Panchlaish': ['Nasirabad', 'Chawkbazar', 'GEC Circle', 'Muradpur', 'Sholashahar'],
    'Chawkbazar': ['Panchlaish', 'Kotwali', 'Jamal Khan', 'Anderkilla', 'Bakalia'],
    'Halishahar': ['Agrabad', 'Port Area', 'Chittagong Port', 'Boropol'],
    'Agrabad': ['Halishahar', 'Chittagong Port', 'Pathantooly', 'Dewanhat', 'Badamtoli'],
    'Khulshi': ['GEC Circle', 'Nasirabad', 'Polytechnic', 'Foy\'s Lake'],
    'Muradpur': ['Bahaddarhat', 'Panchlaish', 'Nasirabad', 'Oxygen', 'Sholashahar'],
    'Bahaddarhat': ['Muradpur', 'Chandgaon', 'Bakalia', 'Karnafuli'],
    'Chandgaon': ['Bahaddarhat', 'Kaloorghat', 'Shikalbaha']
  };

  /**
   * Evaluates a single tutor against a tuition requirement
   */
  function evaluateMatch(req, tutor) {
    if (!req || !tutor) return null;

    let score = 0;
    const reasons = [];
    const mismatches = [];

    // 1. Area Match (Weight: 30 pts)
    const reqArea = (req.area || '').trim();
    const tutorAreas = (tutor.preferredAreas || []).map(a => a.toLowerCase().trim());
    const reqAreaLower = reqArea.toLowerCase();

    if (tutorAreas.includes(reqAreaLower)) {
      score += 30;
      reasons.push(`Direct Area Match: Tutor is based in / covers ${reqArea}`);
    } else {
      // Check cluster proximity
      const cluster = (AREA_CLUSTERS[reqArea] || []).map(a => a.toLowerCase());
      const hasNearby = tutorAreas.some(a => cluster.includes(a));
      if (hasNearby) {
        score += 15;
        reasons.push(`Nearby Zone Match: Tutor covers neighboring areas close to ${reqArea}`);
      } else {
        mismatches.push(`Area Mismatch: Preferred area "${reqArea}" is not in tutor's preferred locations (${tutor.preferredAreas.join(', ') || 'None specified'})`);
      }
    }

    // 2. Subject Overlap (Weight: 25 pts)
    const reqSubjects = req.subjects || [];
    const tutorSubjects = (tutor.preferredSubjects || []).map(s => s.toLowerCase().trim());

    if (reqSubjects.length === 0) {
      score += 15;
      reasons.push('General subjects match');
    } else {
      const matchedSubs = reqSubjects.filter(sub =>
        tutorSubjects.includes(sub.toLowerCase().trim())
      );
      const ratio = matchedSubs.length / reqSubjects.length;

      if (ratio === 1) {
        score += 25;
        reasons.push(`Complete Subject Match: Teaches all required subjects (${matchedSubs.join(', ')})`);
      } else if (ratio > 0) {
        const subScore = Math.round(ratio * 25);
        score += subScore;
        const missingSubs = reqSubjects.filter(sub => !tutorSubjects.includes(sub.toLowerCase().trim()));
        reasons.push(`Partial Subject Match: Covers ${matchedSubs.join(', ')}`);
        mismatches.push(`Missing Subject(s): Tutor does not specialize in ${missingSubs.join(', ')}`);
      } else {
        mismatches.push(`Subject Mismatch: Tutor does not teach any of the requested subjects (${reqSubjects.join(', ')})`);
      }
    }

    // 3. Curriculum / Medium Match (Weight: 20 pts)
    const reqMedium = (req.curriculum || '').trim().toLowerCase();
    const tutorMediums = (tutor.preferredMediums || []).map(m => m.toLowerCase().trim());

    if (!reqMedium || tutorMediums.some(m => m.includes(reqMedium) || reqMedium.includes(m))) {
      score += 20;
      reasons.push(`Curriculum Match: Experienced in ${req.curriculum}`);
    } else {
      mismatches.push(`Curriculum Mismatch: Tutor primarily lists (${tutor.preferredMediums.join(', ') || 'Not specified'}) instead of "${req.curriculum}"`);
    }

    // 4. Gender Match (Weight: 10 pts)
    const prefGender = req.preferredTutorGender || 'Any';
    if (prefGender === 'Any' || !prefGender) {
      score += 10;
      reasons.push(`Gender Preference: Guardian accepts any tutor gender (${tutor.gender})`);
    } else if (prefGender.toLowerCase() === (tutor.gender || '').toLowerCase()) {
      score += 10;
      reasons.push(`Gender Match: Guardian requested ${prefGender} and tutor is ${tutor.gender}`);
    } else {
      mismatches.push(`Gender Mismatch: Guardian specifically requested "${prefGender}" tutor, but candidate is ${tutor.gender}`);
    }

    // 5. Budget & Salary Compatibility (Weight: 10 pts)
    const budget = parseFloat(req.salaryBudget) || 0;
    const minSalary = parseFloat(tutor.expectedSalaryMin) || 0;

    if (budget <= 0 || minSalary <= 0) {
      score += 5;
    } else if (budget >= minSalary) {
      score += 10;
      reasons.push(`Budget Fit: Monthly budget (৳${budget.toLocaleString()}) meets tutor expectation (Min ৳${minSalary.toLocaleString()})`);
    } else if (budget >= minSalary * 0.85) {
      score += 6;
      reasons.push(`Close Budget: Budget ৳${budget.toLocaleString()} is within negotiable range of tutor min ৳${minSalary.toLocaleString()}`);
    } else {
      mismatches.push(`Budget Gap: Guardian budget is ৳${budget.toLocaleString()}, while tutor expects min ৳${minSalary.toLocaleString()}`);
    }

    // 6. Verification Status Bonus (Weight: 5 pts)
    if (tutor.verificationStatus === 'Verified') {
      score += 5;
      reasons.push('Verified Tutor: Identity, academic records, and university status verified by CTS admin');
    } else if (tutor.verificationStatus === 'Under Review') {
      reasons.push('Verification Under Review: Initial documents submitted');
    } else {
      mismatches.push('Verification Pending: Profile not yet verified by CTS admin');
    }

    // Determine match classification
    let grade = 'Moderate Match';
    let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    if (score >= 80) {
      grade = 'Excellent Match';
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (score >= 60) {
      grade = 'Good Match';
      badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (score < 40) {
      grade = 'Low Match';
      badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    }

    // Check if currently shortlisted or assigned
    const isShortlisted = Boolean(req.shortlistedTutors && req.shortlistedTutors.includes(tutor.id));
    const isAssigned = req.assignedTutorId === tutor.id;
    const contactInfo = (req.contactedTutors || []).find(c => c.tutorId === tutor.id) || null;

    return {
      tutor,
      score: Math.min(100, Math.max(0, score)),
      grade,
      badgeColor,
      reasons,
      mismatches,
      isShortlisted,
      isAssigned,
      contactInfo
    };
  }

  /**
   * Ranks all tutors in system for a given requirement
   */
  function findMatches(req, allTutors, options = {}) {
    if (!req || !Array.isArray(allTutors)) return [];

    let results = allTutors.map(tutor => evaluateMatch(req, tutor));

    // Optional filter for only available tutors
    if (options.onlyAvailable) {
      results = results.filter(r => r.tutor.availability === 'Available');
    }

    // Optional filter for verified only
    if (options.onlyVerified) {
      results = results.filter(r => r.tutor.verificationStatus === 'Verified');
    }

    // Sort by match score descending, then by tutor experience, then CGPA
    results.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if ((b.tutor.experienceYears || 0) !== (a.tutor.experienceYears || 0)) {
        return (b.tutor.experienceYears || 0) - (a.tutor.experienceYears || 0);
      }
      return (b.tutor.cgpa || 0) - (a.tutor.cgpa || 0);
    });

    return results;
  }

  return {
    evaluateMatch,
    findMatches,
    AREA_CLUSTERS
  };
});
