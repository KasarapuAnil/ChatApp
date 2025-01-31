import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  const messageEndRef = useRef(null); // Scroll to the bottom ref

  useEffect(() => {
    // Listen for all messages when the component mounts
    socket.on('allMessages', (messages) => {
      setMessages(messages);
    });

    // Listen for new messages
    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('allMessages');
      socket.off('newMessage');
    };
  }, []);

  const sendMessage = () => {
    if (!username.trim() || !message.trim()) {
      setError('Both username and message are required');
      return;
    }
    setError('');
    const messageData = { username, message };
    socket.emit('sendMessage', messageData);
    setMessage('');
  };

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format the timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Converts to local date and time string
  };

  return (
    <div>
      <h2>Chat Room</h2>

      {/* Username input */}
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      {/* Chat messages */}
      <div style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.username}: </strong>
            {msg.message}
            <div style={{ fontSize: '0.8em', color: 'gray' }}>
              {msg.timestamp && formatTimestamp(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messageEndRef} /> {/* Scrolls the chat to the bottom */}
      </div>

      {/* Message input */}
      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>

      {/* Error display */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ChatApp;
