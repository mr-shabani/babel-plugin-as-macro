# <center>babel-plugin-as-macro</center>

<center>power of macro in javascript code.</center>

## Motivation

When I was using [Next.js](https://nextjs.org/), I want to use [y18n](https://github.com/yargs/y18n) module for internationalization. But [y18n](https://github.com/yargs/y18n) uses file system to save words and their meanings. Loading any module that uses file system is prohibited by [next.js](https://nextjs.org/). The first solution that I found, was [preval](https://github.com/kentcdodds/babel-plugin-preval) module. But my need is more. I want to have a syntax as __simple__ as :

```JSX
import React from "react";
import y18n from "y18n";
y18n = y18n(/* some config */);
y18n.setLocal("en")
var __ = y18n.__;
export default function page() {
	return (
		<div>
			<p>{__("HELLO WORLD")}</p>
			<button>{y18n.__n("one button", "%d two button", 2)}</button>
		</div>
	);
}
```
## Usage

### Macro Definition
There are three way to define a macro. Because of nature of macro that is not in any scope of your code, we force that macro definition is only possible in the global.

#### Import Declaration
You can define macro by importing a module. You must place the comment block `/*as macro*/` after `import` identifier.
```JSX
import /*as macro*/ y18n from "y18n";
import /*as macro*/ X,{x1 as y1,x2 as y2} from "anyModule";
```
Import statement will be deleted from the code.

#### Variable Declaration
You can define macro by defining variables. You must place the comment block `/*as macro*/` after `var` identifier.
```JSX
var /*as macro*/ y18n = require("y18n")(/*some config*/);
var /*as macro*/ __ = y18n.__ , str = "some string";
```
Variable declaration statement will be deleted from the code.

#### Block Statement
You can run any nodejs code in a macro block like as macro definition. The syntax of macro block is a block statement in global that have a comment block `/*as macro*/` at the first and a block statement after that.
```JSX
{/*as macro*/{
// This block will be run at build time
}}
```
You can do anything that is possible in nodejs virtual machine([vm](https://nodejs.org/api/vm.html) module).
```JSX
{/*as macro*/{
	var y18n = require("y18n");
	y18n = y18n(/*some config*/);
	var __ = y18n.__;
	console.log("this will be printed at build time");
	let x = 1; /* this is not macro because this is 
	a locale variable that is only accessible in this block */
	while(x<10){
		console.log(x);
		x++;
	}
}}
```
Macro block will be deleted from the code.

### Macro Expression

The aim of macro is to execute some expression and replace the result in the code. Any expression that is sequence of object memberships, function calls and tag templates with a macro name as a main object will be caught as a macro expression. For example :
```javascript
macroName.property.method(some,argument).tagTemplateMethod`some string`.anotherProperty
```
Macro expression will be run in nodejs virtual machine([vm](https://nodejs.org/api/vm.html) module), and the result will be replaced in the code. For replacement we use `JSON.stringify`.
