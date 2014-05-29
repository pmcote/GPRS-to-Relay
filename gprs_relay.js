// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This demo allows you to control the relay 
module on your Tessel by sending SMS messages
with a preset trigger.
It should be fairly easy to adapt this code 
to activate any other module by SMS. Have fun!
**********************************************/

var tessel = require('tessel');
var gprs_port = tessel.port('A');
var gprs = require('gprs-sim900').use(gprs_port);
var relay = require('relay-mono').use(tessel.port('C'));

// Emit unsolicited messages beginning with. . .
gprs.emitMe(['+']);

// gprs.on('ready', function () {
// 	relay.on('ready', function () {
// 		console.log('poop on you')
// 	});
// });

function trigger (callback) {
	// When receiving an unsolicited text, read it and print it to console
	console.log('poo')
	gprs.on('+', function messageNotify (data) {
		console.log('poop')
		var dataSplit = data.split(',');
		var SMSindex = dataSplit[1];
		var mode = 0; // Zero marks message as read, One will not change message status

		gprs.readSMS(SMSindex, mode, function(err, message) {
			if (err) console.log(err);
			sendingInfo = message[1] // message is an array with index 0: Command echo, 1: Message information (read state, soure number, date), 2: Message text, 3; 'OK' if successful
			console.log('Message received!\nMessage from numeber: ' + message[1]);
			console.log('Message to Tessel: ' + message[2]);

			// Now we're going to set a trigger for the next module action
			var trigger = /Tessel/;
			var isTrigger = trigger.test(message[2]);
			if (isTrigger) {
				console.log('We can tell a module what to do');
				// A function with what you would like the module to do
				callback();
			}
			else {
				console.log('That was not the trigger you set, but congrats on having such a popular Tessel.');
			}
		});
	});
};

// The cool thing you want your triggered module to do. In this case, turn something on or off with the relay module.
function coolAction (){
	console.log('extra poo')
	relay.toggle(1, function (err) {
		if (err) console.log('There was an error toggling relay device 1 :(') 
		console.log('toggled');
	});
};

// // Initialize GPRS module
gprs.on('ready', function() {
	// Wait around 30 seconds for the GPRS modual to connect before sending Tessel a text.
	console.log("GPRS is on and waiting for you to text a trigger for your module");
	// Assuming relay is on
	trigger(coolAction);
});





