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
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);

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
          formData.append('fileName', file.name || 'test'); // Use the original file name if available
          formData.append('teamId', teamId);

          try {
            await fetch(`http://localhost:${srvPort}/game/upload`, {
              method: 'POST',
              body: formData,
              credentials: 'include', // Include credentials (e.g., cookies) in the request
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
      formData.append('fileName', file.name || 'test'); // Use the original file name if available
      formData.append('teamId', teamId);

      try {
        await fetch(`http://localhost:${srvPort}/game/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
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
        console.log('Random events:', data);
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
    console.log('Completing event:', randomEvent);
    if (randomEvent) {
      console.log('Completing event:', randomEvent);
      if (randomEvent.type === 'video' || randomEvent.type === 'picture') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name || 'test'); // Use the original file name if available
        formData.append('teamId', teamId);
1
        try {
          const response = await fetch(`http://localhost:${srvPort}/game/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (response.ok) {
            await handleAddPoints(teamId, randomEvent.points, randomEvent.description);
            setPopOverMessage({ message: `Event completed: ${randomEvent.description}`, type: 'success' });
            setShowPopOver(true);
            handleCloseModal();
          } else {
            alert('Failed to upload the file. Please try again.');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('An error occurred while uploading the file.');
        }
      } else if (randomEvent.type === 'workout') {
        await handleAddPoints(teamId, randomEvent.points, randomEvent.description);
        setPopOverMessage({ message: `Event completed: ${randomEvent.description}`, type: 'success' });
        setShowPopOver(true);
        handleCloseModal();
      }
    }
  };

  useEffect(() => {
    const pingBackend = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

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

  const handleUploadToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('teamId', teamId);

    try {
      const response = await fetch(`http://localhost:${srvPort}/game/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include credentials (e.g., cookies) in the request
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Upload completed successfully! Team points updated: ${data.team.total_points}`);
        setShowUploadProgress(false);
      } else {
        setShowUploadProgress(false);
        alert('Failed to upload the file. Please try again.');
      }
    } catch (error) {
      setShowUploadProgress(false);
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    }
  };

  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = mediaStream;
      videoRef.current.srcObject = mediaStream;
      videoRef.current.style.display = 'block';
    } catch (error) {
      console.error('Error starting camera:', error);
      alert('Unable to access the camera. Please check your permissions.');
    }
  };

  const handleCapturePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        setFile(blob);
        alert('Picture captured successfully!');
        handleStopCamera(); // Close the camera after capturing
        setShowUploadProgress(true); // Show upload progress bar
        handleUploadToServer(blob); // Upload to server
      }, 'image/jpeg');
    }
  };

  const handleStartRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = mediaStream;
      const mediaRecorder = new MediaRecorder(mediaStream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setFile(blob);
        alert('Video recorded successfully!');
        handleStopCamera(); // Close the camera after recording
        setShowUploadProgress(true); // Show upload progress bar
        handleUploadToServer(blob); // Upload to server
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // Record for 5 seconds
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Unable to record video. Please check your permissions.');
    }
  };

  const handleStopCamera = () => {
    if (mediaStreamRef.current) {
      const tracks = mediaStreamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      mediaStreamRef.current = null;
      if (videoRef.current) {
        videoRef.current.style.display = 'none';
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="game-container">
      <div className="button-section">

        <button className="button" onClick={handleTriggerRandomEvent}>Trigger Random Event</button>
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
          {randomEvent && (randomEvent.type === 'video' || randomEvent.type === 'picture') && (
            <div>
              <video id="camera-stream" ref={videoRef} autoPlay playsInline style={{ display: 'none' }}></video>
              <canvas id="capture-canvas" ref={canvasRef} style={{ display: 'none' }}></canvas>
              <button onClick={handleStartCamera}>Start Camera</button>
              <button onClick={handleCapturePicture}>Capture Picture</button>
              <button onClick={handleStartRecording}>Record Video</button>
              <button onClick={handleStopCamera}>Stop Camera</button>
              {showUploadProgress && (
                <div className="upload-progress">
                  <p>Uploading...</p>
                  <progress value={uploadProgress} max="100"></progress>
                </div>
              )}
            </div>
          )}
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
