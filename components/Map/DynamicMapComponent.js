import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Dynamically import MapComponent with SSR disabled
const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
                <p className="text-gray-600">Loading interactive map...</p>
            </div>
        </div>
    ),
});

export default MapComponent;
