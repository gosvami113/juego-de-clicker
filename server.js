const WebSocket = require('ws');

const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

let leaderboard = [];

server.on('connection', (ws) => {
    console.log('New client connected');

    // Enviar el leaderboard actual al cliente recién conectado
    ws.send(JSON.stringify({ type: 'leaderboard', leaderboard }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'new-score') {
            // Actualizar el leaderboard
            leaderboard.push({ name: data.name, score: data.score });

            // Ordenar el leaderboard por puntaje en orden descendente
            leaderboard.sort((a, b) => b.score - a.score);

            // Limitar el leaderboard a los 10 mejores jugadores
            leaderboard = leaderboard.slice(0, 10);

            // Enviar el leaderboard actualizado a todos los clientes
            broadcast(JSON.stringify({ type: 'leaderboard', leaderboard }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(message) {
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
