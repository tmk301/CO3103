"""
Script để load tất cả lookup data fixtures.
Chạy: python load_fixtures.py

Fixtures bao gồm:
- users_lookups.json: Role, Status, Gender
- jobfinder_lookups.json: VerifiedCompany, WorkFormat, JobType, Currency, 
                          AdministrativeUnit, Province, District, Ward
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from django.core.management import call_command

def load_all_fixtures():
    """Load tất cả fixtures theo thứ tự đúng"""
    print("=" * 50)
    print("Loading lookup data fixtures...")
    print("=" * 50)
    
    fixtures = [
        ('users/fixtures/users_lookups.json', 'Users lookups (Role, Status, Gender)'),
        ('jobfinder/fixtures/jobfinder_lookups.json', 'Jobfinder lookups (Company, Province, District, Ward, etc.)'),
    ]
    
    for fixture_path, description in fixtures:
        if os.path.exists(fixture_path):
            print(f"\n→ Loading: {description}")
            try:
                call_command('loaddata', fixture_path, verbosity=1)
                print(f"  ✓ Success!")
            except Exception as e:
                print(f"  ✗ Error: {e}")
        else:
            print(f"\n✗ File not found: {fixture_path}")
    
    print("\n" + "=" * 50)
    print("Done!")
    print("=" * 50)

if __name__ == '__main__':
    load_all_fixtures()
