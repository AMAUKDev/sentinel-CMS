# consumers.py

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from core.utils import sanitize_string

logger = logging.getLogger(__name__)


class JobConsumer(AsyncWebsocketConsumer):
    user = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_group_name = None

    async def connect(self):
        self.user = self.scope["user"]
        # Validate user before accepting the Websocket Connection
        logger.info(f"WS user: {self.user}")
        # For example:
        if not self.user.is_authenticated or self.user.is_anonymous:
            logger.info(f"WS is not authenticated: {self.user}")
            logger.info("WS is closing...")
            await self.close()
            pass
        else:
            logger.info(f"WS is authenticated: {self.user}")
            self.user_group_name = f"user_{self.user}"
            self.user_group_name = sanitize_string(self.user_group_name)
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            logger.info(f"WS user_group_name: {self.user_group_name}")
            await self.accept()

    async def disconnect(self, close_code):
        # Remove the channel from the group on disconnect
        if self.user.is_authenticated:
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
        try:
            await self.close()
        except Exception:
            print("WS is already closed")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        await self.send(text_data=json.dumps({
            'message':
            f"Received message '{message}' from user '{self.user.email}'"
        }))

        # Custom handler for sending messages to this consumer

    async def user_message(self, event):
        # logger.info(f"WS received event: {event}")
        message = event['message']
        await self.send(text_data=json.dumps({"message": message}))
