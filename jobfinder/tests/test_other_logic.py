from django.test import TestCase
from django.core.exceptions import ValidationError

from .models import Form, WorkFormat, JobType, VerifiedCompany, Currency


class OtherFieldValidationTests(TestCase):
    def setUp(self):
        self.other_wf = WorkFormat.objects.create(code='other', name='Other')
        self.other_jt = JobType.objects.create(code='other', name='Other')
        self.other_cc = Currency.objects.create(code='other', name='Other')
        self.other_vc = VerifiedCompany.objects.create(code='other', name='Other')

    def test_form_requires_other_text_when_other_selected(self):
        f = Form(
            title='Test Role',
            verified_company=self.other_vc,
            work_format=self.other_wf,
            job_type=self.other_jt,
            salary_currency=self.other_cc,
        )
        with self.assertRaises(ValidationError):
            f.full_clean()

    def test_form_accepts_other_text(self):
        f = Form(
            title='Test Role',
            verified_company=self.other_vc,
            verified_company_other='ACME Inc (unverified)',
            work_format=self.other_wf,
            work_format_other='Hybrid',
            job_type=self.other_jt,
            job_type_other='Contractor',
            salary_currency=self.other_cc,
            salary_currency_other='XYZ',
        )
        # should not raise
        f.full_clean()
