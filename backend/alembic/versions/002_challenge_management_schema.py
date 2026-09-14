"""Challenge Management Schema

Revision ID: 002_challenge_management_schema
Revises: 001_initial_iam_schema
Create Date: 2026-09-14 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.db.base import GUID

# revision identifiers, used by Alembic.
revision: str = '002_challenge_management_schema'
down_revision: Union[str, None] = '001_initial_iam_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Challenges table
    op.create_table(
        'challenges',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('citizen_id', GUID(), sa.ForeignKey('citizens.user_id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_by', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('updated_by', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('subcategory', sa.String(length=100), nullable=True),
        sa.Column('affected_population', sa.Integer(), nullable=False),
        sa.Column('latitude', sa.Numeric(precision=10, scale=8), nullable=False),
        sa.Column('longitude', sa.Numeric(precision=11, scale=8), nullable=False),
        sa.Column('address_text', sa.String(length=255), nullable=True),
        sa.Column('district', sa.String(length=150), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='draft'),
        sa.Column('visibility', sa.String(length=20), nullable=False, server_default='PUBLIC'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('archived_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('priority_score', sa.Integer(), nullable=True),
        sa.Column('ai_confidence', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_challenges_citizen_id', 'challenges', ['citizen_id'])
    op.create_index('ix_challenges_created_by', 'challenges', ['created_by'])
    op.create_index('ix_challenges_category', 'challenges', ['category'])
    op.create_index('ix_challenges_status', 'challenges', ['status'])
    op.create_index('ix_challenges_visibility', 'challenges', ['visibility'])
    op.create_index('ix_challenges_district', 'challenges', ['district'])
    op.create_index('ix_challenges_is_deleted', 'challenges', ['is_deleted'])

    # 2. Challenge assets table
    op.create_table(
        'challenge_assets',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('challenge_id', GUID(), sa.ForeignKey('challenges.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_by', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('media_type', sa.String(length=20), nullable=False),
        sa.Column('storage_url', sa.Text(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_size_bytes', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_challenge_assets_challenge_id', 'challenge_assets', ['challenge_id'])
    op.create_index('ix_challenge_assets_media_type', 'challenge_assets', ['media_type'])


def downgrade() -> None:
    op.drop_table('challenge_assets')
    op.drop_table('challenges')
