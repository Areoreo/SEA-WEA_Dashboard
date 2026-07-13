/** @type {import('tailwindcss').Config} */
// All token-backed values resolve to CSS custom properties emitted by
// utils/themes.js (see buildThemeCss, injected in pages/_document.js), so a
// data-theme switch restyles every utility class without a re-render.
module.exports = {
    content: [
        "./pages/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
        "./utils/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-body)"],
                display: ["var(--font-display)"],
                data: ["var(--font-data)"],
            },
            colors: {
                // Legacy ps.* names kept so existing classes keep working.
                // blue/cyan use rgb triplets — the only two used with alpha
                // modifiers (border-ps-blue/30, bg-ps-cyan/30).
                ps: {
                    black: "#000000",
                    blue: "rgb(var(--accent-rgb) / <alpha-value>)",
                    cyan: "rgb(var(--accent-2-rgb) / <alpha-value>)",
                    linkHover: "var(--link-hover)",
                    darkLink: "var(--link)",
                    inkLink: "#53b1ff",
                    white: "#ffffff",
                    ice: "var(--page)",
                    divider: "var(--line-soft)",
                    shadow: "#121314",
                    ink: "#000000",
                    charcoal: "var(--ink)",
                    bodyGray: "var(--ink-2)",
                    mute: "var(--line-strong)",
                    orange: "var(--cta)",
                    orangeActive: "var(--cta-active)",
                    red: "var(--danger)",
                },
                // Semantic aliases — preferred for new/edited code.
                page: "var(--page)",
                panel: "var(--panel)",
                "panel-soft": "var(--panel-soft)",
                "panel-soft-2": "var(--panel-soft-2)",
                ink: "var(--ink)",
                "ink-2": "var(--ink-2)",
                "ink-3": "var(--ink-3)",
                line: "var(--line)",
                "line-soft": "var(--line-soft)",
                "line-strong": "var(--line-strong)",
                accent: "rgb(var(--accent-rgb) / <alpha-value>)",
                "accent-2": "rgb(var(--accent-2-rgb) / <alpha-value>)",
                "on-accent": "var(--on-accent)",
            },
            boxShadow: {
                "ps-1": "var(--shadow-1)",
                "ps-2": "var(--shadow-2)",
                "ps-3": "var(--shadow-3)",
                overlay: "var(--shadow-overlay)",
                float: "var(--shadow-float)",
                pop: "var(--shadow-pop)",
                "ps-hero": "0 5px 9px 0 rgba(0,0,0,0.8)",
                "ps-ring": "0 0 0 2px var(--accent)",
            },
            borderRadius: {
                "ps-sm": "var(--radius-control)",
                "ps-md": "var(--radius-panel)",
                "ps-lg": "var(--radius-panel-lg)",
                pill: "var(--radius-pill)",
            },
            letterSpacing: {
                "ps-tight": "-0.1px",
                "ps-cta": "0.4px",
                "ps-cta-bold": "0.45px",
            },
            transitionTimingFunction: {
                ps: "var(--ease-1)",
            },
        },
    },
    plugins: [],
};
