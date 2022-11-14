import { useEffect, useRef, useState } from "react";

const useIntersectionObserver = (options) => {
  const containerRef = useRef(null);
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
    if (containerRef.current) {
      console.log(observer);

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

export default useIntersectionObserver;
