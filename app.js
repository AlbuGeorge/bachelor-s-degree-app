const express			= require('express');
const session			= require('express-session');
const hbs				= require('express-handlebars');
const mongoose			= require('mongoose');
const passport			= require('passport');
const localStrategy		= require('passport-local').Strategy;
const bcrypt			= require('bcrypt');
const app				= express();

const server = require('http').createServer(app);  // For connection with socket.io server

var http = require('http');
var fs = require('fs'); //require filesystem module
var io = require('socket.io','net')(server, http); //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var LED17 = new Gpio(17, 'out'); //use GPIO pin 21 as output
var LED27 = new Gpio(27, 'out'); //use GPIO pin 16 as output
var LED21 = new Gpio(21, 'out')
var LED22 = new Gpio(22, 'out')


var GPIO17value = 0;  // Turn on the LED by default
var GPIO27value = 0;  // Turn on the LED by default
var GPIO21value = 0;  // Turn on the LED by default
var GPIO22value = 0;  // Turn on the LED by default

// MongoDb Connection
mongoose.connect("mongodb+srv://georgealbumaster:qELSTREg9Y2cwS2@raspcluster.sjgx7.mongodb.net/smarthome?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  });

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

const User = mongoose.model('User', UserSchema);


// Middleware
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(session({
	secret: "verygoodsecret",
	resave: false,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new localStrategy(function (username, password, done) {
	User.findOne({ username: username }, function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, { message: 'Incorrect username.' });

		bcrypt.compare(password, user.password, function (err, res) {
			if (err) return done(err);
			if (res === false) return done(null, false, { message: 'Incorrect password.' });
			
			return done(null, user);
		});
	});
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/login');
}

function isLoggedOut(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/');
}

// ROUTES
app.get('/', isLoggedIn, (req, res) => {
	res.render("index", { title: "Home" });
});

app.get('/about', (req, res) => {
	res.render("index", { title: "About" });
});

app.get('/login', isLoggedOut, (req, res) => {
	const response = {
		title: "Login",
		error: req.query.error
	}

	res.render('login', response);
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?error=true'
}));

app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

// Setup our admin user
app.get('/setup', async (req, res) => {
	const exists = await User.exists({ username: "george" });

	if (exists) {
		res.redirect('/login');
		return;
	};

	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("pass", salt, function (err, hash) {
			if (err) return next(err);
			
			const newAdmin = new User({
				username: "george",
				password: hash
			});

			newAdmin.save();

			res.redirect('/login');
		});
	});
});


// Read Temperature
var sensor = require("node-dht-sensor");
var sensorType = 11;
var gpioPin = 4;
var repeats = 10;
var count = 0;

server.listen(3000, () => {
	LED17.writeSync(GPIO17value); //turn LED on or off
	LED27.writeSync(GPIO27value); //turn LED on or off
	LED21.writeSync(GPIO21value); //turn Air Cond on or off
	LED22.writeSync(GPIO22value); //turn Central Heating on or off
	console.log("Listening on port 3000");
	console.log('GPIO17 = '+GPIO17value);
	console.log('GPIO27 = '+GPIO27value);
	console.log('GPIO21 = '+GPIO21value);
	console.log('GPIO22 = '+GPIO22value);
});


process.on('SIGINT', () => { //on ctrl+c
	LED17.writeSync(0); // Turn LED off
	LED17.unexport(); // Unexport LED GPIO to free resources
	
	LED27.writeSync(0); // Turn LED off
	LED27.unexport(); // Unexport LED GPIO to free resources

	LED21.writeSync(0); // Turn Air Cond off
	LED21.unexport(); // Unexport Air Cond GPIO to free resources
	
	LED22.writeSync(0); // Turn Central Heating off
	LED22.unexport(); // Unexport Central Heating GPIO to free resources

	process.exit(); //exit completely
  }); 

  /****** io.socket is the websocket connection to the client's browser********/
var action = 0;

io.sockets.on('connection', function (socket) {// WebSocket Connection
    console.log('A new client has connectioned. Send LED status');
    socket.emit('GPIO17', GPIO17value);
    socket.emit('GPIO27', GPIO27value);
    socket.emit('GPIO21', GPIO21value);
    socket.emit('GPIO22', GPIO22value);
    
    // this gets called whenever client presses GPIO17 toggle light button
    socket.on('GPIO17', function(data) { 
	if (GPIO17value) GPIO17value = 0;
	else GPIO17value = 1;
	var action = action + 1;
	console.log(action);
	console.log('new GPIO17 value='+GPIO17value);
	LED17.writeSync(GPIO17value); //turn LED on or off
	console.log('Send new GPIO17 state to ALL clients');
	io.emit('GPIO17', GPIO17value); //send button status to ALL clients 
    });
    
    // this gets called whenever client presses GPIO27 toggle light button
    socket.on('GPIO27', function(data) { 
	if (GPIO27value) GPIO27value = 0;
	else GPIO27value = 1;
	console.log('new GPIO27 value='+GPIO27value);
	LED27.writeSync(GPIO27value); //turn LED on or off
	console.log('Send new GPIO27 state to ALL clients');
	io.emit('GPIO27', GPIO27value); //send button status to ALL clients 
    });
    
	 // this gets called whenever client presses GPIO21 toggle light button
	 socket.on('GPIO21', function(data) { 
		if (GPIO21value) GPIO21value = 0;
		else GPIO21value = 1;
		console.log('new GPIO21 value='+GPIO21value);
		LED21.writeSync(GPIO21value); //turn LED on or off
		console.log('Send new GPIO21 state to ALL clients');
		io.emit('GPIO21', GPIO21value); //send button status to ALL clients 
		});
	
	// this gets called whenever client presses GPIO22 toggle light button
    socket.on('GPIO22', function(data) { 
	if (GPIO22value) GPIO22value = 0;
	else GPIO22value = 1;
	console.log('new GPIO22 value='+GPIO22value);
	LED22.writeSync(GPIO22value); //turn LED on or off
	console.log('Send new GPIO22 state to ALL clients');
	io.emit('GPIO22', GPIO22value); //send button status to ALL clients 
    });

	var iid = setInterval(function() {
		start = new Date().getTime();
		sensor.read(sensorType, gpioPin, function(err, temperature, humidity) {
		  end = new Date().getTime();
		  if (err) {
			console.warn("" + err);
		  } else {
			var elapsed = end - start;
			console.log(
			  "temperature: %s°C, humidity: %s%%, time: %dms",
			  temperature.toFixed(0),
			  humidity.toFixed(0),
			  end - start
			);
			var temper = temperature.toFixed(0);
    		var humid = humidity.toFixed(0);
			
			if (temper > 28) {
				console.log('Temperature is higher than 28.');
				LED21.writeSync(1);
				LED22.writeSync(0);
				GPIO21value = 1;
				GPIO22value = 0;
			} else if (temper < 27) {
				console.log('Temperature is lower than 27.');
				LED21.writeSync(0);
				LED22.writeSync(1);
				GPIO21value = 0;
				GPIO22value = 1;
			}
		}
		socket.emit('dht11', {
			temper, humid,
		  });
		});
	  }, 10000);
    
	  

	 
	  
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
	console.log('A user disconnected');
    });
    


}); 
