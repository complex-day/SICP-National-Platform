"""Initial IAM Schema

Revision ID: 001_initial_iam_schema
Revises: 
Create Date: 2026-09-14 13:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.db.base import GUID

# revision identifiers, used by Alembic.
revision: str = '001_initial_iam_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users table
    op.create_table(
        'users',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('password_hash', sa.String(length=500), nullable=False),
        sa.Column('role', sa.String(length=30), nullable=False, server_default='citizen'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ACTIVE'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('verification_token', sa.String(length=255), nullable=True),
        sa.Column('verification_expires', sa.DateTime(timezone=True), nullable=True),
        sa.Column('trust_score', sa.Numeric(precision=5, scale=2), nullable=False, server_default='50.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_phone', 'users', ['phone'], unique=True)
    op.create_index('ix_users_role', 'users', ['role'])
    op.create_index('ix_users_status', 'users', ['status'])

    # 2. Audit logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', GUID(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('ix_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'])

    # 3. Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_is_read', 'notifications', ['is_read'])

    # 4. Role profiles tables
    op.create_table(
        'citizens',
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('district', sa.String(length=150), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('total_reports', sa.Integer(), nullable=False, server_default='0'),
    )

    op.create_table(
        'faculty',
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('university_id', GUID(), nullable=True),
        sa.Column('department_id', GUID(), nullable=True),
        sa.Column('specialization', sa.String(length=255), nullable=True),
        sa.Column('experience_years', sa.Integer(), nullable=False, server_default='0'),
    )

    op.create_table(
        'students',
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('university_id', GUID(), nullable=True),
        sa.Column('department_id', GUID(), nullable=True),
        sa.Column('skills', sa.JSON(), nullable=True),
        sa.Column('graduation_year', sa.Integer(), nullable=True),
    )

    op.create_table(
        'industries',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('company_name', sa.String(length=255), nullable=False),
        sa.Column('domain', sa.String(length=255), nullable=True),
        sa.Column('csr_budget', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('website', sa.String(length=500), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('industries')
    op.drop_table('students')
    op.drop_table('faculty')
    op.drop_table('citizens')
    op.drop_table('notifications')
    op.drop_table('audit_logs')
    op.drop_table('users')
