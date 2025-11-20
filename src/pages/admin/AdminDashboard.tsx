import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobsContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, Trash2, CheckCircle2, XCircle, Eye, Users, Briefcase, UserRound, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { jobs, updateJob, deleteJob, deleteJobsByStatus, removeJobsByOwner } = useJobs();
  const navigate = useNavigate();
  const USERS_KEY = 'jobfinder_users';
  const { toast } = useToast();

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const approvedJobs = jobs.filter(j => j.status === 'approved');
  const rejectedJobs = jobs.filter(j => j.status === 'rejected');

  const [allUsers, setAllUsers] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Đồng bộ khi tab khác thay đổi localStorage / khi reload
  useEffect(() => {
    const sync = () => {
      try {
        setAllUsers(JSON.parse(localStorage.getItem(USERS_KEY) || "[]"));
      } catch {
        setAllUsers([]);
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const adminAccounts = allUsers.filter((u: any) => u.role === 'admin');
  const normalAccounts = allUsers.filter((u: any) => u.role === 'user');

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

  const handleDeleteJob = (jobId: string) => {
    if (!confirm('Xoá bài đăng này?')) return;
    deleteJob(jobId);
    toast({ title: 'Đã xoá bài đăng' });
  };

  const handleBulkDelete = (status: 'approved' | 'rejected') => {
    const label = status === 'approved' ? 'đã duyệt' : 'đã từ chối';
    if (!confirm(`Xoá tất cả bài ${label}?`)) return;
    deleteJobsByStatus?.([status]);
    toast({ title: `Đã xoá tất cả bài ${label}` });
  };

  function EmptyState({ text }: { text: string }) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    );
  }

  const handleDeleteUser = (id: string) => {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;

    if (user.role === 'admin') {
      // lớp bảo vệ, dù UI không hiển thị nút này với admin
      toast({ title: 'Không thể xoá tài khoản quản trị viên', variant: 'destructive' });
      return;
    }

    if (!confirm(`Bạn có chắc muốn xoá tài khoản "${user.name || user.email}"?`)) return;

    // 1) Xoá khỏi localStorage
    const remaining = allUsers.filter(u => u.id !== id);
    localStorage.setItem(USERS_KEY, JSON.stringify(remaining));
    setAllUsers(remaining);

    // 2) (Tuỳ chọn) dọn bài đăng/ứng tuyển của user này
    // Nếu JobsContext đã có helper,gọi:
    removeJobsByOwner?.(id)
    // hoặc tự lọc và lưu lại jobs ở JobsContext nếu bạn đã expose các api tương ứng.

    toast({ title: 'Đã xoá tài khoản' });
  };

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-16" />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Trang quản trị viên</h1>

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
                <CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{rejectedJobs.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tài khoản</CardTitle>
                <UsersIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{allUsers.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
              <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
              <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
              <TabsTrigger value="users">Tài khoản</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingJobs.length === 0 ? (
                <EmptyState text="Không có tin nào đang chờ duyệt" />
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
                            variant="view"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="approved"
                            onClick={() => handleApprove(job.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="rejected"
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
              {approvedJobs.length === 0 ? (
                <EmptyState text="Không có tin nào đã duyệt" />
              ) : (
                <>
                  {approvedJobs.length > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkDelete('approved')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xoá tất cả bài đã duyệt
                      </Button>
                    </div>
                  )}
                  {approvedJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          {/* LEFT: info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge variant="approved">Đã duyệt</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                              <span>{job.location}</span>
                              <span>{job.salary}</span>
                            </div>
                          </div>

                          {/* RIGHT: actions (cố định mép phải, luôn thẳng hàng) */}
                          <div className="shrink-0 flex items-center gap-2">
                            <Button
                              variant="view"
                              size="icon"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              aria-label="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="rejected"
                              size="icon"
                              onClick={() => handleDeleteJob(job.id)}
                              aria-label="Xoá bài đăng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {rejectedJobs.length === 0 ? (
                <EmptyState text="Không có tin nào đã từ chối" />
              ) : (
                <>
                  {rejectedJobs.length > 0 && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleBulkDelete('rejected')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xoá tất cả bài đã từ chối
                      </Button>
                    </div>
                  )}
                  {rejectedJobs.map((job) => (
                    <Card key={job.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          {/* LEFT */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <Badge variant="rejected">Đã từ chối</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <div className="mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                              <span>{job.location}</span>
                              <span>{job.salary}</span>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="shrink-0 flex items-center gap-2">
                            <Button
                              variant="view"
                              size="icon"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              aria-label="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="approved"
                              size="sm"
                              onClick={() => handleApprove(job.id)}>
                              Duyệt lại
                            </Button>

                            <Button
                              variant="rejected"
                              size="icon"
                              onClick={() => handleDeleteJob(job.id)}
                              aria-label="Xoá bài đăng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>

                    </Card>
                  ))}
                </>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-8">
              {/* Nhóm Admin */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Quản trị viên ({adminAccounts.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {adminAccounts.map((u: any) => (
                    <Card key={u.email}>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <UserRound className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-sm text-muted-foreground">{u.email}</div>
                          <div className="mt-2">
                            <Badge variant="default">Admin</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {adminAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground">Chưa có quản trị viên.</p>
                  )}
                </div>
              </div>

              {/* Nhóm User */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Tài khoản thường ({normalAccounts.length})
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {normalAccounts.map((u: any) => (
                    <Card key={u.email}>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          {/* LEFT: avatar + info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <UserRound className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-semibold">{u.name}</div>
                                <div className="text-sm text-muted-foreground">{u.email}</div>
                                <Badge variant="secondary">User</Badge>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: actions (chỉ user) */}
                          <div className="shrink-0 flex items-center gap-2">

                            {/* Xoá tài khoản */}
                            <Button
                              variant="rejected"
                              size="icon"
                              className="hover:bg-gray-100"
                              onClick={() => handleDeleteUser(u.id)}
                              aria-label="Xoá tài khoản"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {normalAccounts.length === 0 && (
                    <p className="text-sm text-muted-foreground">Chưa có tài khoản thường.</p>
                  )}
                </div>
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
