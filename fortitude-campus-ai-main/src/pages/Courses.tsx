import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sanitizeSearchInput } from '@/lib/validations';

export default function Courses() {
  const { role } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*, faculty(faculty_id, profiles(full_name))')
      .order('course_code');

    if (error) {
      toast({ title: 'Error fetching courses', description: error.message, variant: 'destructive' });
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  const sanitizedSearch = sanitizeSearchInput(searchTerm);
  const filteredCourses = courses.filter(course =>
    course.course_code?.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
    course.course_name?.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
    course.department?.toLowerCase().includes(sanitizedSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Courses Management</h1>
          {role === 'admin' && (
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code, name, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Faculty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No courses found</TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.course_code}</TableCell>
                        <TableCell>{course.course_name}</TableCell>
                        <TableCell>{course.department}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.credits}</Badge>
                        </TableCell>
                        <TableCell>{course.semester}</TableCell>
                        <TableCell>{course.faculty?.profiles?.full_name || 'Unassigned'}</TableCell>
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
