# backend/extensions/__init__.py
# Flask扩展实例化

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_redis import Redis
from celery import Celery

# 初始化扩展实例
db = SQLAlchemy()
migrate = Migrate()
redis_client = Redis()
celery = Celery()