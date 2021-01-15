# <p align="center">babel-plugin-as-macro</p>

<p align="center">Power of macro in javascript code.</p>

## Motivation

When I was using [Next.js](https://nextjs.org/), I want to use the [y18n](https://github.com/yargs/y18n) module for internationalization. But [y18n](https://github.com/yargs/y18n) uses the file system(`fs` module) to save words and their meanings. Importing any module that uses the file system is prohibited by [next.js](https://nextjs.org/). The first solution that I found, was [preval](https://github.com/kentcdodds/babel-plugin-preval) module. But my need is more. I want to have a syntax as **simple** as :

```JSX
import React from "react";
import /*as macro*/ y18n from "y18n";
{/*as macro*/{
	y18n = y18n(/* some config */);
	y18n.setLocal("en")
	var __ = y18n.__;
}}
export default function page() {
	return (
		<div>
			<p>{__("HELLO WORLD")}</p>
			<button>{y18n.__n("one button", "%d two button", 2)}</button>
		</div>
	);
}
```

## Installation

You can install this module via [npm](https://www.npmjs.com/).

```
npm install --save-dev babel-plugin-as-macro
```

Then, you must configure babel with `.babelrc` file.

```javascript
{
	//...
	// "presets": ["next/babel"],  /* Add this line if you want to use with next.js */
	"plugin": [
		// other plugins that you want to
		// be executed before this plugin
		["as-macro",/*plugin options*/],
		// plugins that will be executed
		// after this plugin
	]
}
```

## Usage

### Macro Definition

There are three ways to define a macro. Because of the nature of macro that is not in any scope of your code, we force by default that macro definitions only be possible in the global scope.

#### Import Declaration

You can define macro by importing a module. You must place the comment block `/*as macro*/` after `import` identifier.

```JSX
import /*as macro*/ y18n from "y18n";
import /*as macro*/ X,{x1 as y1,x2 as y2} from "anyModule";
```

The import statement will be deleted from the code.

In the import statement you can use ECMAScript modules(don't use `*.jsx`) or node modules. We use [esm ](https://github.com/standard-things/esm) module for importing ECMAScript modules.

#### Variable Declaration

You can define macro by defining variables. You must place the comment block `/*as macro*/` after `var` identifier.

```JSX
var /*as macro*/ y18n = require("y18n")(/*some config*/);
var /*as macro*/ __ = y18n.__ , str = "some string";
```

Variable declaration statement will be deleted from the code.

#### Block Statement

You can run any nodejs code in a macro-block like a macro definition. The syntax of macro-block is a block statement in the global that has a comment block `/*as macro*/` at the first and a block statement after that.

```JSX
{/*as macro*/{
// This block will be run at build time
}}
```

You can do anything possible in nodejs in a macro-block. Variables that are defined in macro-block with `var` will also be a macro.

```JSX
{/*as macro*/{
	var y18n = require("y18n");
	y18n = y18n(/*some config*/);
	var __ = y18n.__;
	console.log("this will be printed at build time");
	let x = 1; /* this is not macro because this is
	a local variable that is only accessible in this block */
	while(x<10){
		console.log(x);
		x++;
	}
}}
```

The macro-block will be deleted from the code.

### Macro Expression

Macro aims to execute some expression and replace the result in the code. Any expression that is a sequence of object memberships, function calls, and tag templates with a macro name as the main object will be caught as a macro expression.

```javascript
macroName;
macroName`this macro is a function`;
macroName.property.method(some, argument).tagTemplateMethod`some string`
	.anotherProperty;
```

The macro expression will be run in nodejs, and the result will be replaced in the code. For replacement we use [json-scriptify](https://www.npmjs.com/package/json-scriptify) module.

#### Example 1:

```javascript
var /*as macro*/ m = { x: 1 };
{
	/*as macro*/ {
		m.str = "some string";
	}
}
let obj = m;
```

<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center>

```javascript
let obj = {
	x: 1,
	str: "some string"
};
```

#### Example 2:

```javascript
{
	/*as macro*/ {
		var macroFunction = function computeAtCompileTime() {
			return "Result";
		};
	}
}
console.log(macroFunction());
let obj = macroFunction;
```

<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center>

```javascript
console.log("Result");

let obj = function computeAtCompileTime() {
  return "Result";
};
```

#### Example 3:

All occurrences of a macro name, except variable definition, will be caught as macro expression. This can bite you.

```javascript
var /*as macro*/ m1 = "this is a macro",
	m2 = "this is another macro";
var f = function double(m1) {
	let m2 = 2 * m1;
	return m2;
};
```

<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center>

```javascript
var f = function double("this is a macro") {
  let m2 = 2 * "this is a macro";
  return "this is another macro";
};
```

## Plugin Options

The plugin option is an object. You can access values in this object by [info](###info) tool.

### followScopes

`followScopes` is a boolean option that is `false` by default. If you set this option to `true`, you can use macro-block or define macro variables in any scope. Then, macros only available in that scope.

```javascript
var /*as macro*/ m1 = "this is a macro",
	m2 = "this is another macro";
var f = function double(m1) {
	{
		/*as macro*/ {
			var localMacro = "this is local";
		}
	}
	let m2 = 2 * m1;
	var str = localMacro;
	return m2;
};
var globalString = localMacro;
```

<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center>

```javascript
var f = function double(m1) {
	let m2 = 2 * m1;
	var str = "this is local";
	return m2;
};
var globalString = localMacro;
```

But, why we don't set `followScopes` to `true` by default? Because people may have mistakes like bellow.

```javascript
if (bool) {
	var /*as macro*/ m = "bool is true";
} else {
	var /*as macro*/ m = "bool is false";
}
var string = m;
```

<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center>

```javascript
if (bool) {
} else {
}
var string = "bool is false";
```

Regardless of variable `bool`, `string` is always `"bool is false"`. Because both macro definitions are executed and the second definition overwrites first. Moreover, macros are executed at build time when `bool` has not been evaluated.

## Tools

### info

If you want to have some information about the file in which macros are defined and executed in, You can use `info`. You can import it from `babel-plugin-as-macro/info` in any module and use it.
For example, you can have `conf.js` module that detects some config, like language, from the file path.

```javascript
// conf.js
var info = require("babel-plugin-as-macro/info");
let someConfigurations = decideFrom(info.absolutePath);
module.exports = someConfigurations;
```

Then, you can use this module as macro in your code.

```javascript
// main.js
import /*as macro*/ conf from "./conf.js";
/* do something with conf */
```

`info` is an object that will be filled by this plugin when the plugin start.

```javascript
info = {
	options, // plugin options
	filename, // the name of file or "unknown" if has transformed from string
	root, // path to root of the project(directory of package.json)
	absoluteDir, // absolute path to the file directory
	relativeDir, // path to the directory relative to the root
	envName //process.env.BABEL_ENV || process.env.NODE_ENV || "development"
};
```

## License

MIT
