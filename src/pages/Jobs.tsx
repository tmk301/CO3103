import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '@/contexts/JobsContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobs } = useJobs();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('type') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [salaryRange, setSalaryRange] = useState(searchParams.get('salary') || 'all');

  const categories = [
    'IT - Phần mềm', 'Data', 'AI/ML', 'An ninh mạng',
    'Marketing', 'Content', 'Báo chí - Truyền thông',
    'Design', 'UX/UI',
    'Sales', 'Chăm sóc khách hàng',
    'Kế toán', 'Tài chính - Ngân hàng', 'Pháp lý',
    'Nhân sự', 'QA/QC',
    'Sản xuất', 'Logistics', 'Xây dựng', 'Bất động sản', 'Giáo dục', 'Y tế'
  ];
  const salaryRanges = ['Dưới 5 triệu', '5-10 triệu', '10-15 triệu', '15-20 triệu', '20-30 triệu', 'Trên 30 triệu'];

  // Chuẩn hoá chuỗi lương -> { min, max } theo đơn vị "triệu"
  const parseSalary = (s: string) => {
    const lower = s.toLowerCase().trim();

    // helper: chuyển "10,5" -> "10.5", rồi parseFloat
    const toNum = (x: string) => parseFloat(x.replace(',', '.'));

    // Dạng "20-30 triệu", "10.5 - 12,5 triệu"
    const range = lower.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/);
    if (range) {
      const a = toNum(range[1]);
      const b = toNum(range[2]);
      return { min: Math.min(a, b), max: Math.max(a, b) };
    }

    // Dạng "15 triệu", "12tr", "10.5 triệu"
    const single = lower.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr)/);
    if (single) {
      const v = toNum(single[1]);
      return { min: v, max: v };
    }

    // Dưới/Ít hơn X (vd: "Dưới 5 triệu", "Ít hơn 2tr", "Dưới 5,5")
    const below = lower.match(/(dưới|ít hơn)\s*(\d+(?:[.,]\d+)?)/);
    if (below) {
      const v = toNum(below[2]);
      return { min: 0, max: v };
    }

    // Trên/Nhiều hơn X (vd: "Trên 30 triệu", "Nhiều hơn 30tr", "Trên 30,5")
    const above = lower.match(/(trên|nhiều hơn)\s*(\d+(?:[.,]\d+)?)/);
    if (above) {
      const v = toNum(above[2]);
      return { min: v, max: Infinity };
    }

    // Không rõ -> cho qua
    return { min: 0, max: Infinity };
  };


  // Kiểm tra jobSalary có thuộc khoảng lựa chọn không
  const matchSalary = (jobSalary: string, filter: string) => {
    if (filter === 'all') return true;

    const { min, max } = parseSalary(jobSalary);

    switch (filter) {
      case 'Dưới 5 triệu':
        return max < 5;
      case '5-10 triệu':
        return min < 10 && max >= 5;
      case '10-15 triệu':
        return min < 15 && max >= 10;
      case '15-20 triệu':
        return min < 20 && max >= 15;
      case '20-30 triệu':
        return min < 30 && max >= 20;
      case 'Trên 30 triệu':
        return min >= 30;
      default:
        return true;
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (job.status !== 'approved') return false;
    if (keyword && !job.title.toLowerCase().includes(keyword.toLowerCase()) &&
      !job.company.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (jobType !== 'all' && job.type !== jobType) return false;
    if (category !== 'all' && job.category !== category) return false;
    if (salaryRange !== 'all' && !matchSalary(job.salary, salaryRange)) return false;

    // Salary filtering logic can be enhanced
    return true;
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    if (jobType !== 'all') params.set('type', jobType);
    if (category !== 'all') params.set('category', category);
    if (salaryRange !== 'all') params.set('salary', salaryRange);
    setSearchParams(params);
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setJobType('all');
    setCategory('all');
    setSalaryRange('all');
    setSearchParams({});
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="h-16" />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="mb-8 rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Bộ lọc tìm kiếm</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Từ khóa</label>
                <Input
                  placeholder="Tên việc; Tên Công ty / Tổ chức..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Địa điểm</label>
                <Input
                  placeholder="Hà Nội, TP.HCM..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Hình thức</label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Ngành nghề</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Mức lương</label>
                <Select value={salaryRange} onValueChange={setSalaryRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {salaryRanges.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Đặt lại
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Tìm thấy {filteredJobs.length} việc làm
            </h2>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Không tìm thấy việc làm phù hợp</p>
              <Button variant="link" onClick={handleReset} className="mt-4">
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
