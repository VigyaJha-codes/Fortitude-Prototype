import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

export default function Marks() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchMarks();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, course_code, course_name')
      .order('course_code');

    if (error) {
      toast({ title: 'Error fetching courses', description: error.message, variant: 'destructive' });
    } else {
      setCourses(data || []);
      if (data && data.length > 0) setSelectedCourse(data[0].id);
    }
    setLoading(false);
  };

  const fetchMarks = async () => {
    const { data, error } = await supabase
      .from('marks')
      .select('*, students(student_id, profiles(full_name))')
      .eq('course_id', selectedCourse)
      .order('exam_date', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching marks', description: error.message, variant: 'destructive' });
    } else {
      setMarks(data || []);
    }
  };

  const getPercentageBadge = (obtained: number, total: number) => {
    const percentage = (obtained / total) * 100;
    const variant = percentage >= 75 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{percentage.toFixed(1)}%</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Marks Management</h1>
          <Award className="h-8 w-8 text-muted-foreground" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>View Marks</CardTitle>
            <div className="mt-4">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : marks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No marks records found</TableCell>
                    </TableRow>
                  ) : (
                    marks.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.students?.student_id}</TableCell>
                        <TableCell>{record.students?.profiles?.full_name}</TableCell>
                        <TableCell>{record.exam_type}</TableCell>
                        <TableCell>{new Date(record.exam_date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.marks_obtained} / {record.total_marks}</TableCell>
                        <TableCell>{getPercentageBadge(record.marks_obtained, record.total_marks)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
