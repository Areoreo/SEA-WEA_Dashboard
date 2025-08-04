// pages/qa.js
import { MainLayout } from "@components/Layout/MainLayout";
import { useState } from "react";

export default function QA() {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const faqs = [
        {
            question: "What is SEA-WEA?",
            answer: "SEA-WEA (Southeast Asia Water and Energy Assessment) is a comprehensive dashboard that provides real-time and historical data on water resources and energy infrastructure across Southeast Asia.",
        },
        {
            question: "How often is the data updated?",
            answer: "Our data is updated monthly for most indicators. Real-time data for specific stations may be updated more frequently when available.",
        },
        {
            question: "Can I download the data?",
            answer: "Yes, you can download data in various formats including CSV, JSON, and Shapefile from our Download page.",
        },
        {
            question: "How do I cite SEA-WEA data?",
            answer: "Please cite as: SEA-WEA Dashboard (2024). Southeast Asia Water and Energy Assessment. Available at: [URL]. Accessed on: [Date].",
        },
        {
            question: "Is the platform free to use?",
            answer: "Yes, SEA-WEA is free for academic and non-commercial use. Commercial applications may require a license.",
        },
    ];

    return (
        <MainLayout title="Q&A - SEA-WEA">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg">
                            <button
                                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                                onClick={() =>
                                    setExpandedIndex(expandedIndex === index ? null : index)
                                }
                            >
                                <span className="font-semibold">{faq.question}</span>
                                <span className="text-2xl">
                                    {expandedIndex === index ? "−" : "+"}
                                </span>
                            </button>
                            {expandedIndex === index && (
                                <div className="px-6 py-4 border-t bg-gray-50">
                                    <p className="text-gray-700">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">Still have questions?</h2>
                    <p className="text-gray-700 mb-4">
                        Contact us at{" "}
                        <a
                            href="mailto:support@seawea.org"
                            className="text-blue-600 hover:underline"
                        >
                            support@seawea.org
                        </a>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}
