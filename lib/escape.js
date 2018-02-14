/*
	Babel Tower

	Copyright (c) 2016 - 2018 Cédric Ronvel

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



// Regexps
var splitterRegexp = {
	"/": /(\\.)|(\/)/g ,
	"//": /(\\.)|(\/\/)/g ,
	"|": /(\\.)|(\|)/g ,
	"|nested": /(\\.)|(\|)(?![^[]*\])/g ,
	")|(": /(\\.)|(\)\|\()/g
} ;



exports.split = function split( str , splitter ) {
	var match , lastIndex = 0 , splitted = [] ,
		regexp = splitterRegexp[ splitter ] ;

	regexp.lastIndex = 0 ;

	while ( ( match = regexp.exec( str ) ) !== null ) {

		//console.log( "match" , match ) ;
		if ( match[ 2 ] ) {
			splitted.push( str.slice( lastIndex , match.index ) ) ;
			lastIndex = match.index + match[ 0 ].length ;
		}

	}

	// Don't forget to add the end of the string
	splitted.push( str.slice( lastIndex , str.length ) ) ;

	//console.log( "split:" , str , "\n  =>  " , splitted ) ;

	return splitted ;
} ;



exports.unescape = function unescape( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( v => unescape( v ) ) ;
	}
	else if ( typeof value === 'string' ) {
		return value.replace( /\\(.)/g , match => match[ 1 ] ) ;
	}

	return value ;
} ;


