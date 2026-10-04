from alembic import context
from sqlalchemy import create_engine
import os
from app.main import Base
config=context.config
config.set_main_option('sqlalchemy.url', os.environ['DATABASE_URL'].replace('+asyncpg','+psycopg'))
target_metadata=Base.metadata
def run_migrations_online():
 with create_engine(config.get_main_option('sqlalchemy.url')).connect() as c:
  context.configure(connection=c, target_metadata=target_metadata, compare_type=True)
  with context.begin_transaction(): context.run_migrations()
run_migrations_online()
