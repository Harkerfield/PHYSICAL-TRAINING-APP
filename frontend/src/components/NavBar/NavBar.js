import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { appContext } from "../../App.js";
import './NavBar.css';
import { RiDashboardFill, RiComputerLine } from "react-icons/ri";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { team, setteam, srvPort } = useContext(appContext);
  const [links, setLinks] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const currentRoute = location.pathname.replace('/', '').replace(/-/g, ' ').toUpperCase(); // Format to all caps
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => { console.log("team", team) }, []);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const response = await fetch(`/api/gameTransactions/countdown`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCountdown(new Date(data.end_time));
      } catch (error) {
        console.error('Error fetching countdown timer:', error);
      }
    };

    fetchCountdown();
  }, []);

  useEffect(() => {
    if (countdown) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeDiff = countdown - now;
        if (timeDiff <= 0) {
          clearInterval(interval);
          setTimeRemaining('Time is up!');
          // alert('Time is up! The game is over.');
          // Add logic to handle game completion
        } else {
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

          let timeString = '';
          if (hours > 0) timeString += `${hours}h `;
          if (minutes > 0) timeString += `${minutes}m `;
          if (hours === 0 && minutes === 0) timeString += `${seconds}s`;

          setTimeRemaining(timeString.trim());
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [countdown]);

  useEffect(() => {
    //Sidebar Nav Links
    const links = [
      { name: "Game", to: "/game", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Team Scores", to: "/teamScores", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "My Team", to: "/my-team", icon: <RiDashboardFill />, protection: "loggedIn" },
      { name: "Admin", to: "/admin", icon: <RiDashboardFill />, protection: "admin" },
      { name: "Locations", to: "/locations", icon: <RiDashboardFill />, protection: "admin" },
      { name: "Media", to: "/media", icon: <RiDashboardFill />, protection: "admin" },
      { name: "Logout", to: "/logout", icon: <RiDashboardFill />, protection: "loggedIn" }
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
        <div className="navbar-header">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <div>Menu {dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}</div>
          </button>
          <h1>
            18 CS {currentRoute ? <>- {currentRoute}: {team.name}</> : ""}
          </h1>
          {countdown && (
            <div className="countdown-timer">
              Time remaining: {timeRemaining}
            </div>
          )}
        </div>

        <div className="nav-links">

          <div className="dropdown">

            {dropdownOpen && (
              <div className="dropdown-menu">
                <hr />
                {links.map((link, i) => (
                  <React.Fragment key={i}>
                    <Link key={i} to={link.to} onClick={() => setDropdownOpen(false)}>
                      <span className="link">
                        {link.icon ? link.icon : <RiDashboardFill />} {link.name}
                      </span>
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
export default NavBar;
