import Head from "next/head";
import MainDashboard from "../components/Dashboard/MainDashboard";

export default function Home() {
    return (
        <>
            <Head>
                <title>SEA-WEA Dashboard</title>
                <meta
                    name="description"
                    content="Southeast Asia Water and Energy Assessment — reservoir and hydropower atlas."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <MainDashboard />
        </>
    );
}
