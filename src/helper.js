var vm = require("vm");

class MacroSpace {
	constructor(babel) {
		this.babel = babel;
		this.essentialObject = { require, console, process, module };
		this.context = vm.createContext({ ...this.essentialObject });
	}
	hasLeadingCommentAsMacro(array) {
		if (array[0].leadingComments) {
			if (array[0].leadingComments[0].value == "as macro") {
				return true;
			}
		}
		return false;
	}
	mustPathExecute(path) {
		if (path.isVariableDeclaration()) {
			return this.hasLeadingCommentAsMacro(path.node.declarations);
		}
		if (path.isImportDeclaration()) {
			return this.hasLeadingCommentAsMacro(path.node.specifiers);
		}
		if (path.isBlockStatement()) {
			if (
				path.parentPath.isProgram() &&
				path.node.body.length == 1 &&
				path.node.body[0].type == "BlockStatement"
			)
				return this.hasLeadingCommentAsMacro(path.node.body);
			return false;
		}
		if (path.node.mainObject === undefined) return false;
		let mainObjectName = path.node.mainObject.node.name;
		let mainObject_is_macro =
			this.context.hasOwnProperty(mainObjectName) &&
			!this.essentialObject.hasOwnProperty(mainObjectName);
		let this_is_rootExpression = path.node.rootExpression === undefined;
		return mainObject_is_macro && this_is_rootExpression;
	}
	executeAndReplace(path) {
		const code = this.getExecutableCode(path);
		// console.log("execute : ", code);
		const script = new vm.Script(code);
		var output = script.runInContext(this.context);
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

module.exports.MacroSpace = MacroSpace;

const getRootExpression = function(path) {
	let rootExpression = path.node.rootExpression;
	if (rootExpression == undefined) {
		rootExpression = path;
	}
	return rootExpression;
};

module.exports.mainObjectAndRootExpressionResolverVisitor = {
	ThisExpression(path) {
		path.node.mainObject = path;
		path.node.name = "#";
	},
	Identifier(path) {
		path.node.mainObject = path;
	},
	CallExpression: {
		enter(path) {
			let rootExpression = getRootExpression(path);
			path.node.callee.rootExpression = rootExpression;
		},
		exit(path) {
			path.node.mainObject = path.node.callee.mainObject;
		}
	},
	MemberExpression: {
		enter(path) {
			let rootExpression = getRootExpression(path);
			path.node.object.rootExpression = rootExpression;
			path.node.property.rootExpression = rootExpression;
		},
		exit(path) {
			path.node.mainObject = path.node.object.mainObject;
		}
	},
	TaggedTemplateExpression: {
		enter(path) {
			let rootExpression = getRootExpression(path);
			path.node.tag.rootExpression = rootExpression;
		},
		exit(path) {
			path.node.mainObject = path.node.tag.mainObject;
		}
	},
	VariableDeclaration: {
		enter(path) {
			let rootExpression = getRootExpression(path);
			path.node.declarations.forEach(declarator => {
				declarator.id.rootExpression = rootExpression;
			});
		}
	}
};
