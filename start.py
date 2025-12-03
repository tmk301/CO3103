#!/usr/bin/env python
"""
All-in-one startup script for Django project.
- First run: migrate, load fixtures, create superuser
- Subsequent runs: just start the server
"""

import os
import sys
import subprocess
from pathlib import Path

# Ensure we're in the correct directory
BASE_DIR = Path(__file__).resolve().parent
os.chdir(BASE_DIR)

# Marker file to track if first-time setup is done
SETUP_MARKER = BASE_DIR / '.setup_complete'


def run_command(cmd, description=None):
    """Run a command and print output."""
    if description:
        print(f"\n{'='*50}")
        print(f"📌 {description}")
        print('='*50)
    
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"❌ Command failed: {cmd}")
        return False
    return True


def first_time_setup():
    """Run first-time setup: migrate, fixtures, superuser."""
    print("\n🚀 First-time setup detected. Running initialization...\n")
    
    # Step 1: Make migrations and migrate
    print("Step 1/3: Database migrations")
    if not run_command("python make_and_migrate.py", "Running migrations..."):
        return False
    
    # Step 2: Load fixtures
    print("\nStep 2/3: Loading fixtures")
    if not run_command("python load_fixtures.py", "Loading fixture data..."):
        return False
    
    # Step 3: Create superuser
    print("\nStep 3/3: Create superuser")
    print("="*50)
    print("📌 Creating superuser account...")
    print("="*50)
    
    # Check if superuser already exists
    check_superuser = subprocess.run(
        'python manage.py shell -c "from users.models import CustomUser; print(CustomUser.objects.filter(is_superuser=True).exists())"',
        shell=True,
        capture_output=True,
        text=True
    )
    
    if 'True' in check_superuser.stdout:
        print("✅ Superuser already exists. Skipping...")
    else:
        # Interactive superuser creation
        subprocess.run("python manage.py createsuperuser", shell=True)
    
    # Mark setup as complete
    SETUP_MARKER.touch()
    print("\n✅ First-time setup complete!")
    return True


def run_server(port=8000):
    """Start Django development server."""
    print(f"\n🌐 Starting Django server on port {port}...")
    print(f"   Access at: http://localhost:{port}/")
    print(f"   Admin at:  http://localhost:{port}/admin/")
    print("\n   Press Ctrl+C to stop.\n")
    
    try:
        os.system(f"python manage.py runserver {port}")
    except KeyboardInterrupt:
        pass
    
    print("\n\n Server stopped.")


def main():
    # Parse optional port argument
    port = 8000
    force_setup = False
    
    for arg in sys.argv[1:]:
        if arg == '--reset':
            # Force re-run setup
            force_setup = True
            if SETUP_MARKER.exists():
                SETUP_MARKER.unlink()
            print("🔄 Reset flag detected. Will re-run setup.")
        elif arg.isdigit():
            port = int(arg)
    
    # Check if first-time setup is needed
    if not SETUP_MARKER.exists() or force_setup:
        if not first_time_setup():
            print("\n❌ Setup failed. Please fix errors and try again.")
            sys.exit(1)
    else:
        print("✅ Setup already complete. Starting server...")
    
    # Start server
    run_server(port)


if __name__ == '__main__':
    main()
