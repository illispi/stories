import { useEffect, useRef, useState } from "react";

const useIntObsHtml = (options) => {
  const containerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(true);

  const callbackFunction = (entries) => {
    const [entry] = entries;

    if (entry.isIntersecting === true) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    const value = containerRef.current;
    const observer = new IntersectionObserver(callbackFunction, options);
    if (value) {
      observer.observe(value);
    }

    return () => {
      if (value) {
        observer.unobserve(value);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isVisible];
};

export default useIntObsHtml;
