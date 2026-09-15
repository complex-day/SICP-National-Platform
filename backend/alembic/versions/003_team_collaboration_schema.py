"""Team Collaboration Schema

Revision ID: 003_team_collaboration_schema
Revises: 002_challenge_management_schema
Create Date: 2026-09-15 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.db.base import GUID

# revision identifiers, used by Alembic.
revision: str = '003_team_collaboration_schema'
down_revision: Union[str, None] = '002_challenge_management_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Teams Table
    op.create_table(
        'teams',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('challenge_id', GUID(), sa.ForeignKey('challenges.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('created_by', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('max_members', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='OPEN'),
        sa.Column('visibility', sa.String(length=20), nullable=False, server_default='PUBLIC'),
        sa.Column('skills_needed', sa.JSON(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_teams_challenge_id', 'teams', ['challenge_id'])
    op.create_index('ix_teams_created_by', 'teams', ['created_by'])
    op.create_index('ix_teams_status', 'teams', ['status'])
    op.create_index('ix_teams_challenge_status', 'teams', ['challenge_id', 'status'])
    op.create_index('ix_teams_is_deleted', 'teams', ['is_deleted'])
    op.create_index(
        'idx_teams_unique_active_owner',
        'teams',
        ['challenge_id', 'created_by'],
        unique=True,
        postgresql_where=sa.text("is_deleted = false AND status != 'DISBANDED'")
    )

    # 2. Team Members Table
    op.create_table(
        'team_members',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('team_id', GUID(), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='MEMBER'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='REQUESTED'),
        sa.Column('invited_by', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('message', sa.String(length=500), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_team_members_team_id', 'team_members', ['team_id'])
    op.create_index('ix_team_members_user_id', 'team_members', ['user_id'])
    op.create_index('ix_team_members_status', 'team_members', ['status'])
    op.create_index('ix_team_members_team_status', 'team_members', ['team_id', 'status'])
    op.create_index('ix_team_members_is_deleted', 'team_members', ['is_deleted'])
    op.create_index(
        'idx_unique_active_user_team',
        'team_members',
        ['team_id', 'user_id'],
        unique=True,
        postgresql_where=sa.text("is_deleted = false AND status IN ('ACTIVE', 'INVITED', 'REQUESTED')")
    )


def downgrade() -> None:
    op.drop_table('team_members')
    op.drop_table('teams')
