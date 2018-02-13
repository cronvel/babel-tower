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



var postFilters = require( './postFilters.js' ) ;
var Ref = require( 'kung-fig-ref' ) ;



//function Sentence() { throw new Error( 'Use Sentence.create() instead' ) ; }
function Sentence( template , babel ) {
	this.babel = babel || Babel.default ;
	this.key = template ;
	this.parts = null ;
}

module.exports = Sentence ;



var Babel = require( './Babel.js' ) ;
var Element = require( './Element.js' ) ;



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



Sentence.prototype.render =
Sentence.prototype.solve = function solve( ... args ) {
	return this.solveWithBabel( this.babel , ... args ) ;
} ;



Sentence.prototype.solveWithBabel = function solveWithBabel( babel , ... args ) {
	
	var sentence , l10nTvar ,
		l10n = babel.db[ babel.locale ].sentences[ this.key ] ;
	
	console.error( ">>> Locale: " , babel.locale ) ;
	
	if ( ! l10n || l10n === this || l10n === this.key ) {
		sentence = this ;
	}
	else {
		sentence = l10n ;
	}
	
	//console.error( sentence ) ;
	
	// Lazy compilation
	if ( ! sentence.parts ) {
		if ( ! sentence.key ) { return '' ; }
		sentence.parse( sentence.key ) ;
	}
	
	var i , iMax , j , jMax , part , str = '' , strPart , filterFn ,
		tvar = args[ 0 ] ,	// Default to the first arg
		index = 0 ;
	
	for ( i = 0 , iMax = sentence.parts.length ; i < iMax ; i ++ ) {
		part = sentence.parts[ i ] ;
		
		if ( typeof part === 'string' ) {
			str += part ;
		}
		else {
			strPart = '' ;
			
			if ( part.index !== Sentence.REPEAT_LAST_VALUE )
			{
				if ( part.index >= 0 ) {
					index = part.index ;
				}
				
				tvar = part.ref ? part.ref.getValue( args[ index ] ) : args[ index ] ;
				
				// Kung-Fig compatibility
				if ( tvar && typeof tvar === 'object' && tvar.__isDynamic__ && ! ( tvar instanceof Element ) ) {
					tvar = tvar.getRecursiveFinalValue( args[ 0 ] ) ;
				}
			}
			
			if ( part.element ) {
				strPart = part.element.solveWith( babel , tvar , args , index ) ;
			}
			else {
				if ( tvar === undefined ) {
					tvar = babel.db[ babel.locale ].undefinedString ;
					strPart = tvar ;
				}
				else if ( tvar && typeof tvar === 'object' ) {
					
					if ( tvar instanceof Element ) {
						
						if ( tvar.t && babel ) {
							l10n = babel.db[ babel.locale ].elements[ tvar.t ] ;
							if ( l10n && l10n !== tvar ) {
								// We found a translation for this element, so we overwrite current properties with the existing translation.
								// We merge because things like n should be preserved if there are not defined in the l10n element.
								tvar = tvar.merge( l10n ) ;
							}
						}
						
						strPart = tvar.solve( babel , args , index ) ;
					}
					else {
						strPart = ( new Element( tvar ) ).solve( babel , args , index ) ;
					}
				}
				else {
					l10nTvar = babel.db[ babel.locale ].elements[ tvar ] ;
					
					if ( l10nTvar ) {
						strPart = l10nTvar.solve( babel , args , index ) ;
					}
					else {
						strPart = tvar ;
					}
				}
			}
			
			// Apply filters here...
			// If there are filters on an element-side, those are applied after
			if ( part.filters ) {
				// Post-filters
				for ( j = 0 , jMax = part.filters.length ; j < jMax ; j ++ ) {
					filterFn = postFilters[ part.filters[ j ] ] ;
					if ( filterFn ) { strPart = filterFn( strPart ) ; }
				}
			}
			
			if ( babel.autoEscape ) {
				strPart = strPart.replace( babel.autoEscape , babel.autoEscape.substitution ) ;
			}
			
			str += strPart ;
		}
	}
	
	return str ;
} ;



// Parser



Sentence.REPEAT_LAST_INDEX = -2 ;
Sentence.REPEAT_LAST_VALUE = -3 ;



Sentence.parse = function parse( str , babel , options ) {
	var sentence ;
	
	options = options || {}  ;
	
	if ( options.proto ) {
		sentence = Object.create( options.proto ) ;
		Sentence.call( sentence , str , babel ) ;
	}
	else {
		sentence = new Sentence( str , babel ) ;
	}
	
	sentence.parse( str ) ;
	
	return sentence ;
} ;



Sentence.prototype.parse = function parse( str ) {
	var runtime = {
		i: 0 ,
		sentence: this
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	this.key = str ;
	this.parts = [] ;
	
	parseSentence( str , runtime ) ;
	//console.log( 'Sentence:' , this ) ;
	console.log( 'Sentence parts:' , this.parts ) ;
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
				// runtime.i should not be incremented: it can be another $
				continue ;
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
		index: Sentence.REPEAT_LAST_INDEX ,
		ref: null ,
		filters: null
	} ;
	
	runtime.i ++ ;
	
	c = str.charCodeAt( runtime.i ) ;
	
	if ( c >= 0x30 && c <= 0x39 ) {
		part.index = Math.max( 0 , c - 0x31 ) ;
		runtime.i ++ ;
	}
	//else if ( c === 0x23 ) {	'#'
	//	part.index = Sentence.REPEAT_LAST_VALUE ;
	//	runtime.i ++ ;
	//}
	else if ( c !== 0x7b ) {	// '{'
		part.index = Sentence.REPEAT_LAST_VALUE ;
	}
	
	if ( str[ runtime.i ] === '{' ) {
		runtime.i ++ ;
		parseTvarPath( str , runtime , part ) ;
	}
	
	if ( str[ runtime.i ] === '[' ) {
		Element.parseFromSentence( str , runtime , part ) ;
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
	return str.split( '/' ) ;
}



function unescape( str ) {
	return str.replace( /\$\$/g , match => '$' ) ;
}


