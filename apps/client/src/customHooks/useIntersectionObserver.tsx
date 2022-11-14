import { Chart } from "chart.js";
import { useEffect, useRef, useState } from "react";

const useIntersectionObserver = (options) => {
  const containerRef = useRef<Chart>(null);

  const [isVisible, setIsVisible] = useState<
    | "active"
    | "reset"
    | "resize"
    | "none"
    | "hide"
    | "show"
    | "normal"
    | undefined
  >("active");

  const callbackFunction = (entries) => {
    /*     const [entry] = entries;
    setIsVisible(entry.isIntersecting); */
    console.log("made it");

    if (entries[0].isIntersecting === true) {
      setIsVisible("active");
    } else {
      setIsVisible("reset");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    console.log(containerRef.current);
    if (containerRef.current) {
      observer.observe(containerRef.current.canvas);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current.canvas);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isVisible];
};

export default useIntersectionObserver;
