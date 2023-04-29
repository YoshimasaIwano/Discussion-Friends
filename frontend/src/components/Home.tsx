// Home.tsx
import React, { useState } from "react";
import { Button, Container, Form, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDiscussion } from "../hooks/DiscussionContext";

function Home() {
  const { topic, level, setTopic, setLevel } = useDiscussion();
  const navigate = useNavigate();
  

  const handleStartDiscussion = () => {
    navigate("/Discussion");
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">AI Discussion App</h1>
      <Form>
        <Form.Group as={Row} controlId="topic">
          <Form.Label column sm={2}>
            Topic
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              as="select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Select a topic</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="sports">Sports</option>
              {/* // Add more options here */}
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="level">
          <Form.Label column sm={2}>
            Level
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              as="select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">Select a level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Form.Control>
          </Col>
        </Form.Group>
        <Button
          variant="primary"
          disabled={!topic || !level}
          onClick={handleStartDiscussion}
        >
          Start Discussion
        </Button>
      </Form>
    </Container>
  );
}

export default Home;
