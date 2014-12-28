socket = io.connect();

///////////////////////////
// IN GAME SOCKET EVENTS //
///////////////////////////

// Updates the canvas based on information received from enemy player
socket.on('canvasUpdate', function(data) {
	receiveUpdate(enemyTank, data.attributes);
});

// Updates the bullets based on information received from enemy player
socket.on('updateBullets', function(data) {
	enemyBullets = data.bullets;
});

// Reduces health when enemy sends info that it hit you
socket.on('takeDamage', function(data) {
	myTank.health -= data.damage;
});

// When the enemy's health hits zero you win
socket.on('iLost', function(data) {
	myTank.gameOver = 1;
	dieCenter = data.dieCenter;
	explosionColor = data.color.explosion;
});

// Adds a message to your end div
socket.on('rematch', function(data) {
	if (!($('#rematch-message').length)) {
		var rematchDiv = $('<div>').attr('id','rematch-notification');
		$('#end-message').text(data.player + ' demands a rematch!');
		var accept = $('<div>').attr('id','accept').text('Accept');
		var deny = $('<div>').attr('id','deny').text('Deny');
		$(rematchDiv).append(accept).append(deny);
		$('#end').append(rematchDiv);
		$('#rematch').remove();
		$('#return-to-lobby').remove();
	}
});

// The enemy left after a match by clicking 'return to lobby' or 'deny'
socket.on('iLeft', function(data) {
	$('#rematch').remove();
	$('#return-to-lobby').remove();
	var message;
	if (data.clicked === 'return-to-lobby') {
		message = (data.player + ' has left! Returning to lobby...');
	}
	else if (data.clicked === 'deny') {
		message = (data.player + ' rejects your challenge! Returning to lobby...')
	}
	$('#end-message').text(message);
	setTimeout(function() {
		$('#end').remove();
		$('canvas').hide();
		$('#lobby').show();
	}, 2000);
});

////////////////////////////
// Chatroom Socket Events //
////////////////////////////

// Lobby chat welcome message
socket.on('welcome message', function(data) {
	var chatmessages = $('.chatmessagescontainer');
	var message = $('<p>').addClass('message').attr('id', 'welcome-message').text(data);
	chatmessages.append(message);
});

// Gets users that are connected when you first join
socket.on('get users', addUser);

// Updates users when a user joins
socket.on('user joined', addUser);

function addUser(data) {
	var usersDiv = $('.current-users');
	usersDiv.empty();
	if (data.length > 0) {
		data.forEach(function(object) {
			var user = $('<div>').addClass('username-div');
			var usernamePar = $('<p>').addClass('username-text').text(object['name']);
			if (object.name.length > 10) {
				usernamePar.css('font-size','20px').css('line-height','.75');
			}
			user.append(usernamePar);
			user.attr('socketID', object['id']);
			usersDiv.append(user);
			if (object.name !== username) {
				user.append($('<div>').addClass('challenge-button user-button').text('Challenge!'));
			}
		});
	}
}

// Receives a message and displays it
socket.on('send message', function(data) {
	var chatmessages = $('.chatmessagescontainer');
	var messageTag = $('<p>').addClass('message').text(data.message);
	var userTag = $('<span>').addClass('username').text(data.name + ": ");
	messageTag.prepend(userTag);
	chatmessages.append(messageTag);
	chatmessages[0].scrollTop = chatmessages[0].scrollHeight;
});

// Receiving a challenge
socket.on('send challenge', function(data) {
	var message = $('<p>').addClass('message').addClass('challenge-message').text(data.name + ' has challenged you! Click here to accept.').attr('invitation-id',data.player);
	$('.chatmessagescontainer').append(message);
});


// Starts a game between two people
socket.on('commence game', function(players) {
	$('.challenge-message').remove();
	$('canvas').show();
	$('#main-title').hide();
	$('#splashpage').hide();
	$('#lobby').hide();
	$('#end').remove();
	startGame(players.enemy, players.enemyColor, players.player, players.playerColor);
});
