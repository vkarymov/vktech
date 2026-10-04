from alembic import op
import sqlalchemy as sa
revision='0001_initial'; down_revision=None; branch_labels=None; depends_on=None
def upgrade():
 op.create_table('visitor_sessions',sa.Column('id',sa.String(64),primary_key=True),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False))
 op.create_table('conversations',sa.Column('id',sa.String(64),primary_key=True),sa.Column('session_id',sa.String(64),sa.ForeignKey('visitor_sessions.id'),nullable=False),sa.Column('source',sa.String(255),nullable=False),sa.Column('reward_unlocked',sa.Boolean(),nullable=False),sa.Column('reward_verified',sa.Boolean(),nullable=False),sa.Column('discount_applied',sa.Boolean(),nullable=False),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False));op.create_index('ix_conversations_session_id','conversations',['session_id'])
 op.create_table('messages',sa.Column('id',sa.String(64),primary_key=True),sa.Column('conversation_id',sa.String(64),sa.ForeignKey('conversations.id'),nullable=False),sa.Column('body',sa.Text(),nullable=False),sa.Column('created_at',sa.DateTime(timezone=True),nullable=False));op.create_index('ix_messages_conversation_id','messages',['conversation_id'])
def downgrade():
 op.drop_table('messages');op.drop_table('conversations');op.drop_table('visitor_sessions')
