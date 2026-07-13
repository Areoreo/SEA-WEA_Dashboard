import "@styles/globals.scss";
import { Inter, Source_Serif_4, IBM_Plex_Mono, Manrope } from "next/font/google";
import { ThemeProvider } from "../components/Theme/ThemeProvider";

// Self-hosted at build time (static-export friendly). Each exposes a raw
// --font-* variable; the themes compose --font-display/--font-body/--font-data
// from them (utils/themes.js). Classic sticks to the system SST stack.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sourceSerif = Source_Serif_4({
    subsets: ["latin"],
    variable: "--font-source-serif",
    display: "swap",
});
const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-plex-mono",
    display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export default function App({ Component, pageProps }) {
    return (
        // display:contents keeps the h-screen layout chain intact while
        // cascading the font variables to everything (incl. Leaflet DivIcons).
        <div
            className={`${inter.variable} ${sourceSerif.variable} ${plexMono.variable} ${manrope.variable} contents`}
        >
            <ThemeProvider>
                <Component {...pageProps} />
            </ThemeProvider>
        </div>
    );
}
