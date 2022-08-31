const express = require('express')

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4} = require('uuid')
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, { 
    debug: true
});

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/peerjs', peerServer)
// server configuration
const PORT = 8080;

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})
// create a route for the app
app.get('/:param', (req, res) => {
  res.render('room', { roomId: req.params.param});
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        io.to(roomId).emit('user-connected', userId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        })
        socket.on('disconnect', () => {
            io.to(roomId).emit('user-disconnected', userId)
        })
    })
});
// make the server listen to requests
server.listen(process.env.PORT || 8080);
  