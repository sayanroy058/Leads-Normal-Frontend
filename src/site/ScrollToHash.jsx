import { useEffect } from "react";
import { useLocation } from "@/site/router";

export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    const NAVBAR_HEIGHT = 78;

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    };

    const scrollToSection = () => {
      if (!location.hash) {
        scrollToTop();
        return;
      }

      const id = decodeURIComponent(location.hash.replace("#", ""));

      // Wait for the new page and section to render
      requestAnimationFrame(() => {
        setTimeout(() => {
          const element = document.getElementById(id);

          if (!element) return;

          const elementTop =
            element.getBoundingClientRect().top + window.scrollY;

          window.scrollTo({
            top: elementTop - NAVBAR_HEIGHT - 16,
            behavior: "smooth",
          });
        }, 150);
      });
    };

    scrollToSection();
  }, [location.pathname, location.hash]);

  return null;
}