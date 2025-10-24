from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
from .models import SocialLink, OAuthToken
from Backend.models import AuthUser


@require_GET
def social_me(request):
    """Return social links for the currently authenticated SYA user.

    GET /api/social/me/
    """
    try:
        session_user_id = None
        try:
            session_user_id = request.session.get('user_id')
        except Exception:
            session_user_id = None

        if not session_user_id:
            # try django auth fallback by email
            django_user = getattr(request, 'user', None)
            if django_user and getattr(django_user, 'is_authenticated', False):
                email = getattr(django_user, 'email', None)
                user = AuthUser.objects.filter(email=email, is_deleted=False).first()
                if user:
                    session_user_id = getattr(user, 'user_id', None) or getattr(user, 'id', None)

        if not session_user_id:
            return JsonResponse({'detail': 'Not authenticated'}, status=401)

        links = SocialLink.objects.filter(user_id=session_user_id)
        result = []
        for link in links:
            result.append({'provider': link.provider, 'uid': link.uid, 'email': link.email, 'created_at': link.created_at})

        return JsonResponse({'detail': 'ok', 'data': result})
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)


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

    # Ensure the requester is the same SYA user (must be authenticated and match)
    session_user_id = None
    try:
        session_user_id = request.session.get('user_id')
    except Exception:
        session_user_id = None

    if session_user_id is None:
        # try django auth as fallback
        django_user = getattr(request, 'user', None)
        if django_user and getattr(django_user, 'is_authenticated', False):
            session_user_id = getattr(django_user, 'email', None) == email and user.user_id or None

    if session_user_id is None or int(session_user_id) != int(getattr(user, 'user_id', getattr(user, 'id', None))):
        return JsonResponse({'detail': 'Forbidden: must be authenticated as the target SYA user to link'}, status=403)

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
