import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus } from 'lucide-react';
import { sanitizeSearchInput } from '@/lib/validations';

export default function Faculty() {
  const { role } = useAuth();
  const [faculty, setFaculty] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('faculty')
      .select('*, profiles(full_name, email)')
      .order('faculty_id');

    if (error) {
      toast({ title: 'Error fetching faculty', description: error.message, variant: 'destructive' });
    } else {
      setFaculty(data || []);
    }
    setLoading(false);
  };

  const sanitizedSearch = sanitizeSearchInput(searchTerm);
  const filteredFaculty = faculty.filter(f =>
    f.faculty_id?.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
    f.profiles?.full_name?.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
    f.department?.toLowerCase().includes(sanitizedSearch.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          {role === 'admin' && (
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, name, or department..."
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
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Office</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredFaculty.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No faculty found</TableCell>
                    </TableRow>
                  ) : (
                    filteredFaculty.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.faculty_id}</TableCell>
                        <TableCell>{f.profiles?.full_name}</TableCell>
                        <TableCell>{f.profiles?.email}</TableCell>
                        <TableCell>{f.department}</TableCell>
                        <TableCell>{f.designation}</TableCell>
                        <TableCell>{f.specialization}</TableCell>
                        <TableCell>{f.office_location}</TableCell>
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
