import { useAuth, API_BASE, getAccessToken } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRound, CheckCircle, Clock, Ban, MoreVertical, ShieldX, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  status?: string;
  is_active: boolean;
  date_joined?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'ACTIVE': { label: 'Hoạt động', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
  'INACTIVE': { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800', icon: <ShieldX className="h-3 w-3" /> },
  'PENDING_VERIFICATION': { label: 'Chờ xác minh', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  'LOCKED': { label: 'Đã khoá', color: 'bg-orange-100 text-orange-800', icon: <Lock className="h-3 w-3" /> },
  'SUSPENDED': { label: 'Tạm ngưng', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
  'BANNED': { label: 'Cấm', color: 'bg-red-200 text-red-900', icon: <Ban className="h-3 w-3" /> },
};

const AdminUsers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/api/users/users/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(Array.isArray(data) ? data : (data.results || []));
      } else {
        console.error('Failed to fetch users:', res.status);
      }
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    loadData();
  }, []);

  const adminAccounts = allUsers.filter(u => u.role?.toUpperCase() === 'ADMIN');
  const pendingVerification = allUsers.filter(u => u.status?.toUpperCase() === 'PENDING_VERIFICATION');
  const activeAccounts = allUsers.filter(u => u.status?.toUpperCase() === 'ACTIVE' && u.role?.toUpperCase() !== 'ADMIN');
  const otherAccounts = allUsers.filter(u => 
    u.role?.toUpperCase() !== 'ADMIN' && 
    u.status?.toUpperCase() !== 'PENDING_VERIFICATION' &&
    u.status?.toUpperCase() !== 'ACTIVE'
  );

  const getUserName = (u: User) => {
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
    return name || u.username || u.email;
  };

  const getStatusBadge = (status?: string) => {
    const config = STATUS_CONFIG[status?.toUpperCase() || ''] || { label: status || 'N/A', color: 'bg-gray-100 text-gray-600', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const handleSetStatus = async (userId: number, statusCode: string) => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/api/users/users/${userId}/set-status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: statusCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({ title: 'Thành công', description: data.detail || 'Đã cập nhật trạng thái' });
        fetchUsers();
      } else {
        toast({ title: 'Lỗi', description: data.detail || 'Không thể cập nhật', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật', variant: 'destructive' });
    }
  };

  const isAdmin = user && user.role?.toLowerCase() === 'admin';

  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="h-16" />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 text-center">Đang tải...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-16" />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold mb-8">Quản lý tài khoản</h1>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">Tổng tài khoản</div>
                <div className="text-2xl font-bold">{allUsers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">Chờ xác minh</div>
                <div className="text-2xl font-bold text-yellow-600">{pendingVerification.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">Đang hoạt động</div>
                <div className="text-2xl font-bold text-green-600">{activeAccounts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">Quản trị viên</div>
                <div className="text-2xl font-bold text-blue-600">{adminAccounts.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending">Chờ xác minh ({pendingVerification.length})</TabsTrigger>
              <TabsTrigger value="active">Hoạt động ({activeAccounts.length})</TabsTrigger>
              <TabsTrigger value="other">Khác ({otherAccounts.length})</TabsTrigger>
              <TabsTrigger value="admin">Admin ({adminAccounts.length})</TabsTrigger>
            </TabsList>

            {/* Pending Verification */}
            <TabsContent value="pending" className="space-y-4">
              {pendingVerification.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không có tài khoản nào chờ xác minh</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {pendingVerification.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-yellow-50 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{getUserName(u)}</div>
                              <div className="text-sm text-muted-foreground">{u.email}</div>
                              <div className="mt-1">{getStatusBadge(u.status)}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleSetStatus(u.id, 'ACTIVE')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Xác minh
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'SUSPENDED')}>
                                  <AlertCircle className="h-4 w-4 mr-2" /> Tạm ngưng
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'BANNED')}>
                                  <Ban className="h-4 w-4 mr-2" /> Cấm
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Active Accounts */}
            <TabsContent value="active" className="space-y-4">
              {activeAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không có tài khoản hoạt động</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeAccounts.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold">{getUserName(u)}</div>
                              <div className="text-sm text-muted-foreground">{u.email}</div>
                              <div className="mt-1">{getStatusBadge(u.status)}</div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'INACTIVE')}>
                                <ShieldX className="h-4 w-4 mr-2" /> Vô hiệu hoá
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'LOCKED')}>
                                <Lock className="h-4 w-4 mr-2" /> Khoá
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'SUSPENDED')}>
                                <AlertCircle className="h-4 w-4 mr-2" /> Tạm ngưng
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'BANNED')}>
                                <Ban className="h-4 w-4 mr-2" /> Cấm
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Other status accounts */}
            <TabsContent value="other" className="space-y-4">
              {otherAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không có tài khoản nào</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {otherAccounts.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <UserRound className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <div className="font-semibold">{getUserName(u)}</div>
                              <div className="text-sm text-muted-foreground">{u.email}</div>
                              <div className="mt-1">{getStatusBadge(u.status)}</div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'ACTIVE')}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Kích hoạt
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'PENDING_VERIFICATION')}>
                                <Clock className="h-4 w-4 mr-2" /> Chờ xác minh
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSetStatus(u.id, 'BANNED')}>
                                <Ban className="h-4 w-4 mr-2" /> Cấm
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Admin accounts */}
            <TabsContent value="admin" className="space-y-4">
              {adminAccounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa có quản trị viên</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {adminAccounts.map((u) => (
                    <Card key={u.id}>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <UserRound className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{getUserName(u)}</div>
                          <div className="text-sm text-muted-foreground">{u.email}</div>
                          <div className="mt-2 flex gap-2">
                            <Badge variant="default">Admin</Badge>
                            {getStatusBadge(u.status)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;
