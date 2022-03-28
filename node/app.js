var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
	cors: {
		origin: '*',
	}
});
var bodyParser = require('body-parser');

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


var pjson = require('./package.json');

var pushService = (function() {
	var connections = {};
	var connectionCustomers = {};
	return {
		
		registerUser: function(userId, connectionId) {
			if (connections[userId] === undefined) {
				connections[userId] = {};
			}
			connections[userId][connectionId] = null;
			console.log('Registered user ' + connectionId.substring(0, 4) + '*** for user ' + userId);
		},

		registerCustomer: function(customerId, connectionId) {
			if (connectionCustomers[customerId] === undefined) {
				connectionCustomers[customerId] = {};
			}
			connectionCustomers[customerId][connectionId] = null;
			console.log('Registered user ' + connectionId.substring(0, 4) + '*** for user ' + customerId);
		},

        getUsers: function () {
            return connections;
        },

        getCustomers: function () {
            return connectionCustomers;
        },

		registerSocket: function(userId, connectionId, socket) {
			if (connections[userId] !== null && connections[userId][connectionId] === null) {
				socket.userId = userId;
				socket.connectionId = connectionId;
				connections[userId][connectionId] = socket;
				console.log('Registered socket for connection ' + connectionId.substring(0, 4) + '*** and  ussssser ' + userId);
				return true;
			} else {
				console.log('Not found empty conn for connection ' + connectionId.substring(0, 4) + '*** and  user ' + userId);
				return false;
			}
		},

		registerCustomerSocket: function(customerId, connectionId, socket) {
			if (connectionCustomers[customerId] !== null && connectionCustomers[customerId][connectionId] === null) {
				socket.customerId = customerId;
				socket.connectionId = connectionId;
				connectionCustomers[customerId][connectionId] = socket;
				console.log('Registered socket for connection ' + connectionId.substring(0, 4) + '*** and  ussssser ' + customerId);
				return true;
			} else {
				console.log('Not found empty conn for connection ' + connectionId.substring(0, 4) + '*** and  user ' + customerId);
				return false;
			}
		},
		/**
		 * Remove connection.
		 * @param socket socket to remove.
		 */
		removeConnection: function(socket) {
			var userId = socket.userId;
			var connectionId = socket.connectionId;
			if (userId && connectionId && connections[userId] && connections[userId][connectionId]) {
				console.log('Removed socket for user ' + userId + ' and connection: ' + connectionId.substring(0, 4) + '***');
				delete connections[socket.connectionId];
			}
		},
		/**
		 * Send notification to user.
		 * @param userId id of user.
		 * @param message message.
		 */
		pushNotification: function(userId, notification) {
			var userConnections = connections[userId];
			if (userConnections) {
				for (var connectionId in  userConnections) {
					if (userConnections.hasOwnProperty(connectionId)) {
						var socket = userConnections[connectionId];
						if (socket !== null) {
							socket.emit('notification', notification);
						}
					}
				}
			}
		},

		pushSurvey: function(userId, survey) {
			var userConnections = connections[userId];
			if (userConnections) {
				for (var connectionId in  userConnections) {
					if (userConnections.hasOwnProperty(connectionId)) {
						var socket = userConnections[connectionId];
						if (socket !== null) {
							socket.emit('survey', survey);
						}
					}
				}
			}
		},

		sendCoSu: function(customerId, cosu) {
			var customerConnections = connectionCustomers[customerId];
			if (customerConnections) {
				for (var connectionId in  customerConnections) {
					if (customerConnections.hasOwnProperty(connectionId)) {
						var socket = customerConnections[connectionId];
						if (socket !== null) {
							console.log(cosu)
							socket.emit('cosu', cosu);
						}
					}
				}
			}
		},

		notificationFromUser: function(customerId, notification) {
			var customerConnections = connectionCustomers[customerId];
			if (customerConnections) {
				for (var connectionId in  customerConnections) {
					if (customerConnections.hasOwnProperty(connectionId)) {
						var socket = customerConnections[connectionId];
						if (socket !== null) {
							socket.emit('notificationFromUser', notification);
						}
					}
				}
			}
		},

		notificationUserOtherDevice: function(userId, notification) {
			var userConnections = connections[userId];
			if (userConnections) {
				for (var connectionId in  userConnections) {
					if (userConnections.hasOwnProperty(connectionId)) {
						var socket = userConnections[connectionId];
						if (socket !== null) {
							socket.emit('notificationUserOtherDevice', notification);
						}
					}
				}
			}
		},

		surveyFromUser: function(customerId, survey) {
			var customerConnections = connectionCustomers[customerId];
			if (customerConnections) {
				for (var connectionId in  customerConnections) {
					if (customerConnections.hasOwnProperty(connectionId)) {
						var socket = customerConnections[connectionId];
						if (socket !== null) {
							socket.emit('surveyFromUser', survey);
						}
					}
				}
			}
		},

		surveyUserOtherDevice: function(userId, survey) {
			var userConnections = connections[userId];
			if (userConnections) {
				for (var connectionId in  userConnections) {
					if (userConnections.hasOwnProperty(connectionId)) {
						var socket = userConnections[connectionId];
						if (socket !== null) {
							socket.emit('surveyUserOtherDevice', survey);
						}
					}
				}
			}
		},

		readNotificationOtherDevice: function(request) {
			var customerConnections = connectionCustomers[request.customerId];
			if (customerConnections) {
				for (var connectionId in  customerConnections) {
					if (customerConnections.hasOwnProperty(connectionId)) {
						var socket = customerConnections[connectionId];
						if (socket !== null) {
							socket.emit('readNotificationOtherDevice', request.notificationId, request.count);
						}
					}
				}
			}
		},

		commentFromUser: function(customerId, comment) {
			var customerConnections = connectionCustomers[customerId];
			if (customerConnections) {
				for (var connectionId in  customerConnections) {
					if (customerConnections.hasOwnProperty(connectionId)) {
						var socket = customerConnections[connectionId];
						if (socket !== null) {
							socket.emit('comment', comment);
						}
					}
				}
			}
		},

		commentFromCustomer: function(request) {
			var userConnections = connections[request.userId];
			if (userConnections) {
				for (var connectionId in  userConnections) {
					if (userConnections.hasOwnProperty(connectionId)) {
						var socket = userConnections[connectionId];
						if (socket !== null) {
							console.log(request.comment);
							socket.emit('comment', request.comment);
						}
					}
				}
			}
		},
	}
}());

