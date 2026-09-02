import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SecretShortcutListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcut when focus is inside interactive input/textarea/select elements
      const target = e.target;
      const tagName = target?.tagName?.toUpperCase();
      if (
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)
      ) {
        return;
      }

      // Shift + A -> Admin Login (/admin/login)
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }

      // Shift + O -> Organiser Login (/organizer/login)
      if (e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        navigate('/organizer/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}
