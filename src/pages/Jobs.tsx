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

  const categories = ['IT - Phần mềm', 'Marketing', 'Design', 'Sales', 'Kế toán', 'Nhân sự'];
  const salaryRanges = ['Dưới 10 triệu', '10-15 triệu', '15-20 triệu', '20-30 triệu', 'Trên 30 triệu'];

  const filteredJobs = jobs.filter(job => {
    if (job.status !== 'approved') return false;
    if (keyword && !job.title.toLowerCase().includes(keyword.toLowerCase()) && 
        !job.company.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (jobType !== 'all' && job.type !== jobType) return false;
    if (category !== 'all' && job.category !== category) return false;
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
                  placeholder="Vị trí, công ty..."
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
