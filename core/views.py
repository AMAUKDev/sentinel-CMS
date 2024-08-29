import json
import traceback
import uuid
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import httpx
from flaskappframework.flask_app_wrapper import FlaskAppWrapper
from flaskappframework import logging_mp
from core.request_logic import (
    get_callback_and_payload_from_request,
    prep_request
)
from .callbacks import set_callbacks

from functools import wraps
from asgiref.sync import sync_to_async

# Function Based Views:
from adrf.decorators import api_view

logger = logging_mp.bring_logger_to_here()


def user_is_approved_for_request(view_func):
    @wraps(view_func)
    async def _wrapped_view(request, *args, **kwargs):
        try:

            # Wrap the synchronous checks in sync_to_async
            is_authenticated = await sync_to_async(
                lambda: request.user.is_authenticated
            )()
            is_approved = await sync_to_async(lambda: request.user.approved)()

            if not is_authenticated or not is_approved:
                return JsonResponse(
                    {'status':
                     'Request not made, incorrect user auth / approval'},
                    status=400
                )

            return await view_func(request, *args, **kwargs)
        except Exception as e:
            print("Checking user failed with error: ", e)
            traceback.print_exc()

            return JsonResponse(
                {'status':
                 'Request not made, unable to validate user'},
                status=400
            )

    return _wrapped_view


@sync_to_async
def fetch_user_group_tags(user):
    group_tag_list = list(user.group_tags.all())
    return [group_tag.name for group_tag in group_tag_list]


@sync_to_async
def fetch_user_interest_tags(user):
    interest_tag_list = list(user.interest_tags.all())
    return [interest_tag.name for interest_tag in interest_tag_list]


@sync_to_async
def fetch_user_role(user):
    return user.role


@sync_to_async
def fetch_user_email(user):
    return user.email


@api_view(['GET'])
@user_is_approved_for_request
async def async_interpretations_view(request):
    logger.info("async_interpretations_view " + str(request.GET))
    """
    The async_interpretations_view function is a view that takes
    in a GET request and returns an acknowledgement of the request
    from the super-backend.

    Information flow:
    react (initiateRequest) -> specified django endpoint (like this one)
    -> super-backend, with acknowledgement response. Meanwhile, super-backend
    -> django (callback_view) Meanwhile, react (checkData on interval)
    ->  django (check_request_status and callback_function)
    -> react (specified dataHandler)

    This view creates the unique job_id for this request
    of the super-backend, and uses "prep_request" to store the job_id
    and callback function name in a cache for later use.

    The function sends various parameters as kwargs to the
    query_interpretation_host function in the super-backend.
    The query_interpretation_host function will return an acknowledgement
    of its own, which is returned by this view.

    :param request: Get the get parameters from the request
    :return: A jsonresponse with a status of 200 and the job_id
    :doc-author: Trelent
    """
    await set_callbacks()

    callback, extra_payload = await get_callback_and_payload_from_request(
        request
    )

    try:
        if "job_id" in extra_payload:
            job_id = extra_payload["job_id"]
            del extra_payload["job_id"]
        else:
            job_id = str(uuid.uuid4())
    except KeyError:
        job_id = str(uuid.uuid4())

    logger.debug("async_interpretations_view: " + job_id + " callback: "
                 + str(callback) + " extra_payload: " + str(extra_payload))

    if not callback:
        return JsonResponse({'status': 'Invalid callback name'}, status=400)

    await prep_request(job_id, callback, extra_payload)

    # user_kwargs needs to be replaced by some method
    # that grabs the live user and their role/tags

    user_kwargs = {}
    user_kwargs["user_email"] = await fetch_user_email(request.user)
    user_kwargs["user_role"] = await fetch_user_role(request.user)
    user_kwargs["user_group_tags"] = await fetch_user_group_tags(request.user)
    user_kwargs["user_interest_tags"] = await fetch_user_interest_tags(
        request.user
    )

    # instead, we have wrapped the user parameters in the extra_payload
    # from the react side (is that secure)?
    all_kwargs = {**extra_payload, **user_kwargs}

    logger.info(
        "async_interpretations_view: " + job_id + " kwargs: "
        + str(all_kwargs)
    )

    response_data = FlaskAppWrapper.query_interpretation_host(
        job_id=job_id,
        **all_kwargs
    )

    return JsonResponse(
        {'status': 'Request made, acknowledgement: ' + str(response_data),
         'job_id': job_id},
        status=200)


@csrf_exempt
def control(request, name, action):
    if request.method == 'POST':
        data = json.loads(request.body)
        for key, app_name in data["NAME"].items():
            if app_name == name:
                address = data["ADDRESS"][key] or "127.0.0.1"
                port = int(data["PORT"][key])
                # response = requests.post(f"http://{address}:{port}/{action}")
                # not much point using async requests here
                # as we're in a sync endpoint, but oh well.
                response = httpx.post(f"http://{address}:{port}/{action}")
                if response.status_code == 200:
                    return HttpResponse(f"{name} {action}ed successfully")
                else:
                    return HttpResponse(f"Failed to {action} {name}",
                                        status=500)
        return HttpResponse("App not found", status=404)
