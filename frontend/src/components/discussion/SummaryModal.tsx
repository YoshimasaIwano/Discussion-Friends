import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { sum } from '../../functions/utils';
import { DiscussionSummary } from '../../types';
import { useNavigate } from 'react-router-dom';
import GoogleFormLogo from '../../assets/Google_Forms_Logo_128px.png';
import TwitterLogo from '../../assets/Twitter_social_icons.png';

interface SummaryModalProps {
  show: boolean;
  summaryContent: DiscussionSummary | undefined;
  setShowSummary: React.Dispatch<React.SetStateAction<boolean>>;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
  show,
  summaryContent,
  setShowSummary,
}) => {
  const navigate = useNavigate();

  const goToHomePage = () => {
    setShowSummary(false);
    navigate('/');
  };

  return (
    <Modal show={show} onHide={() => setShowSummary(false)} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Summary</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {summaryContent && (
          <>
            <h5 className="text-capitalize font-weight-bold">Main Points</h5>
            <p>{summaryContent.mainPoints}</p>
            <h5 className="text-capitalize font-weight-bold">Conclusion</h5>
            <p>{summaryContent.conclusion}</p>
            <h5 className="text-capitalize font-weight-bold">Feedback</h5>
            <p>{summaryContent.feedback}</p>
            <h5 className="text-capitalize font-weight-bold">Score</h5>
            <p>{sum(summaryContent.score)}</p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center align-items-center">
        <div>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSe5xtkBSU-1_3oX4wySaD0i25dX2rGiGv-2lPt-HDPd-dGLYg/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={GoogleFormLogo}
              alt="Google Form"
              style={{ width: '48px', height: '48px' }}
            />
          </a>
        </div>
        <div>
          <a
            href="https://twitter.com/intent/tweet?text=@Rally_xyz%20%0ABoost%20your%20logical%20thinking%20with%20Rally!%20This%20innovative%20app%20lets%20you%20choose%20topics%20and%20levels%20to%20customize%20your%20learning%20journey.%20Check%20it%20out!%20https://treasure-385205.uc.r.appspot.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={TwitterLogo}
              alt="Share on Twitter"
              style={{ width: '48px', height: '48px' }}
            />
          </a>
        </div>
        <div>
          <Button variant="secondary" onClick={goToHomePage}>
            Home
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SummaryModal;
