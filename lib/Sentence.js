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



const Ref = require( 'kung-fig-ref' ) ;



function Sentence( template , babel , locale = null ) {
	this.locale = locale ;
	this.key = template ;
	this.parts = null ;

	//this.babel = babel || Babel.default ;
	//this.babel = null ;
	Object.defineProperty( this , 'babel' , { value: babel || Babel.default , writable: true } ) ;
}

module.exports = Sentence ;



const Babel = require( './Babel.js' ) ;
const Atom = require( './Atom.js' ) ;



// For backward compatibility
Sentence.create = function( template , babel ) { return new Sentence( template , babel ) ; } ;



Sentence.prototype.toStringKFG = function( ctx ) {
	var babel = ( ctx && ctx.__babel ) || Babel.default ;
	return this.solveWithBabel_( false , babel , ctx ) ;
} ;



Sentence.prototype.toString =
Sentence.prototype.render =
Sentence.prototype.solve = function( ... args ) {
	return this.solveWithBabel_( false , this.babel , ... args ) ;
} ;



Sentence.prototype.solveWithBabel = function( babel , ... args ) {
	return this.solveWithBabel_( false , babel , ... args ) ;
} ;



Sentence.prototype.solveWithBabel_ = function( isSubcall , babel , ... args ) {
	var sentence , i , iMax , part , str = '' , strPart , input , tvar , atom ,
		lastAtom = null ,
		index = 0 ,
		kungFigCtx = args[ args.length - 1 ] ,
		l10n =
			this.locale === babel.locale ? this :
			babel.db[ babel.locale ].sentences.get( this.key ) ;


	if ( ! l10n && ! isSubcall ) {
		// The sentence was not found in current localization DB, use the root babel
		babel = babel.root ;
	}

	// We check  l10n === this  because 'this' has more chance to be compiled than l10n.
	// /!\ l10n === this.key  => it's strange, maybe DEPRECATED code, need to further inspection
	sentence = ! l10n || l10n === this || l10n === this.key ? this : l10n ;

	// Lazy compilation
	if ( ! sentence.parts ) {
		if ( ! sentence.key ) { return '' ; }
		sentence.parse( sentence.key ) ;
	}

	for ( i = 0 , iMax = sentence.parts.length ; i < iMax ; i ++ ) {
		part = sentence.parts[ i ] ;

		if ( typeof part === 'string' ) {
			str += part ;
		}
		else {
			atom = part.atom ;

			if ( atom ) {
				atom = atom.localize( babel ) ;
			}

			if ( part.index !== Sentence.REPEAT_LAST_VALUE ) {
				if ( part.index >= 0 ) { index = part.index ; }
				input = part.ref ? part.ref.getValue( args[ index ] ) : args[ index ] ;
				if ( atom && atom.preFilters ) { input = Atom.applyFilters( input , atom.preFilters ) ; }
				if ( part.preFilters ) { input = Atom.applyFilters( input , part.preFilters ) ; }
				tvar = Sentence.localizeTvar( babel , input , kungFigCtx ) ;
			}
			else if ( ! tvar && part.index < 0 ) {
				input = args[ 0 ] ;
				if ( atom && atom.preFilters ) { input = Atom.applyFilters( input , atom.preFilters ) ; }
				if ( part.preFilters ) { input = Atom.applyFilters( input , part.preFilters ) ; }
				tvar = Sentence.localizeTvar( babel , input , kungFigCtx ) ;
			}

			if ( tvar === undefined ) {
				if ( atom ) {
					strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
				}
				else {
					strPart = babel.db[ babel.locale ].undefinedString ;
				}
			}
			else if ( Array.isArray( tvar ) ) {
				if ( atom ) {
					atom = atom.merge( { list: tvar } ) ;
					strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
				}
				else {
					strPart = Atom.listToN( babel , tvar ) ;
				}
			}
			else if ( atom ) {
				// The order matter, the atom overwrite the tvar
				atom = tvar.merge( atom ) ;
				strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
			}
			else {
				atom = tvar ;
				strPart = atom.solve( babel , lastAtom , kungFigCtx ) ;
			}

			if ( strPart instanceof Atom ) {
				lastAtom = strPart ;
			}
			else {
				// Apply filters here...
				// If there are filters on an atom-side, they are applied first
				if ( part.postFilters ) { strPart = Atom.applyFilters( strPart , part.postFilters ) ; }

				if ( babel.autoEscape ) {
					strPart = strPart.replace( babel.autoEscape , babel.autoEscape.substitution ) ;
				}

				str += strPart ;
				lastAtom = atom ;
			}
		}
	}

	return str ;
} ;



// Localize a Template Variable, transform it into an atom
Sentence.localizeTvar = function( babel , tvar , kungFigCtx ) {
	var atom = Sentence.convertTvar( babel , tvar , kungFigCtx ) ;

	if ( atom && ! Array.isArray( atom ) ) {
		atom = atom.localize( babel ) ;

		// untemp it! or REPEAT_LAST_VALUE will bug!
		atom._tmp = false ;
	}

	return atom ;
} ;



// Convert a Template Variable into an Atom
Sentence.convertTvar = function( babel , tvar , kungFigCtx ) {
	var proto ;

	/*
	if ( tvar === undefined ) {
		return new Atom( { s: babel.db[ babel.locale ].undefinedString } ) ;
	}
	*/

	if ( tvar === undefined ) { return tvar ; }

	if ( tvar && typeof tvar === 'object' ) {
		if ( Array.isArray( tvar ) || ( tvar instanceof Atom ) ) { return tvar ; }
		if ( tvar instanceof String ) { return new Atom( '' + tvar ) ; }
		if ( tvar instanceof Number ) { return new Atom( + tvar ) ; }

		// Kung-Fig interoperability...
		if ( tvar.__isDynamic__ ) {
			return Sentence.convertTvar( babel , tvar.getDeepFinalValue( kungFigCtx ) , kungFigCtx ) ;
		}

		// Check if it's iterable, if so convert it to an array...
		if ( typeof tvar[ Symbol.iterator ] === 'function' ) { return [ ... tvar ] ; }

		proto = Object.getPrototypeOf( tvar ) ;

		if ( proto !== Object.prototype && proto !== null && tvar.toString ) {
			// All non-plain object are stringified
			return new Atom( tvar.toString() ) ;
		}
	}

	return new Atom( tvar ) ;
} ;



Sentence.prototype.getNamedVars = function() {
	// Lazy compilation
	if ( ! this.parts ) {
		if ( ! this.key ) { return [] ; }
		this.parse( this.key ) ;
	}

	var namedVars = new Set() ;

	this.parts.forEach( part => {
		if ( ! part || typeof part !== 'object' || ! part.ref ) { return ; }
		namedVars.add( part.ref.getPath() ) ;
	} ) ;

	return [ ... namedVars ] ;
} ;



// Parser



Sentence.REPEAT_LAST_INDEX = -2 ;
Sentence.REPEAT_LAST_VALUE = -3 ;



Sentence.parse = function( str , babel , options ) {
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



Sentence.prototype.parse = function( str ) {
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
	var c ;

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
		Atom.parseFromSentence( str , runtime , part ) ;
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
		Atom.parseFilters( str.slice( doubleSlashIndex + 2 , runtime.i ) , part ) ;
	}
	else {
		part.ref = Ref.parse( str.slice( start , runtime.i ) , { noInitialDollar: true } ) ;
	}

	runtime.i ++ ;
}



function unescape( str ) {
	return str.replace( /\$\$/g , () => '$' ) ;
}

