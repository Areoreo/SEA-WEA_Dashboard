// import { MainLayout } from "@components/Layout/MainLayout";
// import dynamic from "next/dynamic";
// import { useState, useEffect } from "react";
// import { DataService } from "@utils/dataService";

// const MapComponent = dynamic(() => import("@components/Map/MapComponent"), { ssr: false });

// export default function Dashboard() {
//     const [reservoirData, setReservoirData] = useState([]);
//     const [hydropowerData, setHydropowerData] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         loadInitialData();
//     }, []);

//     const loadInitialData = async () => {
//         setLoading(true);
//         try {
//             const [reservoirs, hydropower] = await Promise.all([
//                 DataService.loadReservoirData(),
//                 DataService.loadHydropowerData(),
//             ]);
//             setReservoirData(reservoirs);
//             setHydropowerData(hydropower);
//         } catch (error) {
//             console.error("Error loading data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <MainLayout title="SEA-WEA Dashboard">
//             <div className="dashboard-container">
//                 {/* Add your dashboard components here */}
//                 <MapComponent
//                     reservoirs={reservoirData}
//                     hydropower={hydropowerData}
//                     loading={loading}
//                 />
//             </div>
//         </MainLayout>
//     );
// }

import ReservoirDashboard from "../components/Dashboard/ReservoirDashboard";

export default function Home() {
    return <ReservoirDashboard />;
}
