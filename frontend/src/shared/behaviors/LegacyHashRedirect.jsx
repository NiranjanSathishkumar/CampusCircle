import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LegacyHashRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const cleanHash = location.hash.replace(/^#\/?/, '');
      if (cleanHash && cleanHash !== 'hero' && cleanHash !== 'landing') {
        const targetPath = cleanHash.startsWith('/') ? cleanHash : `/${cleanHash}`;
        navigate(targetPath, { replace: true });
      } else if (cleanHash === 'hero' || cleanHash === 'landing') {
        navigate('/', { replace: true });
      }
    }
  }, [location.hash, navigate]);

  return null;
}
