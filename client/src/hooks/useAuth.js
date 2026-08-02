import { useEffect, useState, useCallback } from 'react';

export default function useAuth() {
  const [userId, setUserId] = useState(null);
  const [checked, setChecked] = useState(false);

  const refresh = useCallback(() => {
    return fetch('/api/users/check-auth', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUserId(data.authenticated ? data.userId : null))
      .catch(() => setUserId(null))
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { userId, checked, refresh };
}