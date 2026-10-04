from alembic import op
import sqlalchemy as sa
revision='0002_leads';down_revision='0001_initial';branch_labels=None;depends_on=None
def upgrade():
 op.create_table('leads',sa.Column('id',sa.String(64),primary_key=True),sa.Column('session_id',sa.String(64),sa.ForeignKey('visitor_sessions.id'),nullable=False,unique=True),sa.Column('contact',sa.String(255)),sa.Column('name',sa.String(120)),sa.Column('status',sa.String(32),nullable=False),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False))
def downgrade(): op.drop_table('leads')
