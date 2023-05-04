import React, { useState } from "react";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContent";
import { useDiscussion } from "../hooks/DiscussionContext";

function Profile() {
  const { user } = useAuth();
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
    if (user && selectedFile) {
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

        await user.updateProfile({ photoURL });

        const userRef = firestore.collection("users").doc(user.uid);
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

  const parseSummaryText = (text: string) => {
    const mainPointsMatch = text.match(/Main points:\s(.*?)Conclusion:/s);
    const conclusionMatch = text.match(/Conclusion:\s(.*?)Feedback:/s);
    const feedbackMatch = text.match(/Feedback:\s(.*?)(?=\s[a-zA-Z]+:|\s*$)/s);

    const mainPoints = mainPointsMatch ? mainPointsMatch[1] : "none";
    const conclusion = conclusionMatch ? conclusionMatch[1] : "none";
    const feedback = feedbackMatch ? feedbackMatch[1] : "none";

    return { mainPoints, conclusion, feedback };
  };

  return (
    <div>
      {user?.photoURL ? (
        <div>
          <img src={user.photoURL} alt="User profile" />
        </div>
      ) : (
        <p>No profile picture available</p>
      )}
      <p>{user?.displayName}</p>
      <p>{user?.email}</p>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
      />
      <div>
        <button
          onClick={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      <ul>
        {discussions.map((discussion, index) => {
          const { mainPoints, conclusion, feedback } = parseSummaryText(
            discussion.summaryText
          );
          return (
            <div key={index}>
              <h3>{discussion.topic}</h3>
              <p>{discussion.datetime}</p>
              <h4>Main Points</h4>
              <p>{mainPoints}</p>
              <h4>Conclusion</h4>
              <p>{conclusion}</p>
              <h4>Feedback</h4>
              <p>{feedback}</p>
            </div>
          );
        })}
      </ul>
    </div>
  );
}

export default Profile;
