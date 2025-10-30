import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Type, Contrast, Sparkles } from 'lucide-react';

export const AccessibilityPanel = () => {
  const { theme, fontSize, highContrast, glassMode, toggleTheme, setFontSize, toggleHighContrast, toggleGlassMode } = useTheme();

  return (
    <Card className={`p-6 ${glassMode ? 'glass-card' : ''}`}>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Contrast className="h-5 w-5" />
        Accessibility Settings
      </h2>
      
      <div className="space-y-6">
        {/* Theme Toggle */}
        <div>
          <Label className="mb-2 block">Theme</Label>
          <div className="flex gap-2">
            <Button
              onClick={toggleTheme}
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              <Sun className="h-4 w-4 mr-2" />
              Light
            </Button>
            <Button
              onClick={toggleTheme}
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </Button>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <Label className="mb-2 block flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Size
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={() => setFontSize('100')}
              variant={fontSize === '100' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              100%
            </Button>
            <Button
              onClick={() => setFontSize('125')}
              variant={fontSize === '125' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              125%
            </Button>
            <Button
              onClick={() => setFontSize('150')}
              variant={fontSize === '150' ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
            >
              150%
            </Button>
          </div>
        </div>

        {/* High Contrast */}
        <div>
          <Label className="mb-2 block">Display Mode</Label>
          <Button
            onClick={toggleHighContrast}
            variant={highContrast ? 'default' : 'outline'}
            size="sm"
            className="w-full"
          >
            <Contrast className="h-4 w-4 mr-2" />
            High Contrast {highContrast ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Glass Mode */}
        <div>
          <Label className="mb-2 block">Visual Effects</Label>
          <Button
            onClick={toggleGlassMode}
            variant={glassMode ? 'default' : 'outline'}
            size="sm"
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Glass Mode {glassMode ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
