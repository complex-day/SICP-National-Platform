import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from app.models.user import User
from app.models.project import InnovationProject
from app.core.constants import PartnerVerificationStatus, PartnershipType, CommitmentStatus


@pytest.mark.asyncio
async def test_repository_optimistic_concurrency_locking(
    db_session: AsyncSession,
    industry_user: User,
    innovation_project: InnovationProject,
):
    """Test optimistic concurrency control at repository layer."""
    from app.repositories.partnership_repository import PartnershipRepository
    from app.models.partnership import IndustryPartner, PartnershipAgreement

    # 1. Create Partner
    partner = IndustryPartner(
        id=uuid4(),
        user_id=industry_user.id,
        company_name="Concurrency Test Corp",
        domain="IT",
        cin_number="U72900KA2022PTC123999",
        csr_budget=1000000.00,
        website="https://test.corp",
        verification_status=PartnerVerificationStatus.VERIFIED,
    )
    db_session.add(partner)
    await db_session.commit()

    # 2. Create Agreement via Repository
    repo = PartnershipRepository(db_session)
    agreement = PartnershipAgreement(
        id=uuid4(),
        partner_id=partner.id,
        project_id=innovation_project.id,
        partnership_type=PartnershipType.FUNDING,
        commitment_status=CommitmentStatus.PROPOSED,
        promised_amount=100000.00,
        version=1,
    )
    saved_agreement = await repo.create_agreement(agreement)
    assert saved_agreement.version == 1

    # 3. Update with valid Version 1 -> Version becomes 2
    updated = await repo.update_agreement_with_version_check(saved_agreement.id, expected_version=1, update_data={"notes": "Updated note"})
    assert updated.version == 2

    # 4. Competing update with stale Version 1 -> Raises OptimisticLockError
    with pytest.raises(Exception) as exc_info:
        await repo.update_agreement_with_version_check(saved_agreement.id, expected_version=1, update_data={"notes": "Stale note"})
    assert (
        exc_info.type.__name__ == "OptimisticLockError"
        or getattr(exc_info.value, "code", "") == "OPTIMISTIC_LOCK_ERROR"
        or "version mismatch" in str(exc_info.value).lower()
    )

