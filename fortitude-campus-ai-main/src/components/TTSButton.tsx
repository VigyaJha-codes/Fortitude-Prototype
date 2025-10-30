import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TTSButtonProps {
  text: string;
  label?: string;
}

export const TTSButton = ({ text, label = 'Read Aloud' }: TTSButtonProps) => {
  const [speaking, setSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Text-to-Speech not supported',
        description: 'Your browser does not support text-to-speech.',
        variant: 'destructive',
      });
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      toast({
        title: 'Speech error',
        description: 'Failed to read text aloud.',
        variant: 'destructive',
      });
    };

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button
      onClick={speak}
      variant="outline"
      size="sm"
      className="gap-2"
      aria-label={speaking ? 'Stop reading' : label}
    >
      {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      {speaking ? 'Stop' : label}
    </Button>
  );
};
