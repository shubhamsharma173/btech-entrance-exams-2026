"""Historical one-time migration. Kept for reference; never rerun on current data."""
raise SystemExit(
    "This migration is retired: its records are already present. "
    "Edit reviewed data/exams-data.json and run npm run validate:data instead."
)

import json

# Read existing data
with open('data/exams-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# New Law Exams (Private Colleges)
new_law_exams = [
    {
        "id": 25,
        "name": "SLAT",
        "fullName": "Symbiosis Law Admission Test",
        "category": "law",
        "conductedBy": "Symbiosis International University",
        "tier": "Premier Private Law Schools",
        "priority": "Must Apply (for Symbiosis Law Schools)",
        "registrationStart": "2025-11-01 (expected)",
        "registrationEnd": "2025-12-15",
        "examDate": "2025-12-20 and 2025-12-28",
        "resultDate": "2026-01-15",
        "applicationFee": "₹2,250 + ₹1,000 per institute",
        "applyLink": "https://www.slat-test.org/",
        "officialWebsite": "https://www.slat-test.org/",
        "colleges": [
            "Symbiosis Law School Pune",
            "Symbiosis Law School Noida",
            "Symbiosis Law School Hyderabad",
            "Symbiosis Law School Nagpur"
        ],
        "totalSeats": "~500 BA LLB seats across 4 SLS campuses",
        "eligibility": {
            "education": "12th Pass or appearing (any stream)",
            "minimumMarks": "45% (General/OBC/EWS), 40% (SC/ST)",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT) - Online",
            "duration": "60 minutes",
            "sections": "Logical Reasoning (12), Legal Reasoning (12), Analytical Reasoning (12), Reading Comprehension (12), General Knowledge (12)",
            "totalQuestions": 60,
            "totalMarks": 60,
            "markingScheme": "+1 for correct, no negative marking"
        },
        "difficultyLevel": "High",
        "preparationTip": "Focus on Legal Reasoning (12 marks). GK section requires current affairs. Can attempt exam on both dates.",
        "avgPlacement": "₹8-12 LPA",
        "highestPlacement": "₹18+ LPA",
        "approxFees": "₹3-3.5 lakh/year (5-year BA LLB)",
        "location": "Pune, Noida, Hyderabad, Nagpur",
        "topBranches": ["BA LLB (Hons.)", "BBA LLB (Hons.)", "BCom LLB (Hons.)"],
        "keyHighlights": [
            "4 Symbiosis Law Schools accept SLAT",
            "Can appear on both exam dates (Dec 20 & 28)",
            "Selection: SLAT score + Personal Interview",
            "Good score: 48-55 marks",
            "No negative marking",
            "Strong corporate law focus"
        ],
        "colorCode": "high",
        "sources": [
            "https://www.slat-test.org/",
            "https://www.shiksha.com/law/slat-exam"
        ]
    },
    {
        "id": 26,
        "name": "LSAT India",
        "fullName": "Law School Admission Test India (Discontinued)",
        "category": "law",
        "conductedBy": "Pearson VUE / LSAC (Discontinued)",
        "tier": "N/A",
        "priority": "⚠️ Exam Discontinued from 2026",
        "registrationStart": "N/A (Exam discontinued)",
        "registrationEnd": "N/A",
        "examDate": "N/A (Discontinued by LSAC)",
        "resultDate": "N/A",
        "applicationFee": "N/A",
        "applyLink": "N/A",
        "officialWebsite": "N/A",
        "colleges": [
            "Previously accepted by 85+ private law schools",
            "GD Goenka University",
            "ISBR Law College",
            "BML Munjal University",
            "Lloyd Law College",
            "Alliance University"
        ],
        "totalSeats": "N/A",
        "eligibility": {
            "education": "N/A - Exam discontinued",
            "minimumMarks": "N/A",
            "ageLimit": "N/A"
        },
        "examPattern": {
            "mode": "N/A",
            "duration": "N/A",
            "sections": "N/A",
            "totalQuestions": 0,
            "totalMarks": 0,
            "markingScheme": "N/A"
        },
        "difficultyLevel": "N/A",
        "preparationTip": "⚠️ LSAT India discontinued by Law School Admission Council (LSAC). Alternative: Apply to CLAT, AILET, or directly to private law schools.",
        "avgPlacement": "N/A",
        "highestPlacement": "N/A",
        "approxFees": "N/A",
        "location": "N/A",
        "topBranches": ["N/A"],
        "keyHighlights": [
            "⚠️ Discontinued from 2026",
            "LSAC unable to meet business objectives",
            "Alternative: CLAT (24 NLUs)",
            "Alternative: AILET (NLU Delhi)",
            "Alternative: SLAT (Symbiosis Law Schools)",
            "Check directly with private law schools for admission"
        ],
        "colorCode": "low",
        "sources": [
            "https://www.upes.ac.in/blog/exams/lsat-india-exam-and-preparation",
            "https://stepincollege.com/exam/LSAT/EXMID41"
        ]
    }
]

