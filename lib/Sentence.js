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



function Sentence() { throw new Error( 'Use Sentence.create() instead' ) ; }
module.exports = Sentence ;



var Babel = require( './Babel.js' ) ;
var Ref = require( 'kung-fig-ref' ) ;



Sentence.create = function create( template , babel , self ) {
	if ( ! self ) { self = Object.create( Sentence.prototype ) ; }

	Object.defineProperties( self , {
		template: { value: template , writable: true , enumerable: true } ,
		babel: { value: babel || Babel.default , writable: true , enumerable: true }
	} ) ;

	return self ;
} ;



Sentence.prototype.toString = function toString( ... args ) {
	return this.babel.solveArray( this.template , args ) ;
} ;



Sentence.prototype.toStringKFG = function toStringKFG( ctx ) {
	var babel = ( ctx && ctx.__babel ) || Babel.default ;
	return babel.solveArray( this.template , ctx ) ;
} ;



// Parser



Sentence.parse = function parse( str , options ) {
	options = options || {}  ;
	
	var sentence = Object.create( options.proto || Sentence.prototype ) ;
	
	sentence.parts = [] ;
	
	if ( options.babel ) { sentence.babel = options.babel ; }

	var runtime = {
		i: 0 ,
		sentence: sentence
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseSentence( str , runtime ) ;

	return sentence ;
} ;



function parseSentence( str , runtime ) {
	var start = runtime.i , needUnescape = false ;
	
	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === '$' ) {
			if ( str[ runtime.i + 1 ] === '$' ) {
				needUnescape = true ;
				runtime.i ++ ;
			}
			else {
				parseAddRawText( str , runtime , start , needUnescape ) ;
				parseTvar( str , runtime ) ;
				start = runtime.i ;
			}
		}
		
		runtime.i ++ ;
	}
	
	parseAddRawText( str , runtime , start , needUnescape ) ;
}



function parseAddRawText( str , runtime , start , needUnescape ) {
	if ( start >= runtime.i ) { return ; }
	var text = str.slice( start , runtime.i ) ;
	if ( needUnescape ) { text = unescape( text ) ; }
	runtime.sentence.parts.push( text ) ;
}



function parseTvar( str , runtime ) {
	var c , index = null ;
	
	var part = {
		type: 'tvar' ,
		index: null ,
		ref: null ,
		filters: null
	} ;
	
	runtime.i ++ ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 ) {
		part.index = Math.max( 0 , c - 0x31 ) ;
		runtime.i ++ ;
	}
	
	if ( str[ runtime.i ] === '{' ) {
		runtime.i ++ ;
		parseTvarPath( str , runtime , part ) ;
	}
	
	runtime.sentence.parts.push( part ) ;
}



function parseTvarPath( str , runtime , part ) {
	var start = runtime.i , doubleSlashIndex ;
	
	while ( str[ runtime.i ] !== '}' ) {
		if ( runtime.i >= str.length ) {
			throw new SyntaxError( 'Unexpected end of string' ) ;
		}
		
		if ( str[ runtime.i ] === '/' && str[ runtime.i + 1 ] === '/' ) {
			doubleSlashIndex = runtime.i ;
		}
		
		runtime.i ++ ;
	}
	
	if ( doubleSlashIndex !== undefined ) {
		part.ref = Ref.parse( str.slice( start , doubleSlashIndex ) , { noInitialDollar: true } ) ;
		part.filters = parseFilters( str.slice( doubleSlashIndex + 2 , runtime.i ) ) ;
	}
	else {
		part.ref = Ref.parse( str.slice( start , runtime.i ) , { noInitialDollar: true } ) ;
	}
	
	runtime.i ++ ;
}



function parseFilters( str ) {
	return str.split( /\//g ) ;
}



function unescape( str ) {
    return str.replace( /\$\$/g , match => '$' ) ;
}


