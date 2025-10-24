from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError, transaction, connection
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from .models import AuthUser, AuthAccount
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

    # Method: GET -> list users
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


def session_info(request):
    """GET /api/me/ -> return currently authenticated user based on Django session cookie."""
    try:
        user_id = request.session.get('user_id')
    except Exception:
        user_id = None

    # Debug logging to help diagnose why session isn't picked up
    try:
        # print request cookies and session keys to server log (development only)
        print("[session_info] request.COOKIES:", getattr(request, 'COOKIES', {}))
        try:
            print("[session_info] session keys:", list(request.session.keys()))
        except Exception:
            print("[session_info] session not accessible")
        django_user = getattr(request, 'user', None)
        if django_user is not None:
            print("[session_info] request.user.is_authenticated:", getattr(django_user, 'is_authenticated', False))
            print("[session_info] request.user.email:", getattr(django_user, 'email', None))
    except Exception:
        pass

    # If session doesn't have our custom 'user_id', try to fall back to Django auth
    # (useful for django-allauth social logins which authenticate request.user)
    if not user_id:
        try:
            django_user = getattr(request, 'user', None)
            if django_user and getattr(django_user, 'is_authenticated', False):
                # try to map by email to our AuthUser
                email = getattr(django_user, 'email', None)
                if email:
                    user = AuthUser.objects.filter(email=email, is_deleted=False).first()
                    if user:
                        # persist into session for subsequent calls
                        try:
                            request.session['user_id'] = getattr(user, 'user_id', None) or getattr(user, 'id', None)
                        except Exception:
                            pass
                        account = AuthAccount.objects.filter(user=user, is_deleted=False).first()
                        data = {
                            'user_id': getattr(user, 'user_id', None) or getattr(user, 'id', None),
                            'account_id': getattr(account, 'account_id', None) or getattr(account, 'id', None) if account else None,
                            'username': account.username if account else None,
                            'email': user.email,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'status': user.status,
                        }
                        return JsonResponse({'detail': 'Authenticated', 'data': data})
        except Exception:
            pass

        return JsonResponse({'detail': 'Not authenticated'}, status=401)

    try:
        user = AuthUser.objects.filter(user_id=user_id, is_deleted=False).first()
        if not user:
            return JsonResponse({'detail': 'User not found'}, status=404)

        account = AuthAccount.objects.filter(user=user, is_deleted=False).first()
        data = {
            'user_id': getattr(user, 'user_id', None) or getattr(user, 'id', None),
            'account_id': getattr(account, 'account_id', None) or getattr(account, 'id', None) if account else None,
            'username': account.username if account else None,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'status': user.status,
        }
        return JsonResponse({'detail': 'Authenticated', 'data': data})
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)


def logout_api(request):
    """POST /api/logout/ -> clear server session and logout django user."""
    from django.contrib.auth import logout

    try:
        # flush session data
        try:
            request.session.flush()
        except Exception:
            pass
        # also call django logout to clear auth
        try:
            logout(request)
        except Exception:
            pass
        return JsonResponse({'detail': 'Logged out'})
    except Exception as e:
        return JsonResponse({'detail': str(e)}, status=500)