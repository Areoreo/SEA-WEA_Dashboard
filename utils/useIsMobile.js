import { useEffect, useState } from "react";

// True below Tailwind's `lg` breakpoint (1024px) — the width at which the
// sidebar switches from a static column to an off-canvas drawer. Starts false
// (matches SSR markup) and syncs on mount.
export default function useIsMobile(query = "(max-width: 1023px)") {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setIsMobile(mq.matches);
        update();
        if (mq.addEventListener) mq.addEventListener("change", update);
        else mq.addListener(update);
        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", update);
            else mq.removeListener(update);
        };
    }, [query]);
    return isMobile;
}
