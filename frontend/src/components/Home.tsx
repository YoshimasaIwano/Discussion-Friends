// Home.tsx
import { Button, Container, Form, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDiscussion } from "../hooks/DiscussionContext";
import { useEffect } from "react";
import { CSSTransition } from "react-transition-group";

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

  useEffect(() => {
    if (language && topic && level && speakingRate) {
      setLanguage("en");
      setTopic("");
      setLevel("");
      setSpeakingRate(1.0);
    }
  }, []);

  return (
    <Container className="text-center my-5 vh-100">
      <CSSTransition in={true} timeout={1000} classNames="fade" appear>
        <div>
          <h1 className="display-4">
            AI Brain <span className="heading-gym fw-bold">Gym</span>
          </h1>
          <p className="lead mb-4">
            Why don't you train your brain at our "gym"?
          </p>
        </div>
      </CSSTransition>
      <Form className="mx-auto">
        <Row>
          <Form.Group as={Col} className="px-ns-0" controlId="language">
            <Form.Label>Language</Form.Label>
            <Form.Control
              as="select"
              value={language}
              className="text-center text-small "
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="ja">Japanese</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
              {/* // Add more options here */}
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} className="px-ns-0" controlId="topic">
            <Form.Label>Topic</Form.Label>
            <Form.Control
              as="select"
              value={topic}
              className={`text-center text-small ${topic ? "" : "text-danger"}`}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Select a topic</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="sports">Sports</option>
              <option value="business">Business</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="politics">Politics</option>
              <option value="entertainment">Entertainment</option>
              <option value="history">History</option>
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} className="px-ns-0" controlId="level">
            <Form.Label>Level</Form.Label>
            <Form.Control
              as="select"
              value={level}
              className={`text-center text-small ${level ? "" : "text-danger"}`}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="" className="text-red">
                Select a level
              </option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Form.Control>
          </Form.Group>
          <Form.Group as={Col} className="px-ns-0" controlId="speakingRate">
            <Form.Label>Speed</Form.Label>
            <Form.Control
              type="range"
              min="0.25"
              max="4.0"
              step="0.01"
              value={speakingRate}
              onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
            />
            <p>{speakingRate.toFixed(2)}</p>
          </Form.Group>
          <Col xs={12}>
            <Button
              className="mt-3 discussion-button"
              // variant="primary"
              disabled={!topic || !level}
              onClick={handleStartDiscussion}
            >
              Start Discussion
            </Button>
          </Col>
          <Col xs={12}>
            <Button
              className="mt-auto"
              style={{ backgroundColor: 'blue', borderColor: 'blue' }}
              // variant="primary"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe5xtkBSU-1_3oX4wySaD0i25dX2rGiGv-2lPt-HDPd-dGLYg/viewform', '_blank')}
            >
              Give Feedback to get early access
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default Home;
