import React, { useRef } from "react";
import { THEMES, THEME_IDS } from "../../utils/themes";
import { useTheme } from "./ThemeProvider";

// Two-tone preview built from the target theme's own tokens so the swatches
// can never drift from the real palettes.
function Swatch({ theme }) {
    return (
        <span
            className="relative inline-flex h-8 w-8 flex-none rounded-[6px] overflow-hidden"
            style={{
                background: theme.tokens.page,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
            }}
            aria-hidden="true"
        >
            <span
                className="absolute left-1 right-1 top-1 h-2.5 rounded-[3px]"
                style={{
                    background: theme.tokens.panel,
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
                }}
            />
            <span
                className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 rounded-full"
                style={{ background: theme.tokens.accent }}
            />
            <span
                className="absolute bottom-2 left-[18px] right-1.5 h-[3px] rounded-full"
                style={{ background: theme.tokens.ink2, opacity: 0.6 }}
            />
        </span>
    );
}

export default function ThemeSwitcher() {
    const { themeId, setTheme } = useTheme();
    const refs = useRef({});

    const onKeyDown = (e) => {
        const idx = THEME_IDS.indexOf(themeId);
        let next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            next = THEME_IDS[(idx + 1) % THEME_IDS.length];
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            next = THEME_IDS[(idx - 1 + THEME_IDS.length) % THEME_IDS.length];
        }
        if (next) {
            e.preventDefault();
            setTheme(next);
            refs.current[next]?.focus();
        }
    };

    return (
        <div
            role="radiogroup"
            aria-label="Theme"
            className="grid grid-cols-2 gap-2"
            onKeyDown={onKeyDown}
        >
            {THEME_IDS.map((id) => {
                const t = THEMES[id];
                const active = id === themeId;
                return (
                    <button
                        key={id}
                        ref={(el) => (refs.current[id] = el)}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => setTheme(id)}
                        className={`flex items-center gap-2.5 rounded-ps-sm border p-2 text-left transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ps-blue ${
                            active
                                ? "border-ps-blue shadow-ps-1 bg-panel"
                                : "border-line bg-panel hover:border-ps-blue"
                        }`}
                        title={`${t.name} — ${t.tagline}`}
                    >
                        <Swatch theme={t} />
                        <span className="min-w-0">
                            <span className="block text-[12px] font-medium text-ink leading-tight truncate">
                                {t.name}
                            </span>
                            <span className="block text-[10px] text-ink-2 leading-tight truncate">
                                {t.tagline}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
