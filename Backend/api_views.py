from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError, transaction, connection
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from .models import AuthUser, AuthAccount, OAuthToken
import json
import os
import string
import random
import requests
from django.shortcuts import redirect
from datetime import timedelta

def get_user_info(key: str, by: str = 'email') -> dict:
    """Unified helper to get user/account info by email or username.

    Args:
        key: the email or username value
        by: 'email' or 'username'

    Returns same shape as previous helpers: { success, message, data }
    """
    by = (by or 'email').lower()
    key = (key or '').strip()

    if not key:
        return {"success": False, "message": f"{by.capitalize()} is required."}

    try:
        if by == 'username':
            account = AuthAccount.objects.filter(username=key, is_deleted=False).first()
            if not account:
                return {"success": False, "message": "Account not found."}
            user = account.user
            if not user or getattr(user, 'is_deleted', False):
                return {"success": False, "message": "User not found or deleted."}
        else:
            user = AuthUser.objects.filter(email=key, is_deleted=False).first()
            if not user:
                return {"success": False, "message": "User not found."}
            account = AuthAccount.objects.filter(user=user, is_deleted=False).first()

        return {
            "success": True,
            "message": "Info retrieved successfully.",
            "data": {
                "user_id": getattr(user, 'user_id', None) or getattr(user, 'id', None),
                "account_id": getattr(account, 'account_id', None) or getattr(account, 'id', None) if account else None,
                "username": account.username if account else None,
                "password_hash": account.password_hash if account else None,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "status": user.status,
                "is_deleted": user.is_deleted,
            },
        }

    except Exception as e:
        return {"success": False, "message": str(e)}

def _get_all_users_service(is_deleted: bool = False) -> dict:
    """API to get all users."""
    try:
        users = AuthUser.objects.filter(is_deleted=is_deleted)
        user_list = []
        for user in users:
            user_list.append({
                "user_id": getattr(user, 'user_id', None) or getattr(user, 'id', None),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "status": user.status,
            })
        return {
            "success": True,
            "message": "Users retrieved successfully.",
            "data": user_list,
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

@csrf_exempt
def users_collection(request):
    """POST /api/users/ -> create user (register)
       GET  /api/users/ -> list users (is_deleted filter)
    """
    # Method: POST -> create user
    if request.method == 'POST':
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

        try:
            email_val = (email or "").strip()
            username_val = (username or "").strip()

            if not email_val:
                result = {"success": False, "message": "Email is required."}
            elif not username_val:
                result = {"success": False, "message": "Username is required."}
            else:
                with transaction.atomic():
                    if AuthUser.objects.filter(email=email_val, is_deleted=False).exists():
                        result = {"success": False, "message": "Email already exists."}
                    elif AuthAccount.objects.filter(username=username_val, is_deleted=False).exists():
                        result = {"success": False, "message": "Username already exists."}
                    else:
                        now = timezone.now()
                        user = AuthUser.objects.create(
                            email=email_val,
                            first_name=first_name,
                            last_name=last_name,
                            status=0,
                            is_deleted=False,
                            created_at=now,
                        )
                        hashed = make_password(password)
                        account = AuthAccount.objects.create(
                            user=user,
                            username=username_val,
                            password_hash=hashed,
                            is_deleted=False,
                            created_at=now,
                        )
                        result = {
                            "success": True,
                            "message": "Account created successfully.",
                            "user_id": getattr(user, 'user_id', None) or getattr(user, 'id', None),
                            "account_id": getattr(account, 'account_id', None) or getattr(account, 'id', None),
                        }
        except IntegrityError as e:
            result = {"success": False, "message": str(e)}
        except Exception as e:
            result = {"success": False, "message": str(e)}

        if not result.get('success'):
            if 'already exists' in result.get('message', '').lower():
                return JsonResponse({'detail': result.get('message')}, status=409)
            return JsonResponse({'detail': result.get('message')}, status=400)

        return JsonResponse({'detail': result.get('message'), 'user_id': result.get('user_id')}, status=201)

    # GET -> list users
    if request.method == 'GET':
        is_deleted = request.GET.get('is_deleted', 'false').lower() in ('1', 'true', 'yes')
        result = _get_all_users_service(is_deleted=is_deleted)
        if not result.get('success'):
            return JsonResponse({'detail': result.get('message')}, status=500)
        return JsonResponse({'detail': result.get('message'), 'data': result.get('data')})

    return JsonResponse({'detail': 'Method not allowed'}, status=405)


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

    try:
        if username:
            lookup = get_user_info(username, by='username')
        else:
            lookup = get_user_info(email, by='email')
        if not lookup.get('success'):
            return JsonResponse({'detail': lookup.get('message')}, status=400)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)

    info = lookup.get('data', {})
    password_hash = info.get('password_hash')
    if not password_hash:
        return JsonResponse({'detail': 'Password not set for account.'}, status=400)

    try:
        valid = check_password(password or "", password_hash)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)

    if not valid:
        return JsonResponse({'detail': 'Invalid credentials.'}, status=401)

    data = {
        'user_id': info.get('user_id'),
        'account_id': info.get('account_id'),
        'username': info.get('username'),
        'email': info.get('email'),
        'first_name': info.get('first_name'),
        'last_name': info.get('last_name'),
        'status': info.get('status'),
    }

    try:
        request.session['user_id'] = data.get('user_id')
    except Exception:
        pass

    return JsonResponse({'detail': 'Login successful.', 'data': data})


