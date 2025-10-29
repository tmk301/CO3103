import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, FileText, Briefcase } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { getUserApplications, jobs } = useJobs();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [cvUrl, setCvUrl] = useState(user?.cvUrl || '');

  const userApplications = user ? getUserApplications(user.id) : [];

  const handleUpdateProfile = () => {
    updateProfile({ name, cvUrl });
    toast({
      title: "Cập nhật thành công!",
      description: "Hồ sơ của bạn đã được cập nhật",
    });
  };

  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      reviewed: 'bg-primary/10 text-primary',
      accepted: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, string> = {
      pending: 'Đang chờ',
      reviewed: 'Đã xem',
      accepted: 'Chấp nhận',
      rejected: 'Từ chối',
    };
    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  if (!user || user.role !== 'jobseeker') {
    navigate('/');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="applications">
                <Briefcase className="h-4 w-4 mr-2" />
                Đã ứng tuyển ({userApplications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cv">Link CV</Label>
                      <Input
                        id="cv"
                        placeholder="https://drive.google.com/..."
                        value={cvUrl}
                        onChange={(e) => setCvUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Nhập link Google Drive, Dropbox hoặc link lưu trữ CV của bạn
                      </p>
                    </div>

                    <Button onClick={handleUpdateProfile}>
                      Lưu thay đổi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <div className="space-y-4">
                {userApplications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Bạn chưa ứng tuyển công việc nào</p>
                      <Button className="mt-4" onClick={() => navigate('/jobs')}>
                        Tìm việc ngay
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  userApplications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">
                              {getJobTitle(app.jobId)}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Ứng tuyển ngày {new Date(app.appliedDate).toLocaleDateString('vi-VN')}
                            </p>
                            {app.coverLetter && (
                              <p className="text-sm mt-2">{app.coverLetter}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(app.status)}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/jobs/${app.jobId}`)}
                            >
                              Xem tin
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
