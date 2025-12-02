import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth, API_BASE, getAccessToken } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  MapPin, DollarSign, Briefcase, Clock, Building2,
  CheckCircle2, ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface JobForm {
  id: number;
  title: string;
  verified_company?: string;
  display_verified_company?: string;
  verified_company_other?: string;
  province_name?: string;
  district_name?: string;
  ward_name?: string;
  address?: string;
  salary_from?: number;
  salary_to?: number;
  salary_currency?: string;
  display_salary_currency?: string;
  work_format?: string;
  job_type?: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  required_experience?: string;
  benefits?: string;
  contact_email?: string;
  application_email?: string;
  application_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { applyToJob } = useJobs();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [job, setJob] = useState<JobForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch job from API
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = await getAccessToken();
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE}/api/jobfinder/forms/${id}/`, { headers });
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        } else if (res.status === 404) {
          setError('Không tìm thấy công việc');
        } else {
          setError('Có lỗi xảy ra');
        }
      } catch (e) {
        setError('Không thể tải thông tin công việc');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  // Helper functions
  const getCompanyName = () => {
    if (job?.verified_company === 'other' && job?.verified_company_other) {
      return job.verified_company_other;
    }
    return job?.display_verified_company || job?.verified_company || 'Chưa có công ty';
  };

  const getLocation = () => {
    const parts = [job?.address, job?.ward_name, job?.district_name, job?.province_name].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Chưa có địa chỉ';
  };

  const getSalary = () => {
    if (!job?.salary_from) return 'Thương lượng';
    const currency = job.display_salary_currency || job.salary_currency || 'VND';
    if (job.salary_to) {
      return `${job.salary_from.toLocaleString()} - ${job.salary_to.toLocaleString()} ${currency}`;
    }
    return `Từ ${job.salary_from.toLocaleString()} ${currency}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Split text by newlines into array
  const textToList = (text?: string) => {
    if (!text) return [];
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{error || 'Không tìm thấy công việc'}</h2>
            <Button onClick={() => navigate('/jobs')}>Quay lại danh sách</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'user') {
      toast({
        title: "Lỗi",
        description: "Chỉ users mới có thể ứng tuyển",
        variant: "destructive",
      });
      return;
    }
    setShowApplyDialog(true);
  };

  const submitApplication = () => {
    if (!user || !job) return;

    applyToJob(String(job.id), {
      jobId: String(job.id),
      userId: user.id,
      userName: user.name || user.username || '',
      userEmail: user.email,
      cvUrl: user.cvUrl,
      coverLetter,
    });

    toast({
      title: "Ứng tuyển thành công!",
      description: "Hồ sơ của bạn đã được gửi đến nhà tuyển dụng",
    });

    setShowApplyDialog(false);
    setCoverLetter('');
  };

  const companyName = getCompanyName();
  const requirementsList = textToList(job.requirements);
  const benefitsList = textToList(job.benefits);
  const responsibilitiesList = textToList(job.responsibilities);

  // Check if current user is the owner of this job (created_by returns username)
  const isOwner = isAuthenticated && user && user.username === job.created_by;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <Card>
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="h-20 w-20 border">
                  <AvatarFallback>{companyName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                    <Building2 className="h-5 w-5" />
                    <span>{companyName}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getLocation()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">{getSalary()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Đăng ngày {formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.work_format && (
                      <Badge variant="default">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {job.work_format}
                      </Badge>
                    )}
                    {job.job_type && (
                      <Badge variant="outline">{job.job_type}</Badge>
                    )}
                  </div>
                </div>

                {!isOwner && (
                  <Button size="lg" onClick={handleApply}>
                    Ứng tuyển ngay
                  </Button>
                )}
              </div>

              <Separator className="my-6" />

              {/* Description */}
              {job.description && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Mô tả công việc</h2>
                  <p className="text-muted-foreground whitespace-pre-line break-words leading-relaxed">{job.description}</p>
                </section>
              )}

              {/* Responsibilities */}
              {responsibilitiesList.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Trách nhiệm công việc</h2>
                  <ul className="space-y-2">
                    {responsibilitiesList.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Requirements */}
              {requirementsList.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Yêu cầu ứng viên</h2>
                  <ul className="space-y-2">
                    {requirementsList.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 break-words" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Required Experience */}
              {job.required_experience && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Kinh nghiệm yêu cầu</h2>
                  <p className="text-muted-foreground">{job.required_experience}</p>
                </section>
              )}

              {/* Benefits */}
              {benefitsList.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 break-words">Quyền lợi</h2>
                  <ul className="space-y-2">
                    {benefitsList.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Separator className="my-6" />

              {/* Contact Email */}
              {(job.contact_email || job.application_email) && (
                <section className="mb-2">
                  <h2 className="text-xl font-semibold mb-3">Email liên hệ</h2>
                  <a
                    href={`mailto:${job.application_email || job.contact_email}`}
                    className="text-primary underline underline-offset-4 break-words"
                  >
                    {job.application_email || job.contact_email}
                  </a>
                </section>
              )}

              {/* Application URL */}
              {job.application_url && (
                <section className="mb-2">
                  <h2 className="text-xl font-semibold mb-3">Link ứng tuyển</h2>
                  <a
                    href={job.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4 break-words"
                  >
                    {job.application_url}
                  </a>
                </section>
              )}

              <Separator className="my-6" />

              <div className="text-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="min-w-[200px]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </main>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ứng tuyển vào vị trí {job.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Thư xin việc</label>
              <Textarea
                placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              CV của bạn sẽ được tự động đính kèm từ hồ sơ.
            </div>
            <div className="flex gap-2">
              <Button onClick={submitApplication} className="flex-1">
                Gửi ứng tuyển
              </Button>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default JobDetail;
