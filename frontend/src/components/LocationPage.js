import React, { useState, useEffect, useContext } from 'react';
import Modal from './Modal';
import '../styles/TableStyles.css'; // Import the new TableStyles.css
import { appContext } from '../App';

const LocationPage = () => {
  const { srvPort } = useContext(appContext);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({ name: '', points: '', latitude: '', longitude: '' });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`http://localhost:${srvPort}/locations`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`http://localhost:${srvPort}/locations/${editingId}`, { // Include srvPort in the URL
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`http://localhost:${srvPort}/locations`, { // Include srvPort in the URL
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm({ name: '', points: '', latitude: '', longitude: '' });
      setEditingId(null);
      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (location) => {
    setForm({
      name: location.name,
      points: location.points,
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
    });
    setEditingId(location.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:${srvPort}/locations/${id}`, {
        credentials: 'include',
        method: 'DELETE'
      }); // Include srvPort in the URL
      fetchLocations();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = () => {
    setForm({ name: '', points: '', latitude: '', longitude: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="location-page">
      <h1>Manage Locations</h1>
      <button onClick={openModal} className="open-modal-btn">Add Location</button>
      <table className="table"> {/* Apply the table class */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Points</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((location, index) => (
            <tr key={location.id} className={index % 2 === 0 ? 'even' : 'odd'}>
              <td>{location.name}</td>
              <td>{location.points}</td>
              <td>{location.coordinates[1]}</td>
              <td>{location.coordinates[0]}</td>
              <td>
                <button onClick={() => handleEdit(location)}>Edit</button>
                <button onClick={() => handleDelete(location.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <form onSubmit={handleSubmit} className="location-form">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              type="number"
              name="points"
              value={form.points}
              onChange={handleChange}
              placeholder="Points"
              required
            />
            <input
              type="text"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              required
            />
            <input
              type="text"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              required
            />
            <button type="submit">{editingId ? 'Update' : 'Add'} Location</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LocationPage;
