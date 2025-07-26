"""add relationships and enum for access_level

Revision ID: 9ceb72bed778
Revises: 813ce231d489
Create Date: 2025-07-20 22:22:04.851227
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9ceb72bed778'
down_revision: Union[str, Sequence[str], None] = '813ce231d489'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ❌ intentionally empty: we keep access_level as Integer in Python only
    pass


def downgrade() -> None:
    """Downgrade schema."""
    # ❌ nothing to rollback
    pass
