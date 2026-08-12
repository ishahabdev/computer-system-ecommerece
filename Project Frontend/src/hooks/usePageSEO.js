import { useEffect } from 'react';
import { setPageTitle, setMetaDescription } from '../utils/seo';

/**
 * Custom hook to set page title and meta description
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {boolean} noIndex - Whether to prevent indexing (for auth/dashboard pages)
 */
export const usePageSEO = (title, description, noIndex = false) => {
  useEffect(() => {
    if (title) {
      setPageTitle(title, noIndex);
    }
    
    if (description) {
      setMetaDescription(description);
    }
    
    // Cleanup: restore default on unmount
    return () => {
      setPageTitle('', false);
    };
  }, [title, description, noIndex]);
};

export default usePageSEO;
