"""
MediSim AI - Scientific & Clinical Simulation PDF Report Generator
Author: Team BioNex - VIT Bhopal University
Purpose: Generate comprehensive, publication-grade simulation reports using ReportLab.
"""

import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

REPORTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "generated_reports"))
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_pdf_report(sim_data: dict, patient_data: dict, drug_info: dict) -> str:
    """
    Generates a structured medical research simulation PDF report.
    Returns the absolute path to the generated PDF.
    """
    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
    drug_name = sim_data.get("drug_name", "Drug").replace(" ", "_")
    filename = f"MediSim_Report_{drug_name}_{timestamp_str}.pdf"
    file_path = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom brand styling
    brand_navy = colors.HexColor("#0B132B")
    brand_teal = colors.HexColor("#06D6A0")
    brand_cyan = colors.HexColor("#00F5D4")
    dark_text = colors.HexColor("#1C2541")
    light_bg = colors.HexColor("#F4F6F9")

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=brand_navy,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#4A5568"),
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=brand_navy,
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=dark_text
    )

    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#2D3748")
    )

    elements = []

    # 1. Header Banner
    header_table_data = [
        [
            Paragraph("<b>MEDISIM AI</b> &bull; Drug Response Intelligence Platform", title_style),
            Paragraph(f"<b>Report ID:</b> SIM-{timestamp_str}<br/><b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style)
        ]
    ]
    t_header = Table(header_table_data, colWidths=[360, 180])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT')
    ]))
    elements.append(t_header)

    sub_banner = Paragraph(
        "<b>Project Title:</b> Simulating and Explaining Drug Responses Using AI &nbsp;|&nbsp; "
        "<b>Team:</b> BioNex &bull; VIT Bhopal University",
        subtitle_style
    )
    elements.append(sub_banner)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=brand_navy, spaceBefore=2, spaceAfter=10))

    # 2. Executive Summary & Prediction
    elements.append(Paragraph("1. SIMULATION EXECUTIVE SUMMARY", h1_style))
    pred_label = sim_data.get("predicted_class_label", "Under Investigation")
    mode = sim_data.get("operating_mode", "REAL_MODEL_MODE")
    
    summary_data = [
        [Paragraph("<b>Target Medicine:</b>", body_style), Paragraph(str(sim_data.get("drug_name", "N/A")), body_style),
         Paragraph("<b>Operating Mode:</b>", body_style), Paragraph(f"<b>{mode}</b>", body_style)],
        [Paragraph("<b>Predicted Classification:</b>", body_style), Paragraph(f"<b>{pred_label}</b>", body_style),
         Paragraph("<b>Benchmark Dataset:</b>", body_style), Paragraph("FDA DILIrank 2.0 (LTKB)", body_style)]
    ]
    t_sum = Table(summary_data, colWidths=[120, 150, 110, 160])
    t_sum.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_sum)
    elements.append(Spacer(1, 8))

    # 3. Patient Baseline Context
    elements.append(Paragraph("2. PATIENT BASELINE PROFILE", h1_style))
    age = patient_data.get("age", "N/A")
    sex = patient_data.get("sex", "N/A")
    bmi = patient_data.get("bmi", "N/A")
    ast = patient_data.get("ast", "N/A")
    alt = patient_data.get("alt", "N/A")
    bili = patient_data.get("bilirubin", "N/A")
    
    patient_table_data = [
        [Paragraph("<b>Age:</b>", body_style), Paragraph(f"{age} years", body_style),
         Paragraph("<b>Sex:</b>", body_style), Paragraph(f"{sex}", body_style),
         Paragraph("<b>Calculated BMI:</b>", body_style), Paragraph(f"{bmi} kg/m²", body_style)],
        [Paragraph("<b>AST:</b>", body_style), Paragraph(f"{ast} U/L", body_style),
         Paragraph("<b>ALT:</b>", body_style), Paragraph(f"{alt} U/L", body_style),
         Paragraph("<b>Total Bilirubin:</b>", body_style), Paragraph(f"{bili} mg/dL", body_style)]
    ]
    t_patient = Table(patient_table_data, colWidths=[80, 100, 80, 100, 90, 90])
    t_patient.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_patient)
    elements.append(Spacer(1, 8))

    # 4. Physicochemical & PubChem Descriptors
    elements.append(Paragraph("3. DRUG PHYSICOCHEMICAL PROPERTIES (PUBCHEM)", h1_style))
    chem_table_data = [
        [Paragraph("<b>Molecular Formula:</b>", body_style), Paragraph(str(drug_info.get("formula", "N/A")), body_style),
         Paragraph("<b>PubChem CID:</b>", body_style), Paragraph(str(drug_info.get("cid", "N/A")), body_style)],
        [Paragraph("<b>Molecular Weight:</b>", body_style), Paragraph(f"{drug_info.get('mw', 'N/A')} g/mol", body_style),
         Paragraph("<b>Lipophilicity (XLogP):</b>", body_style), Paragraph(str(drug_info.get("logp", "N/A")), body_style)],
        [Paragraph("<b>Polar Surface Area (TPSA):</b>", body_style), Paragraph(f"{drug_info.get('tpsa', 'N/A')} Å²", body_style),
         Paragraph("<b>H-Bond Donors/Acceptors:</b>", body_style), Paragraph(f"{drug_info.get('hbd', 0)} / {drug_info.get('hba', 0)}", body_style)]
    ]
    t_chem = Table(chem_table_data, colWidths=[130, 140, 130, 140])
    t_chem.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_chem)
    elements.append(Spacer(1, 8))

    # 5. Explainable AI - SHAP Attribution Breakdown
    elements.append(Paragraph("4. EXPLAINABLE AI: SHAP FEATURE ATTRIBUTION BREAKDOWN", h1_style))
    exp = sim_data.get("explainability", {})
    summary_text = exp.get("scientific_summary", "Detailed molecular contributions calculated via SHAP TreeExplainer.")
    elements.append(Paragraph(f"<b>Scientific Interpretation:</b> {summary_text}", body_style))
    elements.append(Spacer(1, 4))

    shap_rows = [
        [Paragraph("<b>Influential Feature</b>", body_style),
         Paragraph("<b>Observed Value</b>", body_style),
         Paragraph("<b>SHAP Value</b>", body_style),
         Paragraph("<b>Risk Direction</b>", body_style)]
    ]
    for item in exp.get("waterfall", [])[:5]:
        s_val = item.get("shap_value", 0.0)
        direction = "Elevates Concern" if s_val > 0 else "Protective / Lowers"
        shap_rows.append([
            Paragraph(item.get("display_name", ""), body_style),
            Paragraph(str(item.get("value", "")), body_style),
            Paragraph(f"{s_val:+.4f}", body_style),
            Paragraph(direction, body_style)
        ])
    t_shap = Table(shap_rows, colWidths=[200, 90, 90, 160])
    t_shap.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), light_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(t_shap)
    elements.append(Spacer(1, 8))

    # 6. Biological Response & Pharmacogenomics Summary
    elements.append(Paragraph("5. BIOLOGICAL RESPONSE & PHARMACOGENOMIC CONTEXT", h1_style))
    elements.append(Paragraph(
        "<b>LINCS L1000 Landmark Transcriptional Alterations:</b> Experimental in-vitro gene expression profiling across landmark hallmarks (TP53, CASP3, HMOX1, TNF) shows cellular stress response patterns distinct from clinical outcomes.",
        body_style
    ))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        "<b>CPIC Pharmacogenomic Considerations:</b> CYP450 polymorphic metabolic capacity (CYP2D6, CYP2C19, CYP2C9) and transporter variants (SLCO1B1) strongly influence individual pharmacokinetic drug clearance.",
        body_style
    ))
    elements.append(Spacer(1, 8))

    # 7. Safety, Limitations & Legal Disclaimer
    elements.append(Paragraph("6. SCIENTIFIC LIMITATIONS & RESPONSIBLE AI DISCLAIMER", h1_style))
    disclaimer_text = (
        "<b>MANDATORY MEDICAL DISCLAIMER:</b> MediSim AI is an educational and biomedical research platform developed by "
        "Team BioNex at VIT Bhopal University. It is <b>NOT</b> a clinical diagnostic device, an autonomous prescribing tool, "
        "or a substitute for qualified medical consultation. Predictions are derived from statistical machine learning models "
        "and biomedical research datasets (FDA DILIrank 2.0, LINCS L1000, ClinPGx). Patients must never alter or discontinue "
        "any medication without the direct supervision of a licensed physician."
    )
    elements.append(Paragraph(disclaimer_text, callout_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceBefore=4, spaceAfter=8))
    elements.append(Paragraph(
        "MediSim AI &bull; Simulating and Explaining Drug Responses Using AI &bull; BioNex &bull; VIT Bhopal University",
        subtitle_style
    ))

    doc.build(elements)
    print(f"[OK] PDF report generated at: {file_path}")
    return file_path
