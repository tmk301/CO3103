import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';


const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [search] = useSearchParams();
  const viewedId = search.get('id') || user.id;

  // Lấy danh sách user lưu trong localStorage
  const allUsers = JSON.parse(localStorage.getItem('jobfinder_users') || '[]');

  // User sẽ được hiển thị (ưu tiên theo viewedId)
  const displayUser = allUsers.find((u: any) => u.id === viewedId) || user;

  // Có phải đang xem chính mình không?
  const isSelf = viewedId === user.id;

  const { getUserApplications, jobs } = useJobs();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [cvUrl, setCvUrl] = useState(user?.cvUrl || '');

  const userApplications = user ? getUserApplications(user.id) : [];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ cvUrl });
      toast({
        title: 'Cập nhật thành công',
        description: 'Link CV đã được lưu.',
      });
    } catch (err) {
      toast({
        title: 'Cập nhật thất bại',
        variant: 'destructive',
      });
    }
  };



  const getJobTitle = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
    };
    const labels: Record<string, string> = {
      pending: 'Đang chờ',
      approved: 'Được duyệt',
      rejected: ' Bị từ chối',
    };
    // tắt hover/focus và trỏ chuột
    return (
      <Badge
        className={`${variants[status]} cursor-default pointer-events-none hover:bg-inherit hover:text-inherit focus:ring-0`}
      >
        {labels[status]}
      </Badge>
    );
  };

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null; // tránh render khi đang redirect

  const tabCols = user.role === 'user' ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className={`grid w-full ${tabCols}`}>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Thông tin
              </TabsTrigger>

              {/* CHỈ hiển thị cho user */}
              {displayUser.role === 'user' && isSelf && (
                <TabsTrigger value="applications">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Đã ứng tuyển ({userApplications.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar} alt={displayUser.name} />
                      <AvatarFallback className="text-2xl">{displayUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{displayUser.name}</h3>
                      <p className="text-muted-foreground">{displayUser.email}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Họ và tên */}
                    <div className="grid gap-2">
                      <Label>Họ và tên</Label>
                      <Input
                        value={displayUser?.name ?? ''}
                        readOnly
                        disabled
                        className="pointer-events-none bg-muted/40"
                      />
                    </div>

                    {/* Hàng 1: Ngày sinh + Giới tính */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Ngày sinh */}
                      <div className="grid gap-2">
                        <Label>Ngày sinh</Label>
                        <Input
                          value={displayUser?.dob ? new Date(displayUser.dob).toLocaleDateString('vi-VN') : ''}
                          readOnly
                          disabled
                          className="pointer-events-none bg-muted/40"
                        />
                      </div>

                      {/* Giới tính */}
                      <div className="grid gap-2">
                        <Label>Giới tính</Label>
                        <Input
                          value={displayUser?.gender === 'male' ? 'Nam' : displayUser?.gender === 'female' ? 'Nữ' : ''}
                          readOnly
                          disabled
                          className="pointer-events-none bg-muted/40"
                        />
                      </div>
                    </div>

                    {/* Hàng 2: Số điện thoại + Email */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Số điện thoại */}
                      <div className="grid gap-2">
                        <Label>Số điện thoại</Label>
                        <Input
                          value={displayUser?.phone ?? ''}
                          readOnly
                          disabled
                          className="pointer-events-none bg-muted/40"
                        />
                      </div>

                      {/* Email */}
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input
                          value={displayUser?.email ?? ''}
                          readOnly
                          disabled
                          className="pointer-events-none bg-muted/40"
                        />
                      </div>
                    </div>

                    {/* Link CV */}
                    {isSelf ? (
                      /* ---- CHỈ CHỦ TÀI KHOẢN MỚI THẤY FORM SỬA ---- */
                      <div className="grid gap-2">
                        <Label>Link CV</Label>
                        <Input
                          placeholder="https://..."
                          value={cvUrl}
                          onChange={(e) => setCvUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Dán link Google Drive/Docs, PDF online, hoặc trang CV cá nhân.
                        </p>

                        <div className="flex justify-end">
                          <Button type="submit">Lưu link CV</Button>
                        </div>
                      </div>
                    ) : (
                      /* ---- NGƯỜI KHÁC XEM THÌ CHỈ HIỂN THỊ ---- */
                      <div className="grid gap-2">
                        <Label>Link CV</Label>

                        {displayUser.cvUrl ? (
                          <a
                            href={displayUser.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline break-all"
                          >
                            {displayUser.cvUrl}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Chưa cập nhật CV</span>
                        )}
                      </div>
                    )}

                  </form>

                </CardContent>
              </Card>
            </TabsContent>

            {user.role === 'user' && (
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
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
