import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../firebase/AuthContent";
import { firebase } from "../firebase/firebase";
import { Navbar, Nav } from "react-bootstrap";
import { useDiscussion } from "../hooks/DiscussionContext";

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
    <div className="d-flex align-items-center justify-content-between">
      <Navbar
        expand="sm"
        expanded={expanded}
        bg="transparent"
        variant={darkMode ? "dark" : "light"}
      >
        <Navbar.Brand as={NavLink} to="/" onClick={handleCollapse}>
          AI Brain<span>Gym</span>
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setExpanded(!expanded)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
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
      <button
        className={`dark-mode-btn pr-3 ${
          darkMode ? "dark-mode-btn-white" : "dark-mode-btn-black"
        }`}
        onClick={toggleDarkMode}
      >
        <i className="bi bi-sun-fill"></i>
      </button>
    </div>
  );
}

export default TopBar;
