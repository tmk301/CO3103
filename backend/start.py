#!/usr/bin/env python
"""
All-in-one startup script for Django project.
- First run: create venv, install dependencies, migrate, load fixtures, create superuser
- Subsequent runs: just start the server
"""

import os
import sys
import subprocess
from pathlib import Path

# Ensure we're in the correct directory
BASE_DIR = Path(__file__).resolve().parent
os.chdir(BASE_DIR)

# Virtual environment path
VENV_DIR = BASE_DIR / '.venv'
REQUIREMENTS_FILE = BASE_DIR / 'requirements.txt'

# Marker file to track if first-time setup is done
SETUP_MARKER = BASE_DIR / '.setup_complete'


def get_python_executable():
    """Get the Python executable path (inside venv if exists)."""
    if sys.platform == 'win32':
        venv_python = VENV_DIR / 'Scripts' / 'python.exe'
    else:
        venv_python = VENV_DIR / 'bin' / 'python'
    
    if venv_python.exists():
        return str(venv_python)
    return sys.executable


def get_pip_executable():
    """Get the pip executable path (inside venv if exists)."""
    if sys.platform == 'win32':
        venv_pip = VENV_DIR / 'Scripts' / 'pip.exe'
    else:
        venv_pip = VENV_DIR / 'bin' / 'pip'
    
    if venv_pip.exists():
        return str(venv_pip)
    return 'pip'


def run_command(cmd, description=None):
    """Run a command and print output."""
    if description:
        print(f"\n{'='*50}")
        print(f" {description}")
        print('='*50)
    
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        print(f"❌ Command failed: {cmd}")
        return False
    return True


def setup_venv():
    """Create virtual environment if not exists."""
    if VENV_DIR.exists():
        print("✅ Virtual environment already exists.")
        return True
    
    print("📦 Creating virtual environment...")
    result = subprocess.run([sys.executable, '-m', 'venv', str(VENV_DIR)])
    if result.returncode != 0:
        print("❌ Failed to create virtual environment")
        return False
    
    print("✅ Virtual environment created.")
    return True


def install_dependencies():
    """Install dependencies from requirements.txt."""
    if not REQUIREMENTS_FILE.exists():
        print("⚠️  requirements.txt not found. Skipping dependencies installation.")
        return True
    
    pip = get_pip_executable()
    print(f"📦 Installing dependencies from requirements.txt...")
    
    result = subprocess.run([pip, 'install', '-r', str(REQUIREMENTS_FILE)])
    if result.returncode != 0:
        print("❌ Failed to install dependencies")
        return False
    
    # Check if PostgreSQL is configured, install driver if needed
    postgres_req = BASE_DIR / 'requirements-postgres.txt'
    if postgres_req.exists():
        # Check DB_ENGINE from .env
        env_file = BASE_DIR / '.env'
        if env_file.exists():
            with open(env_file, 'r') as f:
                env_content = f.read()
                if 'DB_ENGINE=postgresql' in env_content.lower().replace(' ', ''):
                    print("📦 PostgreSQL detected. Installing PostgreSQL driver...")
                    result = subprocess.run([pip, 'install', '-r', str(postgres_req)])
                    if result.returncode != 0:
                        print("⚠️  Failed to install PostgreSQL driver. Make sure PostgreSQL is configured correctly.")
    
    print("✅ Dependencies installed.")
    return True


def check_env_file():
    """Check if .env file exists, create from example if not."""
    env_file = BASE_DIR / '.env'
    env_example = BASE_DIR / '.env.example'
    
    if env_file.exists():
        print("✅ .env file exists.")
        return True
    
    if env_example.exists():
        print("⚠️  .env file not found. Creating from .env.example...")
        import shutil
        shutil.copy(env_example, env_file)
        print("📝 Created .env from .env.example")
        print("⚠️  IMPORTANT: Please edit .env and fill in your configuration!")
        print("   Then run this script again.")
        return False
    else:
        print("❌ Neither .env nor .env.example found!")
        print("   Please create .env file with required configuration.")
        return False


def first_time_setup():
    """Run first-time setup: venv, dependencies, migrate, fixtures, superuser."""
    print("\n🚀 First-time setup detected. Running initialization...\n")
    
    python = get_python_executable()
    
    # Step 0: Create venv and install dependencies
    print("Step 0/4: Environment setup")
    if not setup_venv():
        return False
    
    if not install_dependencies():
        return False
    
    # Update python executable after venv setup
    python = get_python_executable()
    
    # Step 0.5: Check .env file
    if not check_env_file():
        return False
    
    # Step 1: Make migrations and migrate
    print("\nStep 1/4: Database migrations")
    if not run_command(f'"{python}" make_and_migrate.py', "Running migrations..."):
        return False
    
    # Step 2: Load fixtures
    print("\nStep 2/4: Loading fixtures")
    if not run_command(f'"{python}" load_fixtures.py', "Loading fixture data..."):
        return False
    
    # Step 3: Create superuser
    print("\nStep 3/4: Create superuser")
    print("="*50)
    print(" Creating superuser account...")
    print("="*50)
    
    # Check if superuser already exists
    check_superuser = subprocess.run(
        f'"{python}" manage.py shell -c "from users.models import CustomUser; print(CustomUser.objects.filter(is_superuser=True).exists())"',
        shell=True,
        capture_output=True,
        text=True
    )
    
    if 'True' in check_superuser.stdout:
        print("✅ Superuser already exists. Skipping...")
    else:
        # Interactive superuser creation
        subprocess.run(f'"{python}" manage.py createsuperuser', shell=True)
    
    # Mark setup as complete
    SETUP_MARKER.touch()
    print("\n✅ First-time setup complete!")
    return True


def run_server(port=8000):
    """Start Django development server."""
    python = get_python_executable()
    
    print(f"\n🌐 Starting Django server on port {port}...")
    print(f"   Access at: http://localhost:{port}/")
    print(f"   Admin at:  http://localhost:{port}/admin/")
    print("\n   Press Ctrl+C to stop.\n")
    
    try:
        os.system(f'"{python}" manage.py runserver {port}')
    except KeyboardInterrupt:
        pass
    
    print("\n\n👋 Server stopped.")


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
            print("\n Setup failed. Please fix errors and try again.")
            sys.exit(1)
    else:
        print(" Setup already complete. Starting server...")
    
    # Start server
    run_server(port)


if __name__ == '__main__':
    main()
