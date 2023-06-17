import GoogleFormLogo from '../../assets/Google_Forms_Logo_128px.png';
import TwitterLogo from '../../assets/Twitter_social_icons.png';

// FeedbackInformation.tsx
function FeedbackInformation() {
  return (
    <>
      <div className="mt-5 d-flex justify-content-center">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSe5xtkBSU-1_3oX4wySaD0i25dX2rGiGv-2lPt-HDPd-dGLYg/viewform"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={GoogleFormLogo}
            alt="Google Form"
            style={{ width: '48px', height: '48px', marginRight: '20px' }}
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
            style={{ width: '48px', height: '48px' }}
          />
        </a>
      </div>
      <div className="mt-5">
        <p className="text-center font-weight-bold text-primary fs-5">
          <span className="text-danger">
            We&apos;d love to hear your feedback!
          </span>{' '}
          <br />
          Join our <i className="fab fa-google text-success"></i>
          Waitlist and Discord by filling out this{' '}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSe5xtkBSU-1_3oX4wySaD0i25dX2rGiGv-2lPt-HDPd-dGLYg/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-info"
          >
            Form!
          </a>
          <br />
          and Help us spread the word by sharing Rally on{' '}
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
    </>
  );
}

export default FeedbackInformation;
