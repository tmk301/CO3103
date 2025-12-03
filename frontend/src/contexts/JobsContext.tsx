import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as JobAPI from '../lib/jobfinder';

export type JobType = 'full-time' | 'part-time' | 'hybrid' | 'remote';
export type JobStatus = 'pending' | 'approved' | 'rejected';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary: string;
  type: JobType;
  category: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  employerId: string;
  status: JobStatus;
  applications?: Application[];
  contactEmail?: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userEmail: string;
  cvUrl?: string;
  coverLetter: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface JobsContextType {
  jobs: Job[];
  applications: Application[];
  addJob: (job: Omit<Job, 'id' | 'postedDate' | 'status'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  deleteJobsByStatus?: (statuses: JobStatus[]) => void;
  removeJobsByOwner: (ownerId: string) => void;
  applyToJob: (jobId: string, application: Omit<Application, 'id' | 'appliedDate' | 'status'>) => void;
  getJobById: (id: string) => Job | undefined;
  getJobsByEmployer: (employerId: string) => Job[];
  getUserApplications: (userId: string) => Application[];
  approveApplication: (appId: string) => void;
  rejectApplication: (appId: string) => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

const JOBS_KEY = 'jobfinder_jobs';
const APPLICATIONS_KEY = 'jobfinder_applications';

const demoJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp Vietnam',
    contactEmail: 'hr@techcorp.vn',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=TCV',
    location: 'Hà Nội',
    salary: '25-35 triệu',
    type: 'full-time',
    category: 'IT - Phần mềm',
    description: 'Chúng tôi đang tìm kiếm một Senior Frontend Developer có kinh nghiệm với React và TypeScript.',
    requirements: ['3+ năm kinh nghiệm React', 'Thành thạo TypeScript', 'Kinh nghiệm với state management'],
    benefits: ['Lương thưởng cạnh tranh', 'Bảo hiểm đầy đủ', 'Làm việc linh hoạt'],
    postedDate: new Date().toISOString(),
    employerId: '2',
    status: 'approved',
  },
  {
    id: '2',
    title: 'Backend Developer (Node.js)',
    company: 'Startup XYZ',
    contactEmail: 'talent@startupxyz.com',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=XYZ',
    location: 'TP. Hồ Chí Minh',
    salary: '20-30 triệu',
    type: 'remote',
    category: 'IT - Phần mềm',
    description: 'Tham gia phát triển hệ thống backend với Node.js và MongoDB.',
    requirements: ['2+ năm kinh nghiệm Node.js', 'Thành thạo MongoDB', 'Kinh nghiệm với microservices'],
    benefits: ['Remote 100%', 'Du lịch hàng năm', 'Đào tạo nâng cao'],
    postedDate: new Date(Date.now() - 86400000).toISOString(),
    employerId: '2',
    status: 'approved',
  },
  {
    id: '3',
    title: 'Marketing Manager',
    company: 'Digital Agency',
    contactEmail: 'dagency@mkt.com',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DA',
    location: 'Đà Nẵng',
    salary: '15-25 triệu',
    type: 'full-time',
    category: 'Marketing',
    description: 'Quản lý các chiến dịch marketing và phát triển thương hiệu.',
    requirements: ['3+ năm kinh nghiệm Marketing', 'Thành thạo Digital Marketing', 'Khả năng lãnh đạo đội nhóm'],
    benefits: ['Môi trường sáng tạo', 'Thưởng KPI', 'Team building'],
    postedDate: new Date(Date.now() - 172800000).toISOString(),
    employerId: '2',
    status: 'approved',
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    company: 'Design Studio',
    contactEmail: 'ds@uiux.com',
    companyLogo: 'https://api.dicebear.com/7.x/initials/svg?seed=DS',
    location: 'Hà Nội',
    salary: '15-20 triệu',
    type: 'hybrid',
    category: 'Design',
    description: 'Thiết kế giao diện và trải nghiệm người dùng cho các sản phẩm digital.',
    requirements: ['2+ năm kinh nghiệm UI/UX', 'Thành thạo Figma', 'Portfolio mạnh'],
    benefits: ['Hybrid working', 'Công cụ làm việc hiện đại', 'Đào tạo chuyên sâu'],
    postedDate: new Date(Date.now() - 259200000).toISOString(),
    employerId: '2',
    status: 'approved',
  },
];

const initializeJobs = () => {
  const existingJobs = localStorage.getItem(JOBS_KEY);
  if (!existingJobs) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(demoJobs));
  }
  const existingApps = localStorage.getItem(APPLICATIONS_KEY);
  if (!existingApps) {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([]));
  }
};


