import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';

const NotificationDetailPage = () => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const cookies = new Cookies();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const token = cookies.get('JWT');
        if (!token) {
          console.error('No JWT token found');
          return;
        }

        const response = await fetch(`https://localhost:7242/api/notifications/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Failed to fetch notification');
          return;
        }

        const data = await response.json();
        setNotification(data);
      } catch (error) {
        console.error("Error fetching notification:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!notification) return <div>Notification not found</div>;

  return (
    <div>
      <h1>{notification.type}</h1>
      <p>{notification.notificationContent}</p>
      <small>{new Date(notification.notificationDate).toLocaleString()}</small>
    </div>
  );
};

export default NotificationDetailPage;
