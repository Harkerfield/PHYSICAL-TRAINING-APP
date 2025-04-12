import React, { useEffect, useState, useContext } from 'react';
import { appContext } from '../../App';
import './Media.css';

const Media = () => {

  const { srvPort } = useContext(appContext);
  const [mediaList, setMediaList] = useState([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/game/all-media`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch media');
        }

        const data = await response.json();
        setMediaList(data);
      } catch (error) {
        console.error('Error fetching media:', error);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="media-container">
      <h2>Uploaded Media</h2>
      {mediaList.length === 0 ? (
        <p>No media available.</p>
      ) : (
        <div className="media-grid">
          {mediaList.map((media) => (
            <div key={media.id} className="media-item">
              <p>{media.description}</p>
              {media.mediaType === 'image' ? (
                <img src={`data:image/png;base64,${media.content}`} alt={media.description} />
              ) : (
                <video controls>
                  <source src={`data:video/webm;base64,${media.content}`} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;