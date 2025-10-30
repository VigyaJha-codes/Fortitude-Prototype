import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { 
  GraduationCap, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpen, 
  ClipboardList,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, role, signOut } = useAuth();
  const { glassMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navigation = role === 'admin' ? [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Faculty', href: '/faculty', icon: Users },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ] : role === 'faculty' ? [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/courses', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Marks', href: '/marks', icon: FileText },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/courses', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Marks', href: '/marks', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b ${glassMode ? 'glass' : 'bg-background'}`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold hidden sm:inline gradient-text">Fortitude</span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={location.pathname === item.href ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(!settingsOpen)}
                aria-label="Accessibility settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b ${glassMode ? 'glass' : 'bg-background'}`}>
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === item.href ? 'default' : 'ghost'}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className={`grid gap-6 ${settingsOpen ? 'lg:grid-cols-4' : 'grid-cols-1'}`}>
          <div className={settingsOpen ? 'lg:col-span-3' : 'col-span-1'}>{children}</div>
          {settingsOpen && (
            <div className="lg:col-span-1 animate-fade-in">
              <div className="lg:sticky lg:top-20">
                <AccessibilityPanel />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
