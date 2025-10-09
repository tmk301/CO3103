from django.db import IntegrityError, transaction, connection
from django.utils import timezone


def create_user_account(
    email: str,
    first_name: str,
    last_name: str,
    username: str,
    password: str,
    status: int = 0,
    auth_user_model=None,
    auth_account_model=None,
) -> dict:
    """Internal implementation used by both CreateUserAccount and create_user_account.

    If auth_user_model/auth_account_model are provided, use the ORM path.
    Otherwise call the stored procedure directly via a DB cursor.
    """
    email = (email or "").strip()
    username = (username or "").strip()

    if not email:
        return {"success": False, "message": "Email is required."}
    if not username:
        return {"success": False, "message": "Username is required."}

    try:
        # If models were injected (for tests), use them; otherwise import the project's models.
        if auth_user_model is not None and auth_account_model is not None:
            AuthUser = auth_user_model
            AuthAccount = auth_account_model
        else:
            # Import lazily so importing this module doesn't force model registration at import time
            from .models import AuthUser, AuthAccount

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

            account = AuthAccount.objects.create(
                user=user,
                username=username,
                password_hash=password,
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