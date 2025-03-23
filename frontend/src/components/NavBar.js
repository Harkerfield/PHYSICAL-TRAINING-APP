import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { appContext } from "../App.js";
import '../styles/NavBar.css';

import { RiDashboardFill, RiComputerLine } from "react-icons/ri";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { team, setteam, srvPort } = useContext(appContext);
  const [links, setLinks] = useState([]);
  const currentRoute = location.pathname.replace('/', '').replace(/-/g, ' ').toUpperCase(); // Format to all caps

  useEffect(() => { console.log("team", team) }, []);


  useEffect(() => {
    //Sidebar Nav Links
    const links = [
      { name: "Game", to: "/game", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Teams", to: "/teams", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "My Team", to: "/my-team", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Logout", to: "/logout", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Admin", to: "/admin", icon: <RiDashboardFill />, protection: "admin" },
      { name: "Locations", to: "/locations", icon: <RiDashboardFill />, protection: "admin" }
    ];

    // Function to check if a link should be displayed
    const isLinkVisible = (link) => {
      if (!team) return false
      console.log("team nav tester", team)
      if (link.protection === "none") return true;
      if (link.protection === "loggedIn" && team.name) return true;
      if (link.protection === "admin" && team.isAdmin) return true;
      return false;
    };
    // links.filter(isLinkVisible)

    setLinks(links.filter(isLinkVisible));

  }, [team]);


  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div>
          <h1>
            18 CS {currentRoute? <>- {currentRoute}: {team.name}</> : ""}
          </h1>
        </div>
        <hr />
        <div className="nav-links">
         
          {links.map((link, i) => (
            <React.Fragment key={i}>
              <Link key={i} to={link.to}>
                <span className="link">
                  {link.icon ? link.icon : <RiDashboardFill />} {link.name}
                </span>
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
}
export default NavBar;
