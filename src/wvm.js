'use strict';
const proxyContextSymbol = Symbol("proxy of context");

const createGlobalContext = function(obj) {
	const context = {};
	const desc = Object.getOwnPropertyDescriptors(global);
	Object.defineProperties(context, desc);
	Object.setPrototypeOf(context, null);
	if (typeof obj == "object" || obj != null)
		Object.defineProperties(context, Object.getOwnPropertyDescriptors(obj));
	context.global = context;
	context[proxyContextSymbol] = new Proxy(context, { has: () => true });
	return context;
};

const runInGlobalContext = function(code, context) {
	const proxyOfContext = context[proxyContextSymbol];

	let run = new Function(
		"proxyOfContext",
		`
        with(proxyOfContext){
            with(global){
                    ${code}
            }
        }
        `
	);

	return run(proxyOfContext);
};

module.exports = { runInGlobalContext, createGlobalContext };
