import { Html, Head, Main, NextScript } from "next/document";
import { buildThemeCss, THEME_IDS, THEME_STORAGE_KEY, DEFAULT_THEME } from "../utils/themes";

// Restore the persisted theme before first paint. Classic is the :root
// default, so a missing/invalid value needs no attribute at all — first
// visits never flash. Runs inline (static export bakes it into every page).
const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(
    THEME_STORAGE_KEY
)});if(t&&t!==${JSON.stringify(DEFAULT_THEME)}&&${JSON.stringify(
    THEME_IDS
)}.indexOf(t)>=0){document.documentElement.setAttribute("data-theme",t);}}catch(e){}`;

export default function Document() {
    return (
        <Html lang="en" className="scroll-smooth">
            <Head>
                <meta charSet="utf-8" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: buildThemeCss() }} />
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
