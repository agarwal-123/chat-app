const socket =io()

const $messages= document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessage = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix: true})


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message',(str)=>{
	console.log(str)
	// document.querySelector('p').innerHTML += str+'<br>' 
	const html=Mustache.render(messageTemplate,{
		username:str.username,
		message:str.text,
		createdAt:moment(str.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})



socket.on('locationMessage',(message)=>{
	console.log(message)
	const html=Mustache.render(locationMessage,{
		username:message.username,
		url:message.url,
		createdAt:moment(message.createdAt).format('h:mm a')

	})
	$messages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})


socket.on('roomData',({room,users})=>{
	const html=Mustache.render(sidebarTemplate,{
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML=html


})

document.querySelector('#message-form').addEventListener('submit',(e)=>{
	e.preventDefault()

	document.querySelector('#message-form').querySelector('button').setAttribute('disabled','disabled')
	const message =document.querySelector('input').value


	socket.emit('sendMessage',message,(message)=>{
			document.querySelector('#message-form').querySelector('button').removeAttribute('disabled')
			document.querySelector('#message-form').querySelector('input').value=''
			document.querySelector('#message-form').querySelector('input').focus()

		console.log(message)
	})
})


document.querySelector('#send-location').addEventListener('click',()=>{
	console.log('wdee')
	document.querySelector('#send-location').setAttribute('disabled','disabled')

	if(!navigator.geolocation){
		return alert('Not Supported')
	}

	navigator.geolocation.getCurrentPosition((position)=>{
		console.log(position,0)
		socket.emit('sendLocation',{
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		})
	document.querySelector('#send-location').removeAttribute('disabled')

	})
})


socket.emit('join',{username,room},(error)=>{
	if(error){
		alert(error)
		location.href='/'
	}
})

// socket.on('countUpdated',(count)=>{
// 	console.log('Count updated',count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
// 	console.log('Increment')

// 	socket.emit('increment')
// })

