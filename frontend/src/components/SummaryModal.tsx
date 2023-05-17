import React from "react";
import { Modal, Button } from "react-bootstrap";
import { sum } from "../functions/utils";
import { DiscussionSummary } from "../types";

const SummaryModal = ({
  show,
  onHide,
  summaryContent,
  goToHomePage,
}: {
  show: boolean;
  onHide: () => void;
  summaryContent: DiscussionSummary | undefined;
  goToHomePage: () => void;
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
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
      <Modal.Footer>
        <div className="d-flex justify-content-center">
          <Button variant="secondary" onClick={goToHomePage}>
            Home
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default SummaryModal;
