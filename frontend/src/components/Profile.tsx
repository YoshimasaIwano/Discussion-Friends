import React, { useState } from "react";
import { firebase, firestore } from "../firebase/firebase";
import { useDiscussion } from "../hooks/DiscussionContext";

function Profile() {
  const currentUser = firebase.auth().currentUser;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { chatHistory } = useDiscussion();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (currentUser && selectedFile) {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error uploading the image");
        }

        const result = await response.json();
        const photoURL = result.photoURL;

        await currentUser.updateProfile({ photoURL });

        const userRef = firestore.collection("users").doc(currentUser.uid);
        await userRef.update({ photoURL });

        setSelectedFile(null);
      } catch (error) {
        console.error("Error uploading the image:", error);
        setErrorMessage("Error uploading the image. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <h1>Profile</h1>
      <p>user name: {currentUser?.displayName}</p>
      <p>email: {currentUser?.email}</p>
      {currentUser?.photoURL ? (
        <div>
          <img
            src={currentUser.photoURL}
            alt="User profile"
            style={{ width: "100px" }}
          />
        </div>
      ) : (
        <p>No profile picture available</p>
      )}
      <input type="file" accept="image/*" onChange={handleFileInputChange} />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? "Uploading..." : "Upload"}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
      <div>
        <h1>Chat History</h1>
        <ul>
          {chatHistory.map((chat, index) => (
            <li key={index}>
              {chat.role}: {chat.content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Profile;
