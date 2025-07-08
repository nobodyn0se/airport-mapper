import './GCMapper.css';

import SearchPane from "@components/SearchPane.tsx";
import RouteList from "@components/RouteList.tsx";
import React, {useEffect, useState, Suspense, startTransition} from "react";
import {FaBars} from "react-icons/fa";
import MapSpinner from "@util/MapSpinner.tsx";

const LazyMap = React.lazy(() => import("@components/MapComponent.tsx"))
// using async await to avoid promise chaining mismatch
const FakeLazyMap = React.lazy(async () => {
    await new Promise(resolve => setTimeout(resolve, 5000)); // delay 5 seconds
    const module = await import('@components/FakeLazyMap.tsx');
    return {default: module.default};
});

function GCMapper() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadMap, setLoadMap] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleResize = () => {
        if (window.matchMedia("(min-width: 768px)").matches) {
            setIsSidebarOpen(false); // Automatically open the sidebar
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();

        startTransition(() => setLoadMap(true));

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="flex relative h-screen w-screen">
            <button
                className="p-2 bg-blue-500 rounded md:hidden absolute top-4 left-4 z-10"
                onClick={toggleSidebar}
            >
                <FaBars/>
            </button>
            <div
                className={`${
                    isSidebarOpen ? 'block w-4/5 h-full absolute top-16 left-0 z-20 bg-gray-242424' : 'hidden'
                } md:block p-4 min-w-1/4`}
            >
                <SearchPane/>
                <RouteList/>
            </div>
            <div className="flex-1">
                {loadMap &&
                    <Suspense fallback={<MapSpinner/>}>
                        <LazyMap/>
                    </Suspense>
                }
            </div>
        </div>
    );
}

export default GCMapper
