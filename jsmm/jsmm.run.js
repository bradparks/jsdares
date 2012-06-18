/*jshint node:true*/
"use strict";

module.exports = function(jsmm) {
	var getNode = function(obj) {
		return 'jsmmContext.tree.nodes[' + obj.id + ']';
	};

	/* statementList */
	jsmm.nodes.Program.prototype.getRunCode = function() {
		var output = 'new function() {';
		output += 'return function(jsmmContext) {';
		output += this.statementList.getRunCode() + '}; }';
		return output;
	};
	
	jsmm.nodes.Program.prototype.getRunFunction = function() {
		/*jshint evil:true*/
		return eval(this.getRunCode());
	};

	jsmm.nodes.Program.prototype.getFunctionCode = function() {
		var output = 'new function() {';
		output += 'return function(jsmmScope) {';
		output += this.statementList.getFunctionCode() + '}; }';
		return output;
	};

	jsmm.nodes.Program.prototype.getFunctionFunction = function() {
		/*jshint evil:true*/
		return eval(this.getFunctionCode());
	};

	jsmm.nodes.Program.prototype.getCompareCode = function(functionNames) {
		return this.statementList.getCompareCode(functionNames);
	};
	
	/* statements */
	jsmm.nodes.StatementList.prototype.getRunCode = function() {
		var output = 'jsmmContext.increaseExecutionCounter(' + getNode(this) + ', ' + (this.statements.length+1) + ');\n';
		for (var i=0; i<this.statements.length; i++) {
			output += this.statements[i].getRunCode() + '\n\n';
		}
		return output;
	};

	jsmm.nodes.StatementList.prototype.getFunctionCode = function() {
		var output = '';
		for (var i=0; i<this.statements.length; i++) {
			if (this.statements[i].type === 'FunctionDeclaration') {
				output += this.statements[i].getFunctionCode() + '\n\n';
			}
		}
		return output;
	};

	jsmm.nodes.StatementList.prototype.getCompareCode = function(functionNames) {
		var output = '';
		for (var i=0; i<this.statements.length; i++) {
			if (this.statements[i].type !== 'FunctionDeclaration' || functionNames.indexOf(this.statements[i].name) >= 0) {
				output += this.statements[i].getCode() + '\n\n';
			} else {
				output += '/* function ' + this.statements[i].name + this.statements[i].getArgList() + ' */\n\n';
			}
		}
		return output;
	};
	
	/* statement */
	jsmm.nodes.CommonSimpleStatement.prototype.getRunCode = function() {
		return this.statement.getRunCode() + ";";
	};
	
	/* identifier, symbol */
	jsmm.nodes.PostfixStatement.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', "' + this.symbol + '")';
	};
	
	/* identifier, symbol, expression */
	jsmm.nodes.AssignmentStatement.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', "' + this.symbol + '", ' + this.expression.getRunCode() + ')';
	};
	
	/* items */
	jsmm.nodes.VarStatement.prototype.getRunCode = function() {
		var output = this.items[0].getRunCode();
		for (var i=1; i<this.items.length; i++) {
			output += ', ' + this.items[i].getRunCode();
		}
		return output;
	};
	
	/* name, assignment */
	jsmm.nodes.VarItem.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFunc(jsmmContext, "' + this.name + '")';
		if (this.assignment !== null) {
			// ; is invalid in for loops
			// this should be possible in JS for normal statements as well
			output += ', ' + this.assignment.getRunCode();
		}
		return output;
	};
	
	/* expression */
	jsmm.nodes.ReturnStatement.prototype.getRunCode = function() {
		var output = '';
		var expressonCode = this.expression === null ? 'undefined' : this.expression.getRunCode();
		output += 'return ' + getNode(this) + '.runFunc(jsmmContext, ' + expressonCode + ');';
		return output;
	};
	
	/* expression1, symbol, expression2 */
	jsmm.nodes.BinaryExpression.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.expression1.getRunCode() + ', "' + this.symbol + '", ' + this.expression2.getRunCode() + ')';
	};
	
	/* symbol, expression */
	jsmm.nodes.UnaryExpression.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, "' + this.symbol + '", ' + this.expression.getRunCode() + ')';
	};

	/* expression */
	jsmm.nodes.ParenExpression.prototype.getRunCode = function() {
		return '(' + this.expression.getRunCode() + ')';
	};
	
	/* number */
	jsmm.nodes.NumberLiteral.prototype.getRunCode = function() {
		return this.number;
	};
	
	/* str */
	jsmm.nodes.StringLiteral.prototype.getRunCode = function() {
		return JSON.stringify(this.str);
	};
	
	/* bool */
	jsmm.nodes.BooleanLiteral.prototype.getRunCode = function() {
		return this.bool ? 'true' : 'false';
	};
	
	/* name */
	jsmm.nodes.NameIdentifier.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, "' + this.name + '")';
	};
	
	/* identifier, prop */
	jsmm.nodes.ObjectIdentifier.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', "' + this.prop + '")';
	};
	
	/* identifier, expression */
	jsmm.nodes.ArrayIdentifier.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', ' + this.expression.getRunCode() + ')';
	};
	
	/* identifier, expressionArgs */
	jsmm.nodes.FunctionCall.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFunc(jsmmContext, ' + this.identifier.getRunCode() + ', [';
		if (this.expressionArgs.length > 0) output += this.expressionArgs[0].getRunCode();
		for (var i=1; i<this.expressionArgs.length; i++) {
			output += ", " + this.expressionArgs[i].getRunCode();
		}
		return output + '])';
	};

	/* identifier, expressions */
	jsmm.nodes.ArrayDefinition.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFunc(jsmmContext, [';
		if (this.expressions.length > 0) output += this.expressions[0].getRunCode();
		for (var i=1; i<this.expressions.length; i++) {
			output += ", " + this.expressions[i].getRunCode();
		}
		return output + '])';
	};
	
	/* expression, statementList, elseBlock */
	jsmm.nodes.IfBlock.prototype.getRunCode = function() {
		var output = 'if (' + getNode(this) + '.runFunc(jsmmContext, ' + this.expression.getRunCode() + ')) {\n';
		output += this.statementList.getRunCode() + '}';
		if (this.elseBlock !== null) {
			output += ' else {\n';
			output += this.elseBlock.getRunCode() + '\n';
			output += '}';
		}
		return output;
	};
	
	/* ifBlock */
	jsmm.nodes.ElseIfBlock.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext);\n' + this.ifBlock.getRunCode();
	};
	
	/* statementList */
	jsmm.nodes.ElseBlock.prototype.getRunCode = function() {
		return getNode(this) + '.runFunc(jsmmContext);\n' + this.statementList.getRunCode();
	};
	
	/* expression, statementList */
	jsmm.nodes.WhileBlock.prototype.getRunCode = function() {
		var output = 'while (' + getNode(this) + '.runFunc(jsmmContext, '  + this.expression.getRunCode() + '))';
		output += '{\n' + this.statementList.getRunCode() + '}';
		return output;
	};
	
	/* statement1, expression, statement2, statementList */
	jsmm.nodes.ForBlock.prototype.getRunCode = function() {
		var output = 'for (' + this.statement1.getRunCode() + '; ';
		output += getNode(this) + '.runFunc(jsmmContext, '  + this.expression.getRunCode() + '); ';
		output += this.statement2.getRunCode() + ') {\n' + this.statementList.getRunCode() + '}';
		return output;
	};
	
	/* name, nameArgs, statementList */
	jsmm.nodes.FunctionDeclaration.prototype.getRunCode = function() {
		var output = getNode(this) + '.runFuncDecl(jsmmContext, "' + this.name + '", ';
		output += 'function (jsmmContext, args) {\n';
		output += getNode(this) + '.runFuncEnter(jsmmContext, args);\n';
		output += this.statementList.getRunCode();
		output += 'return ' + getNode(this) + '.runFuncLeave(jsmmContext);\n';
		output += '});';
		return output;
	};

	jsmm.nodes.FunctionDeclaration.prototype.getFunctionCode = function() {
		var output = 'jsmmScope["' + this.name + '"].func = ';
		output += 'function (jsmmContext, args) {\n';
		output += getNode(this) + '.runFuncEnter(jsmmContext, args);\n';
		output += this.statementList.getRunCode();
		output += 'return ' + getNode(this) + '.runFuncLeave(jsmmContext);\n';
		output += '};';
		return output;
	};
};
