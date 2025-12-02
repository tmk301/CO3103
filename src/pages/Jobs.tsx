import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin, DollarSign, Clock, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface JobForm {
  id: number;
  title: string;
  verified_company?: string;
  display_verified_company?: string;
  verified_company_other?: string;
  province?: string;
  province_name?: string;
  district?: string;
  district_name?: string;
  ward?: string;
  ward_name?: string;
  number_of_positions?: number;
  salary_from?: number;
  salary_to?: number;
  salary_currency?: string;
  display_salary_currency?: string;
  work_format?: string;
  job_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
}

interface LookupOption {
  code: string;
  name: string;
}

interface Province {
  id: string;
  name: string;
}

interface Company {
  code: string;
  name: string;
}

interface Currency {
  code: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  province?: string;
}

interface Ward {
  id: string;
  name: string;
  district?: string;
}

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter options from API
  const [workFormats, setWorkFormats] = useState<LookupOption[]>([]);
  const [jobTypes, setJobTypes] = useState<LookupOption[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Filter values
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [province, setProvince] = useState(searchParams.get('province') || 'all');
  const [workFormat, setWorkFormat] = useState(searchParams.get('work_format') || 'all');
  const [jobType, setJobType] = useState(searchParams.get('job_type') || 'all');
  
  // Advanced filters
  const [district, setDistrict] = useState(searchParams.get('district') || 'all');
  const [ward, setWard] = useState(searchParams.get('ward') || 'all');
  const [company, setCompany] = useState(searchParams.get('company') || 'all');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salary_min') || '');
  const [salaryMax, setSalaryMax] = useState(searchParams.get('salary_max') || '');
  const [currency, setCurrency] = useState(searchParams.get('currency') || 'all');
  const [minPositions, setMinPositions] = useState(searchParams.get('min_positions') || '');

  // Fetch filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [wfRes, jtRes, provRes, compRes, currRes] = await Promise.all([
          fetch(`${API_BASE}/api/jobfinder/work-formats/`),
          fetch(`${API_BASE}/api/jobfinder/job-types/`),
          fetch(`${API_BASE}/api/jobfinder/provinces/`),
          fetch(`${API_BASE}/api/jobfinder/verified-companies/`),
          fetch(`${API_BASE}/api/jobfinder/currencies/`),
        ]);
        
        if (wfRes.ok) {
          const data = await wfRes.json();
          setWorkFormats(data.filter((w: LookupOption) => w.code !== 'other'));
        }
        if (jtRes.ok) {
          const data = await jtRes.json();
          setJobTypes(data.filter((j: LookupOption) => j.code !== 'other'));
        }
        if (provRes.ok) {
          const data = await provRes.json();
          setProvinces(data);
        }
        if (compRes.ok) {
          const data = await compRes.json();
          setCompanies(data.filter((c: Company) => c.code !== 'other'));
        }
        if (currRes.ok) {
          const data = await currRes.json();
          setCurrencies(data.filter((c: Currency) => c.code !== 'other'));
        }
      } catch (e) {
        console.error('Failed to fetch filter options', e);
      }
    };
    fetchOptions();
  }, []);

  // Check if there are advanced params on mount and show advanced section
  useEffect(() => {
    if (searchParams.has('district') || searchParams.has('ward') ||
        searchParams.has('company') || searchParams.has('salary_min') || 
        searchParams.has('salary_max') || searchParams.has('currency') ||
        searchParams.has('min_positions')) {
      setShowAdvanced(true);
    }
    // Fetch jobs on mount
    fetchJobs();
  }, []);

  // Auto-search when any filter changes (with debounce for text inputs)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Update URL params
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (province !== 'all') params.set('province', province);
      if (district !== 'all') params.set('district', district);
      if (ward !== 'all') params.set('ward', ward);
      if (workFormat !== 'all') params.set('work_format', workFormat);
      if (jobType !== 'all') params.set('job_type', jobType);
      if (company !== 'all') params.set('company', company);
      if (salaryMin) params.set('salary_min', salaryMin);
      if (salaryMax) params.set('salary_max', salaryMax);
      if (currency !== 'all') params.set('currency', currency);
      if (minPositions) params.set('min_positions', minPositions);
      setSearchParams(params, { replace: true });
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [keyword, province, district, ward, workFormat, jobType, company, salaryMin, salaryMax, currency, minPositions]);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (province === 'all') {
        setDistricts([]);
        setDistrict('all');
        setWards([]);
        setWard('all');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/jobfinder/districts/?province=${province}`);
        if (res.ok) {
          const data = await res.json();
          setDistricts(data);
        }
      } catch (e) {
        console.error('Failed to fetch districts', e);
      }
    };
    fetchDistricts();
  }, [province]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (district === 'all') {
        setWards([]);
        setWard('all');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/jobfinder/wards/?district=${district}`);
        if (res.ok) {
          const data = await res.json();
          setWards(data);
        }
      } catch (e) {
        console.error('Failed to fetch wards', e);
      }
    };
    fetchWards();
  }, [district]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/jobfinder/forms/`);
      if (res.ok) {
        const data = await res.json();
        // Only show approved jobs
        const approvedJobs = data.filter((j: JobForm) => j.status === 'approved');
        setJobs(approvedJobs);
      }
    } catch (e) {
      console.error('Failed to fetch jobs', e);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCompanyName = (job: JobForm) => {
    if (job.display_verified_company) return job.display_verified_company;
    if (job.verified_company_other) return job.verified_company_other;
    return job.verified_company || 'Chưa có công ty';
  };

  const getLocation = (job: JobForm) => {
    const parts = [job.ward_name, job.district_name, job.province_name].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Chưa có địa chỉ';
  };

  const getSalary = (job: JobForm) => {
    if (!job.salary_from) return 'Thương lượng';
    const currency = job.display_salary_currency || job.salary_currency || 'VND';
    if (job.salary_to) {
      return `${job.salary_from.toLocaleString()} - ${job.salary_to.toLocaleString()} ${currency}`;
    }
    return `Từ ${job.salary_from.toLocaleString()} ${currency}`;
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return posted.toLocaleDateString('vi-VN');
  };

  const getWorkFormatColor = (format?: string) => {
    const colors: Record<string, string> = {
      'onsite': 'bg-primary/10 text-primary',
      'remote': 'bg-success/10 text-success',
      'hybrid': 'bg-accent/10 text-accent',
    };
    return colors[format?.toLowerCase() || ''] || 'bg-muted text-muted-foreground';
  };

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter(job => {
    // Keyword search (title, company)
    if (keyword) {
      const kw = keyword.toLowerCase();
      const title = job.title?.toLowerCase() || '';
      const company = getCompanyName(job).toLowerCase();
      if (!title.includes(kw) && !company.includes(kw)) return false;
    }
    
    // Province filter
    if (province !== 'all') {
      if (job.province !== province) return false;
    }
    
    // Work format filter
    if (workFormat !== 'all') {
      if (job.work_format?.toLowerCase() !== workFormat.toLowerCase()) return false;
    }
    
    // Job type filter
    if (jobType !== 'all') {
      if (job.job_type?.toLowerCase() !== jobType.toLowerCase()) return false;
    }

    // District filter
    if (district !== 'all') {
      if (job.district !== district) return false;
    }

    // Ward filter
    if (ward !== 'all') {
      if (job.ward !== ward) return false;
    }

    // Company filter
    if (company !== 'all') {
      if (job.verified_company !== company) return false;
    }

    // Salary filter
    const minSalary = salaryMin ? parseFloat(salaryMin) : null;
    const maxSalary = salaryMax ? parseFloat(salaryMax) : null;
    
    if (minSalary !== null || maxSalary !== null) {
      // Only filter if currency matches (or currency is 'all')
      if (currency !== 'all' && job.salary_currency !== currency) return false;
      
      const jobMin = job.salary_from || 0;
      const jobMax = job.salary_to || job.salary_from || 0;
      
      if (minSalary !== null && jobMax < minSalary) return false;
      if (maxSalary !== null && jobMin > maxSalary) return false;
    }

    // Number of positions filter
    if (minPositions) {
      const minPos = parseInt(minPositions);
      if (!isNaN(minPos) && (job.number_of_positions || 1) < minPos) return false;
    }

    return true;
  });

  const handleReset = () => {
    setKeyword('');
    setProvince('all');
    setDistrict('all');
    setWard('all');
    setWorkFormat('all');
    setJobType('all');
    setCompany('all');
    setSalaryMin('');
    setSalaryMax('');
    setCurrency('all');
    setMinPositions('');
    setShowAdvanced(false);
    setSearchParams({}, { replace: true });
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Từ khóa</label>
                <Input
                  placeholder="Tên việc, tên công ty..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tỉnh/Thành phố</label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {provinces.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Hình thức làm việc</label>
                <Select value={workFormat} onValueChange={setWorkFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {workFormats.map(wf => (
                      <SelectItem key={wf.code} value={wf.code}>{wf.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Loại công việc</label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {jobTypes.map(jt => (
                      <SelectItem key={jt.code} value={jt.code}>{jt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Search Collapsible */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="mt-4">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Tìm kiếm nâng cao
                  </span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Location filters */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quận/Huyện</label>
                    <Select value={district} onValueChange={setDistrict} disabled={province === 'all'}>
                      <SelectTrigger>
                        <SelectValue placeholder={province === 'all' ? 'Chọn tỉnh trước' : 'Tất cả'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {districts.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Phường/Xã</label>
                    <Select value={ward} onValueChange={setWard} disabled={district === 'all'}>
                      <SelectTrigger>
                        <SelectValue placeholder={district === 'all' ? 'Chọn quận/huyện trước' : 'Tất cả'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {wards.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Công ty</label>
                    <Select value={company} onValueChange={setCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {companies.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Số lượng tuyển tối thiểu</label>
                    <Input
                      type="number"
                      placeholder="1"
                      min="1"
                      value={minPositions}
                      onChange={(e) => setMinPositions(e.target.value)}
                    />
                  </div>

                  {/* Salary filters */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mức lương tối thiểu</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Mức lương tối đa</label>
                    <Input
                      type="number"
                      placeholder="Không giới hạn"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Đơn vị tiền tệ</label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {currencies.map(c => (
                          <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Reset Button */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleReset}>
                Đặt lại bộ lọc
              </Button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Đang tải...</div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Tìm thấy {filteredJobs.length} việc làm
                </h2>
              </div>

              {filteredJobs.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border">
                            <AvatarFallback>{getCompanyName(job).charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">{getCompanyName(job)}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{getLocation(job)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{getSalary(job)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(job.created_at)}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {job.work_format && (
                                <Badge className={getWorkFormatColor(job.work_format)}>
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {job.work_format}
                                </Badge>
                              )}
                              {job.job_type && (
                                <Badge variant="outline">{job.job_type}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-6 pt-0">
                        <Button 
                          className="w-full" 
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          Xem chi tiết
                        </Button>
                      </CardFooter>
                    </Card>
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
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jobs;
