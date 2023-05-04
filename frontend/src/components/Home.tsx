// Home.tsx
import { Button, Container, Form, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDiscussion } from "../hooks/DiscussionContext";

function Home() {
  const {
    language,
    topic,
    level,
    speakingRate,
    setLanguage,
    setTopic,
    setLevel,
    setSpeakingRate,
  } = useDiscussion();
  const navigate = useNavigate();

  const handleStartDiscussion = () => {
    navigate("/Discussion");
  };

  return (
    <Container>
      <h1>
        AI Brain<span>Gym</span>
      </h1>
      <p>
        Why don't you train your brain at our "gym"?
      </p>
      <Form>
        <Form.Group as={Row} controlId="topic">
          <Form.Label column sm={2}>
            language
          </Form.Label>
          <Col sm={2}>
            <Form.Control
              as="select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
              {/* // Add more options here */}
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="topic">
          <Form.Label column sm={2}>
            Topic
          </Form.Label>
          <Col sm={2}>
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
          <Col sm={2}>
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
        <Form.Group
          as={Row}
          controlId="speakingRate"
        >
          <Form.Label column sm={2}>
            Speaking Rate
          </Form.Label>
          <Col sm={2}>
            <Form.Control
              type="range"
              min="0.25"
              max="4.0"
              step="0.01"
              value={speakingRate}
              onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
            />
          </Col>
          <Col sm={2}>
            <Form.Text>{speakingRate.toFixed(2)}</Form.Text>
          </Col>
        </Form.Group>
        <Button
          // variant="secondary"
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
