"""Initial schema.

Revision ID: 001
Revises:
Create Date: 2026-04-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "listings",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column(
            "transaction_type",
            sa.Enum("buy", "rent", name="transaction_type_enum"),
            nullable=False,
        ),
        sa.Column(
            "listing_type",
            sa.Enum("flat", "house", "room", "penthouse", "duplex", name="listing_type_enum"),
            nullable=False,
        ),
        sa.Column("price", sa.Integer, nullable=False),
        sa.Column("surface_m2", sa.Integer, nullable=False),
        sa.Column("rooms", sa.Integer, nullable=False),
        sa.Column("bathrooms", sa.Integer, nullable=True),
        sa.Column("floor", sa.Integer, nullable=True),
        sa.Column("city", sa.String(255), nullable=False),
        sa.Column("neighborhood", sa.String(255), nullable=False),
        sa.Column("street", sa.String(500), nullable=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("description_embedding", sa.LargeBinary, nullable=True),
        sa.Column("quality_score", sa.Float, nullable=False, server_default="5.0"),
        sa.Column("has_elevator", sa.Boolean, nullable=True),
        sa.Column("has_terrace", sa.Boolean, nullable=True),
        sa.Column("has_air_conditioning", sa.Boolean, nullable=True),
        sa.Column("has_heating", sa.Boolean, nullable=True),
        sa.Column("has_garage", sa.Boolean, nullable=True),
        sa.Column("has_furniture", sa.Boolean, nullable=True),
        sa.Column("year_built", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime,
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        ),
    )

    op.create_table(
        "listing_source_metadata",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "listing_id",
            sa.String(36),
            sa.ForeignKey("listings.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("external_id", sa.String(255), nullable=False),
        sa.Column("source_provider", sa.String(255), nullable=False, server_default="habitaclia"),
        sa.Column("source_url", sa.String(1000), nullable=False),
        sa.UniqueConstraint("external_id", "source_provider", name="uq_external_source"),
    )

    op.create_table(
        "listing_images",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "listing_id",
            sa.String(36),
            sa.ForeignKey("listings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("url", sa.String(1000), nullable=False),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
    )

    op.create_index("ix_listing_images_listing_id", "listing_images", ["listing_id"])


def downgrade() -> None:
    op.drop_table("listing_images")
    op.drop_table("listing_source_metadata")
    op.drop_table("listings")
