from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
from .models import SocialLink, OAuthToken
from Backend.models import AuthUser


@csrf_exempt
@require_POST
def link_social(request):
    """Link a social account to an existing SYA user by email.

    Request JSON: {"provider": "google", "uid": "...", "email": "user@example.com", "extra_data": {...}}
    """
    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    provider = (payload.get('provider') or '').strip()
    uid = (payload.get('uid') or '').strip()
    email = (payload.get('email') or '').strip()
    extra = payload.get('extra_data')

    if not provider or not uid or not email:
        return JsonResponse({'detail': 'provider, uid and email are required'}, status=400)

    user = AuthUser.objects.filter(email=email, is_deleted=False).first()
    if not user:
        return JsonResponse({'detail': 'SYA user not found for provided email'}, status=404)

    link, created = SocialLink.objects.get_or_create(provider=provider, uid=uid, defaults={'user': user, 'email': email, 'extra_data': extra or {}})
    if not created:
        # If link exists but points to a different user, return conflict
        if link.user_id != user.user_id:
            return JsonResponse({'detail': 'Social account already linked to another SYA user'}, status=409)
        # update stored data
        link.email = email
        if extra:
            link.extra_data = extra
        link.updated_at = timezone.now()
        link.save()

    return JsonResponse({'detail': 'linked', 'link_id': link.id}, status=201 if created else 200)


@csrf_exempt
@require_POST
def unlink_social(request):
    try:
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({'detail': 'Invalid JSON'}, status=400)

    provider = (payload.get('provider') or '').strip()
    uid = (payload.get('uid') or '').strip()

    if not provider or not uid:
        return JsonResponse({'detail': 'provider and uid required'}, status=400)

    link = SocialLink.objects.filter(provider=provider, uid=uid).first()
    if not link:
        return JsonResponse({'detail': 'Link not found'}, status=404)

    link.delete()
    return JsonResponse({'detail': 'unlinked'})


@require_GET
def lookup_social(request):
    uid = request.GET.get('uid')
    provider = request.GET.get('provider')
    if not uid or not provider:
        return JsonResponse({'detail': 'provider and uid required'}, status=400)
    link = SocialLink.objects.filter(provider=provider, uid=uid).select_related('user').first()
    if not link:
        return JsonResponse({'detail': 'not found'}, status=404)

    return JsonResponse({'detail': 'found', 'user': {'user_id': link.user.user_id, 'email': link.user.email, 'first_name': link.user.first_name, 'last_name': link.user.last_name}})
