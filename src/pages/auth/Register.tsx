import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    dobDay: '' as number | '',
    dobMonth: '' as number | '',
    dobYear: '' as number | '',
    gender: '' as string | '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';
  const [genders, setGenders] = useState<Array<{ code: string; name: string }>>([]);

  // Load gender options from backend so codes are authoritative
  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/api/users/genders/`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setGenders(data.map((g: any) => ({ code: g.code, name: g.name })));
      })
      .catch(() => {
        // ignore; fallback to built-in options below
      });
    return () => { mounted = false; };
  }, []);

  // Giới hạn năm sinh
  const MAX_YEAR = 2007;
  const MIN_YEAR = 1900;

  // Số ngày trong tháng (month: 1-12)
  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month, 0).getDate();

  // Reset "ngày" nếu vượt quá số ngày hợp lệ khi đổi tháng/năm
  useEffect(() => {
    const { dobDay, dobMonth, dobYear } = formData;
    if (dobMonth && dobYear && dobDay) {
      const maxDay = getDaysInMonth(Number(dobMonth), Number(dobYear));
      if (Number(dobDay) > maxDay) {
        setFormData({ ...formData, dobDay: '' });
      }
    }
  }, [formData.dobMonth, formData.dobYear]);

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [loading, setLoading] = useState(false);

  // Cho phép CHỈ chữ cái (mọi ngôn ngữ) và khoảng trắng – không số, không ký tự đặc biệt
  const NAME_REGEX = /^[\p{L}\s]+$/u;

  // Chấp nhận các nhà cung cấp phổ biến (bạn có thể thêm/bớt domain ở đây)
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(demo\.com|gmail\.com|googlemail\.com|yahoo\.com|ymail\.com|outlook\.com|hotmail\.com|live\.com|msn\.com|icloud\.com|proton\.me|protonmail\.com)$/i;

  // Điện thoại đúng 10 chữ số
  const PHONE_REGEX = /^\d{10}$/;

  const validateRegister = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!NAME_REGEX.test(name)) {
      toast({
        title: "Họ và tên không hợp lệ",
        description: "Chỉ cho phép chữ cái và khoảng trắng (không số, không ký tự đặc biệt).",
        variant: "destructive",
      });
      return false;
    }

    if (!EMAIL_REGEX.test(email)) {
      toast({
        title: "Email không hợp lệ",
        description: "Chỉ chấp nhận các domain: gmail, yahoo, outlook/hotmail/live, icloud, proton…",
        variant: "destructive",
      });
      return false;
    }

    if (!PHONE_REGEX.test(phone)) {
      toast({
        title: "Số điện thoại không hợp lệ",
        description: "Số điện thoại phải gồm đúng 10 chữ số.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegister()) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    const { dobDay, dobMonth, dobYear } = formData;

    if (!dobDay || !dobMonth || !dobYear) {
      toast({ title: "Lỗi", description: "Chọn đầy đủ ngày/tháng/năm sinh", variant: "destructive" });
      return;
    }
    const dobAsDate = new Date(Number(dobYear), Number(dobMonth) - 1, Number(dobDay));
    if (dobAsDate.getFullYear() > 2007) {
      toast({ title: "Lỗi", description: "Năm sinh phải ≤ 2007", variant: "destructive" });
      return;
    }
    const dobISO = dobAsDate.toISOString().slice(0, 10);

    try {
      setLoading(true);

      const success = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender, // pass backend gender code (e.g. 'MALE')
        dob: dobISO,
      });

      if (success) {
        toast({
          title: "Đăng ký thành công!",
          description: "Chào mừng bạn đến với JobFinder",
        });
        navigate('/');
      } else {
        toast({
          title: "Đăng ký thất bại",
          description: "Email đã được sử dụng",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ title: "Lỗi không mong muốn", description: "Vui lòng thử lại sau", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link
              to="/"
              aria-label="Về trang chủ JobFinder"
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-hero
               shadow-md hover:shadow-lg focus-visible:outline-none
               focus-visible:ring-2 focus-visible:ring-blue-600/40 focus-visible:ring-offset-2"
            >
              <Briefcase className="h-7 w-7 text-white" aria-hidden="true" />
            </Link>
          </div>

          <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
          <CardDescription>
            Tạo tài khoản để bắt đầu tìm việc hoặc tuyển dụng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="Họ và tên"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                inputMode="text"
                autoComplete="name"
                className="text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="Tên đăng nhập (ví dụ: khue123)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                inputMode="text"
                autoComplete="username"
                className="text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-12">
              {/* Ngày sinh (trái) – rộng hơn */}
              <div className="space-y-2 md:col-span-9 min-w-0">
                <Label>Ngày sinh</Label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Ngày */}
                  <Select
                    value={formData.dobDay === '' ? '' : String(formData.dobDay)}
                    onValueChange={(v) => setFormData({ ...formData, dobDay: v ? Number(v) : '' })}
                  >
                    <SelectTrigger className="min-w-0">
                      <SelectValue placeholder="Ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const year = Number(formData.dobYear) || MAX_YEAR;
                        const month = Number(formData.dobMonth) || 1;
                        const total = getDaysInMonth(month, year);
                        return Array.from({ length: total }, (_, i) => i + 1).map((d) => (
                          <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>

                  {/* Tháng */}
                  <Select
                    value={formData.dobMonth === '' ? '' : String(formData.dobMonth)}
                    onValueChange={(v) => setFormData({ ...formData, dobMonth: v ? Number(v) : '' })}
                  >
                    <SelectTrigger className="min-w-0">
                      <SelectValue placeholder="Tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Năm */}
                  <Select
                    value={formData.dobYear === '' ? '' : String(formData.dobYear)}
                    onValueChange={(v) => setFormData({ ...formData, dobYear: v ? Number(v) : '' })}
                  >
                    <SelectTrigger className="min-w-0">
                      <SelectValue placeholder="Năm" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i).map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Giới tính (phải) – hẹp lại */}
              <div className="space-y-2 md:col-span-3 md:max-w-[220px] md:ml-auto">
                <Label>Giới tính</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.length > 0 ? (
                      genders.map((g) => <SelectItem key={g.code} value={g.code}>{g.name}</SelectItem>)
                    ) : (
                      // fallback options
                      <>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                pattern="^[0-9+\\-\\s]{8,15}$"
                placeholder="Số điện thoại liên hệ"
                value={formData.phone}
                onChange={(e) => {
                  // chỉ cho phép số, cắt còn 10 ký tự
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: v });
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email thường dùng của bạn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pr-10 text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPw2 ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="pr-10 text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700"
                  aria-label={showPw2 ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
