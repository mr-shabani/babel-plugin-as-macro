# <center>babel-plugin-as-macro</center>

<center>Power of macro in javascript code.</center>

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
	a local variable that is only accessible in this block */
	while(x<10){
		console.log(x);
		x++;
	}
}}
```
Macro block will be deleted from the code.

### Macro Expression

The aim of macro is to execute some expression and replace the result in the code. Any expression that is sequence of object memberships, function calls and tag templates with a macro name as a main object will be caught as a macro expression. 
```javascript
macroName
macroName`this macro is a function`
macroName.property.method(some,argument).tagTemplateMethod`some string`.anotherProperty
```
Macro expression will be run in nodejs virtual machine([vm](https://nodejs.org/api/vm.html) module), and the result will be replaced in the code. For replacement we use `JSON.stringify`.
#### Example 1:
```javascript
var /*as macro*/ m = {x:1};
{/*as macro*/{
	m.str = "some string";
}}
var obj = m;
```
<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center> 

```javascript
var obj = {
	"x": 1,
	"str": "some string"
};
```

#### Example 2:
`JSON.stringify` will be ignored methods because of [closure](https://en.wikipedia.org/wiki/Closure_(computer_programming)). The code of a function is a half of its existence and another half is the scope that it binds to it.
```javascript
var /*as macro*/ m = {x:1};
{/*as macro*/{
	m.str = "some string";
	m.f = function test(){
		return `this function will be ignored
			during replacement`;
	};
}}
var obj = m;
```
<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center> 

```javascript
var obj = {
	"x": 1,
	"str": "some string"
};
```
#### Example 3:
All occurrences of a macro name, except variable definition, will be caught as macro expression. This can bite you.
```javascript
var /*as macro*/ m1 = "this is a macro",m2="this is another macro";
var f = function double(m1){
	let m2 = 2*m1;
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


### followScopes
`followScopes` is a boolean option that is `false` by default. If you set this option to `true`, you can use macro block and define macro variables in any scope. Then, macros only available in that scope. 
```javascript
var /*as macro*/ m1 = "this is a macro",m2="this is another macro";
var f = function double(m1){
	{/*as macro*/{
		var localMacro = "this is local";
	}}
	let m2 = 2*m1;
	var str = localMacro;
	return m2;
};
var globalString = localMacro;
```
<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center> 

```javascript
var f = function double(m1){
	let m2 = 2*m1;
	var str = "this is local";
	return m2;
};
var globalString = localMacro;
```
But, why we don't set `followScopes` to `true` by default? Because people may have mistakes like as bellow.
```javascript
if(bool){
	var /*as macro*/ m = "bool is true";
}else{
	var /*as macro*/ m = "bool is false";
}
var string = m;
```
<center>&darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp; &darr; &ensp;</center> 

```javascript
if(bool){
}else{
}
var string = "bool is false";
```
Without regarding to variable `bool`, `string` is always `"bool is false"`. Because both macro definitions are executed and the second definition overwrite first. Also, macros are executed at build time when `bool` has not evaluated.
