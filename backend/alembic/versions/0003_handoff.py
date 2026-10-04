from alembic import op
import sqlalchemy as sa
revision='0003_handoff';down_revision='0002_leads';branch_labels=None;depends_on=None
def upgrade():
 op.create_table('handoff_tokens',sa.Column('id',sa.String(64),primary_key=True),sa.Column('lead_id',sa.String(64),sa.ForeignKey('leads.id'),nullable=False),sa.Column('digest',sa.String(64),nullable=False,unique=True),sa.Column('expires_at',sa.DateTime(timezone=True),nullable=False),sa.Column('consumed_at',sa.DateTime(timezone=True)),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False))
def downgrade(): op.drop_table('handoff_tokens')
