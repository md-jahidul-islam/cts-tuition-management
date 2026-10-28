/**
 * CTS Core Engine Automated Test Suite
 * Tests store functionality, validation rules, matching algorithm,
 * fee calculations, and tuition post generator.
 */

const Store = require('./js/store.js');
const Matching = require('./js/matching.js');
const PostGenerator = require('./js/post-generator.js');

console.log('--- Starting CTS Core Engine Verification Tests ---');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

// 1. Store Initialization & Demo Data Check
console.log('\n[Test Suite 1: Store & Initial Demo Records]');
const store = Store.instance;
const tutors = store.getTutors();
const requests = store.getRequests();

assert(tutors.length >= 6, `Tutors initialized with at least 6 records (found ${tutors.length})`);
assert(requests.length >= 6, `Requests initialized with at least 6 records (found ${requests.length})`);
assert(tutors.every(t => t.id.startsWith('CTS-TUT-')), 'All tutors have valid CTS-TUT IDs');
assert(requests.every(r => r.id.startsWith('CTS-REQ-')), 'All requests have valid CTS-REQ IDs');

// 2. Phone Validation Tests
console.log('\n[Test Suite 2: Bangladesh Phone Validation]');
const validBD1 = Store.validateBDPhone('01812345678');
const validBD2 = Store.validateBDPhone('+8801712345678');
const validBD3 = Store.validateBDPhone('01912-345678');
const invalidBD1 = Store.validateBDPhone('12345');
const invalidBD2 = Store.validateBDPhone('01212345678'); // 012 is invalid operator in BD

assert(validBD1.isValid && validBD1.cleanNumber === '01812345678', 'Accepts standard 018... number');
assert(validBD2.isValid && validBD2.cleanNumber === '01712345678', 'Accepts +88017... number');
assert(validBD3.isValid && validBD3.cleanNumber === '01912345678', 'Normalizes hyphenated numbers');
assert(!invalidBD1.isValid, 'Rejects too short numbers');
assert(!invalidBD2.isValid, 'Rejects invalid BD mobile operator prefixes');

// 3. Profile Completeness Calculation
console.log('\n[Test Suite 3: Profile Completeness Calculation]');
const fullTutor = tutors.find(t => t.id === 'CTS-TUT-1001');
const incompleteTutor = tutors.find(t => t.id === 'CTS-TUT-1005');

const fullScore = Store.calculateProfileCompleteness(fullTutor);
const partialScore = Store.calculateProfileCompleteness(incompleteTutor);

assert(fullScore === 100, `Fully verified tutor scores 100% (scored ${fullScore}%)`);
assert(partialScore > 0 && partialScore < 100, `Partial tutor scores between 1 and 99% (scored ${partialScore}%)`);

// 4. Duplicate Check Tests
console.log('\n[Test Suite 4: Duplicate Detection]');
const isTutorDup = store.checkDuplicateTutor('01812345678', 'unique@mail.local');
const isTutorNotDup = store.checkDuplicateTutor('01999999999', 'newtutor@cts-demo.local');

assert(isTutorDup === true, 'Correctly flags duplicate tutor phone number');
assert(isTutorNotDup === false, 'Allows unique tutor phone number');

// 5. Matching Engine Tests
console.log('\n[Test Suite 5: Tutor Matching Engine]');
const testReq = store.getRequest('CTS-REQ-2001'); // Nasirabad, English Version, Physics, Higher Math, Male
const matches = Matching.findMatches(testReq, tutors);

assert(matches.length === tutors.length, 'Evaluates all tutors');
assert(matches[0].score >= 80, `Top candidate achieves high match score (${matches[0].score}%)`);
assert(matches[0].tutor.gender === 'Male', 'Top match satisfies preferred gender');
assert(matches[0].reasons.length > 0, 'Generates clear positive match reasons');
assert(matches.some(m => m.mismatches.length > 0), 'Generates clear mismatch breakdown for lower matches');

// 6. Pipeline Transition Logic
console.log('\n[Test Suite 6: 11-Stage Pipeline Transitions]');
const reqToTransition = store.getRequest('CTS-REQ-2003');
const initialStage = reqToTransition.status;
assert(initialStage === 'NEW REQUEST', `Initial stage is NEW REQUEST (was ${initialStage})`);

const updatedReq = store.updatePipelineStage('CTS-REQ-2003', 'VERIFY REQUIREMENT', 'Phone verified with guardian', 'Admin Tester');
assert(updatedReq.status === 'VERIFY REQUIREMENT', 'Successfully transitions to next pipeline stage');
assert(updatedReq.activityLog.some(a => a.text.includes('Stage changed')), 'Stage change logged in request activity log');

// 7. Media Fee & Referral Accounting
console.log('\n[Test Suite 7: Financial Accounting & Ledger]');
const paymentResult = store.recordMediaFeePayment('CTS-REQ-2001', {
  amount: 2500,
  method: 'bKash',
  trxId: 'TEST-TRX-101',
  payerName: 'Dr. Kazi Mahfuzur Rahman (Demo)',
  receiverStaff: 'CTS Admin',
  notes: 'First installment of media fee'
});

assert(paymentResult.request.mediaFeeReceived === 2500, 'Accurately credits media fee payment');
assert(paymentResult.request.mediaFeeDue === 2500, 'Accurately recalculates outstanding fee balance');
assert(paymentResult.request.mediaFeeStatus === 'Partially Paid', 'Status changes to Partially Paid');

const transactions = store.getTransactions();
assert(transactions.some(t => t.trxId === 'TEST-TRX-101'), 'Transaction recorded in financial ledger');

// 8. Tuition Post Generator
console.log('\n[Test Suite 8: Tuition Post Generator]');
const socialPost = PostGenerator.generatePost(testReq, { useEmoji: true });
const plainPost = PostGenerator.generatePost(testReq, { useEmoji: false });

assert(socialPost.includes('CTS TUITION ALERT'), 'Social post contains CTS alert header');
assert(socialPost.includes(testReq.id), 'Social post contains tuition code');
assert(!socialPost.includes(testReq.guardianName), 'Social post hides guardian name (privacy preserved)');
assert(!socialPost.includes(testReq.phone), 'Social post hides guardian phone number (privacy preserved)');
assert(!socialPost.includes('Flat 5B'), 'Social post hides private apartment address');
assert(socialPost.includes(testReq.area), 'Social post includes public area');
assert(plainPost.includes('Tuition Code:'), 'Plain post generates clean text without emojis');

// Summary
console.log(`\n==============================================`);
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log(`==============================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
