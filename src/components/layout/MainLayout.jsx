import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-100 md:flex">
            <SideBar />

            <div className="flex-1 min-w-0">
                <Navbar />

                <main className="p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;