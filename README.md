JavaScript Shortcuts Library (jQuery plugin)
===

Usage
---

### Add a shortcut:

	$.Shortcuts.add({
	    type: 'down',
	    mask: 'Ctrl+A',
	    handler: function() {
	        debug('Ctrl+A');
	    }
	});

### Start reacting to shortcuts:

	$.Shortcuts.start();

### Add a shortcut to &ldquo;another&rdquo; list:

	$.Shortcuts.add({
	    type: 'hold',
	    mask: 'Shift+Up',
	    handler: function() {
	        debug('Shift+Up');
	    },
	    list: 'another'
	});

### Activate &ldquo;another&rdquo; list:

	$.Shortcuts.start('another');

### Remove a shortcut:

	$.Shortcuts.remove({
	    type: 'hold',
	    mask: 'Shift+Up',
	    list: 'another'
	});

### Stop (unbind event handlers):

	$.Shortcuts.stop();

Features
---

### Event types

* **down** &mdash; On key down (default value).
* **up** &mdash; On key up.
* **hold** &mdash; On pressing and holding down the key. The handler will be called immediately after pressing the key and then repeatedly while the key is held down.

### Supported keys

* Modifiers: *Ctrl, Shift, Alt*
* Numbers: *0&mdash;9*
* Letters: *A&mdash;Z (case-insensitive)*
* Special: *Backspace, Tab, Enter, Pause, CapsLock, Esc, Space, PageUp, PageDown, End, Home, Left, Up, Right, Down, Insert, Delete, F1&mdash;F12, ? (Question Mark), Minus, Plus*

### Multiple key combinations and multiple lists:

	$.Shortcuts.add({
	    type: 'hold',
	    mask: 'Shift+Up,Shift+Down',
	    handler: function() {
	        doSomething();
	    },
	    list: 'first,second'
	});

### Chaining:

	$.Shortcuts.add({
	    type: 'down',
	    mask: 'Ctrl+A',
	    handler: function() {
	        debug('Ctrl+A');
	    }
	}).start();

### Enable/disable shortcuts in input fields and textareas:

	$.Shortcuts.add({
	    type: 'down',
	    mask: 'Ctrl+S',
	    enableInInput: true,
	    handler: function() {
	        debug('Ctrl+S');
	    }
	});