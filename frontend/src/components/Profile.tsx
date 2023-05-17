import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Modal,
} from "react-bootstrap";
import { firestore } from "../firebase/firebase";
import { useAuth } from "../firebase/AuthContent";
import { useDiscussion } from "../hooks/DiscussionContext";
import { sum } from "../functions/utils";
import { DiscussionSummary } from "../types";
import PolarGraph from "./PolarGraph";

function Profile() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { discussions } = useDiscussion();
  const [showModal, setShowModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionSummary | null>(null);

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

  const handleDiscussionClick = (discussion: DiscussionSummary) => {
    setSelectedDiscussion(discussion);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedDiscussion(null);
    setShowModal(false);
  };

  return (
    <Container className="py-4">
      <Row className="my-4 py-4">
        <Col md={4} className="text-center">
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
          <Row xs={1} md={2} className="g-4">
            {discussions
              .slice()
              .reverse()
              .map((discussion, index) => {
                return (
                  <Col>
                    <Card
                      key={index}
                      className="mb-2 cursor-pointer card-discussion card-background"
                      onClick={() => handleDiscussionClick(discussion)}
                    >
                      <Card.Body className="px-1 text-center">
                        <Card.Title className="text-capitalize font-weight-bold discussion-title">
                          {discussion.topic}
                        </Card.Title>
                        <Card.Subtitle className="mb-2 ">
                          {formatDate(discussion.datetime)}
                        </Card.Subtitle>
                        <div className="d-flex ">
                          <Card.Text className="m-auto">
                            <strong>Level:</strong> {discussion.level}
                          </Card.Text>
                          <Card.Text className="m-auto">
                            <strong>Language:</strong> {discussion.language}
                          </Card.Text>
                          <Card.Text className="m-auto">
                            <strong>Score:</strong> {sum(discussion.score)}
                          </Card.Text>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
          </Row>
        </Col>
      </Row>
      {selectedDiscussion && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="text-capitalize">
              {selectedDiscussion.topic}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Main Points:</strong> {selectedDiscussion.mainPoints}
            </p>
            <p>
              <strong>Conclusion:</strong> {selectedDiscussion.conclusion}
            </p>
            <p>
              <strong>Feedback:</strong> {selectedDiscussion.feedback}
            </p>
            <PolarGraph scores={selectedDiscussion.score} />
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );

}

export default Profile;
