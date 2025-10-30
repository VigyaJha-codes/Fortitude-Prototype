import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting demo data seeding...');

    // Get departments
    const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
    
    // Create 10 faculty members (reduced for faster seeding)
    const facultyIds = [];
    for (let i = 1; i <= 10; i++) {
      const email = `demo.faculty${i}@fortitude.edu`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'Demo123!',
        email_confirm: true,
        user_metadata: { full_name: `Faculty Member ${i}` }
      });

      if (authError) {
        console.error(`Error creating faculty ${i}:`, authError);
        continue;
      }

      const { error: facultyError } = await supabase.from('faculty').insert({
        user_id: authData.user.id,
        faculty_id: `FAC${String(i).padStart(4, '0')}`,
        department: departments[i % 5],
        designation: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'][i % 4],
        specialization: ['AI', 'VLSI', 'Robotics', 'Structures', 'Power'][i % 5],
        office_location: `Building ${(i % 5) + 1}, Room ${100 + i}`,
        phone: `+1-555-${1000 + i}`
      });

      if (!facultyError) facultyIds.push(authData.user.id);
    }

    // Create 50 students (reduced for faster seeding)
    const studentIds = [];
    for (let i = 1; i <= 50; i++) {
      const email = `demo.student${i}@fortitude.edu`;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'Demo123!',
        email_confirm: true,
        user_metadata: { full_name: `Student ${i}` }
      });

      if (authError) {
        console.error(`Error creating student ${i}:`, authError);
        continue;
      }

      const { error: studentError } = await supabase.from('students').insert({
        user_id: authData.user.id,
        student_id: `STU${String(i).padStart(5, '0')}`,
        department: departments[i % 5],
        year: ((i - 1) % 4) + 1,
        semester: ((i - 1) % 8) + 1,
        phone: `+1-555-${2000 + i}`,
        address: `${i} University Avenue`,
        date_of_birth: new Date(2000 + (i % 5), (i % 12), (i % 28) + 1).toISOString().split('T')[0]
      });

      if (!studentError) studentIds.push(authData.user.id);
    }

    // Create courses
    const courses = [
      { code: 'CS101', name: 'Data Structures', dept: 'Computer Science', credits: 4, semester: 1 },
      { code: 'CS102', name: 'Algorithms', dept: 'Computer Science', credits: 4, semester: 2 },
      { code: 'EC101', name: 'Digital Electronics', dept: 'Electronics', credits: 3, semester: 1 },
      { code: 'ME101', name: 'Thermodynamics', dept: 'Mechanical', credits: 4, semester: 1 },
      { code: 'CE101', name: 'Structural Analysis', dept: 'Civil', credits: 4, semester: 1 },
      { code: 'EE101', name: 'Circuit Theory', dept: 'Electrical', credits: 3, semester: 1 },
    ];

    const courseIds = [];
    for (const course of courses) {
      const facultyForCourse = facultyIds[Math.floor(Math.random() * facultyIds.length)];
      const { data, error } = await supabase.from('courses').insert({
        course_code: course.code,
        course_name: course.name,
        department: course.dept,
        credits: course.credits,
        semester: course.semester,
        description: `Comprehensive course on ${course.name}`,
        faculty_id: (await supabase.from('faculty').select('id').eq('user_id', facultyForCourse).single()).data?.id
      }).select();

      if (!error && data) courseIds.push(data[0].id);
    }

    // Create notices
    await supabase.from('notices').insert([
      {
        title: 'Welcome to Fortitude CMS',
        content: 'This is demo data. You can now explore all features of the system.',
        category: 'General',
        target_audience: 'all',
        priority: 'high',
        published_by: facultyIds[0] ? (await supabase.from('faculty').select('id').eq('user_id', facultyIds[0]).single()).data?.id : null
      },
      {
        title: 'Mid-term Examinations',
        content: 'Mid-terms will be held from Nov 1-10.',
        category: 'Academic',
        target_audience: 'students',
        priority: 'high',
        published_by: facultyIds[0] ? (await supabase.from('faculty').select('id').eq('user_id', facultyIds[0]).single()).data?.id : null
      }
    ]);

    console.log('Demo data seeding completed!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${facultyIds.length} faculty, ${studentIds.length} students, and ${courseIds.length} courses`,
        credentials: {
          faculty: 'demo.faculty1@fortitude.edu / Demo123!',
          student: 'demo.student1@fortitude.edu / Demo123!'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error seeding demo data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
