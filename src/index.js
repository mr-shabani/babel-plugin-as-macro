var { MacroSpace, mainObjectAndRootExpressionResolverVisitor } = require("./helper");

module.exports = function(babel) {
	return {
		name: "ast-transform", // not required
		pre(state) {
			this.macroSpace = new MacroSpace(babel);
			this.enterExpression = function enterExpression(path) {
				if (this.macroSpace.mustPathExecute(path)) {
					this.macroSpace.executeAndReplace(path);
				}
			};
		},
		visitor: {
			Identifier: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			CallExpression: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			MemberExpression: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			TaggedTemplateExpression: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			ImportDeclaration: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			VariableDeclaration: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			BlockStatement: {
				enter(path) {
					this.enterExpression(path);
				}
			},
			Program(path) {
				path.traverse(mainObjectAndRootExpressionResolverVisitor);
			}
		}
	};
};
