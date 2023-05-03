import React, { useState } from "react";
import { firebase, firestore } from "../firebase/firebase";
import { useDiscussion } from "../hooks/DiscussionContext";

function Profile() {
  const currentUser = firebase.auth().currentUser;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { discussions } = useDiscussion();

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

  const tmpChatHistory = [
    {
      role: "user",
      content: "Hello, how are you?",
    },
    {
      role: "assistant",
      content: "Hi! I'm doing great, thank you. How can I help you today?",
    },
    {
      role: "user",
      content: "What's the weather like today?",
    },
    {
      role: "assistant",
      content:
        "Today's weather is sunny with a high of 75°F and a low of 55°F.",
    },
  ];

  return (
    <div className="profile-wrapper">
      {currentUser?.photoURL ? (
        <div>
          <img
            src={currentUser.photoURL}
            alt="User profile"
            className="profile-img"
          />
        </div>
      ) : (
        <p>No profile picture available</p>
      )}
      <p className="username">{currentUser?.displayName}</p>
      <p className="email">{currentUser?.email}</p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden-input"
      />
      <div className="upload-btn-wrapper">
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="upload-btn"
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      <div className="chat-history-wrapper">
        <h1>Latest Chat History</h1>
        <ul className="chat-history-list">
          {discussions.map((discussion, index) => (
            <div key={index}>
              <h3>{discussion.topic}</h3>
              <p>{discussion.datetime}</p>
              <p>{discussion.summaryText}</p>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Profile;
