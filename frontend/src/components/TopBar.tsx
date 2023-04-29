import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../firebase/AuthContent";
import { firebase } from "../firebase/firebase";
import { Navbar, Nav } from "react-bootstrap";

const TopBar: React.FC = () => {
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
      <Navbar.Brand as={NavLink} to="/" onClick={handleCollapse}>
        My App
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
  );
};

export default TopBar;
