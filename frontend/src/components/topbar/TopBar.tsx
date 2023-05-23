import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../firebase/AuthContent";
import { firebase } from "../../firebase/firebase";
import { Navbar, Nav } from "react-bootstrap";
import { useDiscussion } from "../../hooks/DiscussionContext";

function TopBar() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const { darkMode, toggleDarkMode } = useDiscussion();

  const handleCollapse = () => {
    setExpanded(false);
  };

  const signOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="d-flex align-items-top justify-content-between">
      <Navbar
        expand="sm"
        expanded={expanded}
        bg="transparent"
        variant={darkMode ? "dark" : "light"}
        className="px-2"
      >
        <Navbar.Brand
          as={NavLink}
          to="/"
          className="fw-bold"
          onClick={handleCollapse}
        >
          Rally
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
          className=""
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link as={NavLink} to="/" onClick={handleCollapse}>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/Profile" onClick={handleCollapse}>
              Profile
            </Nav.Link>
            {user && (
              <Nav.Link
                onClick={() => {
                  signOut();
                  handleCollapse();
                }}
              >
                SignOut
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <div className="px-5 mt-3">
        <button
          className={`dark-mode-btn ${
            darkMode ? "dark-mode-btn-white" : "dark-mode-btn-black"
          }`}
          onClick={toggleDarkMode}
        >
          <i className="bi bi-sun-fill"></i>
        </button>
      </div>
    </div>
  );
}

export default TopBar;
