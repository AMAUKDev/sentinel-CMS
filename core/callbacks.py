from django.core.cache import cache


async def set_callbacks():
    CALLBACKS = {
        'passthrough_data': passthrough_data
    }
    cache.set("CALLBACKS", CALLBACKS)


async def passthrough_data(data):
    """
    The passthrough_data function is a simple passthrough
    function that returns the data it receives.

    :param data: Pass the data to the function
    :return: The data that was passed to it
    :doc-author: Trelent
    """
    return data
