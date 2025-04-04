import React, { useState } from 'react';
import Modal from '../../components/Modal/Modal'; // Import the Modal component
import '../PrivacyNotification/PrivacyNotification.css'; // Import the CSS file for styles

const PrivacyNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <div className="privacy-notification">
      <a href="#" onClick={handleOpen}>Privacy Policy</a>
      {isVisible && (
        <Modal onClose={handleClose}>
          <div className="privacy-content">
            <h2>Privacy Policy</h2>
            <p>
              This website uses GPS and camera access to enhance your experience. By using this site, you consent to the use of your location and camera for taking and submitting pictures.
            </p>
            <button onClick={handleClose}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PrivacyNotification;