# New Management Exams (Private Colleges)
new_management_exams = [
    {
        "id": 27,
        "name": "SNAP",
        "fullName": "Symbiosis National Aptitude Test",
        "category": "management",
        "conductedBy": "Symbiosis International University (SIU)",
        "tier": "Premier B-School Exam",
        "priority": "Must Apply (for Symbiosis B-Schools)",
        "registrationStart": "2026-08-01 (expected)",
        "registrationEnd": "2026-11-30 (expected)",
        "examDate": "December 2026 (3 different dates)",
        "resultDate": "January 2027",
        "applicationFee": "₹2,200 per exam + ₹1,000 per program",
        "applyLink": "https://www.snaptest.org/",
        "officialWebsite": "https://www.snaptest.org/",
        "colleges": [
            "SIBM Pune",
            "SCMHRD Pune",
            "SIBM Bangalore",
            "SIBM Hyderabad",
            "SIIB Pune",
            "SIOM Nashik",
            "SITM Pune",
            "15 Symbiosis B-Schools in total"
        ],
        "totalSeats": "~2,000 MBA seats across 15 institutes",
        "eligibility": {
            "education": "Graduate from recognized university (any discipline)",
            "minimumMarks": "50% (General), 45% (SC/ST)",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT)",
            "duration": "60 minutes",
            "sections": "General English (15 Q), Quantitative (20 Q), Reasoning (25 Q)",
            "totalQuestions": 60,
            "totalMarks": 60,
            "markingScheme": "+1 for correct, no negative marking"
        },
        "difficultyLevel": "High",
        "preparationTip": "Fast-paced exam (1 min/Q). Can attempt on all 3 dates. Best score considered. Focus on speed.",
        "avgPlacement": "₹18-25 LPA (SIBM Pune), varies by institute",
        "highestPlacement": "₹42 LPA (SIBM Pune)",
        "approxFees": "₹12-18 lakh for 2 years (varies by institute)",
        "location": "Pune, Bangalore, Hyderabad, Nashik, Nagpur",
        "topBranches": ["MBA", "MBA (Operations)", "MBA (Healthcare)", "MBA (Agri-Business)"],
        "keyHighlights": [
            "Gateway to 15 Symbiosis B-Schools",
            "Top institutes: SIBM Pune, SCMHRD Pune",
            "3 exam attempts in December",
            "Best of 3 scores considered",
            "No negative marking",
            "60 questions in 60 minutes"
        ],
        "colorCode": "high",
        "sources": [
            "https://www.snaptest.org/",
            "https://www.shiksha.com/mba/articles/snap-2026-exam-blogId-217318"
        ]
    },
    {
        "id": 28,
        "name": "NMAT",
        "fullName": "NMIMS Management Aptitude Test",
        "category": "management",
        "conductedBy": "GMAC (for NMIMS admission)",
        "tier": "Premier B-School Exam",
        "priority": "Must Apply (for NMIMS campuses)",
        "registrationStart": "2026-08-01",
        "registrationEnd": "2026-10-18",
        "examDate": "2026-11-05 to 2026-12-19",
        "resultDate": "January 2027",
        "applicationFee": "₹3,000 per attempt (GMAC) + ₹2,900 (NMIMS Application)",
        "applyLink": "https://nmat.nmims.edu/",
        "officialWebsite": "https://nmat.nmims.edu/",
        "colleges": [
            "NMIMS Mumbai (Flagship)",
            "NMIMS Bangalore",
            "NMIMS Hyderabad",
            "NMIMS Navi Mumbai",
            "NMIMS Indore",
            "NMIMS Shirpur",
            "SVKM's NMIMS Dhule"
        ],
        "totalSeats": "~2,500 MBA seats across campuses",
        "eligibility": {
            "education": "Bachelor's degree (any discipline)",
            "minimumMarks": "50% (General), 45% (SC/ST/OBC)",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT)",
            "duration": "120 minutes (28+52+40)",
            "sections": "Language Skills (36 Q, 28 min), Quantitative Skills (48 Q, 52 min), Logical Reasoning (36 Q, 40 min)",
            "totalQuestions": 120,
            "totalMarks": 360,
            "markingScheme": "+3 for correct, no negative marking"
        },
        "difficultyLevel": "High",
        "preparationTip": "Sectional time limits. Target 209+ overall, 62+ sectional for NMIMS Mumbai. Can retake 3 times.",
        "avgPlacement": "₹23.07 LPA (NMIMS Mumbai)",
        "highestPlacement": "₹57.65 LPA (NMIMS Mumbai)",
        "approxFees": "₹23-26 lakh for 2 years (NMIMS Mumbai)",
        "location": "Mumbai, Bangalore, Hyderabad, Navi Mumbai, Indore, Shirpur",
        "topBranches": ["MBA (Core)", "MBA (HR)", "MBA (Business Analytics)", "MBA (Digital Transformation)", "MBA (Pharma)"],
        "keyHighlights": [
            "NMIMS Mumbai is top 10 B-School",
            "Can retake exam 3 times",
            "Best score considered",
            "Cutoff: 209 overall, 62 sectional (Mumbai)",
            "Sectional time limits (challenging)",
            "Selection: NMAT + Competency Test + PI"
        ],
        "colorCode": "high",
        "sources": [
            "https://nmat.nmims.edu/",
            "https://www.shiksha.com/mba/nmat-exam"
        ]
    },
    {
        "id": 29,
        "name": "CMAT",
        "fullName": "Common Management Admission Test",
        "category": "management",
        "conductedBy": "National Testing Agency (NTA)",
        "tier": "National-Level",
        "priority": "Good Backup (1000+ AICTE colleges)",
        "registrationStart": "2025-11-01 (expected)",
        "registrationEnd": "2025-11-24",
        "examDate": "2026-01-25",
        "resultDate": "2026-02-14",
        "applicationFee": "₹1,200 (General male), ₹1,000 (Reserved/Female/Transgender)",
        "applyLink": "https://cmat.nta.nic.in/",
        "officialWebsite": "https://cmat.nta.nic.in/",
        "colleges": [
            "JBIMS Mumbai",
            "SIMSREE Mumbai",
            "KJ Somaiya Mumbai",
            "Welingkar Mumbai",
            "PUMBA Pune",
            "GIM Goa",
            "1000+ AICTE-approved colleges"
        ],
        "totalSeats": "~40,000+ seats (AICTE colleges)",
        "eligibility": {
            "education": "Graduation (any discipline) or final year appearing",
            "minimumMarks": "No minimum percentage required",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT)",
            "duration": "3 hours",
            "sections": "Quantitative Techniques (25 Q), Logical Reasoning (25 Q), Language Comprehension (25 Q), General Awareness (25 Q), Innovation (1 Q)",
            "totalQuestions": 101,
            "totalMarks": 400,
            "markingScheme": "+4 for correct, -1 for incorrect"
        },
        "difficultyLevel": "Moderate",
        "preparationTip": "Good for tier-2 MBA colleges. Target 180+ for JBIMS/SIMSREE. Negative marking (-1).",
        "avgPlacement": "₹8-12 LPA (varies by college)",
        "highestPlacement": "₹25+ LPA (JBIMS, SIMSREE)",
        "approxFees": "₹3-8 lakh for 2 years (varies by college)",
        "location": "Pan-India (1000+ colleges)",
        "topBranches": ["MBA", "PGDM"],
        "keyHighlights": [
            "Accepted by 1000+ AICTE colleges",
            "Top colleges: JBIMS, SIMSREE, KJ Somaiya",
            "Single attempt in January",
            "Affordable option for tier-2 B-Schools",
            "Good backup to CAT/XAT",
            "NTA-conducted (same as JEE, NEET)"
        ],
        "colorCode": "medium",
        "sources": [
            "https://cmat.nta.nic.in/",
            "https://www.mbauniverse.com/cmat"
        ]
    },
    {
        "id": 30,
        "name": "MAT",
        "fullName": "Management Aptitude Test",
        "category": "management",
        "conductedBy": "All India Management Association (AIMA)",
        "tier": "National-Level",
        "priority": "Good Backup (600+ colleges)",
        "registrationStart": "2026-01-15 (Feb session)",
        "registrationEnd": "2026-02-25 (Feb session)",
        "examDate": "2026-03-01 (PBT), 2026-03-08 (CBT)",
        "resultDate": "Within 2-3 weeks",
        "applicationFee": "₹2,200 (1 session), ₹3,800 (2 sessions)",
        "applyLink": "https://mat.aima.in/",
        "officialWebsite": "https://www.aima.in/mat.html",
        "colleges": [
            "BIMTECH (specialized programs)",
            "JAGSOM Bangalore",
            "Jaipuria Noida",
            "IPE Hyderabad",
            "SIES Mumbai",
            "IBA Bangalore",
            "Rajagiri Kochi",
            "NISM Mumbai",
            "600+ colleges accept MAT"
        ],
        "totalSeats": "~25,000+ seats (600+ colleges)",
        "eligibility": {
            "education": "Graduation from recognized university (any discipline)",
            "minimumMarks": "No minimum percentage required",
            "ageLimit": "No age or work experience limit"
        },
        "examPattern": {
            "mode": "Paper-Based Test (PBT) or Computer-Based Test (CBT)",
            "duration": "150 minutes",
            "sections": "Language Comprehension (40 Q), Mathematical Skills (40 Q), Data Analysis (40 Q), Intelligence & Critical Reasoning (40 Q), Indian & Global Environment (40 Q)",
            "totalQuestions": 200,
            "totalMarks": 200,
            "markingScheme": "+1 for correct, -0.25 for incorrect"
        },
        "difficultyLevel": "Moderate",
        "preparationTip": "Conducted 4 times/year (Feb, May, Sep, Dec). Choose PBT or CBT. Target 500+ for top colleges.",
        "avgPlacement": "₹6-10 LPA (varies by college)",
        "highestPlacement": "₹18+ LPA (top colleges)",
        "approxFees": "₹4-8 lakh for 2 years (varies by college)",
        "location": "Pan-India (600+ colleges)",
        "topBranches": ["MBA", "PGDM"],
        "keyHighlights": [
            "4 attempts per year (Feb, May, Sep, Dec)",
            "600+ colleges accept MAT scores",
            "Choose Paper-Based (PBT) or Computer-Based (CBT)",
            "Conducted by AIMA (established 1956)",
            "Good for working professionals",
            "Most affordable MBA entrance exam"
        ],
        "colorCode": "medium",
        "sources": [
            "https://www.aima.in/mat.html",
            "https://www.shiksha.com/mba/mat-exam"
        ]
    }
]

