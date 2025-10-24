from django.db import IntegrityError, transaction, connection
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from .models import AuthUser, AuthAccount

def create_user_account(
    email: str,
    first_name: str,
    last_name: str,
    username: str,
    password: str,
    status: int = 0,
) -> dict:
    """API to create a new account.
    """
    email = (email or "").strip()
    username = (username or "").strip()

    if not email:
        return {"success": False, "message": "Email is required."}
    if not username:
        return {"success": False, "message": "Username is required."}

    try:

        with transaction.atomic():
            if AuthUser.objects.filter(email=email, is_deleted=False).exists():
                return {"success": False, "message": "Email already exists.", "code": 50001}

            if AuthAccount.objects.filter(username=username, is_deleted=False).exists():
                return {"success": False, "message": "Username already exists.", "code": 50002}

            now = timezone.now()

            user = AuthUser.objects.create(
                email=email,
                first_name=first_name,
                last_name=last_name,
                status=status,
                is_deleted=False,
                created_at=now,
            )

            hashed = make_password(password)

            account = AuthAccount.objects.create(
                user=user,
                username=username,
                password_hash=hashed,
                is_deleted=False,
                created_at=now,
            )

            return {
                "success": True,
                "message": "Account created successfully.",
                "user_id": getattr(user, 'user_id', None) or getattr(user, 'id', None),
                "account_id": getattr(account, 'account_id', None) or getattr(account, 'id', None),
            }

    except IntegrityError as e:
        return {"success": False, "message": str(e)}
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_info_by_email(email: str) -> dict:
    """Helper function to get info by email.
    """
    email = (email or "").strip()

    if not email:
        return {"success": False, "message": "Email is required."}

    try:
        user = AuthUser.objects.filter(email=email, is_deleted=False).first()
        if not user:
            return {"success": False, "message": "User not found.", "code": 50003}

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


def get_info_by_username(username: str) -> dict:
    """Helper function to get info by username.
    """
    username = (username or "").strip()

    if not username:
        return {"success": False, "message": "Username is required."}

    try:
        account = AuthAccount.objects.filter(username=username, is_deleted=False).first()
        if not account:
            return {"success": False, "message": "Account not found.", "code": 50004}

        user = account.user
        if not user or getattr(user, 'is_deleted', False):
            return {"success": False, "message": "User not found or deleted.", "code": 50003}

        return {
            "success": True,
            "message": "Info retrieved successfully.",
            "data": {
                "user_id": getattr(user, 'user_id', None) or getattr(user, 'id', None),
                "account_id": getattr(account, 'account_id', None) or getattr(account, 'id', None),
                "username": account.username,
                "password_hash": account.password_hash,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "status": user.status,
                "is_deleted": user.is_deleted,
            },
        }

    except Exception as e:
        return {"success": False, "message": str(e)}
    
def log_in(username: str = None, email: str = None, password: str = None) -> dict:
    username = (username or "").strip()
    email = (email or "").strip()

    if not username and not email:
        return {"success": False, "message": "Username or email is required."}

    try:
        if username:
            result = get_info_by_username(username)
            if not result.get("success"):
                return result
        else:
            result = get_info_by_email(email)
            if not result.get("success"):
                return result
    except Exception as e:
        return {"success": False, "message": str(e)}

    info = result.get("data", {})
    password_hash = info.get("password_hash")
    if not password_hash:
        return {"success": False, "message": "Password not set for account.", "code": 50005}

    try:
        valid = check_password(password or "", password_hash)
    except Exception as e:
        return {"success": False, "message": str(e)}

    if not valid:
        return {"success": False, "message": "Invalid credentials.", "code": 50006}

    return {
        "success": True,
        "message": "Login successful.",
        "data": {
            "user_id": info.get("user_id"),
            "account_id": info.get("account_id"),
            "username": info.get("username"),
            "email": info.get("email"),
            "first_name": info.get("first_name"),
            "last_name": info.get("last_name"),
            "status": info.get("status"),
        },
    }

def change_password(username: str = None, email: str = None, old_password: str = None, new_password: str = None) -> dict:
    """API to change password."""
    username = (username or "").strip()
    email = (email or "").strip()

    if not username and not email:
        return {"success": False, "message": "Username or email is required."}
    if not old_password:
        return {"success": False, "message": "Old password is required."}
    if not new_password:
        return {"success": False, "message": "New password is required."}
    # Reuse log_in to validate the old password and retrieve account info.
    try:
        login_result = log_in(username=username, email=email, password=old_password)
        if not login_result.get("success"):
            # log_in returns appropriate error messages/codes (e.g. 50005/50006)
            return login_result
    except Exception as e:
        return {"success": False, "message": str(e)}

    info = login_result.get("data", {})
    account_id = info.get("account_id")
    if not account_id:
        # This should be rare because log_in would normally fail earlier if account/password missing
        return {"success": False, "message": "Account not found or password not set.", "code": 50004}

    try:
        hashed = make_password(new_password)
        updated = AuthAccount.objects.filter(account_id=account_id).update(password_hash=hashed)
        if updated == 0:
            return {"success": False, "message": "Failed to update password.", "code": 50007}

        return {"success": True, "message": "Password changed successfully."}

    except Exception as e:
        return {"success": False, "message": str(e)}


def get_all_users(is_deleted: bool = False) -> dict:
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