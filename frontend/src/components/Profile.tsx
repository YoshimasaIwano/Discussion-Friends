import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Form,
} from "react-bootstrap";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContent";
import { useDiscussion } from "../hooks/DiscussionContext";
import { sum } from "../functions/utils";

function Profile() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { discussions } = useDiscussion();

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (selectedFile: File) => {
    if (user) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Container className="py-4">
      <Row className="my-4 py-4 text-center">
        <Col md={4}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="User profile"
              className="img-thumbnail img-fluid profile-image"
            />
          ) : (
            <p>No profile picture available</p>
          )}
          <h3>{user?.displayName}</h3>
          <Form.Group controlId="formFile" className="d-none">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
            />
          </Form.Group>
          <Button
            disabled={isLoading}
            className="my-2"
            as="label"
            htmlFor="formFile"
          >
            {isLoading ? "Uploading..." : "Select Image"}
          </Button>
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
        </Col>
        <Col md={8}>
          <h2>Discussions</h2>
          <ListGroup className="discussions-list discussions-text">
            {discussions
              .slice()
              .reverse()
              .map((discussion, index) => {
                return (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <Card.Title className="text-capitalize font-weight-bold discussion-title">
                        {discussion.topic}
                      </Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {formatDate(discussion.datetime)}
                      </Card.Subtitle>
                      <Card.Text>
                        <strong>Score:</strong> {sum(discussion.score)}
                      </Card.Text>
                      <Card.Text>
                        <strong>Main Points:</strong> {discussion.mainPoints}
                      </Card.Text>
                      <Card.Text>
                        <strong>Conclusion:</strong> {discussion.conclusion}
                      </Card.Text>
                      <Card.Text>
                        <strong>Feedback:</strong> {discussion.feedback}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                );
              })}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
