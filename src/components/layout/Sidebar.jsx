import { NavLink } from "react-router-dom";

function SideBar() {
    const links = [
        { name: "Dashboard", path: "/dashbaord" },
        { name: "Suppliers", path: "/suppliers" },
        { name: "Categories", path: "/categories" },
        { name: "Settings", path: "/setting" },
    ];

    return (
        <div>
            <div>
                <h1>Supplier Management System</h1>
            </div>

            <nav>
                {links.map((link) => (
                    <NavLink
                       key={link.path}
                       to={link.path}
                       className={({ isActive }) => `block rounded-lg px-4 py-3 ${isActive ? "bg-orange-500 text-white" : "hover:bg-blue-800"}`}
                    >
                        {link.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    )
}

export default SideBar;