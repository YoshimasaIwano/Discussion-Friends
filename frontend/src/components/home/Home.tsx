// Home.tsx
import { Button, Container, Form, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDiscussion } from '../../hooks/useDiscussionContext';
import { useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import TopicSelection from './TopicSelection';
import LanguageSelection from './LanguageSelection';
import LevelSelection from './LevelSelection';
import SpeedSelection from './SpeedSelection';
import FeedbackInformation from './FeedbackInformation';

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
    navigate('/Discussion');
  };

  useEffect(() => {
    if (language && topic && level && speakingRate) {
      setLanguage('en');
      setTopic('');
      setLevel('');
      setSpeakingRate(1.0);
    }
  }, []);

  return (
    <Container className="text-center my-5 vh-100">
      <CSSTransition in={true} timeout={1000} classNames="fade" appear>
        <div>
          <h1 className="display-4">Rally</h1>
          <p className="lead mb-4">
            The digital dojo where you master debate and sharpen your intellect!
          </p>
        </div>
      </CSSTransition>
      <Form className="mx-auto">
        <Row>
          <LanguageSelection language={language} setLanguage={setLanguage} />
          <TopicSelection topic={topic} setTopic={setTopic} />
          <LevelSelection level={level} setLevel={setLevel} />
          <SpeedSelection
            speakingRate={speakingRate}
            setSpeakingRate={setSpeakingRate}
          />
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
      <FeedbackInformation />
    </Container>
  );
}

export default Home;
