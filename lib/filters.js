/*
	Babel Tower

	Copyright (c) 2016 - 2020 Cédric Ronvel

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



const string = require( 'string-kit' ) ;



// Case filters

exports.lc = exports.lowercase = exports.lowerCase = str => str.toLowerCase() ;
exports.uc = exports.uppercase = exports.upperCase = str => str.toUpperCase() ;
exports.uc1 = exports.uppercasefirst = exports.upperCaseFirst = str => str ? str[ 0 ].toUpperCase() + str.slice( 1 ) : str ;
exports.cc = exports.camelcase = exports.camelCase = str => string.toCamelCase( str ) ;
exports.dashed = str => string.camelCaseToDashed( str ) ;
exports.dash2space = str => str.replace( /-+/g , ' ' ) ;



// Letter filters

exports.latinize = str => string.latinize( str ) ;



// String-kit format's modes used as pre-filters (mostly for number)

const FORMAT_MODES = [ 'f' , 'P' , 'p' , 'k' , 'e' , 'K' , 'd' , 'i' , 'u' , 'U' , 'm' , 't' , 'h' , 'x' , 'o' , 'b' ] ;
FORMAT_MODES.forEach( mode => {
	var fn = string.format.modes[ mode ] ;
	exports[ mode ] = ( input , params ) => fn( input , params ) ;
	exports[ mode ].pre = true ;
} ) ;



// Escape filters

exports.sharg = exports.shellarg = exports.shellArg = str => string.escape.shellArg( str ) ;
exports.regex = exports.regexp = exports.regExp = str => string.escape.regExp( str ) ;
exports.ctrl = exports.control = str => string.escape.control( str ) ;
exports.html = exports.htmlcontent = exports.htmlContent = str => string.escape.html( str ) ;
exports.htmlattr = exports.htmlAttr = exports.htmlAttribute = str => string.escape.htmlAttr( str ) ;
exports.htmlsp = exports.htmlspecialchars = exports.htmlSpecialChars = str => string.escape.htmlSpecialChars( str ) ;



// Path filters

const path = require( 'path' ) ;

exports.dirname = str => path.dirname( str ) ;
exports.basename = str => path.basename( str ) ;
exports.extname = str => path.extname( str ) ;
exports.basenameNoExt = exports.baseNameNoExt = str => path.basename( str , path.extname( str ) ) ;



// English grammar filters

const vowels = [ 'a' , 'e' , 'i' , 'o' , 'u' ] ;

// Add 'the' article except if str starts with an uppercase letter
exports['en;the'] = str => str[ 0 ].toLowerCase() !== str[ 0 ] ? str : 'the ' + str ;

// Add 'a' or 'an' article except if str starts with an uppercase letter
exports['en;a'] = str => {
	if ( str[ 0 ].toLowerCase() !== str[ 0 ] ) { return str ; }
	return ( vowels.indexOf( str[ 0 ] ) !== -1 ? 'an ' : 'a ' ) + str ;
} ;

