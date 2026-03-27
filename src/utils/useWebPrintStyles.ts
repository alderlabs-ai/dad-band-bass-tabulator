import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useWebPrintStyles(styleId: string, css: string) {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const existing = document.getElementById(styleId);
    if (existing) {
      existing.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [css, styleId]);
}
