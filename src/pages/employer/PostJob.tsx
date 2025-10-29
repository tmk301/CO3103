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

const PostJob = () => {
  const { user } = useAuth();
  const { addJob } = useJobs();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'full-time' as JobType,
    category: '',
    description: '',
    requirements: '',
    benefits: '',
  });

  const categories = ['IT - Phần mềm', 'Marketing', 'Design', 'Sales', 'Kế toán', 'Nhân sự'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    addJob({
      ...formData,
      company: user.company || user.name,
      companyLogo: user.avatar,
      employerId: user.id,
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      benefits: formData.benefits.split('\n').filter(b => b.trim()),
    });

    toast({
      title: "Đăng tin thành công!",
      description: "Tin tuyển dụng của bạn đang chờ duyệt",
    });

    navigate('/employer/dashboard');
  };

  if (!user || user.role !== 'employer') {
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
                  <Label htmlFor="title">Tiêu đề công việc *</Label>
                  <Input
                    id="title"
                    placeholder="VD: Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Địa điểm *</Label>
                    <Input
                      id="location"
                      placeholder="VD: Hà Nội"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Mức lương *</Label>
                    <Input
                      id="salary"
                      placeholder="VD: 20-30 triệu"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Hình thức làm việc *</Label>
                    <Select value={formData.type} onValueChange={(value: JobType) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
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
                    placeholder="Mô tả chi tiết về công việc..."
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
                  <p className="text-xs text-muted-foreground">Mỗi yêu cầu trên một dòng</p>
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
                  <p className="text-xs text-muted-foreground">Mỗi quyền lợi trên một dòng</p>
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
