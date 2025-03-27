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
  const [countdown, setCountdown] = useState(null);
  const [randomEvent, setRandomEvent] = useState(null);
  const [randomEvents, setRandomEvents] = useState([]);
  const navigate = useNavigate();

  const startLocation = {
    coordinates: [127.77127083141988, 26.337389901134443],
    name: 'Start Location',
    points: 5,
    type: 'custom',
  };

  useEffect(() => {
    setLocations((prevLocations) => [startLocation, ...prevLocations]);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/locations`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Locations:', data);
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [srvPort]);

  useEffect(() => {
    const updateLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const teamId = localStorage.getItem('teamId');
          if (teamId) {
            try {
              await fetch('http://localhost:${srvPort}/locations', {
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

    const handleTeamGesture = () => {
      updateLocation();
      document.removeEventListener('click', handleTeamGesture);
    };

    document.addEventListener('click', handleTeamGesture);

    return () => {
      document.removeEventListener('click', handleTeamGesture);
    };
  }, []);

  useEffect(() => {
    const promptTeam = () => {
      setShowPrompt(true);
    };

    const randomInterval = Math.random() * (600000 - 300000) + 300000; // Random interval between 5 and 10 minutes
    const interval = setInterval(promptTeam, randomInterval);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCurrentTeam = async () => {
      const teamId = localStorage.getItem('teamId');
      if (teamId) {
        try {
          const response = await fetch(`http://localhost:${srvPort}/team/${teamId}`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setCurrentTeam(data);
        } catch (error) {
          console.error('Error fetching current team:', error);
        }
      }
    };

    fetchCurrentTeam();
  }, [srvPort]);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/game/random-event-frequency`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCountdown(new Date(data.frequency));
      } catch (error) {
        console.error('Error fetching countdown timer:', error);
        if (error.response && error.response.status === 404) {
          const today = new Date();
          today.setHours(7, 30, 0, 0);
          setCountdown(today);
        }
      }
    };

    fetchCountdown();
  }, [srvPort]);

  useEffect(() => {
    if (countdown) {
      const interval = setInterval(() => {
        const now = new Date();
        if (now >= countdown) {
          clearInterval(interval);
          alert('Time is up! The game is over.');
          // Add logic to handle game completion
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  const handleQRCodeScan = () => {
    navigate('/submit-location'); // Navigate to the LocationPassword component
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const isWithinGeofence = (latitude, longitude, targetLatitude, targetLongitude, radiusInFeet) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    const earthRadiusInFeet = 20925524.9; // Earth's radius in feet

    const dLat = toRadians(targetLatitude - latitude);
    const dLon = toRadians(targetLongitude - longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(latitude)) *
      Math.cos(toRadians(targetLatitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusInFeet * c;

    return distance <= radiusInFeet;
  };

  const handlePictureSubmit = async (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const targetLatitude = 26.337389901134443;
        const targetLongitude = 127.77127083141988;
        const radiusInFeet = 3120;

        if (isWithinGeofence(latitude, longitude, targetLatitude, targetLongitude, radiusInFeet)) {
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
        } else {
          alert('You are not within the required location to submit the picture.');
        }
      });
    }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/game/random-events`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRandomEvents(data);
      } catch (error) {
        console.error('Error fetching random events:', error);
      }
    };

    fetchData();
  }, [srvPort]);

  const triggerRandomEvent = () => {
    if (randomEvents.length > 0) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      setRandomEvent(event);
    }
  };

  useEffect(() => {
    const setupRandomEventInterval = async () => {
      const fetchFrequency = async () => {
        try {
          const response = await fetch(`http://localhost:${srvPort}/game/random-event-frequency`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          return data.frequency;
        } catch (error) {
          console.error('Error fetching random event frequency:', error);
          return 300000; // Default to 5 minutes if there's an error
        }
      };

      const frequency = await fetchFrequency();
      const interval = setInterval(triggerRandomEvent, frequency);
      return () => clearInterval(interval);
    };

    setupRandomEventInterval();
  }, [srvPort, randomEvents]);

  const handleRandomEventCompletion = async () => {
    if (randomEvent) {
      try {
        await fetch(`http://localhost:${srvPort}/game/add-points`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId: localStorage.getItem('teamId'),
            points: randomEvent.points,
            source: randomEvent.description,
          }),
          credentials: 'include',
        });
        alert(`You have earned ${randomEvent.points} points for completing the event: ${randomEvent.description}`);
        setRandomEvent(null);
      } catch (error) {
        console.error('Error completing random event:', error);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const teamId = localStorage.getItem('teamId');
          if (teamId) {
            try {
              await fetch(`http://localhost:${srvPort}/game/add-points`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teamId, points: 5, source: 'Location update' }),
                credentials: 'include',
              });
              setLastPing(new Date().toLocaleString());
            } catch (error) {
              console.error('Error updating location and adding points:', error);
            }
          }
        });
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [srvPort]);

  return (
    <div className="game-container" style={{ width: '100vw', height: '100vh' }}>
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
      {/* {randomEvent && (
        <div className="random-event">
          <h2>Random Event</h2>
          <p>{randomEvent.description}</p>
          <button onClick={handleRandomEventCompletion}>Complete Event</button>
        </div>
      )} */}
      <button className="button" onClick={handleQRCodeScan}>Scan QR Code</button>
      {showPrompt && (
        <div className="prompt">
          <h2>Complete the Challenge!</h2>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload</button>
          <button onClick={handlePictureSubmit}>Submit Picture</button>
        </div>
      )}
    </div>
  );
};

export default Game;
