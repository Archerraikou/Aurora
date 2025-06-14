import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'universal-cookie';

const NotificationDetailPage = () => {
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const cookies = new Cookies();
  
  // Funcție async pentru a prelua detaliile notificării de la backend

  useEffect(() => {
    const fetchNotification = async () => {
      try {    
        // Luăm tokenul JWT din cookie-uri

        const token = cookies.get('JWT');
        if (!token) {
          console.error('No JWT token found');
          return;// dacă nu există token, nu continuăm
        }
        // Facem request GET către API pentru notificarea cu id-ul din URL
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
        // Parsăm răspunsul JSON și salvăm notificarea în stare
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
  // Dacă există notificarea, afișăm detaliile acesteia
  return (
    <div>
      <h1>{notification.type}</h1>
      <p>{notification.notificationContent}</p>
      <small>{new Date(notification.notificationDate).toLocaleString()}</small>
    </div>
  );
};

export default NotificationDetailPage;
