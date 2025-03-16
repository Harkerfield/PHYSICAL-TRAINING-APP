import React, { useEffect, useState, useContext } from 'react';
import MapComponent from './Map';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';
import '../styles/Teams.css';


const Game = () => {
  const { srvPort } = useContext(appContext);
   const [currentTeam, setCurrentTeam] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [file, setFile] = useState(null);
  const [lastPing, setLastPing] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

 
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/game/locations`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await JSON.stringify(response);
        console.log('Locations:', data);
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const updateLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const teamId = localStorage.getItem('teamId');
          if (teamId) {
            try {
              await fetch('/api/update-location', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  teamId,
                  latitude,
                  longitude,
                }),
              });
              setLastPing(new Date().toLocaleString());
            } catch (error) {
              console.error('Error updating location:', error);
            }
          }
        });
      }
    };

    const handleUserGesture = () => {
      updateLocation();
      document.removeEventListener('click', handleUserGesture);
    };

    document.addEventListener('click', handleUserGesture);

    return () => {
      document.removeEventListener('click', handleUserGesture);
    };
  }, []);

  useEffect(() => {
    const promptUser = () => {
      setShowPrompt(true);
    };

    const randomInterval = Math.random() * (600000 - 300000) + 300000; // Random interval between 5 and 10 minutes
    const interval = setInterval(promptUser, randomInterval);
    return () => clearInterval(interval);
  }, []);

  const handleQRCodeScan = () => {
    navigate('/submit-location'); // Navigate to the LocationPassword component
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', localStorage.getItem('teamId'));

      try {
        await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        setShowPrompt(false);
        setFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <div className="game-container" style={{ width: '100vw', height: '100vh' }}>
      <h1>Game</h1>
      <button onClick={() => {
        setShowDebug(!showDebug);
        console.log('Debug menu toggled:', !showDebug);
      }}>
        {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
      </button>
      {showDebug && (
        <div className="debug-info">
          <p>Last Ping: {lastPing}</p>
        </div>
      )}
      <div className="map-container">
        <MapComponent locations={locations} />
      </div>
      {currentTeam && (
        <div className="current-team-info">
          <h2>Current Team: {currentTeam.name}</h2>
          <p>Score: {currentTeam.totalPoints}</p>
        </div>
      )}
   
      <button className="button" onClick={handleQRCodeScan}>Scan QR Code</button>
      {showPrompt && (
        <div className="prompt">
          <h2>Complete the Challenge!</h2>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload</button>
        </div>
      )}
    </div>
  );
};

export default Game;
