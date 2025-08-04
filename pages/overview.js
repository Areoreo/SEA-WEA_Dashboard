import { MainLayout } from "@components/Layout/MainLayout";

export default function Overview() {
    return (
        <MainLayout title="Overview - SEA-WEA">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Overview</h1>
                <p className="mb-4">
                    This page describes the data structure and features in SEA-WEA.
                </p>
                {/* Add more content */}
            </div>
        </MainLayout>
    );
}
