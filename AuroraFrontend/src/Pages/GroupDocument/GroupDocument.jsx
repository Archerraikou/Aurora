import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import './GroupDocument.css';
import * as signalR from '@microsoft/signalr';

export default function GroupDocument() {
  const cookies = new Cookies();
  const location = useLocation();
  const groupId = new URLSearchParams(location.search).get('id');
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const contentRef = useRef('');
  const documentRef = useRef(null);
  const [role, setRole] = useState(null);
  const connectionRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  // Load document & role on mount
  useEffect(() => {
    const load = async () => {
      const jwt = cookies.get('JWT');

      // fetch document
      const resDoc = await fetch(`https://localhost:7242/api/Document/group/${groupId}`, {
        headers: { Authorization: jwt }
      });
      if (resDoc.ok) {
        const data = await resDoc.json();
        setDocument(data);
        setContent(data.content || '');
        contentRef.current = data.content || '';
      } else if (resDoc.status === 404) {
        // no document found
        setDocument(null);
        setContent('');
        contentRef.current = '';
      }

      // fetch user role
      const resRole = await fetch(`https://localhost:7242/api/Groups/role?id=${groupId}`, {
        headers: { Authorization: jwt }
      });
      const text = await resRole.text();
      try {
        setRole(JSON.parse(text).role);
      } catch {
        setRole(text);
      }
    };
    load();
  }, [groupId]);

  // Initialize SignalR
  useEffect(() => {
    const jwt = cookies.get('JWT');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7242/documentHub', {
        accessTokenFactory: () => jwt
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveDocumentUpdate', (newContent) => {
      if (newContent !== contentRef.current && !isTypingRef.current) {
        setContent(newContent);
        contentRef.current = newContent;
      }
    });

    connection.start()
      .then(() => {
        connection.invoke('JoinDocument', groupId);
      })
      .catch(err => console.error('SignalR connect error:', err));

    connectionRef.current = connection;
    return () => {
      if (connection) connection.stop();
    };
  }, [groupId]);

  // Auto-save every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (documentRef.current && documentRef.current.id) {
        try {
          await fetch(`https://localhost:7242/api/Document/${documentRef.current.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: cookies.get('JWT')
            },
            body: JSON.stringify({
              ...documentRef.current,
              content: contentRef.current
            }),
          });
        } catch (err) {
          console.error('Auto-save error:', err);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const newText = e.target.value;
    setContent(newText);
    contentRef.current = newText;

    isTypingRef.current = true;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      const conn = connectionRef.current;
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke('UpdateDocumentContent', groupId, newText)
          .catch(err => console.error('SignalR send error:', err));
      }
      isTypingRef.current = false;
    }, 300);
  };

  const canEdit = role !== null && role !== 'None';
  const isAdmin = role === 'Admin';

  // Create new document
  const createDocument = async () => {
    try {
      const jwt = cookies.get('JWT');
      const res = await fetch(`https://localhost:7242/api/Document/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: jwt,
        },
        body: JSON.stringify({
          groupId: parseInt(groupId),
          content: '',
          title: 'New Document'
        }),
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocument(newDoc);
        setContent('');
        contentRef.current = '';
        alert('Document created.');
      } else {
        alert(`Failed to create document: ${res.statusText}`);
      }
    } catch (err) {
      console.error('Create document error:', err);
      alert('Error creating document.');
    }
  };

  const deleteDocument = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const jwt = cookies.get('JWT');
      const res = await fetch(`https://localhost:7242/api/Document/${document.id}`, {
        method: 'DELETE',
        headers: { Authorization: jwt },
      });
      if (res.ok || res.status === 204) {
        setDocument(null);
        setContent('');
        contentRef.current = '';
        alert('Document deleted.');
      } else {
        alert('Failed to delete document.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting document.');
    }
  };

  return (
    <div className="doc-container">
      <h2>Group Document</h2>

      {/* Show create button if no document and user is admin */}
      {canEdit && !document && isAdmin && (
        <button onClick={createDocument}>Create Document</button>
      )}

      {/* Show document textarea and delete button if document exists */}
      {document && (
        <>
          <textarea
            className="doc-editor"
            value={content}
            onChange={handleChange}
            placeholder="Start editing..."
            disabled={!canEdit}
          />
          {isAdmin && (
            <div className="button-container" style={{ marginTop: '10px' }}>
              <button
                onClick={deleteDocument}
                style={{ backgroundColor: 'red', color: 'white' }}
              >
                Delete Document
              </button>
            </div>
          )}
        </>
      )}

      {/* Inform non-admins if no document */}
      {!document && !isAdmin && (
        <p>No document exists for this group.</p>
      )}
    </div>
  );
}
