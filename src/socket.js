import { io } from 'socket.io-client';

const SOCKET_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : window.location.origin;

let socket = null;
const listeners = {};

export function connectSocket() {
  const token = localStorage.getItem('spilnokup_token');
  if (!token || socket?.connected) return;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));

  // Re-emit to stored listeners
  ['deal:update', 'deal:new', 'deal:deleted', 'order:completed', 'chat:message', 'chat:new', 'chat:typing'].forEach(event => {
    socket.on(event, (data) => {
      if (listeners[event]) listeners[event].forEach(cb => cb(data));
    });
  });
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function onEvent(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  return () => { listeners[event] = listeners[event].filter(cb => cb !== callback); };
}

export function joinDeal(dealId) {
  socket?.emit('join:deal', dealId);
}

export function leaveDeal(dealId) {
  socket?.emit('leave:deal', dealId);
}

export function joinConversation(convId) {
  socket?.emit('join:conversation', convId);
}

export function emitTyping(conversationId) {
  socket?.emit('chat:typing', { conversationId });
}
