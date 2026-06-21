"""PDF generation helpers (ReportLab) for invoices and reports."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def _money(value: Any, currency: str = "USD") -> str:
    return f"{currency} {Decimal(str(value or 0)):,.2f}"


def generate_invoice_pdf(invoice: dict, *, currency: str = "USD") -> bytes:
    """Render an invoice dict to PDF bytes.

    Expected keys: invoice_ref, guest_name, issued_at, due_date, status,
    room_charges, extras, tax, discount, total.
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
    )
    styles = getSampleStyleSheet()
    story: list = []

    story.append(Paragraph("INVOICE", styles["Title"]))
    story.append(Spacer(1, 6 * mm))

    meta = [
        ["Invoice Ref:", str(invoice.get("invoice_ref", ""))],
        ["Guest:", str(invoice.get("guest_name", ""))],
        ["Issued:", str(invoice.get("issued_at") or datetime.utcnow().date())],
        ["Due:", str(invoice.get("due_date") or "")],
        ["Status:", str(invoice.get("status", "")).upper()],
    ]
    meta_table = Table(meta, colWidths=[40 * mm, 110 * mm])
    meta_table.setStyle(
        TableStyle([("FONTSIZE", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4)])
    )
    story.append(meta_table)
    story.append(Spacer(1, 8 * mm))

    rows = [
        ["Description", "Amount"],
        ["Room charges", _money(invoice.get("room_charges"), currency)],
        ["Extras", _money(invoice.get("extras"), currency)],
        ["Tax", _money(invoice.get("tax"), currency)],
        ["Discount", "-" + _money(invoice.get("discount"), currency)],
        ["TOTAL", _money(invoice.get("total"), currency)],
    ]
    table = Table(rows, colWidths=[110 * mm, 40 * mm])
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
            ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2),
             [colors.white, colors.HexColor("#f9fafb")]),
        ])
    )
    story.append(table)
    story.append(Spacer(1, 12 * mm))
    story.append(Paragraph("Thank you for staying with us.", styles["Italic"]))

    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf


def generate_report_pdf(title: str, headers: list[str],
                        data_rows: list[list[Any]]) -> bytes:
    """Generic tabular report PDF."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story: list = [Paragraph(title, styles["Title"]), Spacer(1, 6 * mm)]
    table = Table([headers, *data_rows])
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ])
    )
    story.append(table)
    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
