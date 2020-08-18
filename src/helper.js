module.exports.MacroSpace = require("./macroSpace");

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
