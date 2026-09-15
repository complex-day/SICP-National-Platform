"""Academic Collaboration Schema

Revision ID: 004_academic_collaboration_schema
Revises: 003_team_collaboration_schema
Create Date: 2026-09-15 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from app.db.base import GUID

# revision identifiers, used by Alembic.
revision: str = '004_academic_collaboration_schema'
down_revision: Union[str, None] = '003_team_collaboration_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Universities Table
    op.create_table(
        'universities',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('district', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=False),
        sa.Column('contact_phone', sa.String(length=20), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='PENDING_VERIFICATION'),
        sa.Column('accreditation_details', sa.JSON(), nullable=True),
        sa.Column('domain_expertise', sa.JSON(), nullable=True),
        sa.Column('created_by', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('verified_by', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
    )
    op.create_index('ix_universities_name', 'universities', ['name'], unique=True)
    op.create_index('ix_universities_code', 'universities', ['code'], unique=True)
    op.create_index('ix_universities_location', 'universities', ['state', 'district'])
    op.create_index('ix_universities_status', 'universities', ['status'])

    # 2. University Administrators Table
    op.create_table(
        'university_administrators',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('university_id', GUID(), sa.ForeignKey('universities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_univ_admin_pair', 'university_administrators', ['university_id', 'user_id'])

    # 3. Departments Table
    op.create_table(
        'departments',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('university_id', GUID(), sa.ForeignKey('universities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('head_of_department_id', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('specializations', sa.JSON(), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('university_id', 'name', name='uq_dept_university_name'),
        sa.UniqueConstraint('university_id', 'code', name='uq_dept_university_code'),
    )
    op.create_index('ix_departments_university_id', 'departments', ['university_id'])

    # 4. Faculty Affiliations Table
    op.create_table(
        'faculty_affiliations',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('faculty_id', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('university_id', GUID(), sa.ForeignKey('universities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('department_id', GUID(), sa.ForeignKey('departments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('designation', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='PENDING'),
        sa.Column('verified_by', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_faculty_affiliations_faculty_id', 'faculty_affiliations', ['faculty_id'])
    op.create_index('ix_faculty_affiliations_dept_status', 'faculty_affiliations', ['department_id', 'status'])

    # 5. Academic Intakes Table
    op.create_table(
        'academic_intakes',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('challenge_id', GUID(), sa.ForeignKey('challenges.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('university_id', GUID(), sa.ForeignKey('universities.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='ROUTED'),
        sa.Column('intake_type', sa.String(length=30), nullable=False, server_default='AI_MATCHED'),
        sa.Column('match_score', sa.Numeric(precision=5, scale=2), nullable=False, server_default='0.00'),
        sa.Column('match_reasoning', sa.JSON(), nullable=True),
        sa.Column('claimed_by', GUID(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('claimed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_academic_intakes_challenge_id', 'academic_intakes', ['challenge_id'])
    op.create_index('ix_academic_intakes_univ_status', 'academic_intakes', ['university_id', 'status'])

    # 6. Intake Team Allocations Table
    op.create_table(
        'intake_team_allocations',
        sa.Column('id', GUID(), primary_key=True),
        sa.Column('intake_id', GUID(), sa.ForeignKey('academic_intakes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('team_id', GUID(), sa.ForeignKey('teams.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('department_id', GUID(), sa.ForeignKey('departments.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('faculty_mentor_id', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='ALLOCATED'),
        sa.Column('allocated_by', GUID(), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('allocated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_intake_team_allocations_pair', 'intake_team_allocations', ['intake_id', 'team_id'], unique=True)
    op.create_index('ix_allocations_faculty_mentor', 'intake_team_allocations', ['faculty_mentor_id', 'status'])


def downgrade() -> None:
    op.drop_table('intake_team_allocations')
    op.drop_table('academic_intakes')
    op.drop_table('faculty_affiliations')
    op.drop_table('departments')
    op.drop_table('university_administrators')
    op.drop_table('universities')
