/**
 * Chittagong Tutor Service (CTS) - Data Store & LocalStorage Manager
 * Handles data persistence, initial demo records, validation, and analytics.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CTSStore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  const STORAGE_KEY = 'CTS_APP_DATA_V1';

  // 11-step visual tuition pipeline defined by business requirements
  const PIPELINE_STAGES = [
    'NEW REQUEST',
    'VERIFY REQUIREMENT',
    'FIND TUTORS',
    'CONTACT TUTORS',
    'SHORTLIST',
    'GUARDIAN APPROVAL',
    'TRIAL CLASS',
    'CONFIRM TUITION',
    'COMPLETE',
    'COLLECT MEDIA FEE',
    'FOLLOW-UP'
  ];

  // Areas across Chittagong and greater hubs
  const CHITTAGONG_AREAS = [
    'Nasirabad',
    'GEC Circle',
    'Panchlaish',
    'Chawkbazar',
    'Halishahar',
    'Agrabad',
    'Khulshi',
    'Muradpur',
    'Bahaddarhat',
    'Chandgaon',
    'Anderkilla',
    'Kotwali',
    'Lalkhan Bazar',
    'Jamal Khan',
    'Sholashahar',
    'Oxygen',
    'Bakalia',
    'Hathazari Road',
    'Bayazid',
    'Port Area'
  ];

  // Standard curricula in Bangladesh
  const CURRICULA = [
    'Bangla Medium',
    'English Version',
    'English Medium (Edexcel/Cambridge)',
    'Madrasah Medium',
    'Admission Preparation'
  ];

  // Popular subject list
  const SUBJECTS = [
    'General Math',
    'Higher Math',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Bangla',
    'ICT',
    'General Science',
    'Accounting',
    'Economics',
    'Finance & Banking',
    'Statistics',
    'Social Science',
    'IELTS / Spoken English',
    'Quran & Arabic'
  ];

  // Default configuration & business settings
  const DEFAULT_SETTINGS = {
    businessName: 'Chittagong Tutor Service (CTS)',
    brandTagline: 'Excellence in Tuition Media Across Chittagong & Bangladesh',
    contactPhone: '+880 1800-000000 (Demo Hotline)',
    whatsappNumber: '+880 1800-000000 (Demo)',
    contactEmail: 'support@cts-demo.local',
    officeAddress: 'Equity Central (Level 4), GEC Circle, CDA Avenue, Chittagong',
    currencySymbol: '৳',
    currencyCode: 'BDT',
    defaultMediaFeePercent: 50,
    defaultReferralPercent: 20,
    tuitionPostTemplate: `[CTS TUITION ALERT | {CODE}]
━━━━━━━━━━━━━━━━━━━━
📌 Area: {AREA}, Chittagong
🎓 Class: {CLASS} ({CURRICULUM})
📚 Subjects: {SUBJECTS}
📅 Days/Week: {DAYS} days/week
⏰ Preferred Time: {TIME}
💰 Monthly Remuneration: {SALARY}
👤 Preferred Tutor: {TUTOR_PREFERENCE}
🎯 Tutoring Mode: {TYPE}
━━━━━━━━━━━━━━━━━━━━
💼 CTS Media Policy: {MEDIA_POLICY}
📞 Inquire / Apply: {HOTLINE}
(CTS - Chittagong Tutor Service | Code: {CODE})`
  };

  // Initial Demo Dataset with clearly labeled demo contacts
  function generateInitialData() {
    const tutors = [
      {
        id: 'CTS-TUT-1001',
        name: 'Tanvir Ahmed (Demo)',
        phone: '01812345678',
        displayPhone: '+880 1812-345678 (Demo)',
        email: 'tanvir.cuet@cts-demo.local',
        gender: 'Male',
        university: 'CUET (Chittagong Univ. of Eng. & Tech)',
        department: 'Computer Science & Engineering',
        session: '2021-2022',
        cgpa: 3.78,
        sscGpa: 5.0,
        hscGpa: 5.0,
        preferredAreas: ['Nasirabad', 'GEC Circle', 'Panchlaish', 'Khulshi', 'Muradpur'],
        preferredMediums: ['Bangla Medium', 'English Version'],
        preferredSubjects: ['Physics', 'Higher Math', 'General Math', 'ICT'],
        preferredClasses: ['Class 9', 'Class 10 (SSC)', 'Class 11 (HSC)', 'Class 12 (HSC)'],
        experienceYears: 3,
        expectedSalaryMin: 8000,
        expectedSalaryMax: 12000,
        availability: 'Available',
        verificationStatus: 'Verified',
        verificationChecklist: {
          nid: true,
          studentId: true,
          certificates: true,
          policeOrAddress: true,
          interview: true
        },
        profileCompleteness: 100,
        notes: 'Top tutor for HSC Higher Math & Physics. Exemplary punctuality records.',
        registeredDate: '2026-09-12'
      },
      {
        id: 'CTS-TUT-1002',
        name: 'Dr. (Intern) Nusrat Jahan (Demo)',
        phone: '01823456789',
        displayPhone: '+880 1823-456789 (Demo)',
        email: 'nusrat.cmc@cts-demo.local',
        gender: 'Female',
        university: 'Chittagong Medical College (CMC)',
        department: 'MBBS (Final Year)',
        session: '2020-2021',
        cgpa: 3.85,
        sscGpa: 5.0,
        hscGpa: 5.0,
        preferredAreas: ['Panchlaish', 'Chawkbazar', 'Nasirabad', 'GEC Circle', 'Jamal Khan'],
        preferredMediums: ['Bangla Medium', 'English Version', 'English Medium (Edexcel/Cambridge)'],
        preferredSubjects: ['Biology', 'Chemistry', 'General Science'],
        preferredClasses: ['Class 8', 'Class 9', 'Class 10 (SSC)', 'Class 11 (HSC)', 'Class 12 (HSC)'],
        experienceYears: 4,
        expectedSalaryMin: 9000,
        expectedSalaryMax: 15000,
        availability: 'Available',
        verificationStatus: 'Verified',
        verificationChecklist: {
          nid: true,
          studentId: true,
          certificates: true,
          policeOrAddress: true,
          interview: true
        },
        profileCompleteness: 100,
        notes: 'Specializes in Biology Olympiad preparation and pre-medical coaching.',
        registeredDate: '2026-09-18'
      },
      {
        id: 'CTS-TUT-1003',
        name: 'Zubair Hossain (Demo)',
        phone: '01834567890',
        displayPhone: '+880 1834-567890 (Demo)',
        email: 'zubair.cu@cts-demo.local',
        gender: 'Male',
        university: 'University of Chittagong (CU)',
        department: 'Economics',
        session: '2022-2023',
        cgpa: 3.62,
        sscGpa: 5.0,
        hscGpa: 4.9,
        preferredAreas: ['Agrabad', 'Halishahar', 'Chawkbazar', 'Kotwali'],
        preferredMediums: ['Bangla Medium', 'English Version'],
        preferredSubjects: ['General Math', 'English', 'Economics', 'Accounting'],
        preferredClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9'],
        experienceYears: 2,
        expectedSalaryMin: 6000,
        expectedSalaryMax: 8500,
        availability: 'Available',
        verificationStatus: 'Under Review',
        verificationChecklist: {
          nid: true,
          studentId: true,
          certificates: false,
          policeOrAddress: false,
          interview: true
        },
        profileCompleteness: 75,
        notes: 'Awaiting HSC certificate verification and address verification receipt.',
        registeredDate: '2026-10-02'
      },
      {
        id: 'CTS-TUT-1004',
        name: 'Sadia Rahman (Demo)',
        phone: '01845678901',
        displayPhone: '+880 1845-678901 (Demo)',
        email: 'sadia.eng@cts-demo.local',
        gender: 'Female',
        university: 'Premier University, Chittagong',
        department: 'English Language & Literature',
        session: '2021-2022',
        cgpa: 3.72,
        sscGpa: 5.0,
        hscGpa: 4.85,
        preferredAreas: ['Khulshi', 'Nasirabad', 'GEC Circle', 'Anderkilla'],
        preferredMediums: ['English Medium (Edexcel/Cambridge)', 'English Version'],
        preferredSubjects: ['English', 'General Science', 'IELTS / Spoken English', 'Social Science'],
        preferredClasses: ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'],
        experienceYears: 3,
        expectedSalaryMin: 7000,
        expectedSalaryMax: 10000,
        availability: 'Busy',
        verificationStatus: 'Verified',
        verificationChecklist: {
          nid: true,
          studentId: true,
          certificates: true,
          policeOrAddress: true,
          interview: true
        },
        profileCompleteness: 100,
        notes: 'Experienced with Cambridge curriculum. Currently teaching 2 evening batches.',
        registeredDate: '2026-09-05'
      },
      {
        id: 'CTS-TUT-1005',
        name: 'Mahir Faisal (Demo)',
        phone: '01856789012',
        displayPhone: '+880 1856-789012 (Demo)',
        email: 'mahir.iiuc@cts-demo.local',
        gender: 'Male',
        university: 'International Islamic University Chittagong (IIUC)',
        department: 'Electrical & Electronic Engineering (EEE)',
        session: '2023-2024',
        cgpa: 3.55,
        sscGpa: 5.0,
        hscGpa: 5.0,
        preferredAreas: ['Agrabad', 'Halishahar', 'Chawkbazar', 'Bahaddarhat'],
        preferredMediums: ['Bangla Medium', 'English Version'],
        preferredSubjects: ['Physics', 'Chemistry', 'Higher Math'],
        preferredClasses: ['Class 9', 'Class 10 (SSC)', 'Class 11 (HSC)'],
        experienceYears: 2,
        expectedSalaryMin: 7500,
        expectedSalaryMax: 10500,
        availability: 'Available',
        verificationStatus: 'Pending',
        verificationChecklist: {
          nid: false,
          studentId: true,
          certificates: false,
          policeOrAddress: false,
          interview: false
        },
        profileCompleteness: 55,
        notes: 'Signed up via public portal. Needs in-person NID review and briefing.',
        registeredDate: '2026-10-18'
      },
      {
        id: 'CTS-TUT-1006',
        name: 'Fatima Tuz Zohra (Demo)',
        phone: '01867890123',
        displayPhone: '+880 1867-890123 (Demo)',
        email: 'fatima.math@cts-demo.local',
        gender: 'Female',
        university: 'University of Chittagong (CU)',
        department: 'Department of Mathematics',
        session: '2020-2021',
        cgpa: 3.91,
        sscGpa: 5.0,
        hscGpa: 5.0,
        preferredAreas: ['Nasirabad', 'Panchlaish', 'Muradpur', 'GEC Circle', 'Chandgaon'],
        preferredMediums: ['Bangla Medium', 'English Version'],
        preferredSubjects: ['General Math', 'Higher Math', 'Statistics'],
        preferredClasses: ['Class 8', 'Class 9', 'Class 10 (SSC)', 'Class 11 (HSC)', 'Class 12 (HSC)'],
        experienceYears: 4,
        expectedSalaryMin: 8500,
        expectedSalaryMax: 13000,
        availability: 'Available',
        verificationStatus: 'Verified',
        verificationChecklist: {
          nid: true,
          studentId: true,
          certificates: true,
          policeOrAddress: true,
          interview: true
        },
        profileCompleteness: 100,
        notes: 'Outstanding math educator. Highly recommended by 5 verified guardians.',
        registeredDate: '2026-08-20'
      }
    ];

    const requests = [
      {
        id: 'CTS-REQ-2001',
        guardianName: 'Dr. Kazi Mahfuzur Rahman (Demo)',
        studentName: 'Kazi Rayan (Demo)',
        phone: '01711111111',
        displayPhone: '+880 1711-111111 (Demo)',
        privateAddress: 'Flat 5B, Road 3, Nasirabad Housing Society, Chittagong',
        city: 'Chittagong',
        area: 'Nasirabad',
        classLevel: 'Class 10 (SSC)',
        curriculum: 'English Version',
        subjects: ['Physics', 'Higher Math'],
        studentGender: 'Male',
        preferredTutorGender: 'Male',
        preferredTutorUniversity: 'CUET or CU Engineering Preferred',
        daysPerWeek: 4,
        preferredTime: 'Evening (5:30 PM - 7:00 PM)',
        salaryBudget: 10000,
        tuitionType: 'Home Tutoring',
        status: 'TRIAL CLASS', // Stage 7
        assignedTutorId: 'CTS-TUT-1001',
        shortlistedTutors: ['CTS-TUT-1001', 'CTS-TUT-1006'],
        contactedTutors: [
          {
            tutorId: 'CTS-TUT-1001',
            status: 'Trial Scheduled',
            notes: 'Trial class scheduled for Thursday 5:30 PM. Guardian informed.',
            date: '2026-10-21'
          },
          {
            tutorId: 'CTS-TUT-1006',
            status: 'Backup Shortlist',
            notes: 'Ready if male tutor schedule conflicts.',
            date: '2026-10-20'
          }
        ],
        mediaFeeAgreed: 5000,
        mediaFeeStatus: 'Due',
        mediaFeeReceived: 0,
        mediaFeeDue: 5000,
        referralPerson: 'Rashedul Karim (Student Rep)',
        referralPercent: 20,
        referralAmount: 1000,
        referralStatus: 'Unpaid',
        postingDate: '2026-10-15',
        privateNotes: 'Student needs special coaching on Trigonometry and Newton Mechanics.',
        activityLog: [
          { date: '2026-10-15 11:20', text: 'New request recorded by Admin via phone inquiry.' },
          { date: '2026-10-16 14:00', text: 'Requirement verified: confirmed English version 4 days/week.' },
          { date: '2026-10-18 10:30', text: 'Found matches: Tanvir Ahmed & Fatima Tuz Zohra.' },
          { date: '2026-10-19 16:15', text: 'Contacted Tanvir Ahmed; accepted trial proposal.' },
          { date: '2026-10-20 18:00', text: 'Guardian approved trial class with Tanvir Ahmed.' },
          { date: '2026-10-21 12:00', text: 'Moved to TRIAL CLASS stage.' }
        ]
      },
      {
        id: 'CTS-REQ-2002',
        guardianName: 'Begum Shamima Akhter (Demo)',
        studentName: 'Tahmina Rahman (Demo)',
        phone: '01722222222',
        displayPhone: '+880 1722-222222 (Demo)',
        privateAddress: 'House 14, Lane 2, O.R. Nizam Road, Panchlaish, Chittagong',
        city: 'Chittagong',
        area: 'Panchlaish',
        classLevel: 'Class 11 (HSC)',
        curriculum: 'Bangla Medium',
        subjects: ['Biology', 'Chemistry'],
        studentGender: 'Female',
        preferredTutorGender: 'Female',
        preferredTutorUniversity: 'Chittagong Medical College (CMC)',
        daysPerWeek: 3,
        preferredTime: 'Afternoon (4:00 PM - 5:30 PM)',
        salaryBudget: 9000,
        tuitionType: 'Home Tutoring',
        status: 'COLLECT MEDIA FEE', // Stage 10
        assignedTutorId: 'CTS-TUT-1002',
        shortlistedTutors: ['CTS-TUT-1002'],
        contactedTutors: [
          {
            tutorId: 'CTS-TUT-1002',
            status: 'Confirmed & Teaching',
            notes: 'Completed 1st month successfully. Guardian extremely pleased.',
            date: '2026-10-01'
          }
        ],
        mediaFeeAgreed: 4500,
        mediaFeeStatus: 'Partially Paid',
        mediaFeeReceived: 2500,
        mediaFeeDue: 2000,
        mediaFeeReceivedDate: '2026-10-24',
        mediaFeeTrxId: 'bKash Trx 9J28DA10K',
        referralPerson: 'Farhana (Senior Coordinator)',
        referralPercent: 20,
        referralAmount: 900,
        referralStatus: 'Paid',
        postingDate: '2026-09-20',
        privateNotes: 'Guardian paid partial media fee of ৳2,500 via bKash. Remaining ৳2,000 due by end of month.',
        activityLog: [
          { date: '2026-09-20 09:40', text: 'Tuition inquiry logged from Panchlaish.' },
          { date: '2026-09-22 15:30', text: 'Matched with Dr. Nusrat Jahan (CMC).' },
          { date: '2026-09-25 17:00', text: 'Trial class completed successfully.' },
          { date: '2026-09-28 11:00', text: 'Tuition confirmed by guardian.' },
          { date: '2026-10-22 10:00', text: '1st month completed; billing media fee ৳4,500.' },
          { date: '2026-10-24 16:30', text: 'Collected partial media fee ৳2,500 via bKash (Trx 9J28DA10K).' }
        ]
      },
      {
        id: 'CTS-REQ-2003',
        guardianName: 'Engr. M. A. Jalil (Demo)',
        studentName: 'Zayan Jalil (Demo)',
        phone: '01733333333',
        displayPhone: '+880 1733-333333 (Demo)',
        privateAddress: 'Rose Valley Tower, South Khulshi, Chittagong',
        city: 'Chittagong',
        area: 'Khulshi',
        classLevel: 'Class 8',
        curriculum: 'English Medium (Edexcel/Cambridge)',
        subjects: ['English', 'General Science', 'General Math'],
        studentGender: 'Male',
        preferredTutorGender: 'Any',
        preferredTutorUniversity: 'Premier / CUET / CU',
        daysPerWeek: 4,
        preferredTime: 'Evening (6:00 PM - 7:30 PM)',
        salaryBudget: 11000,
        tuitionType: 'Home Tutoring',
        status: 'NEW REQUEST', // Stage 1
        assignedTutorId: null,
        shortlistedTutors: [],
        contactedTutors: [],
        mediaFeeAgreed: 5500,
        mediaFeeStatus: 'Due',
        mediaFeeReceived: 0,
        mediaFeeDue: 5500,
        referralPerson: 'Direct Portal',
        referralPercent: 0,
        referralAmount: 0,
        referralStatus: 'Unpaid',
        postingDate: '2026-10-26',
        privateNotes: 'Requires tutor with strong English pronunciation and Cambridge checkpoint experience.',
        activityLog: [
          { date: '2026-10-26 14:10', text: 'New tuition request registered from South Khulshi.' }
        ]
      },
      {
        id: 'CTS-REQ-2004',
        guardianName: 'Mohammad Anwarul Haque (Demo)',
        studentName: 'Nabeel Haque (Demo)',
        phone: '01744444444',
        displayPhone: '+880 1744-444444 (Demo)',
        privateAddress: 'Agrabad C/A, Access Road, Chittagong',
        city: 'Chittagong',
        area: 'Agrabad',
        classLevel: 'Class 9',
        curriculum: 'Bangla Medium',
        subjects: ['General Math', 'General Science'],
        studentGender: 'Male',
        preferredTutorGender: 'Male',
        preferredTutorUniversity: 'CU or IIUC Preferred',
        daysPerWeek: 3,
        preferredTime: 'After Maghrib (6:30 PM)',
        salaryBudget: 7000,
        tuitionType: 'Home Tutoring',
        status: 'FIND TUTORS', // Stage 3
        assignedTutorId: null,
        shortlistedTutors: [],
        contactedTutors: [],
        mediaFeeAgreed: 3500,
        mediaFeeStatus: 'Due',
        mediaFeeReceived: 0,
        mediaFeeDue: 3500,
        referralPerson: 'Aminul (Agrabad Coordinator)',
        referralPercent: 20,
        referralAmount: 700,
        referralStatus: 'Unpaid',
        postingDate: '2026-10-24',
        privateNotes: 'Requirement verified with guardian over phone call. Budget is strict ৳7,000.',
        activityLog: [
          { date: '2026-10-24 16:00', text: 'Request received from Agrabad.' },
          { date: '2026-10-25 11:30', text: 'Verified student curriculum and shift preference.' }
        ]
      },
      {
        id: 'CTS-REQ-2005',
        guardianName: 'Mrs. Shahela Parveen (Demo)',
        studentName: 'Afsana Parveen (Demo)',
        phone: '01755555555',
        displayPhone: '+880 1755-555555 (Demo)',
        privateAddress: 'Chandgaon R/A, Block B, Chittagong',
        city: 'Chittagong',
        area: 'Chandgaon',
        classLevel: 'Class 12 (HSC)',
        curriculum: 'Bangla Medium',
        subjects: ['Higher Math'],
        studentGender: 'Female',
        preferredTutorGender: 'Female',
        preferredTutorUniversity: 'CU Mathematics Dept',
        daysPerWeek: 3,
        preferredTime: 'Morning 10:00 AM or Afternoon 3:30 PM',
        salaryBudget: 8500,
        tuitionType: 'Home Tutoring',
        status: 'CONFIRM TUITION', // Stage 8
        assignedTutorId: 'CTS-TUT-1006',
        shortlistedTutors: ['CTS-TUT-1006'],
        contactedTutors: [
          {
            tutorId: 'CTS-TUT-1006',
            status: 'Trial Passed',
            notes: 'Guardian very impressed with Fatima Tuz Zohra. Tuition confirmed.',
            date: '2026-10-22'
          }
        ],
        mediaFeeAgreed: 4250,
        mediaFeeStatus: 'Due',
        mediaFeeReceived: 0,
        mediaFeeDue: 4250,
        referralPerson: 'Direct Portal',
        referralPercent: 0,
        referralAmount: 0,
        referralStatus: 'Unpaid',
        postingDate: '2026-10-12',
        privateNotes: 'Trial session was successful. Classes officially started on Oct 25.',
        activityLog: [
          { date: '2026-10-12 10:15', text: 'HSC Higher Math request recorded.' },
          { date: '2026-10-14 12:00', text: 'Matched with Fatima Tuz Zohra.' },
          { date: '2026-10-18 17:00', text: 'Trial conducted.' },
          { date: '2026-10-22 14:00', text: 'Guardian confirmed tuition officially.' }
        ]
      },
      {
        id: 'CTS-REQ-2006',
        guardianName: 'Advocate Tareq Hossain (Demo)',
        studentName: 'Zidan Hossain (Demo)',
        phone: '01766666666',
        displayPhone: '+880 1766-666666 (Demo)',
        privateAddress: 'GEC Hills Area, Dampara, Chittagong',
        city: 'Chittagong',
        area: 'GEC Circle',
        classLevel: 'Class 10 (SSC)',
        curriculum: 'English Version',
        subjects: ['Physics', 'Chemistry', 'Higher Math'],
        studentGender: 'Male',
        preferredTutorGender: 'Male',
        preferredTutorUniversity: 'CUET',
        daysPerWeek: 5,
        preferredTime: 'Evening 6:30 PM',
        salaryBudget: 12000,
        tuitionType: 'Home Tutoring',
        status: 'FOLLOW-UP', // Stage 11
        assignedTutorId: 'CTS-TUT-1001',
        shortlistedTutors: ['CTS-TUT-1001'],
        contactedTutors: [
          {
            tutorId: 'CTS-TUT-1001',
            status: 'Ongoing & Retained',
            notes: 'Both tutor and guardian gave 5-star feedback.',
            date: '2026-09-30'
          }
        ],
        mediaFeeAgreed: 6000,
        mediaFeeStatus: 'Paid',
        mediaFeeReceived: 6000,
        mediaFeeDue: 0,
        mediaFeeReceivedDate: '2026-10-05',
        mediaFeeTrxId: 'Nagad Trx 7H65FF32',
        referralPerson: 'Kamrul Islam',
        referralPercent: 20,
        referralAmount: 1200,
        referralStatus: 'Paid',
        postingDate: '2026-08-15',
        privateNotes: 'Media fee collected in full ৳6,000. Referral commission ৳1,200 disbursed to Kamrul.',
        activityLog: [
          { date: '2026-08-15 15:00', text: 'Tuition inquiry registered.' },
          { date: '2026-08-20 18:00', text: 'Tanvir Ahmed assigned.' },
          { date: '2026-09-01 19:00', text: 'Regular classes started.' },
          { date: '2026-10-05 11:30', text: 'Collected full media fee ৳6,000 via Nagad.' },
          { date: '2026-10-06 14:00', text: 'Disbursed ৳1,200 referral commission.' },
          { date: '2026-10-20 16:00', text: 'Moved to FOLLOW-UP: monthly satisfaction review.' }
        ]
      }
    ];

    const followUps = [
      {
        id: 'CTS-FLW-3001',
        tuitionId: 'CTS-REQ-2001',
        targetType: 'Guardian',
        targetName: 'Dr. Kazi Mahfuzur Rahman (Demo)',
        targetPhone: '01711111111',
        staffMember: 'CTS Admin',
        channel: 'Phone Call',
        reason: 'Trial Class Feedback',
        response: 'Trial was positive, wants to observe one more session before final approval.',
        scheduledDate: '2026-10-27',
        status: 'Pending',
        isOverdue: false,
        notes: 'Call around 8:00 PM after clinic hours.'
      },
      {
        id: 'CTS-FLW-3002',
        tuitionId: 'CTS-REQ-2002',
        targetType: 'Guardian',
        targetName: 'Begum Shamima Akhter (Demo)',
        targetPhone: '01722222222',
        staffMember: 'Farhana (Coordinator)',
        channel: 'WhatsApp Follow-up',
        reason: 'Remaining Media Fee Collection',
        response: 'Agreed to send the remaining ৳2,000 balance via bKash by Friday.',
        scheduledDate: '2026-10-25', // Overdue demo
        status: 'Pending',
        isOverdue: true,
        notes: 'Follow up politely regarding due balance ৳2,000.'
      },
      {
        id: 'CTS-FLW-3003',
        tuitionId: 'CTS-REQ-2004',
        targetType: 'Tutor',
        targetName: 'Mahir Faisal (Demo)',
        targetPhone: '01856789012',
        staffMember: 'Tanvir (Matching Desk)',
        channel: 'Phone Call',
        reason: 'Schedule Availability Check for Agrabad Request',
        response: 'Tutor confirmed availability on Mon/Wed/Fri evenings.',
        scheduledDate: '2026-10-26',
        status: 'Completed',
        isOverdue: false,
        notes: 'Suitable candidate for CTS-REQ-2004 once NID is submitted.'
      }
    ];

    const reviews = [
      {
        id: 'CTS-REV-4001',
        reviewerName: 'Dr. Kazi Mahfuzur Rahman (Demo)',
        reviewerRole: 'Guardian',
        tuitionId: 'CTS-REQ-2001',
        tutorName: 'Tanvir Ahmed (Demo)',
        rating: 5,
        reviewDate: '2026-10-22',
        feedback: 'CTS provided an exceptional tutor from CUET. He understands the English Version curriculum very well and my son is now much more confident in physics.',
        moderationStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'CTS-REV-4002',
        reviewerName: 'Tanvir Ahmed (Demo)',
        reviewerRole: 'Tutor',
        tuitionId: 'CTS-REQ-2006',
        tutorName: 'Tanvir Ahmed (Demo)',
        rating: 5,
        reviewDate: '2026-10-06',
        feedback: 'Very transparent tuition media service in Chittagong. The CTS team coordinates trial classes professionally and respects tutors.',
        moderationStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'CTS-REV-4003',
        reviewerName: 'Begum Shamima Akhter (Demo)',
        reviewerRole: 'Guardian',
        tuitionId: 'CTS-REQ-2002',
        tutorName: 'Dr. (Intern) Nusrat Jahan (Demo)',
        rating: 5,
        reviewDate: '2026-10-23',
        feedback: 'We wanted a dedicated female mentor for medical prep. Nusrat apa from CMC has been fantastic. Highly recommend CTS!',
        moderationStatus: 'Approved',
        isDemo: true
      },
      {
        id: 'CTS-REV-4004',
        reviewerName: 'Zubair Hossain (Demo)',
        reviewerRole: 'Tutor',
        tuitionId: 'CTS-REQ-2003',
        tutorName: 'Zubair Hossain (Demo)',
        rating: 4,
        reviewDate: '2026-10-26',
        feedback: 'Good verification process, polite customer coordinators. Looking forward to confirmed assignments.',
        moderationStatus: 'Pending',
        isDemo: true
      }
    ];

    const transactions = [
      {
        id: 'CTS-TRX-5001',
        tuitionId: 'CTS-REQ-2006',
        tuitionCode: 'CTS-REQ-2006',
        type: 'Media Fee Collection',
        amount: 6000,
        method: 'Nagad',
        trxId: 'Nagad Trx 7H65FF32',
        payerName: 'Advocate Tareq Hossain (Demo)',
        receiverStaff: 'CTS Admin',
        date: '2026-10-05',
        notes: 'Full 50% media fee received for SSC 5-days tuition.'
      },
      {
        id: 'CTS-TRX-5002',
        tuitionId: 'CTS-REQ-2006',
        tuitionCode: 'CTS-REQ-2006',
        type: 'Referral Commission Payout',
        amount: 1200,
        method: 'bKash',
        trxId: 'bKash Trx 4B22AA99',
        recipientName: 'Kamrul Islam (Referral)',
        payerStaff: 'CTS Admin',
        date: '2026-10-06',
        notes: '20% referral commission paid for CTS-REQ-2006.'
      },
      {
        id: 'CTS-TRX-5003',
        tuitionId: 'CTS-REQ-2002',
        tuitionCode: 'CTS-REQ-2002',
        type: 'Media Fee Collection',
        amount: 2500,
        method: 'bKash',
        trxId: 'bKash Trx 9J28DA10K',
        payerName: 'Begum Shamima Akhter (Demo)',
        receiverStaff: 'Farhana',
        date: '2026-10-24',
        notes: 'Partial media fee collected. ৳2,000 balance remaining.'
      },
      {
        id: 'CTS-TRX-5004',
        tuitionId: 'CTS-REQ-2002',
        tuitionCode: 'CTS-REQ-2002',
        type: 'Referral Commission Payout',
        amount: 900,
        method: 'bKash',
        trxId: 'bKash Trx 8L11BB33',
        recipientName: 'Farhana (Senior Coordinator)',
        payerStaff: 'CTS Admin',
        date: '2026-10-25',
        notes: 'Referral commission paid for Panchlaish CMC placement.'
      }
    ];

    const activities = [
      { id: 'ACT-1', timestamp: '2026-10-26 14:10', type: 'Tuition', text: 'New request registered: CTS-REQ-2003 (Khulshi, Class 8 Cambridge)' },
      { id: 'ACT-2', timestamp: '2026-10-25 11:30', type: 'Pipeline', text: 'CTS-REQ-2004 moved to FIND TUTORS stage' },
      { id: 'ACT-3', timestamp: '2026-10-25 10:00', type: 'Accounts', text: 'Referral commission ৳900 paid for CTS-REQ-2002' },
      { id: 'ACT-4', timestamp: '2026-10-24 16:30', type: 'Accounts', text: 'Partial media fee ৳2,500 collected for CTS-REQ-2002 via bKash' },
      { id: 'ACT-5', timestamp: '2026-10-22 14:00', type: 'Pipeline', text: 'CTS-REQ-2005 tuition confirmed by guardian' },
      { id: 'ACT-6', timestamp: '2026-10-21 12:00', type: 'Pipeline', text: 'CTS-REQ-2001 moved to TRIAL CLASS stage with Tanvir Ahmed' },
      { id: 'ACT-7', timestamp: '2026-10-18 10:00', type: 'Tutor', text: 'New tutor application submitted: Mahir Faisal (IIUC EEE)' }
    ];

    return {
      version: '1.0',
      settings: DEFAULT_SETTINGS,
      tutors: tutors,
      requests: requests,
      followUps: followUps,
      reviews: reviews,
      transactions: transactions,
      activities: activities
    };
  }

  // Calculate tutor profile completeness percentage (0 to 100)
  function calculateProfileCompleteness(tutor) {
    if (!tutor) return 0;
    let score = 0;
    const checks = [
      Boolean(tutor.name && tutor.name.trim()),
      Boolean(tutor.phone && tutor.phone.trim()),
      Boolean(tutor.gender),
      Boolean(tutor.university && tutor.university.trim()),
      Boolean(tutor.department && tutor.department.trim()),
      Boolean(tutor.cgpa && tutor.cgpa > 0),
      Boolean(tutor.preferredAreas && tutor.preferredAreas.length > 0),
      Boolean(tutor.preferredMediums && tutor.preferredMediums.length > 0),
      Boolean(tutor.preferredSubjects && tutor.preferredSubjects.length > 0),
      Boolean(tutor.expectedSalaryMin && tutor.expectedSalaryMin > 0),
      Boolean(tutor.verificationChecklist && tutor.verificationChecklist.nid),
      Boolean(tutor.verificationChecklist && tutor.verificationChecklist.studentId)
    ];

    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
  }

  // Bangladesh phone number validator: accepts 01XXXXXXXXX or +8801XXXXXXXXX
  function validateBDPhone(rawPhone) {
    if (!rawPhone) return { isValid: false, message: 'Phone number is required.' };
    const clean = String(rawPhone).replace(/[\s\-\(\)]/g, '');
    const bdRegex = /^(?:\+?880|0)1[3-9]\d{8}$/;
    if (!bdRegex.test(clean)) {
      return {
        isValid: false,
        message: 'Invalid Bangladesh mobile number. Must be 11 digits starting with 013-019 (e.g., 01812345678).'
      };
    }
    // Normalize to standard 01XXXXXXXXX
    let normalized = clean;
    if (normalized.startsWith('+880')) {
      normalized = normalized.substring(4);
    } else if (normalized.startsWith('880')) {
      normalized = normalized.substring(3);
    }
    if (!normalized.startsWith('0')) {
      normalized = '0' + normalized;
    }
    return {
      isValid: true,
      cleanNumber: normalized,
      displayNumber: `+880 ${normalized.substring(1, 5)}-${normalized.substring(5)}`
    };
  }

  // Storage Manager Object
  class Store {
    constructor() {
      this.cache = null;
      this.init();
    }

    init() {
      if (typeof window === 'undefined' || !window.localStorage) {
        this.cache = generateInitialData();
        return;
      }
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.tutors && parsed.requests) {
            this.cache = parsed;
            return;
          }
        }
      } catch (err) {
        console.warn('CTSStore: Failed to read from localStorage, restoring demo data.', err);
      }
      this.cache = generateInitialData();
      this.persist();
    }

    persist() {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
        } catch (err) {
          console.error('CTSStore: LocalStorage persist failed:', err);
        }
      }
    }

    logActivity(type, text) {
      if (!this.cache.activities) this.cache.activities = [];
      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
      const entry = {
        id: 'ACT-' + Date.now(),
        timestamp: dateStr,
        type: type || 'General',
        text: text
      };
      this.cache.activities.unshift(entry);
      if (this.cache.activities.length > 50) {
        this.cache.activities = this.cache.activities.slice(0, 50);
      }
      this.persist();
    }

    // --- Settings ---
    getSettings() {
      return Object.assign({}, DEFAULT_SETTINGS, this.cache.settings || {});
    }

    saveSettings(newSettings) {
      this.cache.settings = Object.assign({}, this.cache.settings, newSettings);
      this.logActivity('Settings', 'Platform business settings and fee policies updated.');
      this.persist();
      return this.cache.settings;
    }

    // --- Tutors Management ---
    getTutors() {
      return this.cache.tutors || [];
    }

    getTutor(id) {
      return (this.cache.tutors || []).find(t => t.id === id) || null;
    }

    checkDuplicateTutor(phone, email, excludeId = null) {
      const normalizedPhone = validateBDPhone(phone).cleanNumber;
      return (this.cache.tutors || []).some(t => {
        if (excludeId && t.id === excludeId) return false;
        const tPhone = validateBDPhone(t.phone).cleanNumber;
        if (normalizedPhone && tPhone === normalizedPhone) return true;
        if (email && t.email && t.email.toLowerCase().trim() === email.toLowerCase().trim()) return true;
        return false;
      });
    }

    saveTutor(tutorData) {
      if (!this.cache.tutors) this.cache.tutors = [];
      const phoneValidation = validateBDPhone(tutorData.phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }

      const isNew = !tutorData.id;
      let tutorId = tutorData.id;

      if (isNew) {
        // Auto-increment CTS-TUT ID
        const maxNum = this.cache.tutors.reduce((max, t) => {
          const num = parseInt((t.id || '').replace('CTS-TUT-', ''), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }, 1000);
        tutorId = `CTS-TUT-${maxNum + 1}`;
      }

      // Profile completeness computation
      const calculatedCompleteness = calculateProfileCompleteness(tutorData);

      const record = Object.assign({}, tutorData, {
        id: tutorId,
        phone: phoneValidation.cleanNumber,
        displayPhone: phoneValidation.displayNumber,
        profileCompleteness: calculatedCompleteness,
        registeredDate: tutorData.registeredDate || new Date().toISOString().substring(0, 10)
      });

      if (isNew) {
        this.cache.tutors.unshift(record);
        this.logActivity('Tutor', `Added new tutor profile: ${record.name} (${record.id})`);
      } else {
        const index = this.cache.tutors.findIndex(t => t.id === tutorId);
        if (index !== -1) {
          this.cache.tutors[index] = record;
          this.logActivity('Tutor', `Updated tutor profile: ${record.name} (${record.id})`);
        }
      }

      this.persist();
      return record;
    }

    deleteTutor(id) {
      const index = (this.cache.tutors || []).findIndex(t => t.id === id);
      if (index === -1) return false;
      const deleted = this.cache.tutors.splice(index, 1)[0];
      this.logActivity('Tutor', `Deleted tutor profile: ${deleted.name} (${deleted.id})`);
      this.persist();
      return true;
    }

    // --- Tuition Requests Management ---
    getRequests() {
      return this.cache.requests || [];
    }

    getRequest(id) {
      return (this.cache.requests || []).find(r => r.id === id) || null;
    }

    checkDuplicateRequest(phone, classLevel, area, excludeId = null) {
      const normalizedPhone = validateBDPhone(phone).cleanNumber;
      return (this.cache.requests || []).some(r => {
        if (excludeId && r.id === excludeId) return false;
        const rPhone = validateBDPhone(r.phone).cleanNumber;
        return (
          normalizedPhone &&
          rPhone === normalizedPhone &&
          r.classLevel === classLevel &&
          r.area === area
        );
      });
    }

    saveRequest(reqData) {
      if (!this.cache.requests) this.cache.requests = [];
      const phoneValidation = validateBDPhone(reqData.phone);
      if (!phoneValidation.isValid) {
        throw new Error(phoneValidation.message);
      }

      const isNew = !reqData.id;
      let reqId = reqData.id;

      if (isNew) {
        const maxNum = this.cache.requests.reduce((max, r) => {
          const num = parseInt((r.id || '').replace('CTS-REQ-', ''), 10);
          return isNaN(num) ? max : Math.max(max, num);
        }, 2000);
        reqId = `CTS-REQ-${maxNum + 1}`;
      }

      const settings = this.getSettings();
      const salary = parseFloat(reqData.salaryBudget) || 0;
      const mediaFeeAgreed = reqData.mediaFeeAgreed !== undefined
        ? parseFloat(reqData.mediaFeeAgreed)
        : Math.round(salary * ((settings.defaultMediaFeePercent || 50) / 100));

      const referralPercent = reqData.referralPercent !== undefined
        ? parseFloat(reqData.referralPercent)
        : (settings.defaultReferralPercent || 20);

      const referralAmount = reqData.referralAmount !== undefined
        ? parseFloat(reqData.referralAmount)
        : Math.round(mediaFeeAgreed * (referralPercent / 100));

      const mediaFeeReceived = parseFloat(reqData.mediaFeeReceived) || 0;
      const mediaFeeDue = Math.max(0, mediaFeeAgreed - mediaFeeReceived);

      let mediaFeeStatus = 'Due';
      if (mediaFeeReceived >= mediaFeeAgreed && mediaFeeAgreed > 0) {
        mediaFeeStatus = 'Paid';
      } else if (mediaFeeReceived > 0) {
        mediaFeeStatus = 'Partially Paid';
      }

      const record = Object.assign({}, reqData, {
        id: reqId,
        phone: phoneValidation.cleanNumber,
        displayPhone: phoneValidation.displayNumber,
        salaryBudget: salary,
        mediaFeeAgreed: mediaFeeAgreed,
        mediaFeeReceived: mediaFeeReceived,
        mediaFeeDue: mediaFeeDue,
        mediaFeeStatus: reqData.mediaFeeStatus || mediaFeeStatus,
        referralPercent: referralPercent,
        referralAmount: referralAmount,
        status: reqData.status || 'NEW REQUEST',
        postingDate: reqData.postingDate || new Date().toISOString().substring(0, 10),
        activityLog: reqData.activityLog || [
          {
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            text: `Tuition requirement created in CTS.`
          }
        ]
      });

      if (isNew) {
        this.cache.requests.unshift(record);
        this.logActivity('Tuition', `Logged new tuition requirement: ${record.id} (${record.area}, ${record.classLevel})`);
      } else {
        const index = this.cache.requests.findIndex(r => r.id === reqId);
        if (index !== -1) {
          this.cache.requests[index] = record;
          this.logActivity('Tuition', `Updated tuition requirement: ${record.id}`);
        }
      }

      this.persist();
      return record;
    }

    deleteRequest(id) {
      const index = (this.cache.requests || []).findIndex(r => r.id === id);
      if (index === -1) return false;
      const deleted = this.cache.requests.splice(index, 1)[0];
      this.logActivity('Tuition', `Deleted tuition requirement: ${deleted.id}`);
      this.persist();
      return true;
    }

    // --- Pipeline Transition Logic ---
    updatePipelineStage(requestId, newStage, note = '', staffName = 'Admin') {
      const req = this.getRequest(requestId);
      if (!req) throw new Error('Tuition requirement not found.');
      if (!PIPELINE_STAGES.includes(newStage)) {
        throw new Error(`Invalid pipeline stage: ${newStage}`);
      }

      const oldStage = req.status;
      req.status = newStage;

      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const logText = `Stage changed: [${oldStage}] ➔ [${newStage}] by ${staffName}. ${note ? 'Note: ' + note : ''}`;

      if (!req.activityLog) req.activityLog = [];
      req.activityLog.push({ date: timestamp, text: logText });

      this.logActivity('Pipeline', `Tuition ${requestId} transitioned: ${oldStage} ➔ ${newStage}`);
      this.saveRequest(req);
      return req;
    }

    // --- Shortlist and Match Candidate Assignment ---
    toggleShortlistTutor(requestId, tutorId) {
      const req = this.getRequest(requestId);
      if (!req) return false;
      if (!req.shortlistedTutors) req.shortlistedTutors = [];

      const idx = req.shortlistedTutors.indexOf(tutorId);
      if (idx === -1) {
        req.shortlistedTutors.push(tutorId);
        this.logActivity('Match', `Shortlisted tutor ${tutorId} for tuition ${requestId}`);
      } else {
        req.shortlistedTutors.splice(idx, 1);
        this.logActivity('Match', `Removed tutor ${tutorId} from shortlist for ${requestId}`);
      }
      this.saveRequest(req);
      return req;
    }

    recordTutorContact(requestId, tutorId, contactStatus, notes) {
      const req = this.getRequest(requestId);
      if (!req) return false;
      if (!req.contactedTutors) req.contactedTutors = [];

      const dateStr = new Date().toISOString().substring(0, 10);
      const existing = req.contactedTutors.find(c => c.tutorId === tutorId);
      if (existing) {
        existing.status = contactStatus;
        existing.notes = notes;
        existing.date = dateStr;
      } else {
        req.contactedTutors.push({
          tutorId: tutorId,
          status: contactStatus,
          notes: notes,
          date: dateStr
        });
      }

      if (!req.activityLog) req.activityLog = [];
      req.activityLog.push({
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        text: `Tutor contact logged for ${tutorId}: [${contactStatus}] - ${notes || 'No notes'}`
      });

      this.saveRequest(req);
      return req;
    }

    assignTutorToRequest(requestId, tutorId) {
      const req = this.getRequest(requestId);
      if (!req) return false;
      req.assignedTutorId = tutorId;

      const tutor = this.getTutor(tutorId);
      const tutorName = tutor ? tutor.name : tutorId;

      if (!req.activityLog) req.activityLog = [];
      req.activityLog.push({
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        text: `Assigned primary tutor: ${tutorName} (${tutorId})`
      });

      this.logActivity('Tuition', `Assigned tutor ${tutorName} to ${requestId}`);
      this.saveRequest(req);
      return req;
    }

    // --- Financial Ledger & Fee Collection ---
    getTransactions() {
      return this.cache.transactions || [];
    }

    recordMediaFeePayment(requestId, paymentData) {
      const req = this.getRequest(requestId);
      if (!req) throw new Error('Tuition requirement not found.');

      const amount = parseFloat(paymentData.amount) || 0;
      if (amount <= 0) throw new Error('Payment amount must be greater than zero.');

      const currentReceived = parseFloat(req.mediaFeeReceived) || 0;
      const newReceived = currentReceived + amount;
      const mediaFeeAgreed = parseFloat(req.mediaFeeAgreed) || 0;
      const newDue = Math.max(0, mediaFeeAgreed - newReceived);

      req.mediaFeeReceived = newReceived;
      req.mediaFeeDue = newDue;
      req.mediaFeeStatus = newDue === 0 ? 'Paid' : 'Partially Paid';
      req.mediaFeeReceivedDate = paymentData.date || new Date().toISOString().substring(0, 10);
      req.mediaFeeTrxId = paymentData.trxId || 'N/A';

      // Record transaction entry
      const trxId = 'CTS-TRX-' + Date.now().toString().slice(-6);
      const transactionRecord = {
        id: trxId,
        tuitionId: req.id,
        tuitionCode: req.id,
        type: 'Media Fee Collection',
        amount: amount,
        method: paymentData.method || 'bKash',
        trxId: paymentData.trxId || 'Manual-Receipt',
        payerName: paymentData.payerName || req.guardianName,
        receiverStaff: paymentData.receiverStaff || 'CTS Admin',
        date: paymentData.date || new Date().toISOString().substring(0, 10),
        notes: paymentData.notes || `Media fee received for ${req.id}`
      };

      if (!this.cache.transactions) this.cache.transactions = [];
      this.cache.transactions.unshift(transactionRecord);

      if (!req.activityLog) req.activityLog = [];
      req.activityLog.push({
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        text: `Recorded media fee collection ৳${amount} via ${transactionRecord.method} (Trx: ${transactionRecord.trxId}). Remaining due: ৳${newDue}.`
      });

      this.logActivity('Accounts', `Recorded media fee payment ৳${amount} for ${req.id}`);
      this.saveRequest(req);
      this.persist();
      return { request: req, transaction: transactionRecord };
    }

    recordReferralPayout(requestId, payoutData) {
      const req = this.getRequest(requestId);
      if (!req) throw new Error('Tuition requirement not found.');

      const amount = parseFloat(payoutData.amount) || 0;
      if (amount <= 0) throw new Error('Payout amount must be greater than zero.');

      req.referralStatus = 'Paid';

      const trxId = 'CTS-TRX-' + Date.now().toString().slice(-6);
      const transactionRecord = {
        id: trxId,
        tuitionId: req.id,
        tuitionCode: req.id,
        type: 'Referral Commission Payout',
        amount: amount,
        method: payoutData.method || 'bKash',
        trxId: payoutData.trxId || 'Manual-Payout',
        recipientName: payoutData.recipientName || req.referralPerson || 'Referral Partner',
        payerStaff: payoutData.payerStaff || 'CTS Admin',
        date: payoutData.date || new Date().toISOString().substring(0, 10),
        notes: payoutData.notes || `Referral commission paid for ${req.id}`
      };

      if (!this.cache.transactions) this.cache.transactions = [];
      this.cache.transactions.unshift(transactionRecord);

      if (!req.activityLog) req.activityLog = [];
      req.activityLog.push({
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        text: `Disbursed referral commission ৳${amount} to ${transactionRecord.recipientName} via ${transactionRecord.method}.`
      });

      this.logActivity('Accounts', `Disbursed referral payout ৳${amount} for ${req.id}`);
      this.saveRequest(req);
      this.persist();
      return { request: req, transaction: transactionRecord };
    }

    // --- Follow-up & Communication Logs ---
    getFollowUps() {
      const today = new Date().toISOString().substring(0, 10);
      return (this.cache.followUps || []).map(f => {
        const isOverdue = f.status === 'Pending' && f.scheduledDate && f.scheduledDate < today;
        return Object.assign({}, f, { isOverdue: isOverdue });
      });
    }

    saveFollowUp(item) {
      if (!this.cache.followUps) this.cache.followUps = [];
      const isNew = !item.id;
      const id = item.id || 'CTS-FLW-' + Date.now().toString().slice(-6);
      const record = Object.assign({}, item, { id });

      if (isNew) {
        this.cache.followUps.unshift(record);
        this.logActivity('Follow-up', `Created new follow-up reminder for ${record.targetName}`);
      } else {
        const idx = this.cache.followUps.findIndex(f => f.id === id);
        if (idx !== -1) {
          this.cache.followUps[idx] = record;
          this.logActivity('Follow-up', `Updated follow-up record for ${record.targetName}`);
        }
      }
      this.persist();
      return record;
    }

    deleteFollowUp(id) {
      const idx = (this.cache.followUps || []).findIndex(f => f.id === id);
      if (idx === -1) return false;
      this.cache.followUps.splice(idx, 1);
      this.persist();
      return true;
    }

    // --- Reviews & Testimonials Management ---
    getReviews(onlyApproved = false) {
      const all = this.cache.reviews || [];
      if (onlyApproved) {
        return all.filter(r => r.moderationStatus === 'Approved');
      }
      return all;
    }

    saveReview(item) {
      if (!this.cache.reviews) this.cache.reviews = [];
      const isNew = !item.id;
      const id = item.id || 'CTS-REV-' + Date.now().toString().slice(-6);
      const record = Object.assign({}, item, {
        id,
        reviewDate: item.reviewDate || new Date().toISOString().substring(0, 10)
      });

      if (isNew) {
        this.cache.reviews.unshift(record);
        this.logActivity('Review', `New review added by ${record.reviewerName}`);
      } else {
        const idx = this.cache.reviews.findIndex(r => r.id === id);
        if (idx !== -1) {
          this.cache.reviews[idx] = record;
          this.logActivity('Review', `Updated review moderation for ${record.reviewerName}`);
        }
      }
      this.persist();
      return record;
    }

    toggleReviewApproval(id) {
      const review = (this.cache.reviews || []).find(r => r.id === id);
      if (!review) return null;
      review.moderationStatus = review.moderationStatus === 'Approved' ? 'Pending' : 'Approved';
      this.logActivity('Review', `Toggled approval status for review ${id} to ${review.moderationStatus}`);
      this.persist();
      return review;
    }

    deleteReview(id) {
      const idx = (this.cache.reviews || []).findIndex(r => r.id === id);
      if (idx === -1) return false;
      this.cache.reviews.splice(idx, 1);
      this.persist();
      return true;
    }

    // --- Analytics & Dashboard Metrics ---
    getMetrics() {
      const tutors = this.getTutors();
      const requests = this.getRequests();
      const transactions = this.getTransactions();

      const totalTutors = tutors.length;
      const verifiedTutors = tutors.filter(t => t.verificationStatus === 'Verified').length;
      const availableTutors = tutors.filter(t => t.availability === 'Available').length;

      const newRequests = requests.filter(r => r.status === 'NEW REQUEST').length;
      const matchingInProgress = requests.filter(r =>
        ['VERIFY REQUIREMENT', 'FIND TUTORS', 'CONTACT TUTORS', 'SHORTLIST', 'GUARDIAN APPROVAL'].includes(r.status)
      ).length;
      const trialTuitions = requests.filter(r => r.status === 'TRIAL CLASS').length;
      const confirmedTuitions = requests.filter(r =>
        ['CONFIRM TUITION', 'COMPLETE', 'COLLECT MEDIA FEE', 'FOLLOW-UP'].includes(r.status)
      ).length;
      const completedTuitions = requests.filter(r =>
        ['COMPLETE', 'FOLLOW-UP'].includes(r.status)
      ).length;

      // Financials
      let mediaFeesCollected = 0;
      let mediaFeesDue = 0;
      let totalSalaryVolume = 0;
      let referralCommissionsPaid = 0;
      let referralCommissionsPending = 0;

      requests.forEach(r => {
        mediaFeesCollected += (parseFloat(r.mediaFeeReceived) || 0);
        mediaFeesDue += (parseFloat(r.mediaFeeDue) || 0);
        totalSalaryVolume += (parseFloat(r.salaryBudget) || 0);

        if (r.referralAmount && r.referralAmount > 0) {
          if (r.referralStatus === 'Paid') {
            referralCommissionsPaid += r.referralAmount;
          } else {
            referralCommissionsPending += r.referralAmount;
          }
        }
      });

      const conversionRate = requests.length > 0
        ? Math.round((confirmedTuitions / requests.length) * 100)
        : 0;

      return {
        totalTutors,
        verifiedTutors,
        availableTutors,
        newRequests,
        matchingInProgress,
        trialTuitions,
        confirmedTuitions,
        completedTuitions,
        totalRequests: requests.length,
        mediaFeesCollected,
        mediaFeesDue,
        totalSalaryVolume,
        referralCommissionsPaid,
        referralCommissionsPending,
        conversionRate,
        recentActivities: (this.cache.activities || []).slice(0, 10)
      };
    }

    // --- Export, Import & Reset ---
    exportDataJSON() {
      return JSON.stringify(this.cache, null, 2);
    }

    importDataJSON(jsonString) {
      if (!jsonString) throw new Error('Empty JSON data provided.');
      let parsed;
      try {
        parsed = JSON.parse(jsonString);
      } catch (e) {
        throw new Error('Invalid JSON format: ' + e.message);
      }

      if (!parsed || !Array.isArray(parsed.tutors) || !Array.isArray(parsed.requests)) {
        throw new Error('Schema validation failed: Missing tutors or requests array in JSON structure.');
      }

      this.cache = Object.assign({}, generateInitialData(), parsed);
      this.persist();
      this.logActivity('Backup', 'Database imported successfully from JSON backup file.');
      return true;
    }

    resetDemoData() {
      this.cache = generateInitialData();
      this.persist();
      this.logActivity('System', 'Platform reset to initial clean CTS demo dataset.');
      return true;
    }
  }

  // Singleton Instance
  const storeInstance = new Store();

  return {
    Store: Store,
    instance: storeInstance,
    PIPELINE_STAGES,
    CHITTAGONG_AREAS,
    CURRICULA,
    SUBJECTS,
    DEFAULT_SETTINGS,
    validateBDPhone,
    calculateProfileCompleteness
  };
});
