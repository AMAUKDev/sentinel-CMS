import json
import os

from flaskappframework.flask_app_wrapper import FlaskAppWrapper
from flaskappframework import logging_mp


def load_test_data_if_admin(user_role):
    response_data = None
    logger.info("Failed to get proper interpretation data")
    if user_role.lower() == "admin":
        try:
            dir_path = "test_data"
            file_name = "display_selected_interpretation_callback_data.json"
            file_path = os.path.join(dir_path, file_name)
            with open(file_path, "r") as f:
                response_data = json.load(f)
        except FileNotFoundError:
            logger.info("Failed to load test data")
    return response_data


if __name__ == "__main__":
    logger = logging_mp.create_logger(logging_mp.INFO)

    user_role = "ADMIN"

    user_kwargs = {}
    user_kwargs["user_role"] = user_role
    user_kwargs["user_group_tags"] = ["AMAUK"]
    user_kwargs["user_interest_tags"] = []

    extra_payload = {
        "interpretation_key": "PipeclamTracker",
        "entity_ids": [],
        "monitor_ids": [],
        "node_ids": []
    }

    all_kwargs = {**extra_payload, **user_kwargs}

    response_data = FlaskAppWrapper.query_interpretation_host(
        **all_kwargs,
        logger=logging_mp.FakeLogger()
    )
    # Note the lack of job_id in the above method call compared
    # to views.py - no job_id = direct response rather than async reply
    if response_data is None:
        response_data = load_test_data_if_admin(user_role)

    if response_data is not None:
        map_options = response_data["pages"]["map_view"]["sections"]["map"][
            "widgets"][0]["options"]
