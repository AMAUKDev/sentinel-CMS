from django.urls import path
from core.consumers import JobConsumer  # Adjust the import path as necessary

websocket_urlpatterns = [
    path('ws/jobs/', JobConsumer.as_asgi()),
]
