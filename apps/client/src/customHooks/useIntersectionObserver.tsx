import { Chart } from "chart.js";
import { useEffect, useRef, useState } from "react";

const useIntersectionObserver = (options) => {
  const containerRef = useRef<Chart>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [firstDraw, setFirstDraw] = useState(() => isVisible);

  

  const callbackFunction = (entries) => {
    const [entry] = entries;

    if (entry.isIntersecting === true) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };
  
  useEffect(() => {
    if (firstDraw && !isVisible) {
      setFirstDraw(false);
    }
  }, [firstDraw, isVisible]);

  useEffect(() => {
    const value = containerRef.current;
    const observer = new IntersectionObserver(callbackFunction, options);

    if (value) {
      observer.observe(value.canvas);
    }

    return () => {
      if (value?.canvas) {
        observer.unobserve(value.canvas);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isVisible, firstDraw];
};

export default useIntersectionObserver;
