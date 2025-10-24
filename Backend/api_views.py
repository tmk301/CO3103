from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from Backend import services
import json


@csrf_exempt
@require_POST
def register(request):
    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    username = payload.get('username')
    password = payload.get('password')
    email = payload.get('email', '')
    first_name = payload.get('first_name', '')
    last_name = payload.get('last_name', '')

    if not username or not password:
        return JsonResponse({'detail': 'username and password required'}, status=400)

    result = services.create_user_account(
        email=email,
        first_name=first_name,
        last_name=last_name,
        username=username,
        password=password,
    )

    if not result.get('success'):
        return JsonResponse({'detail': result.get('message')}, status=400)

    return JsonResponse({'detail': result.get('message'), 'user_id': result.get('user_id')}, status=201)


@csrf_exempt
@require_POST
def login(request):
    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    username = payload.get('username')
    email = payload.get('email', '')
    password = payload.get('password')

    if not (username or email) or not password:
        return JsonResponse({'detail': 'username/email and password required'}, status=400)

    result = services.log_in(username=username, email=email, password=password)
    if not result.get('success'):
        return JsonResponse({'detail': result.get('message')}, status=400)

    data = result.get('data', {})
    user_id = data.get('user_id')

    # Create a simple session entry so frontend can rely on cookies
    try:
        request.session['user_id'] = user_id
    except Exception:
        # session middleware should be enabled; if not, ignore silently
        pass

    return JsonResponse({'detail': result.get('message'), 'data': data})


@csrf_exempt
@require_POST
def change_password(request):
    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    username = payload.get('username')
    email = payload.get('email', '')
    old_password = payload.get('old_password')
    new_password = payload.get('new_password')

    if not (username or email) or not old_password or not new_password:
        return JsonResponse({'detail': 'username/email, old_password and new_password required'}, status=400)

    result = services.change_password(
        username=username,
        email=email,
        old_password=old_password,
        new_password=new_password,
    )
    if not result.get('success'):
        return JsonResponse({'detail': result.get('message')}, status=400)

    return JsonResponse({'detail': result.get('message')})


@csrf_exempt
@require_POST
def get_all_users(request):
    """Return a list of users filtered by is_deleted flag.

    Expects JSON body: { "is_deleted": false } (defaults to False if omitted)
    """
    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    is_deleted = payload.get('is_deleted', False)
    # Normalize to boolean
    is_deleted = bool(is_deleted)

    result = services.get_all_users(is_deleted=is_deleted)
    if not result.get('success'):
        return JsonResponse({'detail': result.get('message')}, status=400)

    return JsonResponse({'detail': result.get('message'), 'data': result.get('data')})