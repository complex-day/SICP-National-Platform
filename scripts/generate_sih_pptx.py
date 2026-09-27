import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_sih_presentation():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Official GovTech / SIH Color Palette
    COLOR_PRIMARY = RGBColor(0, 82, 204)       # NIC / Digital India Blue (#0052CC)
    COLOR_NAVY = RGBColor(10, 37, 64)          # Deep Navy (#0A2540)
    COLOR_DARK = RGBColor(15, 23, 42)          # Slate 900 (#0F172A)
    COLOR_MUTED = RGBColor(71, 85, 105)        # Slate 600 (#475569)
    COLOR_LIGHT_BG = RGBColor(248, 250, 252)   # Slate 50 (#F8FAFC)
    COLOR_WHITE = RGBColor(255, 255, 255)      # White
    COLOR_SUCCESS = RGBColor(15, 157, 88)      # GovTech Green (#0F9D58)
    COLOR_WARNING = RGBColor(244, 180, 0)      # Amber (#F4B400)
    COLOR_BORDER = RGBColor(226, 232, 240)     # Slate 200 (#E2E8F0)
    COLOR_SAFFRON = RGBColor(255, 153, 51)     # Saffron (#FF9933)

    def add_header_footer(slide, title_text, slide_num, team_name="SICP"):
        # Top banner
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.8))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text.upper()
        p.font.name = "Arial"
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = COLOR_NAVY

        # Accent line under header
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.15), Inches(11.7), Inches(0.04))
        line.fill.solid()
        line.fill.fore_color.rgb = COLOR_PRIMARY
        line.line.color.rgb = COLOR_PRIMARY

        # Top Right Team / SIH Badge
        badge = slide.shapes.add_textbox(Inches(9.5), Inches(0.4), Inches(3.0), Inches(0.4))
        btf = badge.text_frame
        btf.margin_right = 0
        bp = btf.paragraphs[0]
        bp.alignment = PP_ALIGN.RIGHT
        bp.text = f"SIH 2026 | Team: {team_name}"
        bp.font.name = "Arial"
        bp.font.size = Pt(11)
        bp.font.bold = True
        bp.font.color.rgb = COLOR_PRIMARY

        # Bottom Footer Bar
        foot = slide.shapes.add_textbox(Inches(0.8), Inches(7.0), Inches(11.7), Inches(0.35))
        ftf = foot.text_frame
        ftf.margin_left = ftf.margin_right = 0
        fp = ftf.paragraphs[0]
        fp.text = f"Problem Statement ID: 26043  •  SICP Platform  •  Slide {slide_num} of 6"
        fp.font.name = "Arial"
        fp.font.size = Pt(10)
        fp.font.color.rgb = COLOR_MUTED

    # ==========================================
    # SLIDE 1: TITLE PAGE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = COLOR_LIGHT_BG
    bg1.line.fill.background()

    # Top Tri-color strip
    s_saffron = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(4.444), Inches(0.08))
    s_saffron.fill.solid()
    s_saffron.fill.fore_color.rgb = COLOR_SAFFRON
    s_saffron.line.fill.background()

    s_white = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(4.444), Inches(0), Inches(4.444), Inches(0.08))
    s_white.fill.solid()
    s_white.fill.fore_color.rgb = COLOR_WHITE
    s_white.line.fill.background()

    s_green = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(8.888), Inches(0), Inches(4.445), Inches(0.08))
    s_green.fill.solid()
    s_green.fill.fore_color.rgb = COLOR_SUCCESS
    s_green.line.fill.background()

    # Main Card Box
    card1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.6), Inches(11.333), Inches(6.3))
    card1.fill.solid()
    card1.fill.fore_color.rgb = COLOR_WHITE
    card1.line.color.rgb = COLOR_BORDER

    tbox1 = s1.shapes.add_textbox(Inches(1.4), Inches(0.9), Inches(10.5), Inches(5.6))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "SMART INDIA HACKATHON 2026 — IDEA SUBMISSION"
    p0.font.name = "Arial"
    p0.font.size = Pt(13)
    p0.font.bold = True
    p0.font.color.rgb = COLOR_PRIMARY
    p0.space_after = Pt(8)

    p1 = tf1.add_paragraph()
    p1.text = "SICP: Societal Innovation Collaboration Portal"
    p1.font.name = "Arial"
    p1.font.size = Pt(26)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_NAVY
    p1.space_after = Pt(6)

    p_tag = tf1.add_paragraph()
    p_tag.text = '"Crowdsourcing Community Challenges through Universities and Industry Partnerships"'
    p_tag.font.name = "Arial"
    p_tag.font.size = Pt(13)
    p_tag.font.italic = True
    p_tag.font.color.rgb = COLOR_MUTED
    p_tag.space_after = Pt(18)

    # Details table-like entries
    details = [
        ("Problem Statement ID:", "26043"),
        ("Problem Statement Title:", "A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships"),
        ("Theme:", "Smart Education / Social Innovation / GovTech"),
        ("PS Category:", "Software"),
        ("Team ID / Name:", "SICP (Registered on Portal)"),
        ("Team Members:", "1. [Team Leader] (Lead & Arch) | 2. [Member 2] (AI/ML) | 3. [Member 3] (Backend) | 4. [Member 4] (Frontend) | 5. [Member 5] (Cloud) | 6. [Member 6] (QA)"),
        ("Mentor & Institute:", "[Mentor Name]  •  [Institute / University Name, State]"),
    ]

    for label, val in details:
        p_row = tf1.add_paragraph()
        run_label = p_row.add_run()
        run_label.text = f"{label} "
        run_label.font.name = "Arial"
        run_label.font.size = Pt(11)
        run_label.font.bold = True
        run_label.font.color.rgb = COLOR_DARK

        run_val = p_row.add_run()
        run_val.text = val
        run_val.font.name = "Arial"
        run_val.font.size = Pt(11)
        run_val.font.color.rgb = COLOR_MUTED
        p_row.space_after = Pt(4)

    # ==========================================
    # SLIDE 2: IDEA TITLE & PROPOSED SOLUTION
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_footer(s2, "Idea Title & Proposed Solution", 2)

    # Subtitle Header
    sub_box = s2.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(11.7), Inches(0.4))
    sub_tf = sub_box.text_frame
    sub_p = sub_tf.paragraphs[0]
    sub_p.text = "IDEA TITLE: SICP — National Grassroots Innovation & Milestone-Gated CSR Collaboration Engine"
    sub_p.font.name = "Arial"
    sub_p.font.size = Pt(12)
    sub_p.font.bold = True
    sub_p.font.color.rgb = COLOR_PRIMARY

    # Left Column: Problem Addressed
    card_l = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.75), Inches(5.65), Inches(5.05))
    card_l.fill.solid()
    card_l.fill.fore_color.rgb = COLOR_WHITE
    card_l.line.color.rgb = COLOR_BORDER

    tf_l = card_l.text_frame
    tf_l.word_wrap = True
    tf_l.margin_left = tf_l.margin_top = tf_l.margin_right = Inches(0.25)
    
    pl_h = tf_l.paragraphs[0]
    pl_h.text = "How It Addresses The Problem"
    pl_h.font.name = "Arial"
    pl_h.font.size = Pt(14)
    pl_h.font.bold = True
    pl_h.font.color.rgb = COLOR_NAVY
    pl_h.space_after = Pt(8)

    p_items = [
        "Structured Citizen Intake: Replaces fragmented complaints with geotagged, evidence-backed engineering challenge briefs.",
        "Empowering Academic Potential: Connects 4+ Cr students directly with validated community bottlenecks (water, health, energy, agri).",
        "Closing the CSR Accountability Gap: Corporate grants disbursed in automated tranches tied to verified milestone deliverables.",
        "Unified Governance: Single dashboard for district collectors, universities, and ministries with live DIRI Index monitoring.",
    ]
    for it in p_items:
        p = tf_l.add_paragraph()
        p.text = f"•  {it}"
        p.font.name = "Arial"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(8)

    # Right Column: Innovation & Uniqueness
    card_r = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.85), Inches(1.75), Inches(5.65), Inches(5.05))
    card_r.fill.solid()
    card_r.fill.fore_color.rgb = COLOR_WHITE
    card_r.line.color.rgb = COLOR_BORDER

    tf_r = card_r.text_frame
    tf_r.word_wrap = True
    tf_r.margin_left = tf_r.margin_top = tf_r.margin_right = Inches(0.25)

    pr_h = tf_r.paragraphs[0]
    pr_h.text = "Innovation & Uniqueness of SICP"
    pr_h.font.name = "Arial"
    pr_h.font.size = Pt(14)
    pr_h.font.bold = True
    pr_h.font.color.rgb = COLOR_PRIMARY
    pr_h.space_after = Pt(8)

    r_items = [
        "AI Semantic Vector Deduplication: Cosine similarity vector search prevents duplicate problem registrations across districts.",
        "Workload-Balanced HEI Routing: AI matches problem domains to university department capabilities & faculty research history.",
        "Multidisciplinary Squad Builder: Cross-functional skill pairing (AI, IoT, CAD, UI/UX) ensuring holistic prototype execution.",
        "Stage-Gated Milestone Engine: 4-stage lifecycle (Proposal -> Dev -> Pilot -> Impact) with faculty sign-off before CSR release.",
        "Cryptographic Public Transparency: SHA-256 block ledger creates an immutable audit trail for complete trust.",
    ]
    for it in r_items:
        p = tf_r.add_paragraph()
        p.text = f"•  {it}"
        p.font.name = "Arial"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 3: TECHNICAL APPROACH
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_footer(s3, "Technical Approach & Architecture", 3)

    # Tech Stack Bar
    tech_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.3), Inches(11.7), Inches(1.15))
    tech_box.fill.solid()
    tech_box.fill.fore_color.rgb = COLOR_WHITE
    tech_box.line.color.rgb = COLOR_BORDER

    ttf = tech_box.text_frame
    ttf.word_wrap = True
    ttf.margin_left = ttf.margin_top = Inches(0.2)
    tp1 = ttf.paragraphs[0]
    tp1.text = "Core Production Tech Stack (Fully Built & Verified)"
    tp1.font.name = "Arial"
    tp1.font.size = Pt(12)
    tp1.font.bold = True
    tp1.font.color.rgb = COLOR_PRIMARY
    tp1.space_after = Pt(3)

    tp2 = ttf.add_paragraph()
    tp2.text = "• Frontend: Next.js 15 App Router, TypeScript Strict, Tailwind CSS (GovTech Light Design System, 38 Routes Compiled)\n• Backend: Python 3.12+, FastAPI (Async, Layered Clean Architecture), Pydantic v2, JWT + Argon2id RBAC Security\n• Data & AI: PostgreSQL 16 + PostGIS (Spatial), Redis 7 (Caching), Sentence-Transformers (AI Vector Deduplication)"
    tp2.font.name = "Arial"
    tp2.font.size = Pt(9.5)
    tp2.font.color.rgb = COLOR_DARK

    # 7-Module Architecture Grid (2 Columns)
    m_box_l = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.6), Inches(5.65), Inches(4.2))
    m_box_l.fill.solid()
    m_box_l.fill.fore_color.rgb = COLOR_WHITE
    m_box_l.line.color.rgb = COLOR_BORDER
    mtf_l = m_box_l.text_frame
    mtf_l.word_wrap = True
    mtf_l.margin_left = mtf_l.margin_top = Inches(0.2)
    
    mp_lh = mtf_l.paragraphs[0]
    mp_lh.text = "Core Modular Architecture (M1 – M4)"
    mp_lh.font.name = "Arial"
    mp_lh.font.size = Pt(12)
    mp_lh.font.bold = True
    mp_lh.font.color.rgb = COLOR_NAVY
    mp_lh.space_after = Pt(4)

    m_left = [
        "M1 — Identity & RBAC Engine: 6 Personas (Citizen, Student, Faculty, Industry, Government, Admin) with granular permission scopes.",
        "M2 — Geotagged Challenge Intake: GPS coordinates, multimedia evidence, and state machine (Submitted -> Validated -> Assigned).",
        "M3 — Multidisciplinary Team Hub: Automated skill matching (AI, IoT, Hardware, UI), roster management & mentor pairing.",
        "M4 — Academic Collaboration Hub: Department workload balancing, matching score algorithms & research credit allocation.",
    ]
    for it in m_left:
        p = mtf_l.add_paragraph()
        p.text = f"• {it}"
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(4)

    m_box_r = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.85), Inches(2.6), Inches(5.65), Inches(4.2))
    m_box_r.fill.solid()
    m_box_r.fill.fore_color.rgb = COLOR_WHITE
    m_box_r.line.color.rgb = COLOR_BORDER
    mtf_r = m_box_r.text_frame
    mtf_r.word_wrap = True
    mtf_r.margin_left = mtf_r.margin_top = Inches(0.2)

    mp_rh = mtf_r.paragraphs[0]
    mp_rh.text = "Lifecycle & Impact Governance (M5 – M7)"
    mp_rh.font.name = "Arial"
    mp_rh.font.size = Pt(12)
    mp_rh.font.bold = True
    mp_rh.font.color.rgb = COLOR_NAVY
    mp_rh.space_after = Pt(4)

    m_right = [
        "M5 — Innovation Lifecycle Engine: 4-Stage governance (Proposal -> Dev -> Pilot -> Completed) with deliverable validation.",
        "M6 — Industry CSR & Mentorship: Direct milestone-linked CSR tranches, corporate mentorship, and tech transfer licensing.",
        "M7 — Governance Command & Intel: District Innovation & Resolution Index (DIRI), SROI metrics, and state rollups.",
        "AI Engine: Semantic deduplication (cosine similarity > 0.85) + automated priority severity scoring algorithm.",
    ]
    for it in m_right:
        p = mtf_r.add_paragraph()
        p.text = f"• {it}"
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(4)

    # ==========================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_footer(s4, "Feasibility and Viability", 4)

    cards4_data = [
        ("Analysis of Feasibility", COLOR_NAVY, [
            "Technical: High-concurrency async stack (FastAPI + Next.js 15) capable of handling 10k+ requests with sub-second response times.",
            "Operational: Seamlessly integrates into existing university capstones, AICTE internships, and semester project credits.",
            "Statutory CSR: Fully complies with Section 135 of the Companies Act (India) for auditable, milestone-gated grant deployment.",
        ]),
        ("Potential Challenges & Risks", COLOR_WARNING, [
            "Challenge 1: Duplicate or noisy citizen submissions overloading faculty review queues.",
            "Challenge 2: Student team drop-off during academic exam windows causing project delays.",
            "Challenge 3: Corporate hesitation around intellectual property (IP) and fund accountability.",
        ]),
        ("Mitigation Strategies", COLOR_SUCCESS, [
            "AI Vector Filtering: Semantic deduplication automatically flags duplicate and invalid problem submissions.",
            "Faculty Academic Credit Binding: Milestone progress is formally tied to university grades, ensuring continuity.",
            "Escrow Milestone Tranches: Funds released only after faculty approval and verifiable field test deliverables.",
        ]),
    ]

    for idx, (head, col, bullets) in enumerate(cards4_data):
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + idx * 4.0), Inches(1.5), Inches(3.7), Inches(5.2))
        c.fill.solid()
        c.fill.fore_color.rgb = COLOR_WHITE
        c.line.color.rgb = COLOR_BORDER

        ctf = c.text_frame
        ctf.word_wrap = True
        ctf.margin_left = ctf.margin_top = Inches(0.2)

        ch = ctf.paragraphs[0]
        ch.text = head
        ch.font.name = "Arial"
        ch.font.size = Pt(13)
        ch.font.bold = True
        ch.font.color.rgb = col
        ch.space_after = Pt(8)

        for b in bullets:
            bp = ctf.add_paragraph()
            bp.text = f"•  {b}"
            bp.font.name = "Arial"
            bp.font.size = Pt(10)
            bp.font.color.rgb = COLOR_DARK
            bp.space_after = Pt(8)

    # ==========================================
    # SLIDE 5: IMPACT AND BENEFITS
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_footer(s5, "Impact and Benefits", 5)

    # Left: Multi-Stakeholder Matrix
    c5_l = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(6.8), Inches(5.3))
    c5_l.fill.solid()
    c5_l.fill.fore_color.rgb = COLOR_WHITE
    c5_l.line.color.rgb = COLOR_BORDER
    c5_ltf = c5_l.text_frame
    c5_ltf.word_wrap = True
    c5_ltf.margin_left = c5_ltf.margin_top = Inches(0.2)

    c5_lh = c5_ltf.paragraphs[0]
    c5_lh.text = "Direct Multi-Stakeholder Impact"
    c5_lh.font.name = "Arial"
    c5_lh.font.size = Pt(14)
    c5_lh.font.bold = True
    c5_lh.font.color.rgb = COLOR_NAVY
    c5_lh.space_after = Pt(6)

    impacts = [
        "Citizens: Geotagged civic problem resolution, transparent progress alerts, and grassroots empowerment.",
        "Students: NEP 2020-aligned experiential problem solving, patent co-ownership, research papers, and corporate pre-placement offers.",
        "Universities: Elevated NIRF/NAAC rankings, high-impact sponsored research, and formal industry linkages.",
        "Corporate CSR: Section 135 compliance, verified SROI impact proof, and early access to vetted tech innovations.",
        "Government: Real-time DIRI District Innovation Index, macro policy analytics, and accelerated public grievance redressal.",
    ]
    for imp in impacts:
        p = c5_ltf.add_paragraph()
        p.text = f"•  {imp}"
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(6)

    # Right: Quantifiable Expected Outcomes
    c5_r = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.0), Inches(1.4), Inches(4.5), Inches(5.3))
    c5_r.fill.solid()
    c5_r.fill.fore_color.rgb = COLOR_WHITE
    c5_r.line.color.rgb = COLOR_BORDER
    c5_rtf = c5_r.text_frame
    c5_rtf.word_wrap = True
    c5_rtf.margin_left = c5_rtf.margin_top = Inches(0.2)

    c5_rh = c5_rtf.paragraphs[0]
    c5_rh.text = "Expected National Outcomes"
    c5_rh.font.name = "Arial"
    c5_rh.font.size = Pt(14)
    c5_rh.font.bold = True
    c5_rh.font.color.rgb = COLOR_PRIMARY
    c5_rh.space_after = Pt(8)

    outcomes = [
        (">= 75% Faster Resolution", "Direct university engineering triage eliminates bureaucratic red tape."),
        ("100% CSR Traceability", "Cryptographic milestone validation prevents grant misallocation."),
        ("NEP 2020 Realization", "Bridges academic research with societal service at grassroots level."),
        ("Pan-India Scalability", "Architected for immediate rollout across 50,000+ Indian institutions."),
    ]
    for o_head, o_desc in outcomes:
        p = c5_rtf.add_paragraph()
        r1 = p.add_run()
        r1.text = f"✔ {o_head}: "
        r1.font.name = "Arial"
        r1.font.size = Pt(10.5)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_SUCCESS

        r2 = p.add_run()
        r2.text = o_desc
        r2.font.name = "Arial"
        r2.font.size = Pt(10)
        r2.font.color.rgb = COLOR_MUTED
        p.space_after = Pt(8)

    # ==========================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_footer(s6, "Research and References", 6)

    c6 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.7), Inches(5.3))
    c6.fill.solid()
    c6.fill.fore_color.rgb = COLOR_WHITE
    c6.line.color.rgb = COLOR_BORDER
    c6_tf = c6.text_frame
    c6_tf.word_wrap = True
    c6_tf.margin_left = c6_tf.margin_top = Inches(0.3)

    c6_h = c6_tf.paragraphs[0]
    c6_h.text = "National Policy Alignment & Official IEEE References"
    c6_h.font.name = "Arial"
    c6_h.font.size = Pt(13)
    c6_h.font.bold = True
    c6_h.font.color.rgb = COLOR_NAVY
    c6_h.space_after = Pt(8)

    refs = [
        "[1] Smart India Hackathon (SIH), 'Problem Statement 26043: A digital platform to crowdsource societal challenges and facilitate collaborative problem solving through universities and industry partnerships,' Ministry of Education Innovation Cell (MIC) & AICTE, New Delhi, India, 2026. [Online]. Available: https://www.sih.gov.in/",
        "[2] Ministry of Education, Government of India, 'National Education Policy 2020 (NEP 2020): Holistic & Multidisciplinary Education in Higher Education Institutions,' New Delhi, India, 2020.",
        "[3] Ministry of Electronics and Information Technology (MeitY), 'Digital India: Power To Empower - National e-Governance Division (NeGD),' Government of India, 2023. [Online]. Available: https://www.digitalindia.gov.in/",
        "[4] National Innovation Foundation (NIF) India, 'Grassroots Innovations and Traditional Knowledge: Mobilizing Student Engineering for Societal Development,' Department of Science and Technology, Govt. of India, 2024.",
        "[5] Ministry of Corporate Affairs (MCA), 'Companies (Corporate Social Responsibility Policy) Rules & Section 135: CSR Funding Guidelines for Incubators and Academic Research,' Government of India Gazette, 2022.",
        "[6] Open Government Data (OGD) Platform India, 'National Data Sharing and Accessibility Policy (NDSAP) for Public Innovation,' National Informatics Centre (NIC), 2025. [Online]. Available: https://data.gov.in/",
    ]
    for r in refs:
        p = c6_tf.add_paragraph()
        p.text = r
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(6)

    output_path = "SICP_SIH_26043_Winning_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_sih_presentation()
