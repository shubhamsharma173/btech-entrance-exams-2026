"""Historical one-time migration. Kept for reference; never rerun on current data."""
raise SystemExit(
    "This migration is retired: it resets categories and duplicates records. "
    "Edit reviewed data/exams-data.json and run npm run validate:data instead."
)

import json

# Read existing data
with open('data/exams-data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Add category to existing engineering exams
for exam in data['exams']:
    exam['category'] = 'engineering'

# Add more colleges to existing exams
data['exams'][0]['colleges'] = [
    "BITS Pilani (Rajasthan)",
    "BITS Goa",
    "BITS Hyderabad",
    "BITS Dubai"
]

data['exams'][1]['colleges'] = [
    "VIT Vellore (Main Campus)",
    "VIT Chennai",
    "VIT Bhopal",
    "VIT Amaravati (AP)",
    "VIT-AP University"
]

data['exams'][2]['colleges'] = [
    "SRM Kattankulathur (Chennai - Main)",
    "SRM Ramapuram (Chennai)",
    "SRM NCR (Ghaziabad)",
    "SRM Sonepat (Haryana)",
    "SRM Amaravati (AP)",
    "SRM Trichy"
]

data['exams'][4]['colleges'] = [
    "RVCE Bangalore",
    "PES University",
    "MSRIT Bangalore",
    "BMSCE Bangalore",
    "Dayananda Sagar College",
    "BMS College of Engineering",
    "RNSIT Bangalore",
    "CMR Institute of Technology",
    "150+ engineering colleges in Karnataka"
]

# New Medical Exams
medical_exams = [
    {
        "id": 16,
        "name": "NEET-UG",
        "fullName": "National Eligibility cum Entrance Test (Undergraduate)",
        "category": "medical",
        "conductedBy": "National Testing Agency (NTA)",
        "tier": "National-Level",
        "priority": "Must Apply (for MBBS/BDS/AYUSH)",
        "registrationStart": "2026-02-08",
        "registrationEnd": "2026-03-15 (expected)",
        "examDate": "2026-05-03 (expected - First Sunday of May)",
        "resultDate": "June 2026",
        "applicationFee": "₹1,700 (General), ₹1,600 (EWS/OBC), ₹1,000 (SC/ST/PwD), ₹9,500 (Outside India)",
        "applyLink": "https://neet.nta.nic.in/",
        "officialWebsite": "https://neet.nta.nic.in/",
        "colleges": [
            "AIIMS (16 institutes)",
            "JIPMER Puducherry",
            "PGIMER Chandigarh",
            "BHU (Varanasi)",
            "AMU (Aligarh)",
            "All Government Medical Colleges (600+)",
            "Private Medical Colleges (300+)",
            "Deemed Universities",
            "AYUSH Colleges"
        ],
        "totalSeats": "~1,08,000 MBBS seats (Govt + Private)",
        "eligibility": {
            "education": "12th Pass or appearing with Physics, Chemistry, Biology/Biotechnology",
            "minimumMarks": "50% in PCB (40% for SC/ST/OBC, 45% for PwD)",
            "ageLimit": "Minimum 17 years as of Dec 31, 2026. No upper age limit."
        },
        "examPattern": {
            "mode": "Pen & Paper (Offline)",
            "duration": "3 hours 20 minutes",
            "sections": "Physics (50 Q), Chemistry (50 Q), Biology (100 Q - 50 Botany + 50 Zoology)",
            "totalQuestions": 200,
            "totalMarks": 720,
            "markingScheme": "+4 for correct, -1 for incorrect"
        },
        "difficultyLevel": "Very High (Most competitive medical exam in India)",
        "preparationTip": "NCERT is BIBLE for NEET. 85-90% questions directly from NCERT. Focus on Biology (double weightage).",
        "avgPlacement": "N/A (Doctor salary varies: ₹6-12 LPA for freshers, ₹50+ LPA for specialists)",
        "highestPlacement": "N/A",
        "approxFees": "₹50K-2 lakh/year (Govt), ₹15-25 lakh/year (Private)",
        "location": "Pan-India (Govt + Private Medical Colleges)",
        "topBranches": ["MBBS", "BDS", "BAMS", "BHMS", "BUMS"],
        "keyHighlights": [
            "ONLY exam for MBBS/BDS admission in India",
            "20+ lakh students appear annually",
            "NCERT-based (85-90% direct questions)",
            "Single exam for 1000+ colleges",
            "Government college fees: ₹50K-2L/year",
            "Cutoff: 50th percentile (General), 40th (SC/ST/OBC)"
        ],
        "colorCode": "high",
        "sources": [
            "https://neet.nta.nic.in/",
            "https://www.mcc.nic.in/"
        ]
    },
    {
        "id": 17,
        "name": "AIIMS INICET",
        "fullName": "AIIMS INI Entrance Test (Discontinued for UG from 2020)",
        "category": "medical",
        "conductedBy": "AIIMS (Now merged with NEET-UG)",
        "tier": "N/A",
        "priority": "⚠️ No longer conducted - Use NEET-UG for AIIMS admission",
        "registrationStart": "N/A",
        "registrationEnd": "N/A",
        "examDate": "N/A (Discontinued)",
        "resultDate": "N/A",
        "applicationFee": "N/A",
        "applyLink": "https://aiimsexams.ac.in/",
        "officialWebsite": "https://aiimsexams.ac.in/",
        "colleges": [
            "AIIMS New Delhi",
            "AIIMS Bhopal",
            "AIIMS Bhubaneswar",
            "AIIMS Jodhpur",
            "AIIMS Patna",
            "AIIMS Raipur",
            "AIIMS Rishikesh",
            "And 9 more AIIMS"
        ],
        "totalSeats": "~1,200 MBBS seats across 16 AIIMS",
        "eligibility": {
            "education": "N/A - Apply via NEET-UG",
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
        "preparationTip": "⚠️ IMPORTANT: AIIMS UG admissions now through NEET-UG only. Prepare for NEET to get into AIIMS.",
        "avgPlacement": "N/A",
        "highestPlacement": "N/A",
        "approxFees": "₹5,850/year (Govt subsidy)",
        "location": "16 AIIMS across India",
        "topBranches": ["MBBS"],
        "keyHighlights": [
            "⚠️ AIIMS MBBS admission now via NEET-UG",
            "Counselling done by MCC",
            "Extremely affordable (₹5,850/year)",
            "Best medical education in India",
            "Apply through NEET-UG only"
        ],
        "colorCode": "low",
        "sources": [
            "https://aiimsexams.ac.in/",
            "https://www.mcc.nic.in/"
        ]
    },
    {
        "id": 18,
        "name": "JIPMER",
        "fullName": "JIPMER MBBS (Now merged with NEET-UG from 2020)",
        "category": "medical",
        "conductedBy": "JIPMER (Now merged with NEET)",
        "tier": "N/A",
        "priority": "⚠️ No longer conducted - Use NEET-UG",
        "registrationStart": "N/A",
        "registrationEnd": "N/A",
        "examDate": "N/A (Merged with NEET from 2020)",
        "resultDate": "N/A",
        "applicationFee": "N/A",
        "applyLink": "https://neet.nta.nic.in/",
        "officialWebsite": "https://jipmer.edu.in/",
        "colleges": [
            "JIPMER Puducherry",
            "JIPMER Karaikal"
        ],
        "totalSeats": "~200 MBBS seats (Both campuses)",
        "eligibility": {
            "education": "N/A - Apply via NEET-UG",
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
        "preparationTip": "⚠️ JIPMER admissions now through NEET-UG. Counselling by MCC.",
        "avgPlacement": "N/A",
        "highestPlacement": "N/A",
        "approxFees": "₹3,000-5,000/year (Highly subsidized)",
        "location": "Puducherry, Karaikal",
        "topBranches": ["MBBS"],
        "keyHighlights": [
            "⚠️ JIPMER MBBS admission now via NEET-UG",
            "Premier medical institute",
            "Extremely affordable",
            "Apply through NEET-UG only",
            "Counselling by MCC"
        ],
        "colorCode": "low",
        "sources": [
            "https://jipmer.edu.in/",
            "https://www.mcc.nic.in/"
        ]
    }
]

# New Law Exams
law_exams = [
    {
        "id": 19,
        "name": "CLAT",
        "fullName": "Common Law Admission Test",
        "category": "law",
        "conductedBy": "Consortium of National Law Universities",
        "tier": "National-Level",
        "priority": "Must Apply (for NLU admission)",
        "registrationStart": "2026-01-06",
        "registrationEnd": "2026-03-24",
        "examDate": "2026-05-11 (Second Sunday of May)",
        "resultDate": "May-June 2026",
        "applicationFee": "₹5,000 (General/OBC/EWS), ₹2,500 (SC/ST/PwD/BPL)",
        "applyLink": "https://consortiumofnlus.ac.in/",
        "officialWebsite": "https://consortiumofnlus.ac.in/",
        "colleges": [
            "NLSIU Bangalore",
            "NALSAR Hyderabad",
            "NLU Delhi",
            "NUJS Kolkata",
            "NLU Jodhpur",
            "HNLU Raipur",
            "GNLU Gandhinagar",
            "RMLNLU Lucknow",
            "And 16 more NLUs"
        ],
        "totalSeats": "~3,000 UG seats (BA LLB - 5 years) across 24 NLUs",
        "eligibility": {
            "education": "12th Pass or appearing (any stream)",
            "minimumMarks": "45% (General/OBC/EWS), 40% (SC/ST)",
            "ageLimit": "No upper age limit (from 2023)"
        },
        "examPattern": {
            "mode": "Pen & Paper (Offline)",
            "duration": "2 hours",
            "sections": "English (22 Q), Current Affairs (28 Q), Legal Reasoning (32 Q), Logical Reasoning (28 Q), Quantitative Techniques (10 Q)",
            "totalQuestions": 120,
            "totalMarks": 120,
            "markingScheme": "+1 for correct, -0.25 for incorrect"
        },
        "difficultyLevel": "High (Very competitive)",
        "preparationTip": "Focus on Legal Reasoning and Current Affairs. Read newspapers daily. Practice reading comprehension.",
        "avgPlacement": "₹10-18 LPA (from top NLUs like NLSIU, NALSAR)",
        "highestPlacement": "₹25+ LPA (International law firms)",
        "approxFees": "₹2-4 lakh/year (varies by NLU)",
        "location": "Pan-India (24 NLUs)",
        "topBranches": ["BA LLB (Hons.)", "BCom LLB", "BBA LLB"],
        "keyHighlights": [
            "Single exam for 24 NLUs",
            "Top law colleges in India",
            "Excellent career prospects (Corporate Law, Judiciary, Civil Services)",
            "Good starting salaries (₹10-18 LPA)",
            "No age limit (from 2023)",
            "All India Ranking"
        ],
        "colorCode": "high",
        "sources": [
            "https://consortiumofnlus.ac.in/",
            "https://www.livelaw.in/clat-exam"
        ]
    },
    {
        "id": 20,
        "name": "AILET",
        "fullName": "All India Law Entrance Test",
        "category": "law",
        "conductedBy": "National Law University, Delhi",
        "tier": "University-Level",
        "priority": "Apply if interested in NLU Delhi",
        "registrationStart": "2026-01-01 (expected)",
        "registrationEnd": "2026-03-31 (expected)",
        "examDate": "2026-05-18 (expected)",
        "resultDate": "June 2026",
        "applicationFee": "₹3,750 (General), ₹1,875 (SC/ST/PwD)",
        "applyLink": "https://nludelhi.ac.in/",
        "officialWebsite": "https://nludelhi.ac.in/",
        "colleges": [
            "NLU Delhi"
        ],
        "totalSeats": "~118 BA LLB seats",
        "eligibility": {
            "education": "12th Pass or appearing (any stream)",
            "minimumMarks": "50% (General), 45% (SC/ST)",
            "ageLimit": "No upper age limit (from 2023)"
        },
        "examPattern": {
            "mode": "Pen & Paper (Offline)",
            "duration": "1 hour 30 minutes",
            "sections": "English (35 Q), General Knowledge & Current Affairs (35 Q), Legal Aptitude (50 Q), Logical Reasoning (30 Q)",
            "totalQuestions": 150,
            "totalMarks": 150,
            "markingScheme": "+1 for correct, -0.25 for incorrect"
        },
        "difficultyLevel": "High",
        "preparationTip": "Legal Aptitude carries max weight (50 Q). Prepare deeply for legal reasoning and current affairs.",
        "avgPlacement": "₹12-15 LPA",
        "highestPlacement": "₹20+ LPA",
        "approxFees": "₹3.5 lakh/year",
        "location": "New Delhi",
        "topBranches": ["BA LLB (Hons.)"],
        "keyHighlights": [
            "Premier law university in Delhi",
            "Located in national capital",
            "Strong judiciary preparation",
            "Good placement record",
            "Close to Supreme Court",
            "Separate from CLAT"
        ],
        "colorCode": "medium",
        "sources": [
            "https://nludelhi.ac.in/",
            "https://www.livelaw.in/ailet"
        ]
    }
]

# New Management Exams
management_exams = [
    {
        "id": 21,
        "name": "CAT",
        "fullName": "Common Admission Test",
        "category": "management",
        "conductedBy": "IIMs (Rotated annually)",
        "tier": "National-Level",
        "priority": "Must Apply (for IIMs/Top B-Schools)",
        "registrationStart": "2026-08-01 (expected)",
        "registrationEnd": "2026-09-20 (expected)",
        "examDate": "2026-11-22 (Last Sunday of November)",
        "resultDate": "January 2027",
        "applicationFee": "₹2,400 (General/OBC), ₹1,200 (SC/ST/PwD)",
        "applyLink": "https://iimcat.ac.in/",
        "officialWebsite": "https://iimcat.ac.in/",
        "colleges": [
            "IIM Ahmedabad",
            "IIM Bangalore",
            "IIM Calcutta",
            "IIM Lucknow",
            "IIM Kozhikode",
            "IIM Indore",
            "And 14 more IIMs",
            "1000+ B-Schools accept CAT scores (FMS, SPJIMR, MDI, etc.)"
        ],
        "totalSeats": "~5,000 MBA seats across 20 IIMs",
        "eligibility": {
            "education": "Bachelor's degree (any stream) with 50% marks (45% for SC/ST/PwD)",
            "minimumMarks": "50% in graduation (45% for reserved)",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT)",
            "duration": "2 hours (40 min per section)",
            "sections": "VARC (24 Q), DILR (20 Q), QA (22 Q)",
            "totalQuestions": 66,
            "totalMarks": 198,
            "markingScheme": "+3 for correct, -1 for incorrect (MCQs), 0 for wrong (TITA)"
        },
        "difficultyLevel": "Very High (Most competitive MBA exam)",
        "preparationTip": "Start 6-8 months early. Focus on speed and accuracy. Mock tests are crucial. 99+ percentile for top IIMs.",
        "avgPlacement": "₹25-35 LPA (IIMs), varies by college",
        "highestPlacement": "₹1.5+ Crore (IIM A/B/C - International offers)",
        "approxFees": "₹23-28 lakh for 2 years (IIMs)",
        "location": "Pan-India (20 IIMs + 1000+ B-Schools)",
        "topBranches": ["MBA", "PGDM", "PGP"],
        "keyHighlights": [
            "Premier MBA entrance exam in India",
            "Single exam for 20 IIMs + 1000+ colleges",
            "99+ percentile for IIM A/B/C calls",
            "Excellent ROI (₹25L+ packages)",
            "2.5 lakh+ candidates annually",
            "Top IIMs: A, B, C, L, I, K"
        ],
        "colorCode": "high",
        "sources": [
            "https://iimcat.ac.in/",
            "https://www.mba.com/mbas-and-business-masters/india"
        ]
    },
    {
        "id": 22,
        "name": "XAT",
        "fullName": "Xavier Aptitude Test",
        "category": "management",
        "conductedBy": "XLRI Jamshedpur",
        "tier": "Premier B-School Exam",
        "priority": "Apply if targeting XLRI/Top B-Schools",
        "registrationStart": "2026-08-10 (expected)",
        "registrationEnd": "2026-11-30 (expected)",
        "examDate": "2027-01-03 (First Sunday of January)",
        "resultDate": "January 2027",
        "applicationFee": "₹2,000 (XLRI), +₹300 per additional program",
        "applyLink": "https://xatonline.in/",
        "officialWebsite": "https://xlri.ac.in/",
        "colleges": [
            "XLRI Jamshedpur",
            "XLRI Delhi",
            "SPJIMR Mumbai",
            "IMT Ghaziabad",
            "LIBA Chennai",
            "XIMB Bhubaneswar",
            "And 150+ B-Schools"
        ],
        "totalSeats": "~500 seats across XLRI campuses",
        "eligibility": {
            "education": "Bachelor's degree (any stream) with 50%",
            "minimumMarks": "50% in graduation",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT)",
            "duration": "3 hours 30 minutes",
            "sections": "Verbal & Logical Ability (26 Q), Decision Making (21 Q), Quantitative Ability (28 Q), General Knowledge (25 Q)",
            "totalQuestions": 100,
            "totalMarks": 100,
            "markingScheme": "+1 for correct, -0.25 for incorrect, -0.10 for unattempted"
        },
        "difficultyLevel": "High",
        "preparationTip": "Decision Making is unique to XAT. GK section requires current affairs prep. Negative for unattempted!",
        "avgPlacement": "₹25-30 LPA (XLRI)",
        "highestPlacement": "₹78 LPA (XLRI BM)",
        "approxFees": "₹26 lakh for 2 years (XLRI)",
        "location": "Jamshedpur, Delhi, and via 150+ other B-Schools",
        "topBranches": ["PGDM (BM)", "PGDM (HRM)", "MBA"],
        "keyHighlights": [
            "Premier B-School exam (after CAT)",
            "XLRI is top 5 B-School in India",
            "150+ colleges accept XAT",
            "Unique Decision Making section",
            "Negative for unattempted questions (-0.10)",
            "Good alternative to CAT"
        ],
        "colorCode": "high",
        "sources": [
            "https://xatonline.in/",
            "https://xlri.ac.in/"
        ]
    }
]

# New Design Exams
design_exams = [
    {
        "id": 23,
        "name": "UCEED",
        "fullName": "Undergraduate Common Entrance Examination for Design",
        "category": "design",
        "conductedBy": "IIT Bombay (on behalf of IITs)",
        "tier": "National-Level",
        "priority": "Must Apply (for IIT Design programs)",
        "registrationStart": "2025-10-01 (expected)",
        "registrationEnd": "2025-11-10 (expected)",
        "examDate": "2026-01-18 (Third Sunday of January)",
        "resultDate": "March 2026",
        "applicationFee": "₹2,000 (Female/SC/ST/PwD), ₹4,000 (Others)",
        "applyLink": "https://uceed.iitb.ac.in/",
        "officialWebsite": "https://uceed.iitb.ac.in/",
        "colleges": [
            "IIT Bombay (IDC)",
            "IIT Guwahati (DoD)",
            "IIT Hyderabad (DoD)",
            "IIITDM Jabalpur"
        ],
        "totalSeats": "~250 B.Des seats across IITs",
        "eligibility": {
            "education": "12th Pass or appearing (any stream)",
            "minimumMarks": "No minimum percentage required",
            "ageLimit": "No age limit"
        },
        "examPattern": {
            "mode": "Computer-Based Test (CBT)",
            "duration": "3 hours",
            "sections": "Part A: NAT (Numerical), MCQ (72 Q), Part B: Drawing (3 Q)",
            "totalQuestions": 75,
            "totalMarks": 300,
            "markingScheme": "Part A: +4/-1 (MCQ), +4/0 (NAT), Part B: 0-60 marks per drawing"
        },
        "difficultyLevel": "High (Requires creative & analytical thinking)",
        "preparationTip": "Practice drawing, observation, visualization. No specific syllabus. Creativity + logical thinking.",
        "avgPlacement": "₹10-15 LPA (IIT B.Des graduates)",
        "highestPlacement": "₹30+ LPA",
        "approxFees": "₹2.5 lakh/year (IITs)",
        "location": "IIT Bombay, Guwahati, Hyderabad, IIITDM Jabalpur",
        "topBranches": ["B.Des (Product Design)", "B.Des (Visual Communication)", "B.Des (Interaction Design)"],
        "keyHighlights": [
            "Premier design entrance exam",
            "Admission to IIT design programs",
            "No specific syllabus - creativity tested",
            "Drawing section in Part B",
            "High starting salaries in design field",
            "UX/UI, Product Design careers"
        ],
        "colorCode": "high",
        "sources": [
            "https://uceed.iitb.ac.in/",
            "https://www.iitb.ac.in/idc/"
        ]
    },
    {
        "id": 24,
        "name": "NID DAT",
        "fullName": "National Institute of Design - Design Aptitude Test",
        "category": "design",
        "conductedBy": "National Institute of Design (NID)",
        "tier": "Premier Design Institute",
        "priority": "Must Apply (for NID campuses)",
        "registrationStart": "2025-11-01 (expected)",
        "registrationEnd": "2026-01-15 (expected)",
        "examDate": "2026-01-05 (Prelims), 2026-03-15 (Mains - Studio Test)",
        "resultDate": "April 2026",
        "applicationFee": "₹2,000 (General/OBC), ₹1,000 (SC/ST)",
        "applyLink": "https://admissions.nid.edu/",
        "officialWebsite": "https://www.nid.edu/",
        "colleges": [
            "NID Ahmedabad",
            "NID Gandhinagar",
            "NID Bangalore",
            "NID Vijayawada"
        ],
        "totalSeats": "~300 B.Des seats across 4 NID campuses",
        "eligibility": {
            "education": "12th Pass or appearing (any stream)",
            "minimumMarks": "55% (General), 50% (SC/ST/PwD)",
            "ageLimit": "23 years as of July 1, 2026"
        },
        "examPattern": {
            "mode": "Prelims: CBT, Mains: Studio Test (Offline)",
            "duration": "Prelims: 3 hours, Mains: 3-4 days",
            "sections": "Prelims: Creativity, Drawing, Observation, Design Thinking. Mains: Studio Test (hands-on design)",
            "totalQuestions": 100,
            "totalMarks": 100,
            "markingScheme": "Prelims: +1/0/-0.25, Mains: Qualitative assessment"
        },
        "difficultyLevel": "Very High (Studio test requires hands-on creative work)",
        "preparationTip": "Practice sketching, observation, creative thinking. Mains is 3-4 day intensive studio test at NID campus.",
        "avgPlacement": "₹8-12 LPA",
        "highestPlacement": "₹25+ LPA",
        "approxFees": "₹2.5 lakh/year",
        "location": "Ahmedabad, Gandhinagar, Bangalore, Vijayawada",
        "topBranches": ["Product Design", "Textile Design", "Communication Design", "Ceramic & Glass Design"],
        "keyHighlights": [
            "India's premier design institute",
            "Two-stage selection: Prelims + Mains (Studio Test)",
            "Mains is 3-4 day on-campus design test",
            "World-class faculty and facilities",
            "Strong industry connect",
            "Graduates work in top design studios globally"
        ],
        "colorCode": "high",
        "sources": [
            "https://www.nid.edu/",
            "https://admissions.nid.edu/"
        ]
    }
]

# Add new exams
data['exams'].extend(medical_exams)
data['exams'].extend(law_exams)
data['exams'].extend(management_exams)
data['exams'].extend(design_exams)

# Update totalExams count
data['totalExams'] = len(data['exams'])

# Update note
data['note'] = "Engineering: Apply to exams 1-10 (universal) + your state exam (11-15). Medical: NEET-UG is mandatory. Law: CLAT for NLUs. Management: CAT for IIMs. Design: UCEED for IITs, NID DAT for NID."

# Write updated data
with open('data/exams-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated! Total exams: {data['totalExams']}")
print(f"  - Engineering: {len([e for e in data['exams'] if e['category'] == 'engineering'])}")
print(f"  - Medical: {len([e for e in data['exams'] if e['category'] == 'medical'])}")
print(f"  - Law: {len([e for e in data['exams'] if e['category'] == 'law'])}")
print(f"  - Management: {len([e for e in data['exams'] if e['category'] == 'management'])}")
print(f"  - Design: {len([e for e in data['exams'] if e['category'] == 'design'])}")
