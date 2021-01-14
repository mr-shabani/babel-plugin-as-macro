"use strict";
const wvm = require("./wvm");
const requireFromString = require("require-from-string");
const pathModule = require("path");
const scriptify = require("json-scriptify");

const getRelativeRequireAndModule = function(filePath) {
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
		const absolutePath =
			state.opts.filename || pathModule.join(state.opts.root, "unknown");
		this.context = wvm.createGlobalContext(
			getRelativeRequireAndModule(absolutePath)
		);
		this.setInfo(state);
	}
	setInfo(state) {
		this.info = this.context.require(require.resolve("../info"));
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
	hasLeadingAsMacroComment(array) {
		return (
			array[0].leadingComments &&
			array[0].leadingComments[0].value == "as macro"
		);
	}
	ParentMustBeProgram(path) {
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
			if (this.hasLeadingAsMacroComment(path.node.declarations)) {
				if (!this.info.options.followScopes) this.ParentMustBeProgram(path);
				return true;
			}
			return false;
		}
		if (path.isImportDeclaration()) {
			if (this.hasLeadingAsMacroComment(path.node.specifiers)) {
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
				if (this.hasLeadingAsMacroComment(path.node.body)) {
					if (!this.info.options.followScopes) this.ParentMustBeProgram(path);
					return true;
				}
			}
			return false;
		}
		path.isMacroExpression = true;
		if (path.node.mainObject === undefined) return false;
		const mainObjectName = path.node.mainObject.node.name;
		const mainObject_is_macro =
			Object.prototype.hasOwnProperty.call(this.context, mainObjectName) &&
			!Object.prototype.hasOwnProperty.call(global, mainObjectName);
		const this_is_rootExpression = path.node.rootExpression === undefined;
		return mainObject_is_macro && this_is_rootExpression;
	}
	executeAndReplace(path) {
		const code = this.getExecutableCode(path);
		try {
			var output = wvm.runInGlobalContext(code, this.context);
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

		const newProgramAst = this.babel.parseSync("");
		newProgramAst.program.body.push(node);
		const { code } = this.babel.transformFromAstSync(newProgramAst);
		if (path.isMacroExpression) return "return " + code;
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
