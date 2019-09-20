const socket = io() // the return value for io function needs to stored in a variable to access to it 

// socket.on("countUpdated", function(count){ // need to match exactly on the index.js
									// we receive an event server send to us
// 	console.log("The count has been updated ", count)
// })

// we wanna do something when +1 button is clicked
// document.querySelector("#increment").addEventListener("click", function(){ // function runs whenever the button is clicked
// to grab a single element by its id
// 	console.log("Clicked")
// 	socket.emit("increment")
// })

// Elements 
const $messageForm = document.querySelector("#message-form") 
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")
const $users = document.querySelector("#users")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML // give us access  to the HTML contained inside that is <p></p> and div
const locationMessageTemplate = document.querySelector("#locationMessage-template").innerHTML
const sidebarTemplateRooms = document.querySelector("#sidebar-template-rooms").innerHTML
const sidebarTemplateUsers = document.querySelector("#sidebar-template-users").innerHTML

// Options
const { userName, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // what we get back is an object, it has all the key and value of the properties: name and room  
						// this is for this ? to go away

const autoScroll = function(){

	 // New message element
	 const $newMessage = $messages.lastElementChild  // this going to grab the last element as a child which is the latest message 

	 // Height of the new message
	 const newMessageStyles = getComputedStyle($newMessage)
	 const newMessageMargin = parseInt(newMessageStyles.marginBottom)  // it takes a string and parse to a number 
	 const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	 // visible height
	 const visibleHeight = $messages.offsetHeight

	 // height of messages container
	 const containerHeight = $messages.scrollHeight // total height we are able to scroll through

	 // to figure out how far down we are scrolling 
	 const scrollOffset = $messages.scrollTop + visibleHeight  // the top of the scrollbar is zero and as we scroll down the value gets larger

	 if(containerHeight - newMessageHeight <= scrollOffset){ // if we scroll to the bottom but before the new message is added in  
	 		// want to make sure that we are indeed at the bottom before the last message is added 
	 		$messages.scrollTop = $messages.scrollHeight 
	 }
}

socket.on("message", function(message){ // in this case message is an object with value of generateMessage("Welcome!")
	console.log(message)
	const html = Mustache.render(messageTemplate, {
		userName : message.userName,
		message123  : message.text,
		createdAt : moment(message.createdAt).format("h:mm a")
	})
	$messages.insertAdjacentHTML("beforeend", html) //we have four options 
						// afterbegin, it would add just at the top inside of the div, meaning newer messages will show up first 
						// afterend,  after the element ends, it would be outside the element div
		 				// beforebegin, before the messages div
						// beforeend, before the messages div ends
	autoScroll()
}) 

$messageForm.addEventListener("submit", function(e){ // when we get submit function we have access on e object
	e.preventDefault() // to prevent default behaviour where the brownser go to the full page refresh    
	// const message = document.querySelector("input").value // get the actual text that the user typed in 

	$messageFormButton.setAttribute("disabled", "disabled") // this line allows us to disable the form once it's been submitted 
	// diable the form (button) avoid clicking two times 
	
	const message = e.target.elements.message.value // e.target represents the target we are listening for the event on (form)
	
	socket.emit("sendMessage", message, function(error){ // this function is going to run when the event is acknowledged
		// enable it
		$messageFormButton.removeAttribute("disabled")
		$messageFormInput.value = " " // this line clears the input of the previous use
		$messageFormInput.focus() // after entering an input and move the cursor away from the box and click the button. without focus, the cursor would not be seen 

		if(error){
			return console.log(error)
		}

		console.log("Message delivered")
		 	
	})
})

socket.on("locationMessage", function(url){
		const html = Mustache.render(locationMessageTemplate, {
			userName : url.userName,
 			url123 : url.url, 
			createdAt123 : moment(url.createdAt).format("h:mm a") 
		})	
		$messages.insertAdjacentHTML("beforeend", html)
		autoScroll()
	}) 	

$sendLocationButton.addEventListener("click", function(){
	$sendLocationButton.setAttribute("disabled", "disabled")

	if(!navigator.geolocation){ // if this exists, that means they have support for it 
		return alert("geolocation is not supported by your brownser")
	}


	navigator.geolocation.getCurrentPosition(function(position){// CurrentPosition is indeed asynchronous because it takes a bit time to execute, but does not support promise  
		socket.emit("sendLocation", {
			latitude: position.coords.latitude, 
			longitude: position.coords.longitude
		}, function(message){
			$sendLocationButton.removeAttribute("disabled")
			console.log(message)
		})
	})
})

socket.on("roomData", function({ room, users}){
	 const html = Mustache.render(sidebarTemplateUsers, {
	 	 room, 
	 	 users
	 }) 
	document.querySelector("#users").innerHTML = html  
})

socket.on("roomDataRoom", function({rooms, userName}){
	const html = Mustache.render(sidebarTemplateRooms, {
		rooms,
		userName
	})
	document.querySelector("#rooms").innerHTML = html
})


socket.emit("join", {userName, room}, function(error){ // accept the username you going to use and the room you gonna join
	if(error) {
		alert(error)
		location.href = "/" // this will redirect the user back to the root or the join webpage
	}
})  