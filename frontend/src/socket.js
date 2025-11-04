import { io } from 'socket.io-client';

// Connect to your backend
const URL = 'http://localhost:4000';
const socket = io(URL, { autoConnect: true });

export default socket;