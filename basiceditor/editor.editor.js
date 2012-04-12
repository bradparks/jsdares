/*jshint node:true jquery:true*/
"use strict";

var clayer = require('../clayer');


module.exports = function(editor) {
	editor.Editor = function() { return this.init.apply(this, arguments); };

	editor.Editor.prototype = {
		init: function(language, $div, delegate) {
			this.language = language;
			this.surface = new editor.Surface($div, this);
			this.delegate = delegate;
			this.outputs = [];
			this.runner = new language.StaticRunner();

			this.editables = [];
			this.editablesByLine = [];
			this.editablesEnabled = false;

			this.highlightingEnabled = false;
			this.currentHighlightNode = null;

			this.setText('');
		},

		setText: function(text) {
			this.surface.setText(text);
			this.update();
		},

		setScope: function(scope) {
			this.runner.newScope(scope);
			this.update();
		},

		addOutput: function(output) {
			this.outputs.push(output);
			this.update();
		},

		callOutputs: function(funcName) {
			for (var i=0; i<this.outputs.length; i++) {
				this.outputs[i][funcName]();
			}
		},

		update: function() {
			this.code = new editor.Code(this.surface.getText());
			this.tree = new this.language.Tree(this.code.text);
			if (this.tree.hasError()) {
				if (this.editablesEnabled) {
					this.disableEditables();
				}
				if (this.highlightingEnabled) {
					this.disableHighlighting();
				}
				this.handleError(this.tree.getError());
				this.delegate.criticalError();
			} else {
				this.run();
			}
		},

		run: function() {
			this.callOutputs('clear');
			this.runner.newTree(this.tree);
			this.runner.run();
			this.handleRunnerOutput();
		},

		restart: function() {
			if (!this.tree.hasError()) {
				this.runner.restart();
				this.run();
			}
		},

		stepForward: function() {
			if (!this.tree.hasError()) {
				this.callOutputs('clear');
				if (!this.runner.isStepping()) {
					this.surface.openStepMessage();
				}
				this.runner.stepForward();
				this.handleRunnerOutput();
			}
		},

		stepBackward: function() {
			if (!this.tree.hasError()) {
				this.callOutputs('clear');
				this.runner.stepBackward();
				this.handleRunnerOutput();
			}
		},

		handleRunnerOutput: function() {
			if (this.runner.hasError()) {
				this.handleError(this.runner.getError());
				if (this.runner.isStepping()) {
					this.delegate.steppingWithError();
				} else {
					this.delegate.runningWithError();
				}
			} else {
				this.handleMessages(this.runner.getMessages());
				if (this.runner.isStepping()) {
					this.delegate.steppingWithoutError();
				} else {
					this.delegate.runningWithoutError();
				}
			}
		},

		handleError: function(error) {
			this.surface.hideStepMessage();
			this.surface.showErrorMessage(error);
		},

		handleMessages: function(messages) {
			this.surface.hideErrorMessage();
			if (messages.length <= 0) {
				this.surface.hideStepMessage();
			} else {
				for (var i=0; i<messages.length; i++) {
					if (messages[i].type === 'Inline') {
						this.surface.showStepMessage(messages[i]);
					}
				}
			}
		},

		userChangedText: function() { // callback
			this.update();
			if (this.editablesEnabled) {
				this.refreshEditables();
			}
			//window.localStorage.setItem('1', this.code.text);
		},

		userStartedChangingText: function() { // callback

		},

		enableEditables: function() {
			if (!this.tree.hasError() && this.language.editables !== undefined) {
				this.editablesEnabled = true;
				this.delegate.editablesEnabled();
				this.refreshEditables();
			}
		},

		disableEditables: function() {
			this.removeEditables();
			this.editablesEnabled = false;
			this.delegate.editablesDisabled();
		},

		refreshEditables: function() {
			if (this.editablesEnabled) {
				this.removeEditables();
				this.editables = this.language.editables.generate(this.tree, editor.editables, this.surface, this);
				for (var i=0; i<this.editables.length; i++) {
					var line = this.editables[i].line;
					if (this.editablesByLine[line] === undefined) {
						this.editablesByLine[line] = [];
					}
					this.editablesByLine[line].push(this.editables[i]);
				}
			}
		},

		removeEditables: function() {
			if (this.editablesEnabled) {
				for (var i=0; i<this.editables.length; i++) {
					this.editables[i].remove();
				}
				this.editables = [];
				this.editablesByLine = [];
			}
		},

		getEditablesText: function(node) { //callback
			return this.code.rangeToText(node.textLoc);
		},

		editableReplaceCode: function(line, column, column2, newText, updateOffsets) { // callback
			this.surface.setText(this.code.replaceOffsetRange(this.code.lineColumnToOffset(line, column), this.code.lineColumnToOffset(line, column2), newText));

			if (updateOffsets && this.editablesByLine[line] !== undefined) {
				for (var i=0; i<this.editablesByLine[line].length; i++) {
					this.editablesByLine[line][i].offsetColumn(column, newText.length-(column2-column));
				}
			}

			this.update();
		},

		enableHighlighting: function() {
			if (!this.tree.hasError()) {
				this.surface.enableMouse();
				this.highlightingEnabled = true;
				this.delegate.highlightingEnabled();
				this.callOutputs('enableHighlighting');
			}
		},

		disableHighlighting: function() {
			this.tree.clearHooks();
			this.surface.hideHighlight();
			this.surface.disableMouse();
			this.highlightingEnabled = false;
			this.delegate.highLightingDisabled();
			this.callOutputs('disableHighlighting');
		},

		highlightNode: function(node) { // callback
			this.surface.showHighlight(node.lineLoc.line, node.lineLoc.column, node.lineLoc.line+1, node.lineLoc.column2);
			this.surface.scrollToLine(node.lineLoc.line);
		},

		mouseMove: function(event, line, column) { // callback
			if (this.highlightingEnabled) {
				var node = this.tree.getNodeByLine(line);
				if (node !== this.currentHighlightNode) {
					this.currentHighlightNode = node;
					this.tree.clearHooks();
					if (node !== null) {
						this.tree.addHookBeforeNode(node, $.proxy(this.startHighlighting, this));
						this.tree.addHookAfterNode(node, $.proxy(this.stopHighlighting, this));
						var line1 = node.blockLoc.line, line2 = node.blockLoc.line2;
						console.log(this.code.blockToRightColumn(line1, line2));
						this.surface.showHighlight(line1, this.code.blockToLeftColumn(line1, line2), line2+1, this.code.blockToRightColumn(line1, line2));
					} else {
						this.surface.hideHighlight();
					}
					this.run();
				}
			}
		},

		mouseLeave: function(event) { //callback
			if (this.highlightingEnabled) {
				this.currentHighlightNode = null;
				this.tree.clearHooks();
				this.surface.hideHighlight();
				this.run();
			}
		},

		startHighlighting: function(node, scope) { // callback
			this.callOutputs('startHighlighting');
		},

		stopHighlighting: function(node, scope) { // callback
			this.callOutputs('stopHighlighting');
		}
		
	};
};
