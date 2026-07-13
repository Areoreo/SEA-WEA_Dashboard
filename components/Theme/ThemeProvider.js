import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    THEMES,
    THEME_IDS,
    DEFAULT_THEME,
    THEME_STORAGE_KEY,
} from "../../utils/themes";

const ThemeContext = createContext({
    themeId: DEFAULT_THEME,
    theme: THEMES[DEFAULT_THEME],
    setTheme: () => {},
});

export function ThemeProvider({ children }) {
    const [themeId, setThemeId] = useState(DEFAULT_THEME);

    // The pre-paint script in _document.js already restored the persisted
    // theme onto <html> — sync React state to it after mount. SSR markup
    // assumes classic; hydration never diffs <html> attributes, and the map
    // (the main JS-token consumer) mounts later via next/dynamic ssr:false,
    // so nothing renders with a stale palette.
    useEffect(() => {
        const t = document.documentElement.getAttribute("data-theme");
        if (t && THEME_IDS.includes(t)) setThemeId(t);
    }, []);

    const setTheme = useCallback((id) => {
        if (!THEME_IDS.includes(id)) return;
        setThemeId(id);
        // Classic is the :root default — no attribute keeps first paint exact.
        if (id === DEFAULT_THEME) {
            document.documentElement.removeAttribute("data-theme");
        } else {
            document.documentElement.setAttribute("data-theme", id);
        }
        try {
            localStorage.setItem(THEME_STORAGE_KEY, id);
        } catch (e) {
            /* private mode etc. — theme still applies for the session */
        }
    }, []);

    const value = useMemo(
        () => ({ themeId, theme: THEMES[themeId], setTheme }),
        [themeId, setTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
