import json
import traceback

from adrf.decorators import api_view
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from channels.layers import get_channel_layer
from users.models import CustomUser
from asgiref.sync import sync_to_async
from core.utils import sanitize_string
import logging

logger = logging.getLogger(__name__)


async def prep_request(job_id, callback, extra_payload=None):
    """
    The prep_request function is used to store the callback
    function name in a cache. This allows us to call the correct callback
    function when we receive a response from our external API.

    :param job_id: Identify the callback function that is being called
    :param callback: Store the name of the callback function
    :param extra_payload: Pass extra data to the callback function
    :return: None
    :doc-author: Trelent
    """
    key = f"callback_{job_id}"
    cache.set(key, callback.__name__)
    if extra_payload:
        cache.set(f"extra_payload_{job_id}", extra_payload)
    return None


async def parse_query_params_to_dict(query_params):
    """
    Convert QueryDict to regular dictionary,
    and convert repeated keys into lists.
    """
    result_dict = {}
    for key in query_params.keys():
        values_list = query_params.getlist(key)
        if len(values_list) == 1:
            result_dict[key] = values_list[0]
        else:
            result_dict[key] = values_list
    return result_dict


async def get_callback_and_payload_from_request(request):
    parsed_params = await parse_query_params_to_dict(request.GET)
    callback_method_name = parsed_params.get('callback')
    CALLBACKS = cache.get("CALLBACKS")
    callback_method = CALLBACKS.get(callback_method_name, None)
    if "callback" in parsed_params:
        del parsed_params['callback']
    return callback_method, parsed_params


async def get_callback_and_job_id(request):
    """
    Extract common logic for fetching job_id and callback from cache.
    :param request: Get the job_id from the url
    :return: tuple containing job_id, callback_name, and callback function
    """
    job_id = request.GET.get('job_id')
    key = f"callback_{job_id}"

    callback_name = cache.get(key)
    if not callback_name:
        return None, None, JsonResponse(
            {'status': 'Invalid request ID: '
             + str(job_id)},
            status=400
             )

    CALLBACKS = cache.get("CALLBACKS")
    callback = CALLBACKS.get(callback_name)
    if not callback:
        return None, None, JsonResponse(
            {'status': 'No callback to process response'},
            status=400
        )

    return job_id, callback_name, callback


@sync_to_async
def get_user_by_email(email):
    return CustomUser.objects.filter(email=email).first()


@csrf_exempt
@api_view(['POST'])
async def callback_view(request):
    """
    The callback_view function is a Django view that handles the callback
    from the super-backend. It receives a POST request with data in JSON
    format, and stores it in cache for later retrieval by the
    check_request_status function. It also sets a flag to indicate
    whether to stop polling for results. This flag is set either by the
    stop parameter this request (defaults true), or by the stop parameter
    in the data.

    :param request: Get the job_id from the url
    :return: A jsonresponse object
    :doc-author: Trelent
    """
    if request.method != "POST":
        return JsonResponse({'status': 'Invalid method'}, status=405)

    try:
        (job_id,
         callback_name,
         callback) = await get_callback_and_job_id(request)

        logger.info(job_id + " received.")

        request_get = request.GET
        logger.info("Request GET: " + str(request_get))

        user_email = request.GET.get('user_email')
        logger.info("User email in callback: " + str(user_email))
        user = await get_user_by_email(user_email)
        user_group_name = f"user_{user}"
        user_group_name = sanitize_string(user_group_name)
        logger.info("User group name: " + str(user_group_name))
        channel_layer = get_channel_layer()

        body_data = json.loads(request.body)
        params = request.GET.dict()

        if type(body_data) is dict:
            data = {**params, **body_data}
            if "job_id" not in data:
                data['job_id'] = job_id
        else:
            data = body_data

        if type(callback) is JsonResponse:
            # callback is an error response!
            return callback

        key_data = f"data_{job_id}"
        cache.set(key_data, data)
        # logger.debug(job_id + " received data: " + str(data))

        stop = True
        if isinstance(data, dict) and "stop" in data:
            stop = data["stop"]

        key_stop = f"stop_{job_id}"
        cache.set(key_stop, stop)

        logger.info(
            "Sending message for job id: " + str(job_id) +
            " and user group name: " + str(user_group_name)
        )
        await channel_layer.group_send(
            user_group_name,
            {
                "type": "user_message",
                "message": data,
            }
        )

        return JsonResponse({'status': 'Response processed'}, status=200)
    except Exception:
        traceback.print_exc()
        return JsonResponse(
            {'status': 'Response processing failed'},
            status=400
        )


async def check_request_status(request):
    """
    The check_request_status function is called by react to check
    if a response has been processed. It takes in a job_id and returns
    the result of that request, or an error message if no
    data exists for that id. Note that it pre-processes the response using
    the callback function before returning it to react.

    :param request: Get the job_id from the url
    :return: A json response with the status of the request
    :doc-author: Trelent
    """
    job_id, callback_name, callback = await get_callback_and_job_id(request)
    if type(callback) is JsonResponse:
        # callback is an error response!
        return callback

    key_data = f"data_{job_id}"
    data = cache.get(key_data)
    if data is None:
        return JsonResponse({'status': 'Data is none'}, status=200)

    if "job_id" not in data:
        data["job_id"] = job_id

    processed_response = await callback(data)
    key_result = f"result_{job_id}"
    cache.set(key_result, processed_response)

    key_stop = f"stop_{job_id}"
    stop = cache.get(key_stop, True)

    cache.set(key_data, None)
    extra_payload = cache.get(f"extra_payload_{job_id}", None)

    if stop is True:
        cache.delete(key_stop)
        cache.delete(key_data)
        cache.delete(key_result)
        cache.delete(f"extra_payload_{job_id}")

    if extra_payload:
        return JsonResponse(
            {'status': 'Response processed',
             'result': processed_response,
             "extra_payload": extra_payload,
             "stop": stop},
            status=200
        )
    else:
        return JsonResponse(
            {'status': 'Response processed',
             'result': processed_response,
             "stop": stop},
            status=200
        )
