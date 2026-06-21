"""Invoice business logic (generation, payment, PDF, email)."""
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.enums import InvoiceStatus, RelatedEntity
from app.core.exceptions import NotFoundError
from app.models.invoice import Invoice
from app.repositories.invoice import InvoiceRepository
from app.repositories.settings import SettingsRepository
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.services.notification import NotificationService
from app.utils.pdf import generate_invoice_pdf


def _q(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(Decimal("0.01"))


class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = InvoiceRepository(db)

    async def _generate_ref(self) -> str:
        year = datetime.now(timezone.utc).year
        seq = await self.repo.next_sequence(year)
        return f"INV-{year}-{seq:05d}"

    @staticmethod
    def compute_total(room_charges, extras, tax, discount) -> Decimal:
        return _q(
            _q(room_charges) + _q(extras) + _q(tax) - _q(discount)
        )

    async def get(self, invoice_id: int) -> Invoice:
        invoice = await self.repo.get_or_none(invoice_id)
        if invoice is None:
            raise NotFoundError("Invoice not found")
        return invoice

    async def list(
        self, *, status, guest_name, date_from, date_to, offset, limit
    ) -> tuple[list[Invoice], int]:
        conditions = []
        if status is not None:
            conditions.append(Invoice.status == status)
        if date_from is not None:
            conditions.append(Invoice.issued_at >= date_from)
        if date_to is not None:
            conditions.append(Invoice.issued_at <= date_to)
        items = await self.repo.list(
            conditions=conditions, offset=offset, limit=limit,
            order_by=Invoice.created_at.desc(),
        )
        total = await self.repo.count(conditions=conditions)
        return list(items), total

    async def create(self, payload: InvoiceCreate, *, commit: bool = True) -> Invoice:
        total = self.compute_total(
            payload.room_charges, payload.extras, payload.tax, payload.discount
        )
        invoice = Invoice(
            invoice_ref=await self._generate_ref(),
            booking_id=payload.booking_id,
            guest_id=payload.guest_id,
            room_charges=_q(payload.room_charges),
            extras=_q(payload.extras),
            tax=_q(payload.tax),
            discount=_q(payload.discount),
            total=total,
            status=payload.status,
            issued_at=datetime.now(timezone.utc),
            due_date=payload.due_date,
        )
        await self.repo.create(invoice)
        if commit:
            await self.db.commit()
            await self.db.refresh(invoice)
        return invoice

    async def create_from_booking(self, booking, *, commit: bool = True) -> Invoice:
        settings_row = await SettingsRepository(self.db).get_singleton()
        room_charges = _q(booking.total_price)
        tax = _q(room_charges * (settings_row.tax_rate or Decimal(0)) / Decimal(100))
        invoice = Invoice(
            invoice_ref=await self._generate_ref(),
            booking_id=booking.id,
            guest_id=booking.guest_id,
            room_charges=room_charges,
            extras=Decimal("0.00"),
            tax=tax,
            discount=Decimal("0.00"),
            total=self.compute_total(room_charges, 0, tax, 0),
            status=InvoiceStatus.pending,
            issued_at=datetime.now(timezone.utc),
        )
        await self.repo.create(invoice)
        if commit:
            await self.db.commit()
            await self.db.refresh(invoice)
        return invoice

    async def update(self, invoice_id: int, payload: InvoiceUpdate) -> Invoice:
        invoice = await self.get(invoice_id)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(invoice, key, value)
        invoice.total = self.compute_total(
            invoice.room_charges, invoice.extras, invoice.tax, invoice.discount
        )
        await self.repo.save(invoice)
        await self.db.commit()
        await self.db.refresh(invoice)
        return invoice

    async def mark_paid(self, invoice_id: int) -> Invoice:
        invoice = await self.get(invoice_id)
        invoice.status = InvoiceStatus.paid
        invoice.paid_at = datetime.now(timezone.utc)
        await self.repo.save(invoice)
        await self.db.commit()
        await self.db.refresh(invoice)
        return invoice

    async def render_pdf(self, invoice_id: int) -> tuple[bytes, str]:
        invoice = await self.get(invoice_id)
        settings_row = await SettingsRepository(self.db).get_singleton()
        guest = await invoice.awaitable_attrs.guest
        data = {
            "invoice_ref": invoice.invoice_ref,
            "guest_name": guest.full_name if guest else "",
            "issued_at": invoice.issued_at.date() if invoice.issued_at else "",
            "due_date": invoice.due_date.date() if invoice.due_date else "",
            "status": invoice.status.value,
            "room_charges": invoice.room_charges,
            "extras": invoice.extras,
            "tax": invoice.tax,
            "discount": invoice.discount,
            "total": invoice.total,
        }
        pdf = generate_invoice_pdf(data, currency=settings_row.currency)
        return pdf, f"{invoice.invoice_ref}.pdf"

    async def send(self, invoice_id: int) -> Invoice:
        invoice = await self.get(invoice_id)
        guest = await invoice.awaitable_attrs.guest
        if guest is None:
            raise NotFoundError("Guest not found for invoice")
        pdf, filename = await self.render_pdf(invoice_id)
        await NotificationService(self.db).send_email_notification(
            recipient_email=guest.email,
            subject=f"Invoice {invoice.invoice_ref}",
            message="Please find your invoice attached.",
            related_entity=RelatedEntity.invoice,
            related_id=str(invoice.id),
            attachments=[(filename, pdf, "pdf")],
        )
        await self.db.commit()
        return invoice

    async def for_guest(self, guest_id: int) -> list[Invoice]:
        return await self.repo.for_guest(guest_id)

    async def overdue(self) -> list[Invoice]:
        return await self.repo.overdue()
