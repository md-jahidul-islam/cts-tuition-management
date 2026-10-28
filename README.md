# Chittagong Tutor Service (CTS) - Tuition Management Platform

A modern, professional Tuition Media Management Platform designed specifically for **Chittagong Tutor Service (CTS)** to manage real tuition media operations across Chittagong and Bangladesh. Inspired functionally by the service workflow and categories of CareTutors.com, but built with original CTS branding (Navy Blue & Gold), tailored local Chittagong institutional mappings (CUET, CU, CMC, Premier University, IIUC), and strict client privacy protection.

---

## 🌟 Key Architecture & Technical Stack

- **Frontend Core:** Pure HTML5, Tailwind CSS (via CDN utility classes), and Vanilla JavaScript DOM.
- **Framework-free:** Zero React, Vue, Angular, Bootstrap, or custom CSS stylesheets.
- **Persistence:** Browser `localStorage` for an initial single-browser MVP release.
- **Theme & Branding:** Deep Navy Blue (`#060B18`, `#0A122A`) and Warm Amber Gold (`#EAB308`, `#FACC15`).
- **Privacy Engine:** Automatic stripping of guardian names, personal phone numbers, and private house addresses when generating public circulars.

---

## 🚀 Running the Project (VS Code Live Server Instructions)

1. Open **Visual Studio Code**.
2. Go to **File ➔ Open Folder...** and select this directory: `C:\Users\hp\Desktop\CTS`.
3. If not already installed, install the **Live Server** extension by Ritwick Dey from the VS Code Extensions Marketplace (`Ctrl+Shift+X` ➔ search `Live Server`).
4. To launch the **Admin Dashboard**:
   - Right-click on [`index.html`](file:///C:/Users/hp/Desktop/CTS/index.html) in the file explorer.
   - Click **"Open with Live Server"** (or click the **"Go Live"** button in the VS Code bottom status bar).
   - Your default browser will open at `http://127.0.0.1:5500/index.html`.
5. To view the **Public-Facing Portal**:
   - Navigate to `http://127.0.0.1:5500/public.html` or click the **"🌐 View Public Portal"** link in the admin sidebar.
6. Alternatively, without any local server, double-clicking [`index.html`](file:///C:/Users/hp/Desktop/CTS/index.html) directly opens it as a `file:///` URI in any modern browser (Chrome, Edge, Firefox, Brave, Safari).

---

## 📋 Comprehensive Feature Map

### 1. Admin Dashboard (`index.html`)
- **Real-Time KPI Cards:** Total Tutors, Verified Tutors, Available Tutors, New Requests, Matching in Progress, Confirmed Tuitions, Media Fees Collected (৳), Outstanding Fees Due (৳), and Conversion Rate (%).
- **Clickable Quick Filters:** Clicking any KPI card immediately filters the corresponding list (e.g. clicking "Verified Tutors" filters the directory to `status = Verified`).
- **Activity Stream:** Chronological event log tracking tutor additions, pipeline stage transitions, fee collections, and system events.
- **Urgent Communication Alerts:** Surface pending guardian and tutor follow-up tasks with visual overdue flags.

### 2. Tutor Management
- **Full CRUD:** Create, edit, inspect, and delete tutor profiles.
- **CTS Tutor ID System:** Auto-incrementing format `CTS-TUT-1001`, `CTS-TUT-1002`, etc.
- **Chittagong University & Department Mapping:** Built-in support for CUET, Chittagong Medical College (CMC), Chittagong University (CU), Premier University, IIUC, and Chittagong College.
- **Academic Credentials:** Tracks SSC GPA, HSC GPA, Honors CGPA, and years of experience.
- **Multi-Area & Medium Coverage:** Supports Nasirabad, GEC Circle, Panchlaish, Chawkbazar, Halishahar, Agrabad, Khulshi, Muradpur, Bahaddarhat, Chandgaon, etc.
- **Dynamic Profile Completeness:** Real-time percentage indicator (0-100%) calculated based on submitted credentials.
- **Admin Verification Checklist:** Interactive modal toggling NID Smart Card, University Student ID, Academic Certificates, Present Address verification, and Coordinator Interview. **Tutors are never marked verified without explicit admin action.**

### 3. Guardian & Tuition Requirements
- **Tuition Code System:** Auto-incrementing format `CTS-REQ-2001`, `CTS-REQ-2002`, etc.
- **Granular Requirements:** Student class (Class 1 to 12, O/A Level), Curriculum (Bangla Medium, English Version, English Medium, Admission Prep, Madrasah), required subjects, shift time, days/week, and monthly salary budget.
- **Tutor Preferences:** Preferred gender (Male, Female, Any) and university preference (e.g., CUET / CMC / CU).
- **Private Notes:** Confidential student weaknesses and scheduling preferences accessible only to CTS staff.

### 4. Smart Tutor Matching Engine (`js/matching.js`)
- **Weighted Compatibility Scoring (0–100%):**
  - Area Match (30 pts): Direct location match or nearby cluster zone.
  - Subject Match (25 pts): Overlap between student needs and tutor expertise.
  - Curriculum Match (20 pts): Bangla Medium vs English Version vs Cambridge/Edexcel.
  - Gender Match (10 pts): Matches guardian's preference.
  - Budget Match (10 pts): Tutor's minimum expected salary vs guardian's monthly budget.
  - Admin Verification Bonus (5 pts): Reward for verified mentors.
- **Transparent Breakdown:** Explicitly lists *Compatibility Points* (e.g., "Direct Area Match: Nasirabad", "Teaches all requested subjects") alongside *Points of Caution / Gaps* (e.g., "Budget Gap: Expected min ৳10,000 vs budget ৳8,000").
- **Disclaimer Banner:** Explicitly warns that algorithmic matching provides objective recommendations, not guarantees; final assignment requires admin decision.
- **Shortlisting & Candidate Selection:** Staff can shortlist multiple candidates, log contact call outcomes, and assign the primary tutor candidate.

### 5. 11-Stage Visual Tuition Pipeline
A visual Kanban tracking the entire lifecycle across 11 discrete stages:
1. `NEW REQUEST`
2. `VERIFY REQUIREMENT`
3. `FIND TUTORS`
4. `CONTACT TUTORS`
5. `SHORTLIST`
6. `GUARDIAN APPROVAL`
7. `TRIAL CLASS`
8. `CONFIRM TUITION`
9. `COMPLETE`
10. `COLLECT MEDIA FEE`
11. `FOLLOW-UP`
- **Manual Transitions Only:** No automatic advancement without staff verification.
- **Audited Transition History:** Every move records timestamp, staff name, and reason notes in the requirement's activity log.

### 6. Tuition Post Generator Studio (`js/post-generator.js`)
- **Dual Formats:**
  - *Social Media Format:* Includes engaging emojis and line breaks optimized for Facebook Groups and WhatsApp Broadcasts.
  - *Formal Plain Text Format:* Clean, distraction-free notice suitable for SMS or official boards.
- **Built-in Privacy Masking:** Strips guardian full name, telephone number, and private street address. Only public area (e.g. `Nasirabad, Chittagong`) and educational requirements are revealed.
- **One-Click Copy:** Copies formatted advertisement to clipboard with feedback toast.

### 7. Media Fee & Referral Accounts Ledger
- **Financial Segregation:**
  - Agreed Student Monthly Salary (e.g. ৳ 10,000)
  - CTS Media Fee (default 50% = ৳ 5,000)
  - Referral Commission (default 20% of CTS Fee = ৳ 1,000)
  - Net CTS Revenue
- **Payment Lifecycle:** Tracks `Due`, `Partially Paid`, and `Paid` states with remaining balance due calculation.
- **Audited Ledger:** Records payment channel (bKash, Nagad, Bank, Cash), TrxID reference, payer name, receiving staff, and receipt notes. **Money is never marked received without explicit admin entry.**

### 8. Follow-up & Communication Logs
- **Staff Activity Tracker:** Logs phone calls, WhatsApp inquiries, and meetings with guardians and tutors.
- **Overdue Indicator:** Visual warning badges for scheduled follow-ups whose target date is in the past.
- **Disclaimer:** Clarifies that logging follow-ups does not send automated messages without a third-party gateway.

### 9. Reviews & Service Quality Moderation
- **Moderation Queue:** Parent and tutor testimonials start in `Pending` moderation.
- **Admin Approval Gate:** Testimonials only appear on the public portal once explicitly approved by an admin.
- **Demo Badging:** Demo testimonials are clearly distinguished from live user reviews.

### 10. Reports & CSV Export Hub
- **Financial Summaries:** Realized CTS revenue vs outstanding fees due vs referral commissions paid.
- **Market Demands:** Area-wise breakdown and curriculum distribution across Chittagong.
- **Spreadsheet Exports:** 1-click CSV download for:
  - Tutors List (`CTS_Tutors_*.csv`)
  - Tuition Requirements (`CTS_Tuition_Requests_*.csv`)
  - Financial Ledger (`CTS_Transactions_*.csv`)

### 11. Settings & Data Backup Center
- **Customizable Business Rules:** Edit business name, tagline, hotline phone, office address, default media fee percentage, and referral commission percentage.
- **Full JSON Backup & Restore:** Export complete database snapshot to `.json`; import back with schema validation.
- **Demo Reset:** Instant button to restore initial clean demo dataset.

### 12. Public-Facing Portal Concept (`public.html`)
- **Hero & Category Navigation:** Home Tutoring, Online Tutoring, English Medium, Admission Prep, and Special Skills.
- **Live Tuition Opportunities Board:** Displays active vacancies with privacy-masked data.
- **Verified Tutors Showcase:** Highlights top verified mentors while strictly hiding private phone numbers and personal home addresses.
- **Interactive Submission Modals:**
  - *Request a Tutor Form:* Saves into `CTSStore` as a new request.
  - *Become a Tutor Form:* Saves into `CTSStore` as a pending verification tutor.
- **Architecture Disclaimer:** Prominently explains that submissions are currently saved to the user's browser `localStorage` and will not sync to other devices without a backend.

---

## 🛡️ Production Roadmap: Moving from MVP to Enterprise Multi-User Service

To convert this single-browser MVP into a multi-user service running across multiple office staff, thousands of tutors, and guardians across Bangladesh:

1. **Central Database Backend:**
   - Migrate from `localStorage` to **PostgreSQL** or **MySQL**.
   - Create tables for `users`, `tutors`, `tuition_requests`, `pipeline_events`, `transactions`, and `reviews`.
2. **Server Architecture & REST/GraphQL API:**
   - Implement a backend server (Node.js/Express, Python/FastAPI, or Go).
   - Enforce server-side data validation and SQL injection prevention.
3. **Role-Based Access Control (RBAC):**
   - **Super Admin:** Full financial control, settings modification, and user deletion.
   - **Area Coordinator:** View and manage tuition requests in their assigned zone (e.g., Nasirabad, Agrabad).
   - **Tutors:** Self-service profile editing, viewing applied tuitions, and logging trial feedback.
   - **Guardians:** Submit requests, approve shortlisted tutors, and pay media fees.
4. **Authentication & Session Security:**
   - JWT tokens with HTTP-only secure cookies and bcrypt password hashing.
   - Two-factor authentication (2FA) for admin and financial accounts.
5. **Telecom & WhatsApp Integration:**
   - Integrate with **WhatsApp Cloud API** or **Twilio** to dispatch automated trial confirmations.
   - Integrate with local Bangladeshi SMS gateways (e.g., SSL Wireless, Onnorokom SMS) for urgent notifications.
6. **Payment Gateway Integration:**
   - Connect **bKash Merchant API**, **Nagad Gateway**, and **SSLCommerz** for automated payment verification and instant TrxID reconciliation.

---

## 🧪 Verification & Testing Report

Automated tests were written and executed using Node.js to verify core business logic:

### ✅ What Was Tested & Verified:
1. **Bangladesh Mobile Number Validation (`Store.validateBDPhone`):**
   - Standard numbers (`01812345678`), international prefix (`+88017...`), and hyphenated formats.
   - Rejection of short numbers and invalid mobile operator prefixes (e.g., `012...`).
2. **Profile Completeness Formula:**
   - Tested 100% score for fully verified profiles and proportionate scores for partial profiles.
3. **Duplicate Detection:**
   - Accurately flags existing phone numbers or email addresses in tutor registrations and tuition requests.
4. **Tutor Matching Algorithm (`Matching.findMatches`):**
   - Evaluated 6+ tutor profiles against varying requirements.
   - Verified that top match achieves >= 80% with clear breakdown of match reasons and mismatches.
5. **11-Stage Pipeline Progression:**
   - Programmatically transitioned a requirement through all 11 stages (`NEW REQUEST` to `FOLLOW-UP`).
   - Verified timestamp and note logging in the requirement's audit trail.
6. **Financial Accounting Math:**
   - Verified 50% media fee calculation and 20% referral commission calculation.
   - Verified partial payment recording (receives ৳3,000, leaves ৳2,000 due, updates status to `Partially Paid`).
   - Verified final payment recording (receives remaining ৳2,000, sets balance to ৳0, updates status to `Paid`).
   - Verified transaction recording in the financial ledger.
7. **Privacy Masking in Post Generator:**
   - Verified that guardian name, telephone number, and private flat/road details are **never** included in generated advertisements.
   - Verified inclusion of general area, subject requirements, and fee policy.
8. **Follow-up Overdue Logic:**
   - Verified that tasks with a scheduled date prior to today are flagged as `isOverdue = true`.
9. **Review Moderation Gate:**
   - Verified that new reviews default to `Pending` and only appear in the public feed after explicit admin approval.
10. **Data Backup & Schema Validation:**
    - Verified full JSON export.
    - Verified JSON import and schema validation.
    - Verified rejection of malformed or invalid JSON payloads.

*Test Suite 1 (`test-core.js`):* **32 / 32 Passed**  
*Test Suite 2 (`test-e2e-simulation.js`):* **43 / 43 Passed**

### ⚠️ What Was Not Tested (Out of MVP Scope):
- **Real Cross-Device Multi-User Syncing:** Not tested because this is a client-side localStorage MVP; data does not sync between different browsers or computers without a backend database.
- **Actual SMS / WhatsApp Dispatch:** Not tested with live telecom carriers; communication logs record interactions manually.
- **Third-Party Payment Gateway API Calls:** Real bKash/Nagad API webhooks were not tested as this MVP records ledger transactions via admin entry.

---

## 👥 Demo Contact Notice

All contact names, telephone numbers (e.g. `+880 1812-345678 (Demo)`), and email addresses in this application are **strictly simulated demo records**. No real individuals' personal data is exposed.
# cts-tuition-management
