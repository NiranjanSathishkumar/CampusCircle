import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * Ensures the window scroll position resets to the top (0, 0)
 * whenever the route path or tab changes in the application.
 */
function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname, search, hash]);

  return null;
}

export default ScrollToTop;