export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    initializeJobs();
    const savedJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
    let savedApps: Application[] = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
    
    // Clean up duplicate applications - keep only the latest for each user+job combination
    const appMap = new Map<string, Application>();
    for (const app of savedApps) {
      const key = `${app.userId}_${app.jobId}`;
      const existing = appMap.get(key);
      if (!existing || new Date(app.appliedDate) > new Date(existing.appliedDate)) {
        appMap.set(key, app);
      }
    }
    const cleanedApps = Array.from(appMap.values());
    
    // Save cleaned apps if there were duplicates
    if (cleanedApps.length !== savedApps.length) {
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(cleanedApps));
      savedApps = cleanedApps;
    }
    
    setJobs(savedJobs);
    setApplications(savedApps);

    // If backend is configured, fetch jobs from API and replace demo/local data
    (async () => {
      try {
        const remote = await JobAPI.listForms();
        if (remote && remote.length > 0) {
          setJobs(remote);
        }
      } catch (e) {
        // ignore and keep local/demo data
      }
    })();
  }, []);

  const saveJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    localStorage.setItem(JOBS_KEY, JSON.stringify(newJobs));
  };

  const saveApplications = (newApps: Application[]) => {
    setApplications(newApps);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(newApps));
  };

  const addJob = (job: Omit<Job, 'id' | 'postedDate' | 'status'>) => {
    (async () => {
      try {
        const payload = {
          title: job.title,
          description: job.description,
          address: job.location,
          // minimal mapping; caller should use form UI to send correct fields
        };
        const created = await JobAPI.createForm(payload);
        saveJobs([...jobs, created]);
      } catch (e) {
        // fallback to local behaviour
        const newJob: Job = {
          ...job,
          id: Date.now().toString(),
          postedDate: new Date().toISOString(),
          status: 'pending',
        };
        saveJobs([...jobs, newJob]);
      }
    })();
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    (async () => {
      try {
        await JobAPI.updateForm(id, updates);
        const refreshed = await JobAPI.getForm(id);
        const updatedJobs = jobs.map(job => (job.id === id ? refreshed : job));
        saveJobs(updatedJobs);
      } catch (e) {
        const updatedJobs = jobs.map(job =>
          job.id === id ? { ...job, ...updates } : job
        );
        saveJobs(updatedJobs);
      }
    })();
  };

  const deleteJob = (id: string) => {
    (async () => {
      try {
        await JobAPI.deleteForm(id);
        const nextJobs = jobs.filter(job => job.id !== id);
        const nextApps = applications.filter(app => app.jobId !== id);
        saveJobs(nextJobs);
        saveApplications(nextApps);
      } catch (e) {
        const nextJobs = jobs.filter(job => job.id !== id);
        const nextApps = applications.filter(app => app.jobId !== id);
        saveJobs(nextJobs);
        saveApplications(nextApps);
      }
    })();
  };

  const deleteJobsByStatus = (statuses: JobStatus[]) => {
    const keepJobs = jobs.filter(j => !statuses.includes(j.status));
    const keepJobIds = new Set(keepJobs.map(j => j.id));
    const keepApps = applications.filter(a => keepJobIds.has(a.jobId));

    saveJobs(keepJobs);
    saveApplications(keepApps);
  };

  const removeJobsByOwner = (ownerId: string) => {
    const newJobs = jobs.filter(j => j.employerId !== ownerId);
    saveJobs(newJobs);
  };

  const applyToJob = (jobId: string, application: Omit<Application, 'id' | 'appliedDate' | 'status'>) => {
    (async () => {
      try {
        await JobAPI.applyToJob(jobId, application);
      } catch (e) {
        // API might not be available, continue with local storage
      }
      
      // Remove any existing applications from the same user for the same job
      const filteredApps = applications.filter(
        app => !(app.userId === application.userId && app.jobId === jobId)
      );
      
      const newApplication: Application = {
        ...application,
        id: Date.now().toString(),
        appliedDate: new Date().toISOString(),
        status: 'pending',
      };
      saveApplications([...filteredApps, newApplication]);
    })();
  };

  const updateApplicationStatus = (appId: string, status: Application['status']) => {
    setApplications(prev => {
      const next = prev.map(a => a.id === appId ? { ...a, status } : a);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const approveApplication = (appId: string) => updateApplicationStatus(appId, 'approved');
  const rejectApplication = (appId: string) => updateApplicationStatus(appId, 'rejected');

  const getJobById = (id: string) => jobs.find(job => job.id === id);

  const getJobsByEmployer = (employerId: string) =>
    jobs.filter(job => job.employerId === employerId);

  const getUserApplications = (userId: string) =>
    applications.filter(app => app.userId === userId);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        applications,
        addJob,
        updateJob,
        deleteJob,
        deleteJobsByStatus,
        removeJobsByOwner,
        applyToJob,
        getJobById,
        getJobsByEmployer,
        getUserApplications,
        approveApplication,
        rejectApplication,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within JobsProvider');
  }
  return context;
};
