'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../lib/toast-context';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleLoginButton() {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const { showError } = useToast();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        await googleLogin(response.credential);
        router.push('/dashboard');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google login failed';
        showError(message);
      }
    },
    [googleLogin, router, showError],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;

    const initGoogle = () => {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: buttonRef.current.offsetWidth,
        text: 'continue_with',
        shape: 'pill',
      });
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, [handleCredentialResponse]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}
