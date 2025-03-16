import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appContext } from "../App.js";
import '../styles/NavBar.css';

import { RiDashboardFill, RiComputerLine } from "react-icons/ri";

function NavBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const { user, setUser, srvPort } = useContext(appContext);
  const [links, setLinks] = useState([]);

  useEffect(() => { console.log("user", user) }, []);


  useEffect(() => {
    //Sidebar Nav Links
    const links = [
      { name: "Game", to: "/game", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Teams", to: "/teams", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Logout", to: "/logout", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Admin", to: "/admin", icon: <RiDashboardFill />, protection: "admin" }
    ];

    // Function to check if a link should be displayed
    const isLinkVisible = (link) => {
      if (!user) return false
      console.log("user nav tester", user)
      if (link.protection === "none") return true;
      if (link.protection === "loggedIn" && user.name) return true;
      if (link.protection === "admin" && user.isAdmin) return true;
      return false;
    };
    // links.filter(isLinkVisible)

    setLinks(links.filter(isLinkVisible));

  }, [user]);


  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div>
          <h1>
            18 CS PT Game
          </h1>
          <h2>
             {user? <>Team: {user.name}</>: ""}
          </h2>
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
