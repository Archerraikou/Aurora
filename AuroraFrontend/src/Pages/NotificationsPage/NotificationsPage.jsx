import React, { useState, useEffect } from 'react';
import Cookies from 'universal-cookie';
import Modal from 'react-modal';
import './NotificationsPage.css';

Modal.setAppElement('#root');

const NotificationsPage = () => {  
  // Stări pentru notificări, loading, eroare, paginare și notificarea selectată
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const cookies = new Cookies();

  const notificationsPerPage = 3;
  
  // Fetch pentru lista de notificări

  const fetchNotifications = async () => {
    const token = cookies.get('JWT');

    if (!token) {
      setError('No token found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://localhost:7242/api/notifications', {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      // Asigurăm că fiecare notificare are proprietățile isHandled și isRead
      const updatedNotifications = data.map(notification => ({
        ...notification,
        isHandled: notification.isHandled || false,
        isRead: notification.isRead || false,
      }));
      setNotifications(updatedNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Când se dă click pe o notificare, încărcăm detalii și o marcăm ca citită

  const handleNotificationClick = async (notificationId) => {
    const token = cookies.get('JWT');

    try {
      const response = await fetch(`https://localhost:7242/api/notifications/showNotification?id=${notificationId}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification');
      }

      const notification = await response.json();
      setSelectedNotification(notification);

      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error fetching notification details:', error);
    }
  };
  // Închidem modalul de detalii notificare

  const handleModalClose = () => {
    setSelectedNotification(null);
  };
  // Tratarea cererilor de intrare in grup (accept/reject)
  const handleRequestDecision = async (notificationId, groupId, userEmail, isApproved) => {
    const token = cookies.get('JWT');
    const adminResponse = window.prompt('Please enter a response for the user:');

    if (!adminResponse) {
      alert('Admin response is required!');
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7242/api/Groups/approveRequest?groupId=${groupId}&userEmail=${userEmail}&isApproved=${isApproved}&adminResponse=${encodeURIComponent(adminResponse)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process request');
      }
      // Actualizăm notificarea local, marcând-o ca procesată și adăugând răspunsul adminului
      setNotifications((prevNotifications) =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? {
                ...notification,
                isHandled: true,
                notificationContent: `${notification.notificationContent} Admin's response: ${adminResponse}`,
              }
            : notification
        )
      );

      alert(`User has been ${isApproved ? 'approved' : 'rejected'} successfully!`);
      // Reîncărcăm notificările
      fetchNotifications();
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    }
  };
  // Ștergerea unei notificări
  const handleDeleteNotification = async (notificationId) => {
    const token = cookies.get('JWT');

    try {
      const response = await fetch(`https://localhost:7242/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications((prevNotifications) =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  // Calculăm indexurile pentru pagina curentă și extragem notificările afișate

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  // Navigare paginare
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const extractEmail = (content) => {
    const match = content.match(/User (.+?) requested/);
    return match ? match[1] : '';
  };

  const extractGroupId = (content) => {
    const match = content.match(/\(ID: (\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
  };
  // Determinăm statusul cererii în funcție de textul notificării
  const getRequestStatus = (content) => {
    if (content.includes('approved')) return 'Approved';
    if (content.includes('rejected')) return 'Rejected';
    return 'New';
  };
  // Randăm o notificare, cu butoane specifice pentru cereri de aderare la grup
  const renderNotification = (notification) => {
    const isGroupJoinRequest = notification.type === 'Group Join Request';
    const groupId = extractGroupId(notification.notificationContent);
    const userEmail = extractEmail(notification.notificationContent);
    const requestStatus = getRequestStatus(notification.notificationContent);

    const showActionButtons =
      isGroupJoinRequest &&
      requestStatus === 'New' &&
      !notification.isRead &&
      !notification.isHandled;

    return (
      <div
        key={notification.id}
        className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
        onClick={() => handleNotificationClick(notification.id)}
      >
        <div className="notification-header">
          <span className="notification-type">
            {notification.type}
          </span>
          <span className="notification-date">
            {new Date(notification.notificationDate).toLocaleString()}
          </span>
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNotification(notification.id);
            }}
            title="Delete notification"
          >
            ❌
          </button>
        </div>

        <p className="notification-message">
          {notification.notificationContent}
        </p>

        {showActionButtons && (
          <div className="admin-buttons">
            <button
              className="accept-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRequestDecision(notification.id, groupId, userEmail, true);
              }}
            >
              Accept
            </button>
            <button
              className="reject-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRequestDecision(notification.id, groupId, userEmail, false);
              }}
            >
              Reject
            </button>
          </div>
        )}

        <div className="notification-footer">
          Status: {notification.isRead ? 'Read' : 'New'}
        </div>
      </div>
    );
  };

  return (
    <div className="notifications-container">
      <h1 className="notifications-title">NOTIFICATIONS</h1>

      <button
        onClick={fetchNotifications}
        className="pagination-button"
        style={{ marginBottom: '20px' }}
      >
        Refresh Notifications
      </button>

      {loading && <p>Loading notifications...</p>}
      {error && <p style={{ color: '#dc3545' }}>Error: {error}</p>}

      {currentNotifications.length > 0 ? (
        <div>
          {currentNotifications.map((notification) =>
            renderNotification(notification)
          )}

          <div className="pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>

            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        !loading && <p style={{ color: '#6c757d' }}>No notifications available.</p>
      )}

      <Modal
        isOpen={selectedNotification !== null}
        onRequestClose={handleModalClose}
        className="modal"
      >
        {selectedNotification && (
          <>
            <h2>{selectedNotification.type}</h2>
            <p>{selectedNotification.notificationContent}</p>
            <p><strong>Date:</strong> {new Date(selectedNotification.notificationDate).toLocaleString()}</p>
            <button onClick={handleModalClose} className="close-modal-button">
              Close
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default NotificationsPage;
