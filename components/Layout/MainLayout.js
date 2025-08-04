import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import Head from "next/head";
import Link from "next/link";

export const MainLayout = ({ children, title = "SEA-WEA Dashboard" }) => {
    const navItems = [
        { href: "/", label: "Dashboard" },
        { href: "/overview", label: "Overview" },
        { href: "/methods", label: "Methods" },
        { href: "/about", label: "About Us" },
        { href: "/application", label: "Application" },
        { href: "/download", label: "Download" },
        { href: "/qa", label: "Q&A" },
        { href: "/comments", label: "Comments" },
    ];

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta
                    name="description"
                    content="SEA-WEA Dashboard - Water and Energy Assessment"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <Header navItems={navItems} />

            <main className="min-h-screen">{children}</main>

            <Footer />
        </>
    );
};
