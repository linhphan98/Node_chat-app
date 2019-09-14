const users = []


// addUser, to track a new user

const addUser = function({ id, userName, room }){ // every socket has unique id generated for it
	// Clean the data
	userName = userName.trim().toLowerCase()
	room = room.trim().toLowerCase()

	// Validate the data
	if(!userName || !room) {
		return {
			error: "Username and room are required!"
		}
	}

	// Check for existing userName
	const existingUser = users.find(function(user){
		return user.room == room && user.userName == userName
	}) // to find a match 

	// Validate userName 
	if(existingUser){
		return {
			error: "Username is in used!"
		}
	}

	// Store user
	const user = { id, userName, room }
	users.push(user) // push the user onto the array together with id, userName, room
	return { user }
} 



	// removeUser, to stop tracking a user when he/she leave
const removeUser = function(id){
	const index = users.findIndex(function(user){
		return user.id == id 
	})  // -1 if no match, >0 if there is match

	if(index != -1){
		return users.splice(index, 1)[0] // allows us to remove item from the array by their index and store them into an array
	}
}



	// getUser, allows us to fetch an existing user data 
const getUser = function(id){
	return users.find(function(user){ // return match if found, undefined if there is no match
		return user.id == id
	}) 
}



	// getUsersInRoom, allows us to fetch all users in a specific room, render the list on sidebar
const getUsersInRoom = function(room){
	room = room.trim().toLowerCase()
	return users.filter(function(user){ // true when something gets returned, false when it should be filtered out and should not returned
		return user.room == room
	})
}

module.exports = {
	addUser, 
	removeUser, 
	getUser,
	getUsersInRoom
}