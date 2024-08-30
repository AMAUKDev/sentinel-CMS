import os
import httpx
import asyncio

from core.callbacks import set_callbacks
from django.http import JsonResponse
import uuid
import logging
import json
from core.request_logic import (
   get_callback_and_payload_from_request,
   prep_request
)
from core.views import (
    user_is_approved_for_request,
    fetch_user_role,
    fetch_user_email,
    fetch_user_group_tags,
    fetch_user_interest_tags,
    api_view,
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
@user_is_approved_for_request
async def test_get_interpretations(request):
    """
    The async_interpretations_view function is a view that takes in a GET
    request and returns an acknowledgement of the request
    from the super-backend.

    Information flow react (initiateRequest)
    -> specified django endpoint (like this one)
    -> super-backend, with acknowledgement response. Meanwhile, super-backend
    -> django (callback_view) which spits through channel
    (websocket) back to react

    This view creates the unique job_id for this
    request of the super-backend, and uses "prep_request" to store
    the job_id and callback function name in a cache for later use.

    The function sends various parameters as kwargs to the
    query_interpretation_host function in the super-backend.
    The query_interpretation_host function will return an acknowledgement of
    its own, which is returned by this view.

    :param request: Get the get parameters from the request
    :return: A jsonresponse with a status of 200 and the job_id
    :doc-author: Trelent
    """
    user_role = await fetch_user_role(request.user)

    if user_role.lower() == "ADMIN".lower():

        await set_callbacks()

        job_id = str(uuid.uuid4())

        callback, extra_payload = await get_callback_and_payload_from_request(
            request
        )

        logger.info(
            "test_get_interpretations: " + job_id + " callback: "
            + str(callback) + " extra_payload: " + str(extra_payload))

        if not callback:
            return JsonResponse(
                {'status': 'Invalid callback name'},
                status=400
            )

        await prep_request(job_id, callback, extra_payload)

        if False:
            user_kwargs = {
                "user_email": "test_user@example.com",
                "user_role": "USER",
                "user_group_tags": ["AMAUK"],
                "user_interest_tags": []
            }
        else:
            user_kwargs = {}
            user_kwargs["user_email"] = \
                await fetch_user_email(request.user)
            user_kwargs["user_role"] = await fetch_user_role(request.user)
            user_kwargs["user_group_tags"] = \
                await fetch_user_group_tags(request.user)
            user_kwargs["user_interest_tags"] = await fetch_user_interest_tags(
                request.user
            )

        all_kwargs = {**extra_payload, **user_kwargs}

        logger.info(
            "test_get_interpretations: "
            + job_id + " kwargs: " + str(all_kwargs)
        )

        response_data = "Request received for job_id: " + job_id

        callback_data = {}
        dir_path = "test_data"
        file_name = "new_cms_lite.json"
        file_path = os.path.join(dir_path, file_name)

        with open(file_path, "r") as f:
            callback_data = json.load(f)

        callback_data["job_id"] = job_id
        callback_data["user_email"] = user_kwargs["user_email"]

        params = {}
        params["job_id"] = job_id
        params["user_email"] = user_kwargs["user_email"]

        # logger.info("test_get_interpretations: "
        #             + job_id + " callback_data: " + str(callback_data))

        asyncio.create_task(
            send_to_callback_view_async(
                callback_data,
                job_id,
                params
            )
        )

        logger.info("test_get_interpretations: "
                    + job_id + " returning.")

        return JsonResponse(
            {'status': 'Request made, acknowledgement: '
             + str(response_data), 'job_id': job_id},
            status=200
        )
    else:
        return JsonResponse(
            {'status': 'Request not made, incorrect user role'},
            status=400
        )


async def send_to_callback_view_async(callback_data, job_id, params):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url="http://localhost:8000/callback_view/",
                params=params,
                json=callback_data,
                headers={'Content-Type': 'application/json'},
                timeout=1
            )
            logger.info("Async call to callback_view: "
                        + job_id + " response: "
                        + str(response.json()))
        except Exception as e:
            logger.info("Async call to callback_view: "
                        + job_id + " request exception: " + str(e))


@api_view(['GET'])
@user_is_approved_for_request
async def test_display_interpretation(request):
    """
    The async_interpretations_view function is a view that takes in a GET
    request and returns an acknowledgement of the request
    from the super-backend.

    Information flow:
    react (initiateRequest) -> specified django endpoint (like this one)
    -> super-backend, with acknowledgement response. Meanwhile, super-backend
    -> django (callback_view) Meanwhile, react (checkData on interval)
    -> django (check_request_status and callback_function)
    -> react (specified dataHandler)

    This view creates the unique job_id for this
    request of the super-backend, and uses "prep_request" to store the
    job_id and callback function name in a cache for later use.

    The function sends various parameters as kwargs to the
    query_interpretation_host function in the super-backend.
    The query_interpretation_host function will return an acknowledgement
    of its own, which is returned by this view.

    :param request: Get the get parameters from the request
    :return: A jsonresponse with a status of 200 and the job_id
    :doc-author: Trelent
    """

    user_role = await fetch_user_role(request.user)

    if user_role.lower() == "ADMIN".lower():

        await set_callbacks()

        job_id = str(uuid.uuid4())

        callback, extra_payload = await get_callback_and_payload_from_request(
            request
        )

        logger.info(
            "test_display_interpretation: " + job_id + " callback: "
            + str(callback) + " extra_payload: " + str(extra_payload))

        if not callback:
            return JsonResponse(
                {'status': 'Invalid callback name'},
                status=400
            )

        await prep_request(job_id, callback, extra_payload)

        if False:
            user_kwargs = {
                "user_email": "test_user@example.com",
                "user_role": "USER",
                "user_group_tags": ["AMAUK"],
                "user_interest_tags": []
            }
        else:
            user_kwargs = {}
            user_kwargs["user_email"] = await fetch_user_email(request.user)
            user_kwargs["user_role"] \
                = await fetch_user_role(request.user)
            user_kwargs["user_group_tags"] \
                = await fetch_user_group_tags(request.user)
            user_kwargs["user_interest_tags"] = await fetch_user_interest_tags(
                request.user
            )
        print('cunt', user_kwargs)
        all_kwargs = {**extra_payload, **user_kwargs}

        logger.debug("test_display_interpretation: "
                     + job_id + " kwargs: " + str(all_kwargs))

        response_data = "Request received for job_id: " + job_id

        callback_data = {}
        dir_path = "test_data"

        # change test data here

        file_name = "new_cms_lite.json"

        file_path = os.path.join(dir_path, file_name)
        with open(file_path, "r") as f:
            callback_data = json.load(f)
        callback_data["job_id"] = job_id

        # job_id and user_email must be in params.
        # in callback_data may be optional?
        params = {}
        params["job_id"] = job_id
        params["user_email"] = user_kwargs["user_email"]

        logger.debug(
            "test_display_interpretation: "
            + job_id + " callback_data: " + str(callback_data)
        )

        asyncio.create_task(
            send_to_callback_view_async(
                callback_data,
                job_id,
                params
            )
        )

        return JsonResponse(
            {'status': 'Request made, acknowledgement: '
             + str(response_data), 'job_id': job_id},
            status=200
        )
    else:
        return JsonResponse(
            {'status': 'Request not made, incorrect user role'},
            status=400
        )
