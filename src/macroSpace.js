var vm = require("vm");

const renameVariableToUniqueIdentifier = {
	VariableDeclarator(path) {
		path.scope.rename(path.node.id.name, path.scope.generateUid());
	}
};

class MacroSpace {
	constructor(babel) {
		this.babel = babel;
		this.essentialObjects = { require, console, process, module };
		this.context = vm.createContext({ ...this.essentialObjects });
	}
	setInfo(info) {
		this.info = info;
	}
	hasLeadingCommentAsMacro(array) {
		if (array[0].leadingComments) {
			if (array[0].leadingComments[0].value == "as macro") {
				return true;
			}
		}
		return false;
	}
	checkParentIsProgram(path) {
		if (!path.parentPath.isProgram()) {
			let type;
			if (path.isBlockStatement()) type = "block";
			// else if(path.isImportDeclaration())   // this is not require because import statement 
			// 	type = "import statement";			 // by default has to be in global 
			else if (path.isVariableDeclaration()) type = "variable definition";
			throw path.buildCodeFrameError(
				`as_macro: Macro ${type} only allowed in global scope!`
			);
		}
	}
	mustPathExecute(path) {
		if (path.isVariableDeclaration()) {
			if (this.hasLeadingCommentAsMacro(path.node.declarations)) {
				if (!this.info.options.followScopes) this.checkParentIsProgram(path);
				return true;
			}
			return false;
		}
		if (path.isImportDeclaration()) {
			if (this.hasLeadingCommentAsMacro(path.node.specifiers)) {
				// if(!this.info.options.followScopes)     // this is not require because import statement 
				// 	this.checkParentIsProgram(path);       // by default has to be in global 
				return true;
			}
			return false;
		}
		if (path.isBlockStatement()) {
			if (
				path.node.body.length == 1 &&
				path.node.body[0].type == "BlockStatement"
			) {
				if (this.hasLeadingCommentAsMacro(path.node.body)) {
					if (!this.info.options.followScopes) this.checkParentIsProgram(path);
					return true;
				}
			}
			return false;
		}
		if (path.node.mainObject === undefined) return false;
		let mainObjectName = path.node.mainObject.node.name;
		let mainObject_is_macro =
			this.context.hasOwnProperty(mainObjectName) &&
			!this.essentialObjects.hasOwnProperty(mainObjectName);
		let this_is_rootExpression = path.node.rootExpression === undefined;
		return mainObject_is_macro && this_is_rootExpression;
	}
	executeAndReplace(path) {
		const code = this.getExecutableCode(path);
		const script = new vm.Script(code);
		try {
			var output = script.runInContext(this.context);
		} catch (e) {
			e.message = e.name + ": " + e.message;
			e.name = "as_macro";
			throw path.buildCodeFrameError(e);
		}
		this.replace(path, output);
	}
	getExecutableCode(path) {
		if (path.isImportDeclaration()) {
			let generated_code = "";
			const source = path.node.source.value;
			path.node.specifiers.forEach(node => {
				if (node.type == "ImportDefaultSpecifier") {
					generated_code += `var ${node.local.name} = require("${source}");`;
				} else {
					generated_code += `var {${node.imported.name}:${node.local.name}} = require("${source}");`;
				}
			});
			return generated_code;
		}
		if (this.info.options.followScopes) {
			path.traverse(renameVariableToUniqueIdentifier);
		}
		let node = path.node;
		if (path.isBlockStatement()) node = path.node.body[0];

		var newProgramAst = this.babel.parseSync("");
		newProgramAst.program.body.push(node);
		const { code } = this.babel.transformFromAstSync(newProgramAst);
		return code;
	}
	replace(path, output) {
		if (
			path.isVariableDeclaration() ||
			path.isImportDeclaration() ||
			path.isBlockStatement()
		) {
			path.remove();
			return;
		}
		var parsedAst = this.babel.parseSync(`var x = ${JSON.stringify(output)};`);
		path.replaceWith(parsedAst.program.body[0].declarations[0].init);
	}
}

module.exports = MacroSpace;
