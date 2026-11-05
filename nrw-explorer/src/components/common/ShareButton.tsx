import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';

export function ShareButton({ title, text, ...props }: { title: string; text?: string } & ButtonProps) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Teilen abgebrochen */
    }
  };
  return (
    <Button variant="outline" onClick={share} {...props}>
      {copied ? <Check /> : <Share2 />}
      {copied ? 'Link kopiert' : 'Teilen'}
    </Button>
  );
}
