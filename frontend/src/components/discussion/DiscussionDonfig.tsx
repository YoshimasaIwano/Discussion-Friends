import { Col, Row } from 'react-bootstrap';
import SpeechRateControl from './SpeechRateControl';
import { languageDictionary } from '../../types';
import { useDiscussion } from '../../hooks/useDiscussionContext';

const DiscussionConfig = () => {
  const { language, topic, speakingRate, setSpeakingRate } = useDiscussion();
  return (
    <Row className="gx-3 text-center">
      <Col xs={12} sm={4} className="mx-auto">
        <div>
          <strong>Language:</strong>
        </div>
        <h3 className="capitalize-bold">
          {languageDictionary[language].language}
        </h3>
      </Col>
      <Col xs={12} sm={4} className="mx-auto">
        <div>
          <strong>Topic:</strong>
        </div>
        <h3 className="capitalize-bold">{topic}</h3>
      </Col>
      <Col xs={12} sm={4} className="mx-auto">
        <SpeechRateControl
          speakingRate={speakingRate}
          setSpeakingRate={setSpeakingRate}
        />
      </Col>
    </Row>
  );
};

export default DiscussionConfig;
