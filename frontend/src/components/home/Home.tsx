// Home.tsx
import { Button, Container, Form, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDiscussion } from "../../hooks/DiscussionContext";
import { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import GoogleFormLogo from "../../assets/Google_Forms_Logo_128px.png";
import TwitterLogo from "../../assets/Twitter_social_icons.png";

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
            Rally
          </h1>
          <p className="lead mb-4">
            The digital dojo where you master debate and sharpen your intellect!
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
        </Row>
      </Form>
      <div className="mt-5 d-flex justify-content-center">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSe5xtkBSU-1_3oX4wySaD0i25dX2rGiGv-2lPt-HDPd-dGLYg/viewform"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={GoogleFormLogo}
            alt="Google Form"
            style={{ width: "48px", height: "48px", marginRight: "20px" }}
          />
        </a>
        <a
          href="https://twitter.com/intent/tweet?text=@Rally_xyz%20%0ABoost%20your%20logical%20thinking%20with%20Rally!%20This%20innovative%20app%20lets%20you%20choose%20topics%20and%20levels%20to%20customize%20your%20learning%20journey.%20Check%20it%20out!%20https://treasure-385205.uc.r.appspot.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={TwitterLogo}
            alt="Share on Twitter"
            style={{ width: "48px", height: "48px" }}
          />
        </a>
      </div>
      <div className="mt-5">
        <p className="text-center font-weight-bold text-primary fs-5">
          <span className="text-danger">
            We&apos;d love to hear your feedback!
          </span>{" "}
          <br />
          Join our  <i className="fab fa-google text-success"></i> 
          Waitlist and Discord  by filling out this{" "}
          <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSe5xtkBSU-1_3oX4wySaD0i25dX2rGiGv-2lPt-HDPd-dGLYg/viewform" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-info"
        >
          Form!
          </a>
           <br />
          and Help us spread the word by sharing Rally on{" "}
          <a 
          href="https://twitter.com/intent/tweet?text=@Rally_xyz%20%0ABoost%20your%20logical%20thinking%20with%20Rally!%20This%20innovative%20app%20lets%20you%20choose%20topics%20and%20levels%20to%20customize%20your%20learning%20journey.%20Check%20it%20out!%20https://treasure-385205.uc.r.appspot.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-info"
        >
          Twitter!
          </a>
        </p>
      </div>
    </Container>
  );
}


export default Home;