# New Design Exams (Private Colleges)
new_design_exams = [
    {
        "id": 31,
        "name": "NIFT",
        "fullName": "National Institute of Fashion Technology Entrance Exam",
        "category": "design",
        "conductedBy": "National Testing Agency (NTA)",
        "tier": "Premier Design Institute",
        "priority": "Must Apply (for Fashion/Textile Design)",
        "registrationStart": "2025-12-08",
        "registrationEnd": "2026-01-19 (with late fee ₹5,000)",
        "examDate": "2026-02-08",
        "resultDate": "March 2026",
        "applicationFee": "₹3,000 (1 program), ₹4,500 (2 programs) + ₹5,000 (late fee)",
        "applyLink": "https://exams.nta.nic.in/niftee/",
        "officialWebsite": "https://www.nift.ac.in/",
        "colleges": [
            "NIFT Delhi",
            "NIFT Mumbai",
            "NIFT Bangalore",
            "NIFT Kolkata",
            "NIFT Hyderabad",
            "NIFT Chennai",
            "NIFT Gandhinagar",
            "NIFT Kannur",
            "18 NIFT campuses across India"
        ],
        "totalSeats": "~3,500 B.Des/B.FTech seats across 18 campuses",
        "eligibility": {
            "education": "12th Pass from recognized board (any stream)",
            "minimumMarks": "No minimum percentage required",
            "ageLimit": "Maximum 24 years as of Aug 1, 2026 (UG)"
        },
        "examPattern": {
            "mode": "Pen & Paper (Offline)",
            "duration": "GAT: 2 hours, CAT: 3 hours",
            "sections": "General Ability Test (GAT): 100 Q, Creative Ability Test (CAT): Hands-on sketching",
            "totalQuestions": 100,
            "totalMarks": 100,
            "markingScheme": "+1 for correct, -0.25 for incorrect (GAT), Qualitative (CAT)"
        },
        "difficultyLevel": "High (Creative test challenging)",
        "preparationTip": "GAT: General knowledge + English. CAT: Drawing skills essential. Practice fashion sketching.",
        "avgPlacement": "₹7-10 LPA",
        "highestPlacement": "₹20+ LPA (International fashion houses)",
        "approxFees": "₹1.9-2.4 lakh/year (varies by program)",
        "location": "18 campuses across India",
        "topBranches": ["B.Des Fashion Design", "B.Des Textile Design", "B.Des Accessory Design", "B.FTech (Apparel Production)"],
        "keyHighlights": [
            "India's premier fashion institute",
            "18 campuses nationwide",
            "Two-stage exam: GAT + CAT",
            "CAT requires drawing/sketching skills",
            "Top recruiters: Zara, H&M, Louis Vuitton",
            "Government institute with affordable fees"
        ],
        "colorCode": "high",
        "sources": [
            "https://exams.nta.nic.in/niftee/",
            "https://design.careers360.com/articles/nift-2026"
        ]
    },
    {
        "id": 32,
        "name": "SEED",
        "fullName": "Symbiosis Entrance Exam for Design",
        "category": "design",
        "conductedBy": "Symbiosis International University",
        "tier": "Premier Private Design Institute",
        "priority": "Apply for Symbiosis Institute of Design",
        "registrationStart": "2026-01-12 (Round 2)",
        "registrationEnd": "2026-03-15 (Round 2)",
        "examDate": "2026-01-11 (Round 1 done), 2026-03-22 (Round 2)",
        "resultDate": "Within 2 weeks of exam",
        "applicationFee": "₹3,250 (₹2,250 SEED + ₹1,000 SID)",
        "applyLink": "https://www.siu.edu.in/",
        "officialWebsite": "https://sid.edu.in/",
        "colleges": [
            "Symbiosis Institute of Design (SID) Pune"
        ],
        "totalSeats": "~200 B.Des seats",
        "eligibility": {
            "education": "10+2 (any stream) or equivalent 10+3 diploma",
            "minimumMarks": "50% (General), 45% (SC/ST)",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Online Test",
            "duration": "1 hour",
            "sections": "Design Aptitude, Creativity, Problem-Solving, General Awareness (Design)",
            "totalQuestions": 60,
            "totalMarks": 60,
            "markingScheme": "+1 for correct, no negative marking"
        },
        "difficultyLevel": "Moderate-High",
        "preparationTip": "Focus on visual thinking, design concepts, creativity. 2 rounds available - can apply to both.",
        "avgPlacement": "₹5-8 LPA",
        "highestPlacement": "₹15+ LPA",
        "approxFees": "₹3.5 lakh/year",
        "location": "Pune (Maharashtra)",
        "topBranches": ["B.Des (Communication Design)", "B.Des (Fashion Design)", "B.Des (Fashion Communication)", "B.Des (Product Design)"],
        "keyHighlights": [
            "2 rounds per year (Jan & March)",
            "Can apply to both rounds",
            "Selection: SEED + Personal Interview",
            "Strong industry connections",
            "Pune location advantage",
            "No negative marking"
        ],
        "colorCode": "high",
        "sources": [
            "https://sid.edu.in/",
            "https://www.shiksha.com/college/symbiosis-institute-of-design-symbiosis-international-pune/seed-exam"
        ]
    },
    {
        "id": 33,
        "name": "MIT DAT",
        "fullName": "MIT Institute of Design - Design Entrance Test",
        "category": "design",
        "conductedBy": "MIT Institute of Design, Pune",
        "tier": "Premier Private Design Institute",
        "priority": "Apply for MIT Design programs",
        "registrationStart": "2025-10-17",
        "registrationEnd": "2026-02-28",
        "examDate": "2026-04-12",
        "resultDate": "May 2026",
        "applicationFee": "₹3,000 (Indian), ₹4,500 (NRI/Foreign)",
        "applyLink": "https://www.mitid.edu.in/",
        "officialWebsite": "https://www.mitid.edu.in/",
        "colleges": [
            "MIT Institute of Design (MITID) Pune"
        ],
        "totalSeats": "~300 B.Des/M.Des seats",
        "eligibility": {
            "education": "10+2 (any stream) with 50% for B.Des, Bachelor's degree for M.Des",
            "minimumMarks": "50% in qualifying exam",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Design Entrance Test (DET) - Online, Studio Test - Offline",
            "duration": "DET: 2 hours, Studio Test: 6-8 hours",
            "sections": "DET: Design aptitude, analytical skills. Studio Test: Material handling, creative problem-solving",
            "totalQuestions": 100,
            "totalMarks": 100,
            "markingScheme": "DET: MCQs, Studio Test: Qualitative assessment"
        },
        "difficultyLevel": "Very High (Studio test intensive)",
        "preparationTip": "2-stage: DET (online) + Studio Test + Portfolio Interview. Studio test is hands-on creative work.",
        "avgPlacement": "₹6-10 LPA",
        "highestPlacement": "₹20+ LPA",
        "approxFees": "₹5-6 lakh/year",
        "location": "Pune (Maharashtra)",
        "topBranches": ["B.Des (Product Design)", "B.Des (Communication Design)", "B.Des (Film & Video)", "B.Des (Fashion Design)"],
        "keyHighlights": [
            "Three-stage selection: DET + Studio Test + Interview",
            "Studio test is intensive (6-8 hours hands-on)",
            "Portfolio review mandatory",
            "Strong industry partnerships",
            "International faculty",
            "Located in Pune IT hub"
        ],
        "colorCode": "high",
        "sources": [
            "https://www.mitid.edu.in/",
            "https://design.careers360.com/articles/mitid-dat"
        ]
    },
    {
        "id": 34,
        "name": "Pearl Academy",
        "fullName": "Pearl Academy Entrance Exam",
        "category": "design",
        "conductedBy": "Pearl Academy",
        "tier": "Private Design Institute",
        "priority": "Good Backup (Fashion & Design)",
        "registrationStart": "2025-11-01 (expected)",
        "registrationEnd": "2026-01-13 (January cycle)",
        "examDate": "2026-01-17 (January cycle) - 5 cycles yearly",
        "resultDate": "Within 1 week",
        "applicationFee": "₹2,000 (Bachelor's/Master's), ₹500 (Certificate)",
        "applyLink": "https://www.pearlacademy.com/",
        "officialWebsite": "https://www.pearlacademy.com/",
        "colleges": [
            "Pearl Academy Delhi",
            "Pearl Academy Mumbai",
            "Pearl Academy Jaipur",
            "Pearl Academy Bengaluru"
        ],
        "totalSeats": "~1,500 seats across 4 campuses",
        "eligibility": {
            "education": "10+2 from recognized board (any stream)",
            "minimumMarks": "No minimum percentage required",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Online Test",
            "duration": "GPT: 60 min, DAT: 90 min",
            "sections": "General Proficiency Test (GPT): English, GK, Reasoning. Design Aptitude Test (DAT): Creative thinking",
            "totalQuestions": 100,
            "totalMarks": 100,
            "markingScheme": "No negative marking"
        },
        "difficultyLevel": "Moderate",
        "preparationTip": "5 cycles yearly (Jan, Apr, Jun, Aug, Sep). Selection: GPT + DAT + Personal Interview. Scholarships available.",
        "avgPlacement": "₹4-7 LPA",
        "highestPlacement": "₹12+ LPA",
        "approxFees": "₹4-5 lakh/year (scholarships available)",
        "location": "Delhi, Mumbai, Jaipur, Bengaluru",
        "topBranches": ["B.Des Fashion Design", "B.Des Fashion Styling", "B.Des Interior Design", "B.Des Product Design"],
        "keyHighlights": [
            "5 admission cycles per year",
            "Multiple campuses (Delhi, Mumbai, Jaipur, Bangalore)",
            "Scholarship based on exam performance",
            "No negative marking",
            "Industry-oriented curriculum",
            "Fashion & lifestyle design focus"
        ],
        "colorCode": "medium",
        "sources": [
            "https://www.pearlacademy.com/",
            "https://design.careers360.com/articles/pearl-academy-entrance-exam-2026"
        ]
    }
]

# Add all new exams
data['exams'].extend(new_law_exams)
data['exams'].extend(new_management_exams)
data['exams'].extend(new_design_exams)

# Update totalExams count
data['totalExams'] = len(data['exams'])

# Update note
data['note'] = "Engineering: Apply to exams 1-10 (universal) + your state exam (11-15). Medical: NEET-UG is mandatory. Law: CLAT for NLUs, SLAT for Symbiosis. Management: CAT for IIMs, SNAP/NMAT for private B-Schools. Design: UCEED for IITs, NIFT for fashion, NID for design."

# Write updated data
with open('data/exams-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated! Total exams: {data['totalExams']}")
print(f"  - Engineering: {len([e for e in data['exams'] if e['category'] == 'engineering'])}")
print(f"  - Medical: {len([e for e in data['exams'] if e['category'] == 'medical'])}")
print(f"  - Law: {len([e for e in data['exams'] if e['category'] == 'law'])}")
print(f"  - Management: {len([e for e in data['exams'] if e['category'] == 'management'])}")
print(f"  - Design: {len([e for e in data['exams'] if e['category'] == 'design'])}")
