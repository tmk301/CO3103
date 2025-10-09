from django.db import connection, IntegrityError
from django.contrib.auth import get_user_model

def CreateUserAccount(
        email: str, 
        first_name: str, 
        last_name: str, 
        username: str, 
        password: str
    ) -> dict:
    email = (email or "").strip()
    username = (username or "").strip()
    
    sql = """
    EXEC auth.sp_CreateUserAccount
        @Email=%s,
        @FirstName=%s,
        @LastName=%s,
        @Username=%s,
        @PasswordHash=%s
    """
    params = [email, first_name, last_name, username, password]

    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            result = cursor.fetchone()
            if result:
                return {
                    "success": result[0],
                    "message": result[1]
                }
            else:
                return {
                    "success": False,
                    "message": "No response from database."
                }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }