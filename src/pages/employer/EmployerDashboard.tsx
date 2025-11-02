import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Briefcase, Users, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { getJobsByEmployer, applications, deleteJob } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();

  const employerJobs = user ? getJobsByEmployer(user.id) : [];
  const jobApplications = applications.filter(app =>
    employerJobs.some(job => job.id === app.jobId)
  );

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
      deleteJob(jobId);
      toast({
        title: "Đã xóa",
        description: "Tin tuyển dụng đã được xóa",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, string> = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getJobTitle = (jobId: string) => {
    const job = employerJobs.find(j => j.id === jobId);
    return job?.title || 'Unknown';
  };

  if (!user || user.role !== 'user') {
    navigate('/');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Nhà tuyển dụng</h1>
              <p className="text-muted-foreground mt-1">{user.company}</p>
            </div>
            <Button onClick={() => navigate('/employer/post-job')}>
              <Plus className="h-4 w-4 mr-2" />
              Đăng tin mới
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tổng tin đăng</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employerJobs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {employerJobs.filter(j => j.status === 'approved').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ứng viên</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobApplications.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs">Tin đã đăng</TabsTrigger>
              <TabsTrigger value="applications">
                Ứng viên ({jobApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-4">
              {employerJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Bạn chưa đăng tin tuyển dụng nào</p>
                    <Button onClick={() => navigate('/employer/post-job')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Đăng tin đầu tiên
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                employerJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{job.location}</span>
                            <span>{job.salary}</span>
                            <span>{job.type}</span>
                          </div>
                          <p className="text-sm">
                            Đăng ngày {new Date(job.postedDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteJob(job.id)}
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

            <TabsContent value="applications" className="space-y-4">
              {jobApplications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Chưa có ứng viên nào ứng tuyển</p>
                  </CardContent>
                </Card>
              ) : (
                jobApplications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{app.userName}</h3>
                            <p className="text-sm text-muted-foreground">{app.userEmail}</p>
                          </div>
                          <Badge variant="outline">
                            Ứng tuyển: {getJobTitle(app.jobId)}
                          </Badge>
                        </div>
                        {app.coverLetter && (
                          <div>
                            <p className="text-sm font-medium mb-1">Thư xin việc:</p>
                            <p className="text-sm text-muted-foreground">{app.coverLetter}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {new Date(app.appliedDate).toLocaleDateString('vi-VN')}
                          </p>
                          {app.cvUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                                Xem CV
                              </a>
                            </Button>
                          )}
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
