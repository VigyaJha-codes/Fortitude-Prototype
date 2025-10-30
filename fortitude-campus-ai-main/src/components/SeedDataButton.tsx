import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const SeedDataButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-data');
      
      if (error) throw error;

      toast({
        title: 'Demo data created successfully!',
        description: `${data.message}. Credentials: ${data.credentials.faculty}, ${data.credentials.student}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error creating demo data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo Data Setup</CardTitle>
        <CardDescription>
          Click below to populate the database with demo faculty, students, courses, and notices.
          This will create 10 faculty members and 50 students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSeedData} disabled={loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating demo data...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Create Demo Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
