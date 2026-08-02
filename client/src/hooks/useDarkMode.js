import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('sl-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
}