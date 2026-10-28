/**
 * CTS Comprehensive End-to-End Simulation Test Suite
 * Tests full business workflow:
 * 1. Tutor Registration & Phone Validation
 * 2. Guardian Tuition Requirement Creation
 * 3. Match Engine Scoring & Ranking
 * 4. 11-Stage Pipeline Progression
 * 5. Post Generator Privacy Masking
 * 6. Financial Ledger & Partial/Full Media Fee Collection
 * 7. Referral Commission Payout
 * 8. Follow-up Communications & Overdue Detection
 * 9. Review Moderation
 * 10. JSON Export/Import & Schema Validation
 */

const Store = require('./js/store.js');
const Matching = require('./js/matching.js');
const PostGenerator = require('./js/post-generator.js');

console.log('=====================================================');
console.log('   CTS FULL E2E BUSINESS SIMULATION & VERIFICATION    ');
console.log('=====================================================\n');

let total = 0;
let passed = 0;

function check(assertion, description) {
  total++;
  if (assertion) {
    passed++;
    console.log(`  [PASS] ${description}`);
  } else {
    console.error(`  [FAIL] ${description}`);
  }
}

const store = new Store.Store();

// Step 1: Tutor Registration
console.log('1. Testing Tutor Registration & Verification Checklist');
const newTutor = store.saveTutor({
  name: 'Mushfiqur Rahman (Demo)',
  phone: '01888888888',
  email: 'mushfiq.cuet@cts-demo.local',
  gender: 'Male',
  university: 'CUET',
  department: 'Civil Engineering',
  session: '2021-2022',
  cgpa: 3.82,
  sscGpa: 5.0,
  hscGpa: 5.0,
  preferredAreas: ['Nasirabad', 'GEC Circle', 'Panchlaish'],
  preferredMediums: ['Bangla Medium', 'English Version'],
  preferredSubjects: ['Physics', 'Higher Math', 'General Math'],
  expectedSalaryMin: 8500,
  expectedSalaryMax: 12000,
  availability: 'Available',
  verificationStatus: 'Under Review',
  verificationChecklist: {
    nid: true,
    studentId: true,
    certificates: false,
    policeOrAddress: false,
    interview: true
  },
  notes: 'Documents submitted at CTS office.'
});

check(newTutor.id.startsWith('CTS-TUT-'), `New tutor ID assigned: ${newTutor.id}`);
check(newTutor.profileCompleteness >= 75, `Profile completeness calculated: ${newTutor.profileCompleteness}%`);
check(newTutor.phone === '01888888888', 'Phone stored in normalized format');

// Step 2: Guardian Tuition Requirement Creation
console.log('\n2. Testing Tuition Requirement Creation & Fee Math');
const newReq = store.saveRequest({
  guardianName: 'Dr. Shahinur Alam (Demo)',
  studentName: 'Shahinur Jr (Demo)',
  phone: '01799999999',
  privateAddress: 'Apt 4A, Hill View R/A, Nasirabad, Chittagong',
  city: 'Chittagong',
  area: 'Nasirabad',
  classLevel: 'Class 10 (SSC)',
  curriculum: 'English Version',
  subjects: ['Physics', 'Higher Math'],
  studentGender: 'Male',
  preferredTutorGender: 'Male',
  preferredTutorUniversity: 'CUET',
  daysPerWeek: 4,
  preferredTime: 'Evening 6:00 PM',
  salaryBudget: 10000,
  tuitionType: 'Home Tutoring',
  referralPerson: 'Kawsar Ahmed',
  privateNotes: 'Needs focus on SSC Higher Math syllabus.'
});

check(newReq.id.startsWith('CTS-REQ-'), `Tuition Code assigned: ${newReq.id}`);
check(newReq.mediaFeeAgreed === 5000, `Calculated 50% media fee agreed: ৳${newReq.mediaFeeAgreed}`);
check(newReq.mediaFeeDue === 5000, `Initial media fee due: ৳${newReq.mediaFeeDue}`);
check(newReq.mediaFeeStatus === 'Due', `Status is Due`);
check(newReq.referralAmount === 1000, `Calculated 20% referral commission: ৳${newReq.referralAmount}`);

// Step 3: Run Smart Matching Engine
console.log('\n3. Testing Smart Matching Engine Scoring');
const tutors = store.getTutors();
const matchResults = Matching.findMatches(newReq, tutors);
const topCandidate = matchResults[0];

check(matchResults.length === tutors.length, `Evaluated all registered tutors (${matchResults.length} tutors)`);
check(topCandidate.score >= 80, `Top candidate score is ${topCandidate.score}%`);
check(topCandidate.reasons.length >= 3, `Positive match breakdown produced ${topCandidate.reasons.length} reasons`);
check(topCandidate.reasons.some(r => r.includes('Area Match') || r.includes('Nasirabad')), 'Includes location match reason');

// Step 4: Progression across all 11 stages of the pipeline
console.log('\n4. Testing 11-Stage Pipeline Transitions');
const stages = Store.PIPELINE_STAGES;

let currentStageReq = newReq;
for (let i = 1; i < stages.length; i++) {
  const stage = stages[i];
  currentStageReq = store.updatePipelineStage(newReq.id, stage, `Automated step test to ${stage}`, 'System Test');
  check(currentStageReq.status === stage, `Pipeline advanced to [${stage}]`);
}
check(currentStageReq.activityLog.length >= 11, `Audit log contains ${currentStageReq.activityLog.length} historical transitions`);