/**
 * Handle connection to socket.io.
 */
	/**
	 * On registered socket from client.
	 */
io.on('connection', function(socket) {
	socket.on('registerUser', function(userId, connectionId) {
		pushService.registerUser(userId, connectionId);
		pushService.registerSocket(userId, connectionId, socket);
	});


	socket.on('registerCustomer', function(customerId, connectionId) {
		pushService.registerCustomer(customerId, connectionId);
		pushService.registerCustomerSocket(customerId, connectionId, socket);
	});

	socket.on('notificationFromUser', function(complexId, notification) {
		let name = 'notification-' + complexId;
		io.emit(name, notification);

		notification.id = socket.id;
		io.emit('notificationUserOtherDevice', notification)
	});

	socket.on('surveyFromUser', function(complexId, survey) {
		let name = 'survey-' + complexId;
		io.emit(name, survey);

		survey.id = socket.id;
		io.emit('surveyUserOtherDevice', survey)
	});

	/**
	 * On disconnected socket.
	 */
	socket.on('disconnect', function() {
		pushService.removeConnection(socket);
	});
});

/**
 * Api to register user.
 */
app.post('/api/:userId/register', function(req, res) {
	var userId = req.params['userId'];
	var connectionId = req.query['connectionId'];
	if (userId ) {
		pushService.registerUser(userId, connectionId);
		res.status(200).send('Success');
	} else {
		res.status(400).send('Bad Request');
	}
});

/**
 * Api to send message to user.
 */
app.post('/api/sendNotification', function(req, res) {
	var users = req.body.users;
	var connectionUsers = pushService.getUsers();
	for(var user in users) {
		if(connectionUsers[users[user].user_id]) {
			pushService.pushNotification(users[user].user_id, users[user]);
		}
	}
	res.send('aaa');
});

app.post('/api/notificationFromUser', function(req, res) {
	var customerIdList = req.body.customerIdList;
	for(var customerId in customerIdList) {
		pushService.notificationFromUser(customerIdList[customerId], req.body.notification);
	}
	pushService.notificationUserOtherDevice(req.body.userId, req.body.notification);
	res.send('aaa');
});

app.post('/api/sendSurvey', function(req, res) {
	var users = req.body.users;
	var connectionUsers = pushService.getUsers();
	for(var user in users) {
		if(connectionUsers[users[user].user_id]) {
			pushService.pushSurvey(users[user].user_id, users[user]);
		}
	}
	res.send('aaa');
});

app.post('/api/surveyFromUser', function(req, res) {
	var customerIdList = req.body.customerIdList;
	for(var customerId in customerIdList) {
		pushService.surveyFromUser(customerIdList[customerId], req.body.survey);
	}
	pushService.surveyUserOtherDevice(req.body.userId, req.body.survey);
	res.send('aaa');
});

app.post('/api/sendCoSu', function(req, res) {
	var customerIdList = req.body.customerIdList;
	for(var customerId in customerIdList) {
		pushService.sendCoSu(customerIdList[customerId], req.body.cosu);
	}
	res.send('aaa');
});

app.post('/api/readNotification', function(req, res) {
	pushService.readNotificationOtherDevice(req.body);
	res.send('aaa');
});

app.post('/api/commentFromUser', function(req, res) {
	var customerIdList = req.body.customerIdList;
	for(var customerId in customerIdList) {
		pushService.commentFromUser(customerIdList[customerId], req.body.comment);
	}
	res.send('aaa');
});

app.post('/api/commentFromCustomer', function(req, res) {
	pushService.commentFromCustomer(req.body);
	res.send('aaa');
});

http.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});