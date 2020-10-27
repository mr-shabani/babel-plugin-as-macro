var vm = require("vm");
var requireFromString = require("require-from-string");
var pathModule = require("path");
var scriptify = require("json-scriptify");

var getRelativeRequireAndModule = function(filePath) {
	return requireFromString("module.exports = {require,module};", filePath);
};

const renameVariableToUniqueIdentifier = {
	VariableDeclarator(path) {
		path.scope.rename(path.node.id.name, path.scope.generateUid());
	}
};

class MacroSpace {
	constructor(babel, state) {
		this.babel = babel;
		let absolutePath =
			state.opts.filename || pathModule.join(state.opts.root, "unknown");
		this.essentialObjects = {
			console,
			process,
			...getRelativeRequireAndModule(absolutePath)
		};
		this.setInfo(state);
		this.context = vm.createContext({ ...this.essentialObjects });
	}
	setInfo(state) {
		this.info = this.essentialObjects.require(require.resolve("../info"));
		this.info.root = state.opts.root;
		this.info.absolutePath =
			state.opts.filename || pathModule.join(this.info.root, "unknown");
		this.info.filename = pathModule.basename(this.info.absolutePath);
		this.info.absoluteDir = pathModule.dirname(this.info.absolutePath);
		this.info.relativeDir =
			"./" + pathModule.relative(this.info.root, this.info.absoluteDir);
		this.info.relativePath =
			"./" + pathModule.relative(this.info.root, this.info.absolutePath);
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
			Object.prototype.hasOwnProperty.call(this.context, mainObjectName) &&
			!Object.prototype.hasOwnProperty.call(
				this.essentialObjects,
				mainObjectName
			);
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
			let source = path.node.source.value;
			path.node.specifiers.forEach(node => {
				if (node.type == "ImportDefaultSpecifier") {
					generated_code += `try{
											var ${node.local.name} = require("${source}");
										}catch(e){
											var {default:${node.local.name}} = require("esm")(module)("${source}");
										}`;
				} else {
					generated_code += `var {${node.imported.name}:${node.local.name}} = require("esm")(module)("${source}");`;
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
		var output_code;
		try {
			if (this.info.options.useJsonStringify)
				output_code = JSON.stringify(output);
			else output_code = scriptify(output);
		} catch (e) {
			// e.message = e.name + ": " + e.message;
			e.name = "as_macro";
			throw path.buildCodeFrameError(e);
		}
		var parsedAst = this.babel.parseSync(`var x = ${output_code};`);
		path.replaceWith(parsedAst.program.body[0].declarations[0].init);
	}
}

module.exports = MacroSpace;
