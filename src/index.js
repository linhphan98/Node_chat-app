const express = require("express") 
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generateMessage, generateLocationMessage} = require("./utils/messages")
const { addUser, removeUser, getUser, getUsersInRoom, addRoom, getRooms, removeRoom, existingRoom } = require("./utils/users")

// server(emit) --> client(receive) --> acknowledgement --> server

// client(emit) --> server(receive) --> acknowledgement --> client

// whoever emiting the event, set up the callback function. Whoever receive the event, receive the callback function that needs to be called   
const app = express()
const server = http.createServer(app) // allow us to create a new web server and pass our express application
const io = socketio(server) 

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

// let count = 0

io.on("connection", function(socket){ //connection is gonna fire whenever socketio server got a new connection
	// socket is an object and it contains information about the new connection so we can use methods on socket to communicate with that specific client
	// if we have five clients, this function will run five different times
	console.log("New WebSocket connection")
	
	
	socket.on("join", function({userName, room}, callback){
		
		const { error, user } = addUser({ id: socket.id, userName, room })
		const existRoom = existingRoom(user, error)
		const roomList = addRoom(room)	

		console.log(userName)
		console.log(room)
		
		if(error){
			return callback(error)
		}

		socket.join(user.room) // we can only use this on server allows us to join a given chatroom 
		// io.to().emit, emit events to everyone in a specific room
		// socket.broadcast.to.emit, sending events to everyone except for that user in a specific room 

		socket.emit("message", generateMessage("admin", "Welcome!"))
		socket.broadcast.to(user.room).emit("message", generateMessage("admin" ,`${user.userName} has joined!`)) // this will emit new user message to every user except for the one that is loging in 

		if(!existRoom){
			socket.broadcast.emit("message", generateMessage("admin", `Room ${roomList.room} has been added to the list!`))
		}

		// send all the rooms available
		// send the list of users to the new user as well as update the list for the old users
		io.emit("roomDataRoom", {
			rooms: getRooms(),
			userName
		})

		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUsersInRoom(user.room)
		})
		
	 	
		callback()
	})

	socket.on("sendMessage", function(message, callback){ // receive the message, we call the callback to acknowledge the event
		const filter = new Filter() // used to filter bad words
		const user = getUser(socket.id)

		if(filter.isProfane(message)){
			return callback("Profanity is not allowed!")
		}
 
		io.to(user.room).emit("message", generateMessage(user.userName,  message))

		callback() // when everything is done, the message is sent to users, the callback function on this page will be called 
	})

	socket.on("sendLocation", function(position, callback){
		
		const user = getUser(socket.id)

		io.to(user.room).emit("locationMessage", generateLocationMessage(user.userName, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
		callback("Location Shared")
	})
	// send some datas back to that newly connected client
	// when we are working with socket.io and transferring data, we are sending and receiving events  
	// socket.emit("countUpdated", count) // send an event, whatever we send by the second element it will be available for the receive event, client 
	// if we use the io.emit here whenever a client join, all clients will get the count data because the count has not changed, there is no need to send it to everyone
	// socket.on("increment", function(){
	// 	count++
	// socket.emit("countUpdated", count) // when we use emit, we emit an event to a particular connection 
	// 	io.emit("countUpdated", count) // this s gonna emit the event to every connection that is available
	// })

	// built-in event when a given socket is disconnected
	socket.on("disconnect", function(){

		const user = removeUser(socket.id) // we either get the user that is removed as an object or undefined 
		
		if(user) {
			const room = removeRoom(user.room)

		// we don't need to do broadcast because that socket will not receive the message anyway 
		io.to(user.room).emit("message", generateMessage( "admin" ,`${user.userName} has left!`))

		if(room){
			io.emit("message", generateMessage("admin", `Room ${room.room} has been removed`))
			io.emit("roomDataRoom", {
				rooms: getRooms(),
				userName: user.userName
			})
		}

		io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room)
			})
		}
	})
})
server.listen(port, function(){
	console.log(`Server is up on port ${port}!`)
})