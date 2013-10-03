/* A lightweight, better logger for Titanium
 * can set names, levels (like Log4J) and 
 * shows time and memory usage
 * 
 * usage: var tracer = require('tracer');
 * var log = tracer.createTracer('Some Name');
 * log.setLevel(tracer.levels.DEBUG);
 * log.debug( 'A debug message');
 * log.info( 'A info message');
 * log.warn( 'a warning message');
 * log.error( 'a error message');
 * log.setLevel( tracer.levels.INFO);
 * log.debug( 'this wont show');
 * log.info( 'this will');
 * 
 * Levels are DEBUG, INFO, WARN, ERROR, OFF
 * 
 * Output:
 * [DEBUG] Some Name      0ms    51mb     ^0mb A debug message
 *         NameofLogger TimeSinceStart FreeMemory MemoryChangeSinceStart Message
 * 
 * To Reset the Memory or Time, use log.startTimer, log.resetMemory or log.reset (for both)
 * 
 */

exports.levels = {};
exports.levels.DEBUG = 1;
exports.levels.INFO = 2;
exports.levels.WARN = 3;
exports.levels.ERROR = 4;
exports.levels.OFF = 5;

exports.createTracer = function(name) {

	var t = {};
	t.name = name;

	t.startTimer = function() {
		t.startTime = (new Date()).valueOf();
	};

	t.resetMemory = function() {
		t.startMem = Ti.Platform.availableMemory;
	};

	t.reset = function() {
		t.startTimer();
		t.resetMemory();
	}

	t.reset();

	function makeMsg(msg) {
		var dateTemp = new Date();
		var elapsed = dateTemp.valueOf() - t.startTime;
		var currMem = Ti.Platform.availableMemory;
		var avilableMem = Math.round(currMem) + 'mb';
		var deltaMem = Math.round(t.startMem - currMem) + 'mb';
		return (padRight(t.name, 10) + " " + padLeft(elapsed + "ms", 7) + " " + padLeft(avilableMem, 7) + " " + padLeft("^" + deltaMem, 8) + " " + msg );
	};

	function padLeft(str, num) {
		str = "            " + str
		return str.substr(-1 * num);
	};

	function padRight(str, num) {
		str += "            ";
		return str.substr(0, num);
	}


	t.level = exports.levels.INFO;

	t.setLevel = function(level) {
		t.level = level;
	};

	t.debug = function(msg) {
		if(t.level <= exports.levels.DEBUG) {
			Ti.API.debug(makeMsg(msg));
		}
	};

	t.info = function(msg) {
		if(t.level <= exports.levels.INFO) {
			Ti.API.info(makeMsg(msg));
		}
	};

	t.warn = function(msg) {
		if(t.level <= exports.levels.WARN) {
			Ti.API.warn(makeMsg(msg));
		}
	};

	t.error = function(msg) {
		if(t.level <= exports.levels.ERROR) {
			Ti.API.error(makeMsg(msg));
		}
	};
	return t;

};
