import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create an instance of Cookies to access cookies
  const cookies = new Cookies();

  // Function to fetch notifications
  const fetchNotifications = async () => {
    const token = cookies.get('JWT'); // Get token from cookie

    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://localhost:7242/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': cookies.get("JWT"), // Send the token as Bearer token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data); // Set notifications to state
    } catch (err) {
      setError(err.message); // Set error if something goes wrong
    } finally {
      setLoading(false); // Stop loading spinner once done
    }
  };

  // Use useEffect to fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <div>
      <h1>Notifications</h1>
      {loading && <p>Loading...</p>} {/* Show loading message while fetching */}
      {error && <p>{error}</p>} {/* Show error if something goes wrong */}
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>{notification.message}</li> // Assuming 'id' and 'message' fields
          ))}
        </ul>
      ) : (
        !loading && <p>No notifications available.</p>
      )}
    </div>
  );
};

export default NotificationsPage;
