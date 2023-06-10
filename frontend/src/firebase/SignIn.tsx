import { firebase, firestore } from './firebase';
import { useAuth } from './AuthContent';
import { Container, Row, Col } from 'react-bootstrap';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import App from '../App';
import { useDiscussion } from '../hooks/DiscussionContext';
import { useEffect, useRef } from 'react';

import googleSignInBtn from '../assets/btn_google_signin_light_normal_web.png';


function SignIn() {
  const { darkMode } = useDiscussion();
  const { user } = useAuth();
  const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);
  const signInContainerRef = useRef<HTMLDivElement | null>(null);

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
        ],
      };

      uiRef.current.start('#firebaseui-auth-container', uiConfig);
    }
  }, [user]);



  const saveUserData = async (user: firebase.User) => {
    const userRef = firestore.collection('users').doc(user.uid);

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
        console.error('Error adding user data to Firestore:', error);
      }
    }
  };

  const handleSignInWithGoogle = async (e: React.MouseEvent) => {
    e.preventDefault();
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
      if (user) {
        saveUserData(user);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className={darkMode ? 'dark-mode ' : ''}>
      <Container className="min-vh-100 bg-light text-dark" fluid="lg">
        {!user ? (
          <Row className="vh-100 align-items-center">
            <Col className="text-center">
              <h1 className="display-4">Welcome Back</h1>
              <p className="lead mb-4">Improve your learning productivity</p>
              <div
                id="firebaseui-auth-container"
                ref={signInContainerRef}
              ></div>
              <button
                onClick={handleSignInWithGoogle}
                className="mt-3 google-signin-btn"
              >
                <img src={googleSignInBtn} alt="Sign in with Google" />
              </button>
            </Col>
          </Row>
        ) : (
          <App />
        )}
      </Container>
    </div>
  );
}

// function SignIn() {
//   const { darkMode } = useDiscussion();
//   const { user } = useAuth();
//   const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);
//   const signInContainerRef = useRef<HTMLDivElement | null>(null);
//   // const [showModal, setShowModal] = useState(false);

//   const saveUserData = async (user: firebase.User) => {
//     const userRef = firestore.collection("users").doc(user.uid);

//     const userData = await userRef.get();
//     if (!userData.exists) {
//       try {
//         await userRef.set({
//           displayName: user.displayName,
//           email: user.email,
//           uid: user.uid,
//           photoURL: user.photoURL || null,
//         });
//       } catch (error) {
//         console.error("Error adding user data to Firestore:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       saveUserData(user); // Save user data when the user is signed in
//     }
//     if (!user && signInContainerRef.current) {
//       if (!uiRef.current) {
//         uiRef.current = new firebaseui.auth.AuthUI(firebase.auth());
//       }

//       const uiConfig = {
//         callbacks: {
//           signInSuccessWithAuthResult: () => {
//             return false;
//           },
//         },
//         signInOptions: [
//           firebase.auth.EmailAuthProvider.PROVIDER_ID,
//           firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//         ],
//       };

//       uiRef.current.start("#firebaseui-auth-container", uiConfig);
//     }
//   }, [user]);

//   return (
//     <div className={darkMode ? "dark-mode " : ""}>
//       <Container className="min-vh-100 bg-light text-dark" fluid="lg">
//         {!user ? (
//           <Row className="vh-100 align-items-center">
//             <Col className="text-center">
//               <h1 className="display-4">Welcome Back</h1>
//               <p className="lead mb-4">Improve your learning productivity</p>
//               <div
//                 id="firebaseui-auth-container"
//                 ref={signInContainerRef}
//               ></div>
//             </Col>
//           </Row>
//         ) : (
//           <App />
//         )}
//       </Container>
//     </div>
//   );

//   // Using popup
//   // useEffect(() => {
//   //   if (user) {
//   //     saveUserData(user);
//   //   }
//   //   if (showModal && !user && signInContainerRef.current) {
//   //     if (!uiRef.current) {
//   //       uiRef.current = new firebaseui.auth.AuthUI(firebase.auth());
//   //     }

//   //     const uiConfig = {
//   //       callbacks: {
//   //         signInSuccessWithAuthResult: () => {
//   //           setShowModal(false);
//   //           return false;
//   //         },
//   //       },
//   //       signInOptions: [
//   //         firebase.auth.EmailAuthProvider.PROVIDER_ID,
//   //         firebase.auth.GoogleAuthProvider.PROVIDER_ID,
//   //       ],
//   //     };

//   //     uiRef.current.start("#firebaseui-auth-container", uiConfig);
//   //   }
//   // }, [user, showModal]);

//   // const handleShowModal = () => {
//   //   setShowModal(true);
//   // };

//   // return (
//   //   <div className={darkMode ? "dark-mode " : ""}>
//   //     <Container className="min-vh-100 bg-light text-dark" fluid="lg">
//   //       {!user ? (
//   //         <Row className="vh-100 align-items-center">
//   //           <Col className="text-center">
//   //             <h1 className="display-4">Welcome Back</h1>
//   //             <p className="lead mb-4">Improve your learning productivity</p>
//   //             <Button onClick={handleShowModal}>Sign In</Button>
//   //             <Modal show={showModal} onHide={() => setShowModal(false)}>
//   //               <Modal.Header closeButton>
//   //                 <Modal.Title>Sign In</Modal.Title>
//   //               </Modal.Header>
//   //               <Modal.Body>
//   //                 <div
//   //                   id="firebaseui-auth-container"
//   //                   ref={signInContainerRef}
//   //                 ></div>
//   //               </Modal.Body>
//   //             </Modal>
//   //           </Col>
//   //         </Row>
//   //       ) : (
//   //         <App />
//   //       )}
//   //     </Container>
//   //   </div>
//   // );

// }

export default SignIn;
