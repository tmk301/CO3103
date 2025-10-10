# CO3103 — Backend

This folder contains the backend code for the CO3103 project. The instructions below show how to create and activate a Python virtual environment on Windows (PowerShell), install dependencies, and prepare environment variables.

## Prerequisites

- Python 3.8+ installed and available on PATH
- Git (optional, for cloning the repo)

## Setup (PowerShell)

1. Create a virtual environment in the project root:

```powershell
python -m venv .venv
```

2. Activate the virtual environment (PowerShell):

```powershell
.venv\Scripts\Activate.ps1
# If activation is blocked by execution policy, run this in the same session:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

3. Install project dependencies:

```powershell
pip install -r requirements.txt
```

4. Create a `.env` file in the project root and add any required environment variables. Example variables (adjust as needed):

```
DB_ENGINE=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_DRIVER=
DB_EXTRA_PARAMS=
```

## Running the project (basic)

After activating the virtual environment and setting up `.env`:

```powershell
# From the repo root (where manage.py is located)
python manage.py runserver 8000
```