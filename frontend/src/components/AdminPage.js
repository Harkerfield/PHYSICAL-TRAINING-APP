import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';
import '../styles/App.css';
import '../styles/TableStyles.css'; // Import the new TableStyles.css
import Modal from './Modal/Modal'; // Import the Modal component
import PopOver from './PopOver/PopOver'; // Import PopOver component

const AdminPage = () => {
  const { team, srvPort } = useContext(appContext);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [points, setPoints] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [endTime, setEndTime] = useState('2025-04-02T07:30');
  const [randomEventFrequency, setRandomEventFrequency] = useState(300000); // Default: 5 minutes
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [showPopOver, setShowPopOver] = useState(false);
  const [popOverMessage, setPopOverMessage] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value || '');
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/team`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
    const interval = setInterval(fetchTeams, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [srvPort]);

  useEffect(() => {
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
        setRandomEventFrequency(data.frequency);
      } catch (error) {
        console.error('Error fetching random event frequency:', error);
      }
    };

    fetchFrequency();
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
        setEndTime(data.frequency);
      } catch (error) {
        console.error('Error fetching countdown timer:', error);
      }
    };

    fetchCountdown();
  }, [srvPort]);

  const handleAddPoints = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch(`http://localhost:${srvPort}/game/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: selectedTeam.id, points, source: `Admin team ${team.name} gave points for: ${source}` }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to add points');
      }
      const data = await response.json();
      setMessage(`${data.message} to team "${data.teamName}" for ${data.points} points`);
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === selectedTeam.id ? { ...team, totalPoints: parseInt(team.totalPoints) + parseInt(points) } : team
        )
      );
      setPoints('');
      setSource('');
      setIsModalOpen(false);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleSetCountdown = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:${srvPort}/game/random-event-frequency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frequency: endTime }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update countdown timer');
      }
      const data = await response.json();
      setPopOverMessage({ message: `Countdown timer updated successfully to ${data.frequency}`, type: 'success' });
      setShowPopOver(true);
      setEndTime(data.frequency);
    } catch (error) {
      console.error('Error updating countdown timer:', error);
      setPopOverMessage({ message: 'Failed to update countdown timer', type: 'error' });
      setShowPopOver(true);
    }
  };

  const handleFrequencyChange = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:${srvPort}/game/random-event-frequency`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frequency: randomEventFrequency }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update random event frequency');
      }

      setPopOverMessage({ message: 'Random event frequency updated successfully', type: 'success' });
      setShowPopOver(true);
    } catch (error) {
      console.error('Error updating random event frequency:', error);
      setPopOverMessage({ message: 'Failed to update random event frequency', type: 'error' });
      setShowPopOver(true);
    }
  };

  const handleUpdateLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(`http://localhost:${srvPort}/game/update-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: team.id, latitude, longitude }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      const data = await response.json();
      setPopOverMessage({ message: 'Location updated successfully', type: 'success' });
      setShowPopOver(true);
      return data.locationId;
    } catch (error) {
      console.error('Error updating location:', error);
      setPopOverMessage({ message: 'Failed to update location', type: 'error' });
      setShowPopOver(true);
      throw error;
    }
  };

  const handleUploadMedia = async (locationId) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('teamLocationId', locationId);
    formData.append('file', file);
    formData.append('description', description);
    formData.append('mediaType', mediaType);

    try {
      const response = await fetch(`http://localhost:${srvPort}/game/upload-media`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload media');
      }

      setPopOverMessage({ message: 'Media uploaded successfully', type: 'success' });
      setShowPopOver(true);
      setFile(null);
      setDescription('');
    } catch (error) {
      console.error('Error uploading media:', error);
      setPopOverMessage({ message: 'Failed to upload media', type: 'error' });
      setShowPopOver(true);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log(`Current location: Latitude ${latitude}, Longitude ${longitude}`); // Debug log

          try {
            const locationId = await handleUpdateLocation(latitude, longitude);
            await handleUploadMedia(locationId);
          } catch (error) {
            console.error('Error handling location or media:', error);
          }
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error('User denied the request for Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              console.error('The request to get user location timed out.');
              break;
            case error.UNKNOWN_ERROR:
              console.error('An unknown error occurred.');
              break;
          }
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handleCaptureMedia = async (mediaType) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPopOverMessage({ message: 'Camera not supported on this device.', type: 'error' });
      setShowPopOver(true);
      return;
    }

    try {
      const constraints = mediaType === 'video' ? { video: true } : { video: true, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (mediaType === 'photo') {
        setTimeout(() => {
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const photoData = canvas.toDataURL('image/png');

          // Stop the video stream
          stream.getTracks().forEach((track) => track.stop());

          // Upload the photo
          uploadMedia(photoData, 'image');
        }, 1000); // Capture photo after 1 second
      } else if (mediaType === 'video') {
        // Handle video capture logic here if needed
        setPopOverMessage({ message: 'Video capture is not yet implemented.', type: 'error' });
        setShowPopOver(true);
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setPopOverMessage({ message: 'Error accessing camera.', type: 'error' });
      setShowPopOver(true);
    }
  };

  const handleCaptureVideo = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPopOverMessage({ message: 'Camera not supported on this device.', type: 'error' });
      setShowPopOver(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();

      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoData = new File([blob], 'recorded-video.webm', { type: 'video/webm' });

        // Stop the video stream
        stream.getTracks().forEach((track) => track.stop());

        // Upload the video
        const formData = new FormData();
        formData.append('file', videoData);
        formData.append('description', description);
        formData.append('mediaType', 'video');

        try {
          const response = await fetch(`http://localhost:${srvPort}/game/upload-media`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to upload video');
          }

          setPopOverMessage({ message: 'Video uploaded successfully', type: 'success' });
          setShowPopOver(true);
          setDescription('');
        } catch (error) {
          console.error('Error uploading video:', error);
          setPopOverMessage({ message: 'Failed to upload video', type: 'error' });
          setShowPopOver(true);
        }
      };

      // Start recording
      mediaRecorder.start();
      setPopOverMessage({ message: 'Recording started. Click OK to stop.', type: 'success' });
      setShowPopOver(true);

      // Stop recording after user confirmation
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // Automatically stop after 5 seconds (or adjust as needed)
    } catch (error) {
      console.error('Error accessing camera:', error);
      setPopOverMessage({ message: 'Error accessing camera.', type: 'error' });
      setShowPopOver(true);
    }
  };

  const uploadMedia = async (mediaData, mediaType) => {
    const formData = new FormData();
    formData.append('file', mediaData);
    formData.append('description', description);
    formData.append('mediaType', mediaType);

    try {
      const response = await fetch(`http://localhost:${srvPort}/game/upload-media`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload media');
      }

      setPopOverMessage({ message: 'Media uploaded successfully', type: 'success' });
      setShowPopOver(true);
      setDescription('');
    } catch (error) {
      console.error('Error uploading media:', error);
      setPopOverMessage({ message: 'Failed to upload media', type: 'error' });
      setShowPopOver(true);
    }
  };

  const openModal = (team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="admin-page">
      {showPopOver && (
        <PopOver
          content={popOverMessage}
          onClose={() => setShowPopOver(false)}
        />
      )}
      {message && <p>{message}</p>}
      <h2>Current Scores</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team Name</th>
            <th>Score</th>
            <th>Members</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teams.sort((a, b) => b.totalPoints - a.totalPoints).map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.totalPoints}</td>
              <td>
                <ul>
                  {team.team_members.map((member) => (
                    <li key={member.id}>{member.firstName} {member.lastName}</li>
                  ))}
                </ul>
              </td>
              <td><button onClick={() => openModal(team)}>Add Points</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2>Add Points to {selectedTeam.name}</h2>
          <form onSubmit={handleAddPoints}>
            <div>
              <label>Points:</label>
              <input
                type="number"
                value={points}
                onChange={handleInputChange(setPoints)}
                required
              />
            </div>
            <div>
              <label>Description:</label>
              <input
                type="text"
                value={source}
                onChange={handleInputChange(setSource)}
                required
              />
            </div>
            <button type="submit">Add Points</button>
          </form>
        </Modal>
      )}
      <div>
        <h2>Set Countdown Timer</h2>
        <form onSubmit={handleSetCountdown}>
          <input
            type="datetime-local"
            value={endTime}
            onChange={handleInputChange(setEndTime)}
            required
          />
          <button type="submit">Set Timer</button>
        </form>
      </div>
      <div>
        <h2>Set Random Event Frequency</h2>
        <form onSubmit={handleFrequencyChange}>
          <label>
            Frequency (in milliseconds):
            <input
              type="number"
              value={randomEventFrequency}
              onChange={handleInputChange(setRandomEventFrequency)}
              required
            />
          </label>
          <button type="submit">Update Frequency</button>
        </form>
      </div>
      <div>
        <h2>Update Location and Upload Media</h2>
        <button onClick={handleGetLocation}>Get Location</button>
        <form>
          <div>
            <label>File:</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={handleInputChange(setDescription)}
            />
          </div>
          <div>
            <label>Media Type:</label>
            <select
              value={mediaType}
              onChange={handleInputChange(setMediaType)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>
        </form>
      </div>
      <div>
        <h2>Capture and Upload Media</h2>
        <button onClick={() => handleCaptureMedia('photo')}>Take Photo</button>
        <button onClick={handleCaptureVideo}>Record Video</button>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={handleInputChange(setDescription)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;