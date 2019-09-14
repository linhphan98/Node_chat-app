const generateMessage = function(userName, text){
	return {
		userName, 
		text,
		createdAt: new Date().getTime()
	}
}

const generateLocationMessage = function(userName, url){
	return { 
		userName,
		url, 
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessage, 
	generateLocationMessage
}