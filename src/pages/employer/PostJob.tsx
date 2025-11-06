import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs, JobType } from '@/contexts/JobsContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

const PostJob = () => {
  const { user } = useAuth();
  const { addJob } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    type: '' as JobType | '',
    category: '',
    description: '',
    requirements: '',
    benefits: '',
    contactEmail: '',
    companyName: '',
  });

  const [salaryValue, setSalaryValue] = useState<number>(10); // 10tr mặc định
  const salaryLabel =
    salaryValue === 2 ? 'Từ 2 triệu trở xuống'
      : salaryValue === 30 ? 'Từ 30 triệu trở lên'
        : `${salaryValue} triệu`;

  const categories = [
    'IT - Phần mềm', 'Data', 'AI/ML', 'An ninh mạng',
    'Marketing', 'Content', 'Báo chí - Truyền thông',
    'Design', 'UX/UI',
    'Sales', 'Chăm sóc khách hàng',
    'Kế toán', 'Tài chính - Ngân hàng', 'Pháp lý',
    'Nhân sự', 'QA/QC',
    'Sản xuất', 'Logistics', 'Xây dựng', 'Bất động sản', 'Giáo dục', 'Y tế'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Bắt buộc chọn hình thức làm việc và ngành nghê
    if (!formData.type) {
      toast({
        title: "Thiếu hình thức làm việc",
        description: "Vui lòng chọn hình thức làm việc.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Thiếu ngành nghề",
        description: "Vui lòng chọn ngành nghề.",
        variant: "destructive",
      });
      return;
    }

    // Đảm bảo có nhãn lương nếu user chưa kéo slider
    const salaryText = formData.salary || salaryLabel;

    addJob({
      title: formData.title,
      location: formData.location,
      salary: salaryText,
      type: formData.type as JobType,          // đã validate ở trên
      category: formData.category,
      description: formData.description,
      company: formData.companyName || user.company || user.name,
      companyLogo: user.avatar,
      employerId: user.id,
      contactEmail: formData.contactEmail,
      requirements: formData.requirements.split("\n").filter(r => r.trim()),
      benefits: formData.benefits.split("\n").filter(b => b.trim()),
    });

    toast({
      title: "Đăng tin thành công!",
      description: "Tin tuyển dụng của bạn đang chờ duyệt",
    });

    navigate('/employer/dashboard');
  };

  if (!user || !['user', 'admin'].includes(user.role)) {
    navigate('/');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Đăng tin tuyển dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2">
                  <Label htmlFor="companyName">Tên Công ty / Tổ chức *</Label>
                  <Input id="companyName" placeholder="VD: Công ty TNHH ABC"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email liên lạc *</Label>
                  <Input id="contactEmail" type="email" placeholder="Email Công ty / Tổ chức"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề công việc *</Label>
                  <Input
                    id="title"
                    placeholder="VD: Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Địa điểm *</Label>
                  <Input
                    id="location"
                    placeholder="VD: 123/456 đường ABC, phường XX, quận YY, thành phố ZZ"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mức lương *</Label>
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 text-sm text-muted-foreground">
                      Kéo để chọn mức lương:{" "}
                      <span className="font-medium text-foreground">{salaryLabel}</span>
                    </div>
                    <Slider
                      value={[salaryValue]}
                      min={2}
                      max={30}
                      step={0.5}
                      onValueChange={(v) => {
                        const val = v[0];
                        setSalaryValue(val);
                        const label =
                          val === 2 ? "Từ 2 triệu trở xuống" :
                            val === 30 ? "Từ 30 triệu trở lên" :
                              `${val} triệu`;
                        setFormData({ ...formData, salary: label });
                      }}
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Từ 2 triệu trở xuống</span>
                      <span>Từ 30 triệu trở lên</span>
                    </div>
                  </div>
                </div>


                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Hình thức làm việc *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as JobType })}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Chọn hình thức làm việc" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Ngành nghề *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngành nghề" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả công việc *</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả chi tiết về công việc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Yêu cầu ứng viên *</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Mỗi yêu cầu một dòng&#10;VD:&#10;3+ năm kinh nghiệm React&#10;Thành thạo TypeScript"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Quyền lợi *</Label>
                  <Textarea
                    id="benefits"
                    placeholder="Mỗi quyền lợi một dòng&#10;VD:&#10;Lương thưởng cạnh tranh&#10;Bảo hiểm đầy đủ"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Đăng tin
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Hủy
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostJob;
