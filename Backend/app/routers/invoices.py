"""Invoices routes (receptionist view-only)."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.core.dependencies import CurrentUser, DBSession, require_super_admin
from app.core.enums import InvoiceStatus
from app.core.responses import ok, paginate
from app.schemas.common import PaginationParams
from app.schemas.invoice import InvoiceCreate, InvoiceOut, InvoiceUpdate
from app.services.invoice import InvoiceService

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("", summary="List invoices")
async def list_invoices(
    db: DBSession,
    _: CurrentUser,
    pagination: PaginationParams = Depends(),
    status: InvoiceStatus | None = None,
    guest_name: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
):
    items, total = await InvoiceService(db).list(
        status=status,
        guest_name=guest_name,
        date_from=date_from,
        date_to=date_to,
        offset=pagination.offset,
        limit=pagination.limit,
    )
    data = [InvoiceOut.model_validate(i) for i in items]
    return paginate(data, total=total, page=pagination.page, limit=pagination.limit)


@router.get("/overdue", summary="List overdue invoices")
async def overdue(db: DBSession, _: CurrentUser):
    invoices = await InvoiceService(db).overdue()
    return ok([InvoiceOut.model_validate(i) for i in invoices])


@router.post(
    "", summary="Create invoice", dependencies=[Depends(require_super_admin)]
)
async def create_invoice(payload: InvoiceCreate, db: DBSession):
    invoice = await InvoiceService(db).create(payload)
    return ok(InvoiceOut.model_validate(invoice), message="Invoice created")


@router.get("/{invoice_id}", summary="Invoice detail")
async def get_invoice(invoice_id: int, db: DBSession, _: CurrentUser):
    invoice = await InvoiceService(db).get(invoice_id)
    return ok(InvoiceOut.model_validate(invoice))


@router.get("/{invoice_id}/pdf", summary="Download invoice PDF")
async def invoice_pdf(invoice_id: int, db: DBSession, _: CurrentUser):
    pdf, filename = await InvoiceService(db).render_pdf(invoice_id)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.put(
    "/{invoice_id}", summary="Update invoice", dependencies=[Depends(require_super_admin)]
)
async def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: DBSession):
    invoice = await InvoiceService(db).update(invoice_id, payload)
    return ok(InvoiceOut.model_validate(invoice), message="Invoice updated")


@router.put(
    "/{invoice_id}/pay",
    summary="Mark invoice paid",
    dependencies=[Depends(require_super_admin)],
)
async def pay_invoice(invoice_id: int, db: DBSession):
    invoice = await InvoiceService(db).mark_paid(invoice_id)
    return ok(InvoiceOut.model_validate(invoice), message="Invoice paid")


@router.post(
    "/{invoice_id}/send",
    summary="Email invoice PDF to guest",
    dependencies=[Depends(require_super_admin)],
)
async def send_invoice(invoice_id: int, db: DBSession):
    sent = await InvoiceService(db).send(invoice_id)
    return ok({"sent": sent}, message="Invoice sent")
