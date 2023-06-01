import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebase, firestore } from './firebase';
import { Button, Form, Modal } from 'react-bootstrap';

interface AuthContextType {
  user: firebase.User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  initializing: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const [userGeneration, setUserGeneration] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userOccupation, setUserOccupation] = useState('');

  const isUserDataComplete =
    userGeneration && userGender && userOccupation ? true : false;

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setInitializing(false);

      if (user) {
        // Fetch user data from Firestore
        firestore
          .collection('users')
          .doc(user.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              const data = doc.data();
              setUserGeneration(data?.generation);
              setUserGender(data?.gender);
              setUserOccupation(data?.occupation);

              // Check if user has already completed their profile
              if (!data?.hasCompletedProfile) {
                setShowModal(true);
              }
            } else {
              // No such document or the user hasn't completed their profile
              setShowModal(true);
            }
          })
          .catch((error) => {
            console.log('Error getting document:', error);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFormSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Save user info to Firestore
    const user = firebase.auth().currentUser;
    if (user) {
      firestore
        .collection('users')
        .doc(user.uid)
        .update({
          generation: userGeneration,
          gender: userGender,
          occupation: userOccupation,
          hasCompletedProfile: true, // set the flag indicating the user has completed their profile
        })
        .then(() => {
          setShowModal(false);
        });
    }
  };

  return (
    <AuthContext.Provider value={{ user, initializing }}>
      <Modal
        show={showModal}
        backdrop="static"
        keyboard={false}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header>
          <Modal.Title>Please enter your information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="userAge">
              <Form.Label>Generation</Form.Label>
              <Form.Control
                as="select"
                name="generation"
                value={userGeneration}
                onChange={(e) => setUserGeneration(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="20s">20s</option>
                <option value="30s">30s</option>
                <option value="40s">40s</option>
                <option value="50s">50s</option>
                <option value="60s">60s</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="userGender">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={userGender}
                onChange={(e) => setUserGender(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="userOccupation">
              <Form.Label>Occupation</Form.Label>
              <Form.Control
                as="select"
                name="occupation"
                value={userOccupation}
                onChange={(e) => setUserOccupation(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="student">University Student</option>
                <option value="engineer">Engineer</option>
                <option value="consultant">Consultant</option>
                <option value="other">Other</option>
              </Form.Control>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="mt-2"
              disabled={!isUserDataComplete}
            >
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {children}
    </AuthContext.Provider>
  );
};
