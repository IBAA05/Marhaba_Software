"""Import every model so Alembic / metadata sees them."""
from app.models.base import TimestampMixin, SoftDeleteMixin  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.room import Room  # noqa: F401
from app.models.guest import Guest  # noqa: F401
from app.models.booking import Booking  # noqa: F401
from app.models.housekeeping import HousekeepingTask  # noqa: F401
from app.models.inventory import InventoryItem  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.invoice import Invoice  # noqa: F401
from app.models.expense import Expense  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.concierge import ConciergeRequest  # noqa: F401
from app.models.notification import Notification  # noqa: F401
from app.models.settings import HotelSettings  # noqa: F401
from app.models.token_blacklist import TokenBlacklist  # noqa: F401

__all__ = [
    "TimestampMixin",
    "SoftDeleteMixin",
    "User",
    "Room",
    "Guest",
    "Booking",
    "HousekeepingTask",
    "InventoryItem",
    "Message",
    "Invoice",
    "Expense",
    "Review",
    "ConciergeRequest",
    "Notification",
    "HotelSettings",
    "TokenBlacklist",
]
