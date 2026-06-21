"""Application entrypoint: app factory, CORS, routers, OpenAPI security."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.routers import (
    auth,
    bookings,
    calendar,
    concierge,
    dashboard,
    financials,
    guests,
    housekeeping,
    inventory,
    invoices,
    messages,
    notifications,
    reviews,
    rooms,
)
from app.routers import settings as settings_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Hotel Management System API",
        description=(
            "Production-ready REST API for hotel operations: auth, rooms, "
            "guests, bookings, housekeeping, inventory, messaging, financials, "
            "invoices, reviews, concierge, dashboard, calendar, settings and "
            "notifications."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    prefix = settings.API_V1_PREFIX
    for module in (
        auth,
        rooms,
        guests,
        bookings,
        housekeeping,
        inventory,
        messages,
        financials,
        invoices,
        reviews,
        concierge,
        dashboard,
        calendar,
        settings_router,
        notifications,
    ):
        app.include_router(module.router, prefix=prefix)

    @app.get("/", tags=["Health"], summary="Health check")
    async def health() -> dict:
        return {"success": True, "data": {"status": "ok"}, "message": "Service healthy"}

    _customise_openapi(app)
    return app


def _customise_openapi(app: FastAPI) -> None:
    def custom_openapi() -> dict:
        if app.openapi_schema:
            return app.openapi_schema
        schema = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            routes=app.routes,
        )
        schema.setdefault("components", {}).setdefault("securitySchemes", {})[
            "BearerAuth"
        ] = {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
        schema["security"] = [{"BearerAuth": []}]
        app.openapi_schema = schema
        return app.openapi_schema

    app.openapi = custom_openapi  # type: ignore[assignment]


app = create_app()
