import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or faculty role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || (roleData.role !== 'admin' && roleData.role !== 'faculty')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin or faculty access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple ML-inspired risk prediction based on attendance and performance
    const predictRisk = (attendance: number, avgMarks: number, failures: number): string => {
      const riskScore = (
        (100 - attendance) * 0.4 +
        (100 - avgMarks) * 0.4 +
        (failures * 10) * 0.2
      );

      if (riskScore < 20) return 'low';
      if (riskScore < 40) return 'medium';
      return 'high';
    };

    // Fetch students with their attendance and marks
    const { data: students, error: studentsError } = await supabaseClient
      .from('students')
      .select('id, student_id');

    if (studentsError) throw studentsError;

    const predictions = [];

    for (const student of students || []) {
      // Calculate attendance percentage
      const { data: attendanceData } = await supabaseClient
        .from('attendance')
        .select('status')
        .eq('student_id', student.id);

      const totalClasses = attendanceData?.length || 0;
      const presentClasses = attendanceData?.filter(a => a.status === 'present').length || 0;
      const attendancePct = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 90;

      // Calculate average marks
      const { data: marksData } = await supabaseClient
        .from('marks')
        .select('marks_obtained, total_marks')
        .eq('student_id', student.id);

      let avgMarks = 85;
      if (marksData && marksData.length > 0) {
        const totalObtained = marksData.reduce((sum, m) => sum + Number(m.marks_obtained), 0);
        const totalPossible = marksData.reduce((sum, m) => sum + Number(m.total_marks), 0);
        avgMarks = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 85;
      }

      // For demo, assume 0-2 random failures
      const failures = Math.floor(Math.random() * 3);

      const risk = predictRisk(attendancePct, avgMarks, failures);

      predictions.push({
        student_id: student.student_id,
        attendance_pct: Math.round(attendancePct),
        avg_marks: Math.round(avgMarks),
        failures,
        risk_level: risk,
      });
    }

    return new Response(
      JSON.stringify({ predictions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in predict-risk:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
