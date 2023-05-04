import React, { useContext, useEffect, useRef } from "react";
import { firebase, firestore } from "./firebase";
import { useAuth } from "./AuthContent";
import { Container, Row, Col } from "react-bootstrap";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import App from "../App";
import { useDiscussion } from "../hooks/DiscussionContext";

function SignIn() {
  const { darkMode } = useDiscussion();
  const { user } = useAuth();
  const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);
  const signInContainerRef = useRef<HTMLDivElement | null>(null);

  const saveUserData = async (user: firebase.User) => {
    const userRef = firestore.collection("users").doc(user.uid);

    const userData = await userRef.get();
    if (!userData.exists) {
      try {
        await userRef.set({
          displayName: user.displayName,
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL || null,
        });
      } catch (error) {
        console.error("Error adding user data to Firestore:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      saveUserData(user); // Save user data when the user is signed in
    }
    if (!user && signInContainerRef.current) {
      if (!uiRef.current) {
        uiRef.current = new firebaseui.auth.AuthUI(firebase.auth());
      }

      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: () => {
            return false;
          },
        },
        signInOptions: [
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
      };

      uiRef.current.start("#firebaseui-auth-container", uiConfig);
    }
  }, [user]);

  return (
    <div className={darkMode ? "dark-mode " : ""}>
      <Container className="bg-light text-dark" fluid="lg">
        {!user ? (
          <Row className="vh-100 align-items-center">
            <Col className="text-center">
              <h1 className="display-4">Welcome Back</h1>
              <p className="lead mb-4">Improve your learning productivity</p>
              <div
                id="firebaseui-auth-container"
                ref={signInContainerRef}
              ></div>
            </Col>
          </Row>
        ) : (
          <App />
        )}
      </Container>
    </div>
  );
}

export default SignIn;
