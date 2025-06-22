import './GCMapper.css';

import MapComponent from "./components/MapComponent.jsx";
import SearchPane from "./components/SearchPane.jsx";
import RouteList from "./components/RouteList.jsx";
import {useEffect, useState} from "react";
import {FaBars} from "react-icons/fa";

function GCMapper() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                    isSidebarOpen ? 'block w-full h-full absolute top-16 left-0 z-20 bg-gray-242424' : 'hidden'
                } md:block w-1/4 p-4`}
            >
                <SearchPane/>
                <RouteList/>
            </div>
            <div className="flex-1">
                <MapComponent/>
            </div>
        </div>
    );
}

export default GCMapper
