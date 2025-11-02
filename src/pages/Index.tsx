import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Search, MapPin, Briefcase, Users, Building2 } from 'lucide-react';

const Index = () => {
  const { jobs } = useJobs();
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const approvedJobs = jobs.filter(job => job.status === 'approved').slice(0, 6);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchKeyword) params.set('keyword', searchKeyword);
    if (searchLocation) params.set('location', searchLocation);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl lg:max-w-5xl text-center text-white">
              <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl lg:whitespace-nowrap tracking-tight">
                Tìm công việc mơ ước của bạn
              </h1>
              <p className="mb-8 text-lg md:text-xl opacity-90">
                Hàng ngàn cơ hội việc làm đang chờ đón bạn!
              </p>

              {/* Search Box */}
              <div className="mx-auto max-w-2xl">
                <div className="flex flex-col md:flex-row gap-3 bg-white rounded-lg p-3 shadow-xl">
                  <div className="flex-1 flex items-center gap-2 px-3 border-r border-border/50">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Vị trí, công ty..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="border-0 focus-visible:ring-0 text-slate-900 placeholder:text-slate-500 caret-slate-900"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-2 px-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Địa điểm"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="border-0 focus-visible:ring-0 text-slate-900 placeholder:text-slate-500 caret-slate-900"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button size="lg" onClick={handleSearch} className="md:w-auto">
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{jobs.length}+</div>
                <div className="text-sm text-muted-foreground">Việc làm</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Công ty</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Ứng viên</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Đã tuyển dụng</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Việc làm nổi bật</h2>
              <p className="text-muted-foreground">Khám phá các cơ hội việc làm hấp dẫn</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {approvedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" onClick={() => navigate('/jobs')}>
                Xem tất cả việc làm
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-hero py-16">
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Bạn là nhà tuyển dụng?</h2>
            <p className="text-lg mb-8 opacity-90">
              Đăng tin tuyển dụng và tìm kiếm ứng viên phù hợp
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/register')}
            >
              Đăng ký ngay
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
