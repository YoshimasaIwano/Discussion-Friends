// Home.tsx
import { Button, Container, Form, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDiscussion } from "../hooks/DiscussionContext";

function Home() {
  const { language, topic, level, setLanguage, setTopic, setLevel } = useDiscussion();
  const navigate = useNavigate();

  const handleStartDiscussion = () => {
    navigate("/Discussion");
  };

  return (
    <Container className="home-wrapper">
      <h1 className="home-heading">AI Brain<span className="home-heading-gym">Gym</span></h1>
      <p className="home-heading-copy">Why don't you train your brain at our "gym"?</p>
      <Form className="option-items-wrapper">
        <Form.Group as={Row} controlId="topic" className="option language">
          <Form.Label column sm={2}>
            language
          </Form.Label>
          <Col sm={2}>
            <Form.Control
              as="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="option-form language"
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
              {/* // Add more options here */}
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="topic"  className="option topic">
          <Form.Label column sm={2}>
            Topic
          </Form.Label>
          <Col sm={2}>
            <Form.Control
              as="select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="option-form topic"              
            >
              <option value="">Select a topic</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="sports">Sports</option>
              {/* // Add more options here */}
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="level" className="option level">
          <Form.Label column sm={2}>
            Level
          </Form.Label>
          <Col sm={2}>
            <Form.Control
              as="select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="option-form level"                
            >
              <option value="">Select a level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Form.Control>
          </Col>
        </Form.Group>
        <Button
          // variant="secondary"
          disabled={!topic || !level}
          onClick={handleStartDiscussion}
          className="option-btn"
        >
          Start Discussion
        </Button>
      </Form>
      
    </Container>
  );
}

export default Home;
