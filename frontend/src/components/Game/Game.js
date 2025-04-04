import React, { useEffect, useState, useContext, useRef } from 'react';
import MapComponent from '../Map/Map';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../../App';
import './Game.css';
import Modal from '../Modal/Modal';
import PopOver from '../PopOver/PopOver';

const Game = () => {
  const { srvPort } = useContext(appContext);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [file, setFile] = useState(null);
  const [lastPing, setLastPing] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [locations, setLocations] = useState([]);
  const [randomEvent, setRandomEvent] = useState(null);
  const [randomEvents, setRandomEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [showPopOver, setShowPopOver] = useState(false);
  const [popOverMessage, setPopOverMessage] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();


  useEffect(() => {
    const teamData = localStorage.getItem('team');
    const teamId = teamData ? JSON.parse(teamData).teamId : null;
    console.log('Team ID from localStorage:', JSON.parse(teamData), JSON.parse(teamData).teamId);
    setTeamId(teamId);
  }, []);



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

  const handleTriggerRandomEvent = () => {
    if (randomEvents.length > 0) {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      console.log('Random event triggered:', event);
      setRandomEvent(event);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    const setupRandomEventInterval = () => {
      const interval = setInterval(() => {
        if (randomEvents.length > 0) {
          const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
          setRandomEvent(event);
          setIsModalOpen(true);
        }
      }, 300000); // Trigger every 5 minutes

      return () => clearInterval(interval);
    };

    const cleanup = setupRandomEventInterval();
    return cleanup;
  }, [randomEvents]);

  const handleAddPoints = async (teamId, points, source) => {
    console.log('Adding points:', { teamId, points, source });
    try {
      const response = await fetch(`http://localhost:${srvPort}/game/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, source, points }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to add points');
      }

      const data = await response.json();
      console.log(`${data.message} to team "${data.teamName}" for ${data.points} points`);

      // Show PopOver with success message
      setPopOverMessage({ message: `${data.points} points added to team "${data.teamName}"!`, type: 'success' });
      setShowPopOver(true);
    } catch (err) {
      console.error('Error adding points:', err.message);
      setPopOverMessage({ message: 'Error adding points. Please try again.', type: 'error' });
      setShowPopOver(true);
    }
  };

  const handleCompleteEvent = async () => {
    if (randomEvent) {
      await handleAddPoints(teamId, randomEvent.points, randomEvent.description);
      setPopOverMessage({ message: `Event completed: ${randomEvent.description}`, type: 'success' });
      setShowPopOver(true);
      handleCloseModal();
    }
  };

  useEffect(() => {
    const pingBackend = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const teamId = localStorage.getItem('teamId');
          if (teamId) {
            try {
              const response = await fetch(`http://localhost:${srvPort}/game/ping`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  teamId,
                  latitude,
                  longitude,
                }),
                credentials: 'include',
              });
              if (!response.ok) {
                throw new Error('Failed to ping backend');
              }
              setLastPing(new Date().toLocaleString());
            } catch (error) {
              console.error('Error pinging backend:', error);
            }
          }
        });
      }
    };

    const interval = setInterval(pingBackend, 300000); // Ping every 5 minutes
    return () => clearInterval(interval);
  }, [srvPort]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendLocationPing = async () => {
    console.log('Send Location Ping button clicked');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Geolocation obtained:', { latitude, longitude });
        const teamId = localStorage.getItem('teamId');
        if (teamId) {
          try {
            const response = await fetch(`http://localhost:${srvPort}/game/ping`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                teamId,
                latitude,
                longitude,
              }),
              credentials: 'include',
            });
            if (!response.ok) {
              throw new Error('Failed to ping backend');
            }
            const data = await response.json();
            console.log('Ping response:', data);
            setLastPing(data.lastPing || new Date().toLocaleString());
          } catch (error) {
            console.error('Error pinging backend:', error);
          }
        } else {
          console.error('No teamId found in localStorage');
        }
      });
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="game-container">
      <div className="button-section">

        <button className="button" onClick={handleTriggerRandomEvent}>Trigger Random Event</button>
        {/* {randomEvent && (
          <div className="random-event">
            <h3>Random Event</h3>
            <button onClick={() => handleAddPoints(teamId, randomEvent.points, randomEvent.source)}>Complete Event</button>
          </div>
        )} */}
        <button className="button" onClick={() => {
          setShowDebug(!showDebug);
          console.log('Debug menu toggled:', !showDebug);
        }}>
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
        {showDebug && (
          <div className="debug-info">
            <p>Last Ping: {lastPing}</p>
            <button onClick={handleSendLocationPing}>Send Location Ping</button>
          </div>
        )}
      </div>
      {isModalOpen && (
        <Modal onClose={handleCloseModal}>
          <h2>Random Event</h2>
          {randomEvent && <p>{randomEvent.description}</p>}
          <button onClick={handleCompleteEvent}>Complete Event</button>
          <button onClick={handleCloseModal}>Close</button>
        </Modal>
      )}
      {showPopOver && (
        <PopOver
          content={popOverMessage}
          onClose={() => setShowPopOver(false)}
        />
      )}

      <MapComponent locations={locations} />

      {currentTeam && (
        <div className="current-team-info">
          <h2>Current Team: {currentTeam.name}</h2>
          <p>Score: {currentTeam.totalPoints}</p>
        </div>
      )}
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
