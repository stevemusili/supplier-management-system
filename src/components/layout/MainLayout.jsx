import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout() {
    return (
        <div>
            <SideBar />

            <div>
                <Navbar />

                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;