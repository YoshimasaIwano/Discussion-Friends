import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../firebase/AuthContent";
import { firebase } from "../firebase/firebase";
import { Navbar, Nav } from "react-bootstrap";

function TopBar() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

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
    <Navbar expand="sm" expanded={expanded}>
      <Navbar.Brand as={NavLink} to="/" onClick={handleCollapse} style={{ color: "#ffffff", fontSize: "30px", fontWeight: "bold" }}>
        AI Brain<span className="nav-bar-gym">Gym</span>
      </Navbar.Brand>
      <Navbar.Toggle
        aria-controls="basic-navbar-nav"
        onClick={() => setExpanded(!expanded)}
      />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Nav.Link as={NavLink} to="/" onClick={handleCollapse} style={{ color: "#ffffff", fontSize: "25px" }}>
            Home
          </Nav.Link>
          <Nav.Link as={NavLink} to="/Profile" onClick={handleCollapse} style={{ color: "#ffffff", fontSize: "25px" }}>
            Profile
          </Nav.Link>
          {user && (
            <Nav.Link
              onClick={() => {
                signOut();
                handleCollapse();
              }}
              style={{ color: "#ffffff", fontSize: "25px" }}
            >
              SignOut
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default TopBar;
