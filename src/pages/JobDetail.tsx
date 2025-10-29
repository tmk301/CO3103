import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, applyToJob } = useJobs();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const job = getJobById(id || '');

  if (!job) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy công việc</h2>
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
    if (user?.role !== 'jobseeker') {
      toast({
        title: "Lỗi",
        description: "Chỉ ứng viên mới có thể ứng tuyển",
        variant: "destructive",
      });
      return;
    }
    setShowApplyDialog(true);
  };

  const submitApplication = () => {
    if (!user) return;

    applyToJob(job.id, {
      jobId: job.id,
      userId: user.id,
      userName: user.name,
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
                  <AvatarImage src={job.companyLogo} alt={job.company} />
                  <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                    <Building2 className="h-5 w-5" />
                    <span>{job.company}</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-primary">{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Đăng ngày {formatDate(job.postedDate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="default">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.type}
                    </Badge>
                    <Badge variant="outline">{job.category}</Badge>
                  </div>
                </div>

                <Button size="lg" onClick={handleApply}>
                  Ứng tuyển ngay
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Description */}
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Mô tả công việc</h2>
                <p className="text-muted-foreground whitespace-pre-line">{job.description}</p>
              </section>

              {/* Requirements */}
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Yêu cầu ứng viên</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Benefits */}
              <section>
                <h2 className="text-xl font-semibold mb-3">Quyền lợi</h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <Separator className="my-6" />

              <div className="text-center">
                <Button size="lg" onClick={handleApply} className="min-w-[200px]">
                  Ứng tuyển ngay
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
