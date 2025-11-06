import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Check, X, User as UserIcon, Plus, Briefcase, Users, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const {
    getJobsByEmployer,
    applications,
    deleteJob,
    approveApplication,
    rejectApplication,
  } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!user || !['user', 'admin'].includes(user.role)) {
    navigate('/');
    return null;
  }

  // Lấy jobs của employer
  const employerJobs = getJobsByEmployer(user.id);
  const approvedJobsCount = employerJobs.filter(j => j.status === 'approved').length;
  const rejectedJobsCount = employerJobs.filter(j => j.status === 'rejected').length;

  // Gộp ứng viên cho các job của employer
  const jobApplications = applications.filter(app =>
    employerJobs.some(job => job.id === app.jobId)
  );

  // Badge trạng thái job
  const jobStatusBadge = (status: string) => {
    const style: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const text: Record<string, string> = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
    };
    return (
      <Badge
        className={`${style[status]} pointer-events-none cursor-default hover:bg-inherit hover:text-inherit hover:opacity-100`}
      >
        {text[status]}
      </Badge>
    );
  };

  // Badge trạng thái ứng viên
  const appStatusBadge = (status: string) => {
    const style: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const text: Record<string, string> = {
      pending: 'Đang chờ',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
    };
    return (
      <Badge
        className={`${style[status]} pointer-events-none cursor-default hover:bg-inherit hover:text-inherit hover:opacity-100`}
      >
        {text[status]}
      </Badge>
    );
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
      deleteJob(jobId);
      toast({ title: 'Đã xóa', description: 'Tin tuyển dụng đã được xóa' });
    }
  };

  const getJobTitle = (jobId: string) =>
    employerJobs.find(j => j.id === jobId)?.title || '—';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-16" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Quản lý tin đăng</h1>
              <p className="text-muted-foreground mt-1">{user.company}</p>
            </div>
            <Button onClick={() => navigate('/employer/post-job')}>
              <Plus className="h-4 w-4 mr-2" />
              Đăng tin mới
            </Button>
          </div>

          {/* Stats: thêm thẻ Bị từ chối */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tin đã đăng</CardTitle>
                <Briefcase className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{employerJobs.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Được duyệt</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{approvedJobsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bị từ chối</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{rejectedJobsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ứng viên</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{jobApplications.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Tin đã đăng | Bài đăng bị từ chối | Ứng viên */}
          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs">Tin đã đăng</TabsTrigger>
              <TabsTrigger value="approvedJobs">Được duyệt</TabsTrigger>
              <TabsTrigger value="rejectedJobs">Bị từ chối</TabsTrigger>
              <TabsTrigger value="applications">Ứng viên</TabsTrigger>
            </TabsList>

            {/* Tin đã đăng (ALL) */}
            <TabsContent value="jobs" className="space-y-4">
              {employerJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Chưa có tin nào. Hãy đăng tin đầu tiên!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                employerJobs.map(job => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{job.title}</h3>
                            {jobStatusBadge(job.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.location} • {job.salary} • {job.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Đăng ngày {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="view"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="rejected"
                            className="hover:opacity-90"
                            onClick={() => handleDeleteJob(job.id)}
                            title="Xóa tin"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Tin BỊ TỪ CHỐI */}
            <TabsContent value="approvedJobs" className="space-y-4">
              {employerJobs.filter(j => j.status === 'approved').length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Không có tin nào được duyệt</p>
                  </CardContent>
                </Card>
              ) : (
                employerJobs
                  .filter(j => j.status === 'approved')
                  .map(job => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{job.title}</h3>
                              {jobStatusBadge(job.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job.location} • {job.salary} • {job.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Đăng ngày {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="view"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="rejected"
                              onClick={() => handleDeleteJob(job.id)}
                              title="Xóa tin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            {/* Tin BỊ TỪ CHỐI */}
            <TabsContent value="rejectedJobs" className="space-y-4">
              {employerJobs.filter(j => j.status === 'rejected').length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Không có tin nào bị từ chối</p>
                  </CardContent>
                </Card>
              ) : (
                employerJobs
                  .filter(j => j.status === 'rejected')
                  .map(job => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{job.title}</h3>
                              {jobStatusBadge(job.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {job.location} • {job.salary} • {job.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Đăng ngày {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="view"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="rejected"
                              onClick={() => handleDeleteJob(job.id)}
                              title="Xóa tin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            {/* Ứng viên (HIỂN THỊ TẤT CẢ, không ẩn sau khi duyệt/từ chối) */}
            <TabsContent value="applications" className="space-y-4">
              {jobApplications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Chưa có ứng viên nào</p>
                  </CardContent>
                </Card>
              ) : (
                jobApplications.map(app => (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{app.userName}</h3>
                            <p className="text-sm text-muted-foreground">{app.userEmail}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            {appStatusBadge(app.status)}
                            {app.cvUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={app.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Xem CV
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/profile?id=${encodeURIComponent(app.userId)}`)}
                              title="Xem hồ sơ"
                            >
                              <UserIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {app.coverLetter && (
                          <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Ứng tuyển: {getJobTitle(app.jobId)} •{' '}
                            {new Date(app.appliedDate).toLocaleDateString('vi-VN')}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-success/10 text-success hover:bg-success/20"
                              onClick={() => approveApplication(app.id)}
                              disabled={app.status === 'approved'}
                            >
                              <Check className="h-4 w-4 mr-1" /> Duyệt
                            </Button>
                            <Button
                              size="sm"
                              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                              onClick={() => rejectApplication(app.id)}
                              disabled={app.status === 'rejected'}
                            >
                              <X className="h-4 w-4 mr-1" /> Từ chối
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmployerDashboard;
