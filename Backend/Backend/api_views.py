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