@csrf_exempt
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

    try:
        if username:
            lookup = get_user_info(username, by='username')
        else:
            lookup = get_user_info(email, by='email')
        if not lookup.get('success'):
            return JsonResponse({'detail': lookup.get('message')}, status=400)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)

    info = lookup.get('data', {})
    account_id = info.get('account_id')
    password_hash = info.get('password_hash')
    if not account_id or not password_hash:
        return JsonResponse({'detail': 'Account not found or password not set.'}, status=400)

    try:
        valid = check_password(old_password or "", password_hash)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)

    if not valid:
        return JsonResponse({'detail': 'Old password is incorrect.'}, status=401)

    try:
        hashed = make_password(new_password)
        updated = AuthAccount.objects.filter(account_id=account_id).update(password_hash=hashed, updated_at=timezone.now())
        if updated == 0:
            return JsonResponse({'detail': 'Failed to update password.'}, status=500)
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)

    return JsonResponse({'detail': 'Password changed successfully.'})

def _random_password(length: int = 32) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(random.choice(chars) for _ in range(length))


def google_auth(request):
    """Redirect user to Google's OAuth2 consent page."""
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    if not client_id:
        return JsonResponse({'detail': 'GOOGLE_CLIENT_ID not configured'}, status=500)

    redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/google/oauth2callback/')
    scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
    auth_url = (
        'https://accounts.google.com/o/oauth2/v2/auth'
        f'?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}'
        f'&scope={requests.utils.requote_uri(scope)}&access_type=offline&prompt=consent'
    )
    return redirect(auth_url)


