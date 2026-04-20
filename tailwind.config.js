/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
        "./utils/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "SST",
                    "Playstation SST",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Helvetica",
                    "Arial",
                    "sans-serif",
                ],
            },
            colors: {
                ps: {
                    black: "#000000",
                    blue: "#0070cc",
                    cyan: "#1eaedb",
                    linkHover: "#1883fd",
                    darkLink: "#0068bd",
                    inkLink: "#53b1ff",
                    white: "#ffffff",
                    ice: "#f5f7fa",
                    divider: "#f3f3f3",
                    shadow: "#121314",
                    ink: "#000000",
                    charcoal: "#1f1f1f",
                    bodyGray: "#6b6b6b",
                    mute: "#cccccc",
                    orange: "#d53b00",
                    orangeActive: "#aa2f00",
                    red: "#c81b3a",
                },
            },
            boxShadow: {
                "ps-1": "0 5px 9px 0 rgba(0,0,0,0.06)",
                "ps-2": "0 5px 9px 0 rgba(0,0,0,0.08)",
                "ps-3": "0 5px 9px 0 rgba(0,0,0,0.16)",
                "ps-hero": "0 5px 9px 0 rgba(0,0,0,0.8)",
                "ps-ring": "0 0 0 2px #0070cc",
            },
            borderRadius: {
                "ps-sm": "3px",
                "ps-md": "12px",
                "ps-lg": "24px",
                pill: "999px",
            },
            letterSpacing: {
                "ps-tight": "-0.1px",
                "ps-cta": "0.4px",
                "ps-cta-bold": "0.45px",
            },
            transitionTimingFunction: {
                ps: "cubic-bezier(0.4, 0, 0.2, 1)",
            },
        },
    },
    plugins: [],
};
