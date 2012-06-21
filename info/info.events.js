/*jshint node:true jquery:true*/
"use strict";

module.exports = function(info) {
	info.tables.push({
		html: '<p><span class="info-table-output"><i class="icon-play icon-white"></i> events</span></p><p>Events are used to add <strong>interactivity</strong> to your program. A <strong>function</strong> of your choice is executed whenever something happens, like when a button is pressed or the mouse is moved.</p>',
		list: [
			{
				name: 'document.onkeydown = functionName',
				id: 'events.document.onkeydown',
				// outputs: [],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>This lets you specify a function that is called every time a key is <strong>pressed down</strong>. An <var>event</var> object is passed into the function, which you can use to determine which key is pressed.</p>');
					info.consoleExample(infoTable, $content, 'function keyDown(event) {\n  console.log("key is pressed down");\n}\ndocument.onkeydown = keyDown;');
				}
			},
			{
				name: 'document.onkeyup = functionName',
				id: 'events.document.onkeyup',
				// outputs: [],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>This lets you specify a function that is called every time a key is <strong>released</strong>. An <var>event</var> object is passed into the function, which you can use to determine which key is released.</p>');
					info.consoleExample(infoTable, $content, 'function keyUp(event) {\n  console.log("key is released again");\n}\ndocument.onkeyup = keyUp;');
				}
			},
			{
				name: 'event.keyCode',
				id: 'events.event.keyCode',
				// outputs: [],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>The <strong>keyCode property</strong> of the event object of keyboard events contains a number which specifies which key was pressed or released. You can try yourself which keys correspond to which numbers.</p>');
					info.consoleExample(infoTable, $content, 'function keyDown(event) {\n  console.clear();\n  console.log("keyCode: " + event.keyCode);\n}\ndocument.onkeydown = keyDown;');
				}
			},
			{
				name: 'canvas.onmousemove = functionName',
				id: 'events.canvas.onmousemove',
				// outputs: ['canvas'],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>This event makes sure the function is called every time the mouse is <strong>moved</strong> across the canvas. You can use the <var>event</var> object in your function to determine where the mouse is.</p>');
					info.canvasExample(infoTable, $content, 'function mouseMove(event) {\n  var x = event.layerX;\n  var y = event.layerY;\n  context.fillRect(x, y, 5, 5);\n}\ncanvas.onmousemove = mouseMove;');
				}
			},
			{
				name: 'canvas.onmousedown = functionName',
				id: 'events.canvas.onmousedown',
				// outputs: ['canvas'],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>This event makes sure the function is called every time the mouse is <strong>pressed down</strong>. You can use the <var>event</var> object in your function to determine where the mouse is.</p>');
					info.canvasExample(infoTable, $content, 'function mouseDown(event) {\n  var x = event.layerX;\n  var y = event.layerY;\n  context.fillRect(x, y, 5, 5);\n}\ncanvas.onmousedown = mouseDown;');
				}
			},
			{
				name: 'canvas.onmouseup = functionName',
				id: 'events.canvas.onmouseup',
				// outputs: ['canvas'],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>This event makes sure the function is called every time the mouse is <strong>released</strong>. You can use the <var>event</var> object in your function to determine where the mouse is.</p>');
					info.canvasExample(infoTable, $content, 'function mouseUp(event) {\n  var x = event.layerX;\n  var y = event.layerY;\n  context.fillRect(x, y, 5, 5);\n}\ncanvas.onmouseup = mouseUp;');
				}
			},
			{
				name: 'event.layerX',
				id: 'events.event.layerX',
				// outputs: ['canvas'],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>The <var>layerX</var> property of the mouse events contains a number with the <strong>x-position</strong> of the mouse.</p>');
					info.canvasExample(infoTable, $content, 'function mouseMove(event) {\n  var x = event.layerX;\n  context.fillRect(x, 30, 5, 5);\n}\ncanvas.onmousemove = mouseMove;');
				}
			},
			{
				name: 'event.layerY',
				id: 'events.event.layerY',
				// outputs: ['canvas'],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>The <var>layerY</var> property of the mouse events contains a number with the <strong>y-position</strong> of the mouse.</p>');
					info.canvasExample(infoTable, $content, 'function mouseMove(event) {\n  var y = event.layerY;\n  context.fillRect(30, y, 5, 5);\n}\ncanvas.onmousemove = mouseMove;');
				}
			},
			{
				name: 'window.setInterval(functionName, time)',
				id: 'events.window.setInterval',
				// outputs: ['canvas'],
				outputs: [],
				makeContent: function(infoTable, $content) {
					$content.html('<p>You can have a function execute every <strong>once in a while</strong>, by using this command. The <strong>time</strong> argument specifies the number of <strong>milliseconds</strong> after which the function should be executed again.</p>');
					info.canvasExample(infoTable, $content, 'var t = 0;\nfunction tick() {\n  context.clearRect(0, 0, 500, 500);\n  context.fillRect(0, 0, t, t);\n  t += 5;\n  if (t > 200) {\n    t = 0;\n  }\n}\nwindow.setInterval(tick, 30);');
				}
			}
		]
	});
};
