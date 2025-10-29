import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, Eye, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { jobs, updateJob } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const approvedJobs = jobs.filter(j => j.status === 'approved');
  const rejectedJobs = jobs.filter(j => j.status === 'rejected');

  const allUsers = JSON.parse(localStorage.getItem('jobfinder_users') || '[]');
  const jobSeekers = allUsers.filter((u: any) => u.role === 'jobseeker');
  const employers = allUsers.filter((u: any) => u.role === 'employer');

  const handleApprove = (jobId: string) => {
    updateJob(jobId, { status: 'approved' });
    toast({
      title: "Đã duyệt",
      description: "Tin tuyển dụng đã được phê duyệt",
    });
  };

  const handleReject = (jobId: string) => {
    updateJob(jobId, { status: 'rejected' });
    toast({
      title: "Đã từ chối",
      description: "Tin tuyển dụng đã bị từ chối",
      variant: "destructive",
    });
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
                <Briefcase className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{pendingJobs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{approvedJobs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ứng viên</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobSeekers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Nhà tuyển dụng</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employers.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">
                Chờ duyệt ({pendingJobs.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Đã duyệt ({approvedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Đã từ chối ({rejectedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="users">
                Người dùng ({allUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingJobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Không có tin nào đang chờ duyệt</p>
                  </CardContent>
                </Card>
              ) : (
                pendingJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge className="bg-warning/10 text-warning">Chờ duyệt</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>{job.location}</span>
                            <span>{job.salary}</span>
                            <span>{job.type}</span>
                          </div>
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
                            onClick={() => handleApprove(job.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(job.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge className="bg-success/10 text-success">Đã duyệt</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>{job.location}</span>
                          <span>{job.salary}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge className="bg-destructive/10 text-destructive">Từ chối</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(job.id)}
                      >
                        Duyệt lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {allUsers.map((u: any) => (
                  <Card key={u.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{u.name}</h3>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <Badge variant="outline" className="mt-1">
                            {u.role === 'jobseeker' ? 'Ứng viên' : u.role === 'employer' ? 'Nhà tuyển dụng' : 'Admin'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
