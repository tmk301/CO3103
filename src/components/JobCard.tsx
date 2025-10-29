import { Job } from '@/contexts/JobsContext';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Clock, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JobCardProps {
  job: Job;
}

const JobCard = ({ job }: JobCardProps) => {
  const navigate = useNavigate();

  const getJobTypeColor = (type: string) => {
    const colors = {
      'full-time': 'bg-primary/10 text-primary',
      'part-time': 'bg-warning/10 text-warning',
      'hybrid': 'bg-accent/10 text-accent',
      'remote': 'bg-success/10 text-success',
    };
    return colors[type as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getJobTypeLabel = (type: string) => {
    const labels = {
      'full-time': 'Full-time',
      'part-time': 'Part-time',
      'hybrid': 'Hybrid',
      'remote': 'Remote',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return posted.toLocaleDateString('vi-VN');
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage src={job.companyLogo} alt={job.company} />
            <AvatarFallback>{job.company.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDate(job.postedDate)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={getJobTypeColor(job.type)}>
                <Briefcase className="h-3 w-3 mr-1" />
                {getJobTypeLabel(job.type)}
              </Badge>
              <Badge variant="outline">{job.category}</Badge>
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
  );
};

export default JobCard;
