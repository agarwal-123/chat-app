const path = require('path')
http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users.js')

const app = express()
const server=http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count =0

io.on('connection',(socket)=>{
	console.log('New Connection established')



	socket.on('join',({username,room},callback)=>{
		const {error,user}= addUser({id:socket.id,username,room})

		if(error){
			return callback(error)
		}

		socket.join(user.room)

		socket.emit('message',generateMessage('Welcome'))
		socket.broadcast.to(room).emit('message',generateMessage(`${user.username} has joined!!`))
		
		io.to(user.room).emit('roomData',{
			room:user.room,
			users:getUsersInRoom(user.room)

		})
		callback()
	})


	socket.on('sendMessage',(message,callback)=>{
		const user= getUser(socket.id)
		const filter = new Filter()

		message=(filter.clean(message))
		io.emit('message',generateMessage(user.username,message))
		callback('Delivered')
	})

	socket.on('sendLocation',(coords)=>{
		// console.log('vgvggvg')
		const user=getUser(socket.id)
		io.emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
	})

	socket.on('disconnect',()=>{
		const user=removeUser(socket.id)
		if(!user){
			return 0
		}

		io.to(user.room).emit('message',generateMessage(`${user.username} has Left :(`))
		io.to(user.room).emit('roomData',{
			room:user.room,
			users:getUsersInRoom(user.room)
		})
	})
	// io.emit('countUpdated',count)

	// socket.on('increment',()=>{
	// 	count++
	// 	io.emit('countUpdated',count)
	// })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})