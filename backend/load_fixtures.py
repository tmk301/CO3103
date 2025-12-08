"""
Script để load tất cả lookup data fixtures.

Cách dùng:
    python load_fixtures.py                 # Load tất cả fixtures
    python load_fixtures.py --all           # Load tất cả fixtures
    python load_fixtures.py --users         # Chỉ load users lookups
    python load_fixtures.py --basic         # Chỉ load basic lookups
    python load_fixtures.py --province      # Chỉ load province lookups
    python load_fixtures.py --district      # Chỉ load district lookups
    python load_fixtures.py --ward          # Chỉ load ward lookups
    python load_fixtures.py --users --basic # Load nhiều fixtures

Fixtures bao gồm:
- users_lookups.json: Role, Status, Gender
- jobfinder lookups: VerifiedCompany, WorkFormat, JobType, Currency, 
                     AdministrativeUnit, Province, District, Ward
"""
import os
import sys
import argparse
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from django.core.management import call_command

# Định nghĩa tất cả fixtures
ALL_FIXTURES = {
    'users': ('backend/users/fixtures/users_lookups.json', 'Users lookups (Role, Status, Gender)'),
    'basic': ('backend/jobfinder/fixtures/01_lookups_basic.json', 'Basic lookups (Company, WorkFormat, JobType, Currency, AdministrativeUnit)'),
    'province': ('backend/jobfinder/fixtures/01_lookups_province.json', 'Province lookups'),
    'district': ('backend/jobfinder/fixtures/02_lookups_district.json', 'District lookups'),
    'ward1': ('backend/jobfinder/fixtures/03_lookups_ward_part1.json', 'Ward lookups (Part 1/3)'),
    'ward2': ('backend/jobfinder/fixtures/03_lookups_ward_part2.json', 'Ward lookups (Part 2/3)'),
    'ward3': ('backend/jobfinder/fixtures/03_lookups_ward_part3.json', 'Ward lookups (Part 3/3)'),
}

# Thứ tự load fixtures (quan trọng vì có foreign key dependencies)
LOAD_ORDER = ['users', 'basic', 'province', 'district', 'ward1', 'ward2', 'ward3']


def load_fixture(key):
    """Load một fixture theo key"""
    fixture_path, description = ALL_FIXTURES[key]
    if os.path.exists(fixture_path):
        print(f"\n-> Loading: {description}")
        try:
            call_command('loaddata', fixture_path, verbosity=1)
            print(f"  [OK] Success!")
            return True
        except Exception as e:
            print(f"  [ERROR] {e}")
            return False
    else:
        print(f"\n[SKIP] File not found: {fixture_path}")
        return False


def load_fixtures(selected_keys=None):
    """Load fixtures theo danh sách keys, hoặc tất cả nếu không chỉ định"""
    print("=" * 50)
    print("Loading lookup data fixtures...")
    print("=" * 50)
    
    if selected_keys is None:
        # Load tất cả theo thứ tự
        keys_to_load = LOAD_ORDER
    else:
        # Load theo thứ tự đúng (dựa vào LOAD_ORDER)
        keys_to_load = [k for k in LOAD_ORDER if k in selected_keys]
    
    success_count = 0
    for key in keys_to_load:
        if load_fixture(key):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"Done! Loaded {success_count}/{len(keys_to_load)} fixtures.")
    print("=" * 50)


def main():
    parser = argparse.ArgumentParser(
        description='Load lookup data fixtures vào database.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ví dụ:
  python load_fixtures.py                 # Load tất cả
  python load_fixtures.py --users --basic # Load users và basic
  python load_fixtures.py --ward          # Load tất cả ward parts
        """
    )
    
    parser.add_argument('--all', action='store_true', 
                        help='Load tất cả fixtures (mặc định nếu không có option)')
    parser.add_argument('--users', action='store_true', 
                        help='Load users lookups (Role, Status, Gender)')
    parser.add_argument('--basic', action='store_true', 
                        help='Load basic lookups (Company, WorkFormat, JobType, Currency, AdministrativeUnit)')
    parser.add_argument('--province', action='store_true', 
                        help='Load province lookups')
    parser.add_argument('--district', action='store_true', 
                        help='Load district lookups')
    parser.add_argument('--ward', action='store_true', 
                        help='Load tất cả ward lookups (3 parts)')
    
    args = parser.parse_args()
    
    # Xác định fixtures cần load
    selected = []
    
    if args.users:
        selected.append('users')
    if args.basic:
        selected.append('basic')
    if args.province:
        selected.append('province')
    if args.district:
        selected.append('district')
    if args.ward:
        selected.extend(['ward1', 'ward2', 'ward3'])
    
    # Nếu không có option nào hoặc --all thì load tất cả
    if args.all or not selected:
        load_fixtures(None)
    else:
        load_fixtures(selected)


if __name__ == '__main__':
    main()
