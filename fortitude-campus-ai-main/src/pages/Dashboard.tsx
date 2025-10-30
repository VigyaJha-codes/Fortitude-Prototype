import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { TTSButton } from '@/components/TTSButton';
import { SeedDataButton } from '@/components/SeedDataButton';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, TrendingUp, AlertTriangle, GraduationCap, Award } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const attendanceData = [
  { month: 'Jan', attendance: 92 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 90 },
  { month: 'Apr', attendance: 85 },
  { month: 'May', attendance: 87 },
  { month: 'Jun', attendance: 91 },
];

const marksData = [
  { subject: 'Math', marks: 85 },
  { subject: 'Physics', marks: 78 },
  { subject: 'Chemistry', marks: 92 },
  { subject: 'English', marks: 88 },
  { subject: 'CS', marks: 95 },
];

const riskData = [
  { name: 'Low Risk', value: 150, color: 'hsl(var(--success))' },
  { name: 'Medium Risk', value: 35, color: 'hsl(var(--accent))' },
  { name: 'High Risk', value: 15, color: 'hsl(var(--destructive))' },
];

export default function Dashboard() {
  const { role } = useAuth();
  const { glassMode } = useTheme();
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [studentsRes, facultyRes, coursesRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('faculty').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      students: studentsRes.count || 0,
      faculty: facultyRes.count || 0,
      courses: coursesRes.count || 0,
    });
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
    return `${greeting}, ${role?.charAt(0).toUpperCase() + role?.slice(1)}!`;
  };

  const reportText = `Welcome to your Fortitude dashboard. ${
    role === 'admin' ? 'You have 200 students and 50 faculty members. Overall attendance is 89% and system health is excellent.' :
    role === 'faculty' ? 'You have 5 active courses with 180 enrolled students. Average class performance is 85%.' :
    'Your current attendance is 89% with an average score of 87%. Keep up the good work!'
  }`;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Seed Data Button - Show only for admins when no data exists */}
        {role === 'admin' && stats.students === 0 && (
          <SeedDataButton />
        )}

        {/* Welcome Section */}
        <div className={`p-8 rounded-2xl bg-gradient-hero ${glassMode ? 'glass' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{getWelcomeMessage()}</h1>
              <p className="text-white/80 text-lg">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <TTSButton text={reportText} label="🔊 Read My Report" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {role === 'admin' && (
            <>
              <StatsCard title="Total Students" value={stats.students.toString()} icon={Users} color="primary" trend={{ value: 5, label: 'this month' }} />
              <StatsCard title="Total Faculty" value={stats.faculty.toString()} icon={GraduationCap} color="success" />
              <StatsCard title="Active Courses" value={stats.courses.toString()} icon={BookOpen} color="analytics" />
              <StatsCard title="Avg. Attendance" value="89%" icon={TrendingUp} color="accent" trend={{ value: 3, label: 'vs last month' }} />
            </>
          )}
          {role === 'faculty' && (
            <>
              <StatsCard title="My Courses" value="5" icon={BookOpen} color="primary" />
              <StatsCard title="Total Students" value="180" icon={Users} color="success" />
              <StatsCard title="Avg. Performance" value="85%" icon={Award} color="analytics" trend={{ value: 2, label: 'improvement' }} />
              <StatsCard title="Pending Reviews" value="12" icon={AlertTriangle} color="accent" />
            </>
          )}
          {role === 'student' && (
            <>
              <StatsCard title="My Courses" value="6" icon={BookOpen} color="primary" />
              <StatsCard title="Attendance" value="89%" icon={TrendingUp} color="success" trend={{ value: 4, label: 'this month' }} />
              <StatsCard title="Avg. Score" value="87%" icon={Award} color="analytics" trend={{ value: 5, label: 'improvement' }} />
              <StatsCard title="Pending Tasks" value="3" icon={AlertTriangle} color="accent" />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className={`p-6 ${glassMode ? 'glass-card' : ''}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Attendance Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className={`p-6 ${glassMode ? 'glass-card' : ''}`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-success" />
              Performance Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marksData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="marks" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {role === 'admin' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className={`p-6 lg:col-span-2 ${glassMode ? 'glass-card' : ''}`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                AI Predictive Risk Analysis
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-success">Low Risk Students</p>
                      <p className="text-sm text-muted-foreground">150 students (75%)</p>
                    </div>
                    <div className="text-2xl font-bold text-success">150</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-accent">Medium Risk Students</p>
                      <p className="text-sm text-muted-foreground">35 students (17.5%)</p>
                    </div>
                    <div className="text-2xl font-bold text-accent">35</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-destructive">High Risk Students</p>
                      <p className="text-sm text-muted-foreground">15 students (7.5%)</p>
                    </div>
                    <div className="text-2xl font-bold text-destructive">15</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${glassMode ? 'glass-card' : ''}`}>
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
