import { useState, useEffect } from "react";

/**
 * A robust hook to measure the size of a DOM element using ResizeObserver.
 * Safe against null refs, SSR, and component unmounting.
 * 
 * @param {React.RefObject} ref - React ref object of the element to measure.
 * @returns {Object} - Object containing { width, height } of the element.
 */
export function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref || !ref.current) return;

    const element = ref.current;

    // Set initial size
    setSize({
      width: element.clientWidth || 0,
      height: element.clientHeight || 0,
    });

    const handleResize = (entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}
