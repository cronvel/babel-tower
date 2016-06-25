/*
	Babel Tower
	
	Copyright (c) 2016 Cédric Ronvel
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var string = require( 'string-kit' ) ;



// Case filters

exports.lc =
	exports.lowercase =
	exports.lowerCase =
		function lc( str ) { return str.toLowerCase() ; } ;

exports.uc =
	exports.uppercase =
	exports.upperCase =
		function uc( str ) { return str.toUpperCase() ; } ;

exports.uc1 =
	exports.uppercasefirst =
	exports.upperCaseFirst =
		function uc1( str ) { return str[ 0 ].toUpperCase() + str.slice( 1 ) ; } ;

exports.cc =
	exports.camelcase =
	exports.camelCase =
		string.toCamelCase ;

exports.dashed =
		string.camelCaseToDashed ;



// Letter filters

exports.latinize =
		string.latinize ;



// Escape filters

exports.sharg =
	exports.shellarg =
	exports.shellArg =
		string.escape.shellArg ;

exports.regex =
	exports.regexp =
	exports.regExp =
		string.escape.regExp ;

exports.ctrl =
	exports.control =
		string.escape.control ;

exports.html =
	exports.htmlcontent =
	exports.htmlContent =
		string.escape.html ;

exports.htmlattr =
	exports.htmlAttr =
	exports.htmlAttribute =
		string.escape.htmlAttr ;

exports.htmlsp =
	exports.htmlspecialchars =
	exports.htmlSpecialChars =
		string.escape.htmlSpecialChars ;
