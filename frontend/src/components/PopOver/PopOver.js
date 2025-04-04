import React, { useEffect, useState } from 'react';
import './PopOver.css';

const PopOver = ({ content, onClose }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            if (onClose) onClose();
          }, 0); // Defer onClose execution
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className={`popover ${content.type}`}>
      <p>{content.message}</p>
      <p>Closing in {countdown} seconds...</p>
      <button onClick={onClose} aria-label="Close popover">Close Now</button>
    </div>
  );
};

export default PopOver;