// Step 5: Tuition Post Generator with Privacy Protection
console.log('\n5. Testing Tuition Post Generator Privacy Features');
const adPostWithEmoji = PostGenerator.generatePost(newReq, { useEmoji: true });
const adPostPlain = PostGenerator.generatePost(newReq, { useEmoji: false });

check(!adPostWithEmoji.includes('Dr. Shahinur Alam'), 'Privacy: Guardian name hidden');
check(!adPostWithEmoji.includes('01799999999'), 'Privacy: Private phone hidden');
check(!adPostWithEmoji.includes('Apt 4A, Hill View'), 'Privacy: Private street address hidden');
check(adPostWithEmoji.includes('Nasirabad, Chittagong'), 'Includes general public area');
check(adPostWithEmoji.includes('Physics, Higher Math'), 'Includes required subjects');
check(adPostPlain.includes('[TUITION REQUIREMENT NOTICE'), 'Plain text generator format verified');

// Step 6: Financial Ledger & Media Fee Collection
console.log('\n6. Testing Partial & Full Fee Collection');
// Installment 1: ৳3,000 partial
const partPay = store.recordMediaFeePayment(newReq.id, {
  amount: 3000,
  method: 'bKash',
  trxId: 'TRX-BKASH-3000',
  payerName: 'Dr. Shahinur Alam (Demo)'
});
check(partPay.request.mediaFeeReceived === 3000, 'Partial fee received: ৳3,000');
check(partPay.request.mediaFeeDue === 2000, 'Remaining fee due: ৳2,000');
check(partPay.request.mediaFeeStatus === 'Partially Paid', 'Status updated to Partially Paid');

// Installment 2: ৳2,000 final
const finalPay = store.recordMediaFeePayment(newReq.id, {
  amount: 2000,
  method: 'Nagad',
  trxId: 'TRX-NAGAD-2000',
  payerName: 'Dr. Shahinur Alam (Demo)'
});
check(finalPay.request.mediaFeeReceived === 5000, 'Total fee received: ৳5,000');
check(finalPay.request.mediaFeeDue === 0, 'Remaining fee due: ৳0');
check(finalPay.request.mediaFeeStatus === 'Paid', 'Status updated to Paid');

// Step 7: Referral Commission Payout
console.log('\n7. Testing Referral Commission Payout');
const refPayout = store.recordReferralPayout(newReq.id, {
  amount: 1000,
  method: 'bKash',
  trxId: 'TRX-REF-1000',
  recipientName: 'Kawsar Ahmed'
});
check(refPayout.request.referralStatus === 'Paid', 'Referral status marked as Paid');

// Step 8: Central Communication & Follow-up Log
console.log('\n8. Testing Follow-up Tasks & Overdue Detection');
const overdueFollowUp = store.saveFollowUp({
  tuitionId: newReq.id,
  targetName: 'Dr. Shahinur Alam',
  targetPhone: '01799999999',
  targetType: 'Guardian',
  channel: 'Phone Call',
  reason: 'Monthly Review',
  scheduledDate: '2026-10-01', // in past -> overdue
  status: 'Pending'
});
const allFollowUps = store.getFollowUps();
const retrieved = allFollowUps.find(f => f.id === overdueFollowUp.id);
check(retrieved.isOverdue === true, 'Correctly flags past scheduled date as overdue');

// Step 9: Reviews & Moderation Toggle
console.log('\n9. Testing Testimonial Moderation Approval');
const rev = store.saveReview({
  reviewerName: 'Dr. Shahinur Alam (Demo)',
  reviewerRole: 'Guardian',
  tuitionId: newReq.id,
  rating: 5,
  feedback: 'CTS provided a fantastic CUET tutor within 24 hours. Highly recommended!',
  moderationStatus: 'Pending'
});
check(rev.moderationStatus === 'Pending', 'New review starts as Pending');

const approvedRev = store.toggleReviewApproval(rev.id);
check(approvedRev.moderationStatus === 'Approved', 'Review successfully approved for public showcase');

const publicReviews = store.getReviews(true);
check(publicReviews.some(r => r.id === rev.id), 'Approved review appears in public feed');

// Step 10: JSON Backup Export & Schema Import Validation
console.log('\n10. Testing Full JSON Backup & Schema Validation');
const backupJSON = store.exportDataJSON();
check(typeof backupJSON === 'string' && backupJSON.length > 500, 'Exported valid JSON backup string');

let importSuccess = false;
try {
  importSuccess = store.importDataJSON(backupJSON);
} catch (e) {
  importSuccess = false;
}
check(importSuccess === true, 'Import and schema validation succeeded');

// Test bad schema rejection
let rejectedBadSchema = false;
try {
  store.importDataJSON(JSON.stringify({ invalid: "data" }));
} catch (e) {
  rejectedBadSchema = true;
}
check(rejectedBadSchema === true, 'Correctly rejected invalid schema payload');

console.log('\n=====================================================');
console.log(`   SIMULATION RESULTS: ${passed} / ${total} CHECKS PASSED`);
console.log('=====================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
