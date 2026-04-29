import { useEffect, useState } from "react";

export function useScrollSpy(
  sectionIds: string[],
  initial: string,
  ready: boolean = true,
): string {
  const [active, setActive] = useState(initial);
  useEffect(() => {
    if (!ready) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { threshold: [0.4], rootMargin: "-100px 0px -50% 0px" },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds.join(","), ready]);
  return active;
}
