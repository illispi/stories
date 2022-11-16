import { useEffect, useRef, useState } from "react";

const useIntObsHtml = (options) => {
  const containerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);

  const callbackFunction = (entries) => {
    const [entry] = entries;

    if (entry.isIntersecting === true) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isVisible];
};

export default useIntObsHtml;
