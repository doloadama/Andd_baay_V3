import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'andd_baay.settings')
django.setup()

from users.models import User
from sites.models import Site
from projects.models import Project
from market.models import Product
from finance.models import Transaction

def seed_data():
    # Clear existing data
    Transaction.objects.all().delete()
    Product.objects.all().delete()
    Project.objects.all().delete()
    Site.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    print("Seeding data...")

    # Create Users
    u1 = User.objects.create_user('adama@farm.com', 'password123', first_name='Adama', last_name='Traoré', phone='555-0101', location='Kayes', role='FARMER')
    u2 = User.objects.create_user('binta@market.com', 'password123', first_name='Binta', last_name='Diallo', phone='555-0102', location='Sikasso', role='SELLER')
    u3 = User.objects.create_user('moussa@agri.com', 'password123', first_name='Moussa', last_name='Coulibaly', phone='555-0103', location='Koulikoro', role='BOTH')
    u4 = User.objects.create_user('fatou@farm.com', 'password123', first_name='Fatoumata', last_name='Keita', phone='555-0104', location='Ségou', role='FARMER')

    # Create Sites
    s1 = Site.objects.create(farmer=u1, name='Kayes Sun Farm', location='Kayes')
    s2 = Site.objects.create(farmer=u1, name='River Field', location='Kayes')
    s3 = Site.objects.create(farmer=u3, name='Koulikoro Oasis', location='Koulikoro')
    s4 = Site.objects.create(farmer=u4, name='Ségou Fertile Lands', location='Ségou')

    # Create Projects
    p1 = Project.objects.create(site=s1, name='Mango Season 2024', description='Organic Kent mango cultivation.', crop_type='Mango', start_date=date(2024, 3, 1), end_date=date(2024, 8, 15), expected_yield=5000, status='Harvesting')
    p2 = Project.objects.create(site=s2, name='Millet Harvest', description='High-yield pearl millet for local markets.', crop_type='Millet', start_date=date(2024, 6, 1), end_date=date(2024, 10, 30), expected_yield=10000, status='In Progress')
    p3 = Project.objects.create(site=s3, name='Tomato Greenhouse', description='Year-round tomato production.', crop_type='Tomato', start_date=date(2024, 1, 1), end_date=date(2024, 12, 31), expected_yield=2000, status='Completed')
    p4 = Project.objects.create(site=s3, name='Okra Planting', description='Early-season okra for premium price.', crop_type='Okra', start_date=date(2024, 4, 15), end_date=date(2024, 7, 20), expected_yield=1500, status='Harvesting')
    p5 = Project.objects.create(site=s4, name='Rice Paddy Cultivation', description='High-quality rice for export.', crop_type='Rice', start_date=date(2024, 5, 20), end_date=date(2024, 11, 10), expected_yield=25000, status='In Progress')
    
    # Create Products
    Product.objects.create(project=p1, product_name='Organic Kent Mangoes', quantity=2000, price=1.50, unit='kg', availability_status='Available')
    Product.objects.create(project=p3, product_name='Greenhouse Tomatoes', quantity=500, price=2.00, unit='kg', availability_status='Available')
    Product.objects.create(project=p4, product_name='Fresh Okra', quantity=0, price=3.0, unit='kg', availability_status='Out of Stock')

    # Create Transactions
    Transaction.objects.create(user=u1, type='expense', amount=15000, date=date(2024, 1, 20), description='Expense for Tractor Purchase', site=s1, category='Equipment')
    Transaction.objects.create(user=u1, type='expense', amount=1500, date=date(2024, 5, 15), description='Expense for Seed Funding (Millet)', site=s2, project=p2, category='Supplies')
    Transaction.objects.create(user=u1, type='income', amount=1500, date=date(2024, 7, 10), description='Sale of 1000kg Organic Kent Mangoes', site=s1, project=p1)
    
    Transaction.objects.create(user=u3, type='expense', amount=8000, date=date(2023, 12, 5), description='Expense for Greenhouse Setup', site=s3, project=p3, category='Infrastructure')
    Transaction.objects.create(user=u3, type='income', amount=800, date=date(2024, 6, 25), description='Sale of 400kg Greenhouse Tomatoes', site=s3, project=p3)
    
    Transaction.objects.create(user=u4, type='expense', amount=12000, date=date(2024, 3, 10), description='Expense for Irrigation System Upgrade', site=s4, project=p5, category='Infrastructure')

    Transaction.objects.create(user=u2, type='expense', amount=750, date=date(2024, 7, 11), description='Purchase of 500kg Organic Kent Mangoes', category='Supplies')
    Transaction.objects.create(user=u2, type='expense', amount=400, date=date(2024, 6, 26), description='Purchase of 200kg Greenhouse Tomatoes', category='Supplies')

    print("Data seeding complete.")

if __name__ == '__main__':
    seed_data()