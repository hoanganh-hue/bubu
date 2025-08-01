import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCreateJob } from '@/hooks/queries/use-jobs';
import { toast } from '@/components/ui/toast';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const jobTypes = [
  { value: 'company_search', label: 'Tìm kiếm Công ty' },
  // Add other job types as needed
];

const sources = [
  { value: 'infodoanhnghiep.com', label: 'InfoDoanhNghiep.com' },
  { value: 'hsctvn.com', label: 'HSCTVN.com' },
  { value: 'masothue.com', label: 'MasoThue.com' },
];

const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose }) => {
  const [jobType, setJobType] = useState(jobTypes[0].value);
  const [keyword, setKeyword] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [province, setProvince] = useState('');
  const [industryCode, setIndustryCode] = useState('');

  const createJobMutation = useCreateJob();

  const handleSubmit = async () => {
    try {
      await createJobMutation.mutateAsync({
        jobType,
        parameters: {
          keyword,
          province,
          industryCode,
          sources: selectedSources.length > 0 ? selectedSources : undefined,
        },
      });
      toast({
        title: 'Tạo công việc thành công!',
        description: 'Công việc cào dữ liệu của bạn đã được khởi tạo.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi khi tạo công việc',
        description: 'Đã có lỗi xảy ra khi khởi tạo công việc cào dữ liệu.',
        variant: 'destructive',
      });
      console.error('Error creating job:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo Công việc Cào dữ liệu Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết cho công việc cào dữ liệu của bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jobType" className="text-right">
              Loại Công việc
            </Label>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn loại công việc" />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="keyword" className="text-right">
              Từ khóa
            </Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="col-span-3"
              placeholder="Ví dụ: Công ty TNHH ABC"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="province" className="text-right">
              Tỉnh/Thành phố
            </Label>
            <Input
              id="province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="col-span-3"
              placeholder="Ví dụ: Hà Nội"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="industryCode" className="text-right">
              Mã Ngành nghề
            </Label>
            <Input
              id="industryCode"
              value={industryCode}
              onChange={(e) => setIndustryCode(e.target.value)}
              className="col-span-3"
              placeholder="Ví dụ: 4651"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sources" className="text-right">
              Nguồn
            </Label>
            <Select
              value={selectedSources.join(',')}
              onValueChange={(value) =>
                setSelectedSources(value.split(',').filter(Boolean))
              }
              multiple // This is a conceptual multiple select, actual implementation might vary
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Chọn nguồn (có thể chọn nhiều)" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={createJobMutation.isLoading}>
            {createJobMutation.isLoading ? 'Đang tạo...' : 'Tạo Công việc'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobModal;