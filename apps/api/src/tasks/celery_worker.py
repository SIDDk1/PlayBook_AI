from celery import Celery
from config.settings import settings

# Initialize Celery app
celery_app = Celery(
    "sentinel_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "tasks.scenario_tasks",
        "tasks.notification_tasks",
        "tasks.analytics_tasks"
    ]
)

# Enterprise settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes execution ceiling
)