def google_oauth2callback(request):
    """Handle OAuth2 callback from Google: exchange code for tokens, fetch userinfo, create/login local user."""
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'detail': 'Missing code parameter'}, status=400)

    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    redirect_uri = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/google/oauth2callback/')

    if not client_id or not client_secret:
        return JsonResponse({'detail': 'Google client credentials not configured'}, status=500)

    token_url = 'https://oauth2.googleapis.com/token'
    try:
        resp = requests.post(token_url, data={
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }, timeout=10)
        token_resp = resp.json()
    except Exception as e:
        return JsonResponse({'detail': 'Failed to exchange code for token', 'error': str(e)}, status=500)

    if resp.status_code != 200 or 'access_token' not in token_resp:
        return JsonResponse({'detail': 'Token exchange failed', 'response': token_resp}, status=400)

    access_token = token_resp.get('access_token')

    try:
        ui = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers={'Authorization': f'Bearer {access_token}'}, timeout=10)
        userinfo = ui.json()
    except Exception as e:
        return JsonResponse({'detail': 'Failed to fetch userinfo', 'error': str(e)}, status=500)

    email = userinfo.get('email')
    first_name = userinfo.get('given_name') or ''
    last_name = userinfo.get('family_name') or ''

    if not email:
        return JsonResponse({'detail': 'Email not provided by Google'}, status=400)

    existing = get_user_info(email, by='email')
    if existing.get('success'):
        user_data = existing.get('data')
        user_id = user_data.get('user_id')
    else:
        base = email.split('@')[0]
        username = base
        suffix = ''.join(random.choice(string.digits) for _ in range(4))
        username = f"{base}_{suffix}"
        password = _random_password(24)
        try:
            email_val = (email or "").strip()
            username_val = (username or "").strip()

            if not email_val:
                create_res = {"success": False, "message": "Email is required."}
            elif not username_val:
                create_res = {"success": False, "message": "Username is required."}
            else:
                with transaction.atomic():
                    if AuthUser.objects.filter(email=email_val, is_deleted=False).exists():
                        create_res = {"success": False, "message": "Email already exists."}
                    elif AuthAccount.objects.filter(username=username_val, is_deleted=False).exists():
                        create_res = {"success": False, "message": "Username already exists."}
                    else:
                        now = timezone.now()
                        user = AuthUser.objects.create(
                            email=email_val,
                            first_name=first_name,
                            last_name=last_name,
                            status=0,
                            is_deleted=False,
                            created_at=now,
                        )
                        hashed = make_password(password)
                        account = AuthAccount.objects.create(
                            user=user,
                            username=username_val,
                            password_hash=hashed,
                            is_deleted=False,
                            created_at=now,
                        )
                        create_res = {
                            "success": True,
                            "message": "Account created successfully.",
                            "user_id": getattr(user, 'user_id', None) or getattr(user, 'id', None),
                            "account_id": getattr(account, 'account_id', None) or getattr(account, 'id', None),
                        }
        except IntegrityError as e:
            create_res = {"success": False, "message": str(e)}
        except Exception as e:
            create_res = {"success": False, "message": str(e)}
        if not create_res.get('success'):
            return JsonResponse({'detail': 'Failed to create user', 'error': create_res.get('message')}, status=500)
        user_id = create_res.get('user_id')

    try:
        user_obj = AuthUser.objects.filter(user_id=user_id).first()
        if user_obj:
            expires_in = token_resp.get('expires_in')
            expires_at = None
            try:
                if expires_in is not None:
                    expires_at = timezone.now() + timedelta(seconds=int(expires_in))
            except Exception:
                expires_at = None

            try:
                OAuthToken.objects.update_or_create(
                    user=user_obj,
                    provider='google',
                    defaults={
                        'access_token': token_resp.get('access_token'),
                        'refresh_token': token_resp.get('refresh_token'),
                        'scope': token_resp.get('scope') or None,
                        'expires_at': expires_at,
                        'is_deleted': False,
                        'updated_at': timezone.now(),
                        'created_at': timezone.now(),
                    }
                )
            except Exception:
                pass

    except Exception:
        pass

    try:
        request.session['user_id'] = user_id
    except Exception:
        pass

    return JsonResponse({
        'detail': 'Google login successful',
        'data': {
            'user_id': user_id,
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
        },
        'access_token_expires_in': token_resp.get('expires_in'),
    })


def google_userinfo(request):
    """Optional: fetch userinfo by access_token (discouraged in favor of server session)."""
    token = request.GET.get('token')
    if not token:
        return JsonResponse({'detail': 'Missing token parameter'}, status=400)

    try:
        resp = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', headers={'Authorization': f'Bearer {token}'}, timeout=10)
        return JsonResponse(resp.json())
    except Exception as e:
        return JsonResponse({'detail': 'Failed to call Google userinfo', 'error': str(e)}, status=500)