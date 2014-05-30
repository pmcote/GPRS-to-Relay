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
var gprslib = require('gprs-sim900');
var relaylib = require('relay-mono');

var gprs = gprslib.use(tessel.port['A']);
var relay = relaylib.use(tessel.port['C']);

var LOGS = true; // If you don't want logs, set to false.

// Emit unsolicited messages beginning with. . .
gprs.emitMe(['+']);

function trigger (callback) {
	// When receiving an unsolicited text, read it and print it to console
	gprs.on('+', function messageNotify (data) {
		var dataSplit = data.split(',');
		var SMSindex = dataSplit[1];
		var mode = 0; // Zero marks message as read, One will not change message status

		gprs.readSMS(SMSindex, mode, function (err, message) {
			if (err) {
				return console.err();
			};
			sendingInfo = message[1] // message is an array with index 0: Command echo, 1: Message information (read state, soure number, date), 2: Message text, 3; 'OK' if successful
			if (LOGS) console.log('Message received!\nMessage from numeber: ', message[1]);
			if (LOGS) console.log('Message to Tessel: ', message[2]);

			// Now we're going to set a trigger for the next module action
			var trigger = /Tessel/;
			var isTrigger = trigger.test(message[2]);
			if (isTrigger) {
				if (LOGS) console.log('We can tell a module what to do');
				// A function with what you would like the module to do
				callback();
			}
			else {
				if (LOGS) console.log('That was not the trigger you set, but congrats on having such a popular Tessel.');
			}
		});
	});
};

// The cool thing you want your triggered module to do. In this case, turn something on or off with the relay module.
function coolAction (){
	relay.toggle(1, function (err) {
		if (err) return console.err() 
		if (LOGS) console.log('toggled');
	});
};

// // Initialize GPRS module
gprs.on('ready', function() {
	// Wait around 30 seconds for the GPRS modual to connect before sending Tessel a text.
	if (LOGS) console.log("GPRS is on and waiting for you to text a trigger for your module");
	// Assuming relay module is ready 
	trigger(coolAction);
});


