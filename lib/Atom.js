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



var postFilters = require( './postFilters.js' ) ;
var Ref = require( 'kung-fig-ref' ) ;



/*
	Atom parts:

	- babel: Babel instance
	- k: translation key
	- s: invariable string
	- c: (getter) canonical string
	- n: atom count (integer), or 'many' (=Infinity)
	- g: atom gender, char: 'm' (male), 'f' (female), 'n' (neutral), 'h' (hermaphrodite, or both - plural)
	- nOffset: offset for the altn variation
	- p: person, char '1' (first person), '2' (second person), '3' (third person)
	- u: noun type (u: Unique), char: 'c' (common noun), 'p' (proper noun)
	- alt: (array of)^N variations
	- ord: array of property names to be used to navigate inside of 'alt' array structure
	- n?: array of variations by atom number
	- g?: array of variations by atom gender
	- p?: array of variations by atom's 1st/2nd/3rd person
	- u?: array of variations, first common noun, then proper noun
	- ng?: array of variations by atom number and gender (array of array, [number][gender])
	- list: list of things
	- enum: handle enumeration of list
	- uv: unit of measurements: list of values
	- uf: unit of measurements: format, should match 'uv'
	- um: unit of measurements: mode
	- uenum: enumeration, when the mode include concatenation of multiple units, e.g.: 2 feets and 3 inches
*/



function Atom( arg , isTmp ) {
	if ( arg && typeof arg === 'object' ) {
		this.assign( arg ) ;
	}
	else if ( typeof arg === 'string' ) {
		this.k = arg ;
	}
	else if ( typeof arg === 'number' ) {
		this.n = arg ;
	}
	else if ( typeof arg === 'boolean' ) {
		this.b = arg ;
	}

	if ( isTmp ) {
		this._tmp = true ;
	}
}

module.exports = Atom ;



var Babel = require( './Babel.js' ) ;
var Sentence = require( './Sentence.js' ) ;



// For backward compatibility
Atom.create = function create( arg , proto ) {
	var atom ;

	if ( proto ) {
		atom = Object.create( proto ) ;
		Atom.call( atom , arg ) ;
		return atom ;
	}

	return new Atom( arg ) ;
} ;



// Canonical form
Object.defineProperty( Atom.prototype , 'canon' , {
	enumerable: false ,
	get: function() {
		var ptr ;

		if ( this.alt ) {
			ptr = this.alt ;
			while ( Array.isArray( ptr ) ) { ptr = ptr[ 0 ] ; }
			if ( ptr ) { return ptr ; }
		}

		return this.s || this.k ;
	}
} ) ;



Atom.prototype.toStringKFG = function toStringKFG( ctx ) {
	return this.solve( ( ctx && ctx.__babel ) || Babel.default , [ ctx ] , 0 , ctx ) ;
} ;



Atom.prototype.localize = function localize( babel ) {
	if ( this._loc ) { return this ; }

	var l10n , atom ;

	babel = babel || this.babel || Babel.default ;

	atom = this.tmp() ;

	if ( ! this.k || ! babel ) {
		atom._loc = true ;
		return atom ;
	}

	if ( this.k && babel ) {
		l10n = babel.db[ babel.locale ].atoms.get( this.k ) ;
		if ( l10n && l10n !== this ) {
			// We found a translation for this atom, so we overwrite current properties with the existing translation.
			// We merge because things like n should be preserved if there are not defined in the l10n atom.
			atom = atom.assign( l10n ) ;
		}
	}

	atom._loc = true ;

	return atom ;
} ;



Atom.prototype.toString =
Atom.prototype.render =
Atom.prototype.solve = function solve( babel , args , lastIndex = 0 , kungFigCtx = null ) {
	var atom , str , i , iMax , arg , filterFn ;

	babel = babel || this.babel || Babel.default ;

	atom = this.localize( babel ) ;

	if ( atom.$ && args ) {
		if ( atom.$.index === Sentence.REPEAT_LAST_INDEX ) {
			arg = args[ lastIndex ] ;
		}
		else {
			arg = args[ atom.$.index ] ;
		}

		if ( atom.$.ref ) {
			arg = atom.$.ref.getValue( arg ) ;
		}

		if ( arg && typeof arg === 'object' ) {
			if ( arg instanceof Atom ) {
				atom = arg.merge( atom , true ) ;
			}
			else {
				atom = ( new Atom( arg , true ) ).merge( atom , true ) ;
			}
		}
	}

	if ( atom.fn ) {
		atom = atom.solveFn( babel , kungFigCtx ) ;
	}

	if ( atom.enum ) {
		if ( ! Array.isArray( atom.list ) ) {
			if ( atom.s !== undefined ) { atom.list = [ atom.s ] ; }
			else if ( atom.n !== undefined ) { atom.list = [ atom.n ] ; }
			else if ( atom.k !== undefined ) { atom.list = [ atom.k ] ; }
			else { atom.list = [] ; }
		}

		str = atom.solveEnum( babel , null , kungFigCtx ) ;
	}
	else {
		str = atom.solveOne( babel , kungFigCtx ) ;
	}

	// Apply filters here
	if ( atom.filters ) {
		// Post-filters
		for ( i = 0 , iMax = atom.filters.length ; i < iMax ; i ++ ) {
			filterFn = postFilters[ atom.filters[ i ] ] ;
			if ( filterFn ) { str = filterFn( str ) ; }
		}
	}

	return str ;
} ;



Atom.prototype.solveOne = function solveOne( babel , kungFigCtx ) {
	var str ;

	// We need a temporary object to work on
	var atom = this.tmp() ;

	atom.k = atom.k !== undefined ? atom.k : atom.d ;

	atom.nOffset = atom.nOffset !== undefined ? atom.nOffset : babel.db[ babel.locale ].nOffset ;

	if ( atom.n === undefined && atom.list ) {
		atom.n = Atom.listToN( babel , atom.list ) ;
	}

	if ( atom.n === 'many' ) {
		atom.n = Infinity ;
	}
	else {
		atom.n = + atom.n ;	// Cast anything to a number
		if ( isNaN( atom.n ) ) { atom.n = undefined ; }
	}

	// There is an alternative
	if ( atom.alt && atom.ord ) {
		str = atom.solveAlt( babel , kungFigCtx ) ;
		if ( str !== undefined ) { return str ; }
	}

	// There is a unit system using n
	if ( atom.uv && atom.uf && typeof atom.n === 'number' ) {
		return this.solveMeasure( babel , atom.n , atom , kungFigCtx ) ;
	}

	// There is an alternative
	if ( atom.alt && atom.ord ) {
		str = atom.solveAlt( babel , kungFigCtx , true ) ;
		if ( str !== undefined ) { return str ; }
	}

	// This is an invariable string
	if ( atom.s !== undefined ) {
		return atom.s ;
	}

	// This is a translation key
	if ( atom.k !== undefined ) {
		return atom.k ;
	}

	// This is a number
	if ( atom.n !== undefined ) {
		return '' + atom.n ;
	}

	// This is a boolean
	if ( atom.b !== undefined ) {
		return toBoolean( atom.b ) ? babel.db[ babel.locale ].trueString : babel.db[ babel.locale ].falseString ;
	}

	// This is the default value
	if ( atom.d !== undefined ) {
		return atom.d ;
	}

	if ( babel ) {
		return babel.db[ babel.locale ].undefinedString ;
	}

	return atom.k ;
} ;



function toInteger( v ) {
	if ( v === 'many' ) { return Infinity ; }
	return Math.max( 0 , Math.round( + v ) ) || 0 ;
}



function toBoolean( v ) {
	if ( v === true || v === 'true' ) { return true ; }
	if ( v === false || v === 'false' ) { return false ; }
	return !! toInteger( v ) ;
}



Atom.prototype.solveAlt = function solveAlt( babel , kungFigCtx , fallback ) {
	var index , indexMax , pName , pValue , pIndexes , ptr , sk ;

	// s or k
	sk = this.s || this.k ;

	ptr = this.alt ;

	for ( index = 0 , indexMax = this.ord.length ; index < indexMax ; index ++ ) {
		if ( ! Array.isArray( ptr ) ) { return ptr ; }

		pName = this.ord[ index ] ;

		if ( pName === 'b' ) {
			if ( this.b === undefined ) {
				if ( ! fallback ) { return ; }

				if ( this.n !== undefined ) {
					pValue = + ! toBoolean( this.n ) ;
				}
				else {
					pValue = + ! toBoolean( sk ) ;
				}
			}
			else {
				pValue = + ! toBoolean( this.b ) ;
			}

			pValue = Math.max( 0 , Math.min( pValue , ptr.length - 1 ) ) || 0 ;
			ptr = ptr[ pValue ] ;
		}
		else if ( pName === 'n' || pName === 'n0' ) {
			if ( this.n === undefined ) {
				if ( ! fallback ) { return ; }

				pValue = toInteger( sk ) ;
			}
			else {
				pValue = toInteger( this.n ) ;
			}

			if ( pName === 'n' ) { pValue -- ; }

			pValue = Math.max( 0 , Math.min( pValue , ptr.length - 1 ) ) || 0 ;
			ptr = ptr[ pValue ] ;
		}
		else {
			if ( this[ pName ] === undefined ) {
				if ( ! fallback ) { return ; }
				pValue = sk !== undefined ? sk : 'default' ;
			}
			else {
				pValue = this[ pName ] ;
			}

			pIndexes = babel.db[ babel.locale ].propertyIndexes[ pName ] ;

			if ( pIndexes ) {
				pValue = pValue in pIndexes ? pIndexes[ pValue ] : pIndexes.default || 0 ;
				if ( pValue >= ptr.length ) { pValue = 0 ; }
				ptr = ptr[ pValue ] ;
			}
		}
	}

	return ptr ;
} ;



Atom.prototype.solveEnum = function solveEnum( babel , enum_ , kungFigCtx ) {
	var atom = this , i , iMax , enumIndex , str = '' ;

	if ( ! enum_ ) {
		enum_ = Array.isArray( atom.enum ) && atom.enum.length ? atom.enum : babel.db[ babel.locale ].defaultEnum ;
	}

	// Empty list, return the first sub-sentence in the list
	if ( ! atom.list.length ) { return enum_[ 0 ].solveWithBabel( babel , null , kungFigCtx ) ; }

	for ( i = 0 , iMax = atom.list.length ; i < iMax ; i ++ ) {
		if ( i === 0 ) { enumIndex = 1 ; }
		else if ( i === iMax - 1 ) { enumIndex = 3 ; }
		else { enumIndex = 2 ; }

		enumIndex = Math.min( enumIndex , enum_.length - 1 ) ;
		str += enum_[ enumIndex ].solveWithBabel( babel , atom.list[ i ] , kungFigCtx ) ;
	}

	return str ;
} ;



Atom.prototype.solveMeasure = function solveMeasure( babel , value , atom , kungFigCtx ) {
	var i , iMax = atom.uf.length , currentValue , strArray = [] ,
		currentRatio , closestIndex , closestDelta = Infinity ;

	if ( ! iMax ) { return '' ; }

	switch ( atom.um ) {
		case 'N+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentValue = value / atom.uv[ i ] ;

				if ( currentValue < 1 ) { continue ; }

				currentValue = Math.trunc( currentValue ) ;
				value = value - currentValue * atom.uv[ i ] ;

				strArray.push( atom.uf[ i ].solveWithBabel( babel , currentValue , kungFigCtx ) ) ;
			}

			return this.merge( { list: strArray } , true ).solveEnum( babel , atom.uenum , kungFigCtx ) ;

		case 'R1+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = value >= atom.uv[ i ] ? value - atom.uv[ i ] : 2 * atom.uv[ i ] - value ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			return atom.uf[ closestIndex ].solveWithBabel( babel , value / atom.uv[ closestIndex ] , kungFigCtx ) ;

		case 'R' :
		default :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = Math.abs( value - atom.uv[ i ] ) ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			return atom.uf[ closestIndex ].solveWithBabel( babel , value / atom.uv[ closestIndex ] , kungFigCtx ) ;
	}
} ;



Atom.prototype.solveFn = function solveFn( babel , kungFigCtx ) {
	var i , iMax , fn , returnVal ,
		atom = this.tmp() ;

	for ( i = 0 , iMax = atom.fn.length ; i < iMax ; i ++ ) {
		fn = babel.db[ babel.locale ].functions[ atom.fn[ i ].key ] ;

		if ( typeof fn === 'function' ) {
			returnVal = fn( atom , atom.fn[ i ].value , babel ) ;

			if ( returnVal !== undefined ) {
				if ( returnVal instanceof Atom ) {
					atom = returnVal ;
				}
				else {
					atom = new Atom( returnVal , true ) ;
				}

				// Preserve filters...
				if ( this.filters ) { atom.filters = this.filters ; }
			}
		}
		else if ( fn && typeof fn === 'object' ) {
			atom.assign( fn ) ;
		}
	}

	return atom ;
} ;



Atom.listToN = function listToN( babel , list ) {
	var i , iMax , item , l10n , nSum = 0 , n ;

	for ( i = 0 , iMax = list.length ; i < iMax ; i ++ ) {
		item = list[ i ] ;

		if ( item && typeof item === 'object' ) {

			if ( 'n' in item ) {
				n = item.n ;
			}
			else if ( item.k && babel && ( l10n = babel.db[ babel.locale ].atoms.get( item.k ) ) && l10n.n ) {
				n = l10n.n ;
			}
			else {
				n = 1 ;
			}
		}
		else {
			n = 1 ;
		}

		if ( n === undefined ) { nSum ++ ; }
		else if ( n === 'many' ) { nSum = 'many' ; break ; }
		else { nSum += + n || 0 ; }
	}

	return nSum ;
} ;



// Aliases
var aliases = {
	"default": "d"
} ;



var altAliasesOrd = {
	"n?": [ 'n' ] ,
	"n0?": [ 'n0' ] ,
	"g?": [ 'g' ] ,
	"p?": [ 'p' ] ,
	"u?": [ 'u' ] ,
	"ng?": [ 'n' , 'g' ] ,
	"n0g?": [ 'n0' , 'g' ] ,
	"np?": [ 'n' , 'p' ] ,
	"n0p?": [ 'n0' , 'p' ] ,
	"npg?": [ 'n' , 'p' , 'g' ] ,
	"n0pg?": [ 'n0' , 'p' , 'g' ] ,

	// Boolean
	"b?": [ 'b' ] ,
	"?": [ 'b' ]
} ;



Atom.prototype.assign = function assign( object ) {
	var key , cKey ;

	for ( key in object ) {
		if ( object[ key ] === undefined || key === 'canon' || key === 'ord' ) { continue ; }

		if ( key === 'babel' ) {
			// Not enumerable
			Object.defineProperty( this , 'babel' , { value: object.babel , writable: true } ) ;
		}
		else {
			cKey = aliases[ key ] || key ;

			if ( altAliasesOrd[ cKey ] ) {
				this.alt = object[ key ] ;
				this.ord = Array.from( altAliasesOrd[ cKey ] ) ;
			}
			else if ( cKey === 'alt' ) {
				this.alt = object[ key ] ;
				this.ord = object.ord ;
			}
			else {
				this[ cKey ] = object[ key ] ;
			}
		}
	}

	return this ;
} ;



Atom.prototype.merge = function merge( object , isTmp ) {
	var atom ;

	if ( this._tmp ) {
		// This is a tmp object, just assign...
		return this.assign( object ) ;
	}

	atom = Object.create( this ).assign( object ) ;
	if ( isTmp ) { atom._tmp = true ; }
	return atom ;
} ;



// Return a temporary variante
Atom.prototype.tmp = function tmp() {
	var atom ;

	if ( this._tmp ) {
		// This is already a tmp object, nothing to do...
		return this ;
	}

	atom = Object.create( this ) ;
	atom._tmp = true ;
	return atom ;

} ;



// Parser



Atom.parse = function parse( str , options ) {
	var atom ;

	options = options || {}  ;

	if ( options.proto ) {
		atom = Object.create( options.proto ) ;
		Atom.call( atom , { babel: options.babel } ) ;
	}
	else {
		atom = new Atom( { babel: options.babel } ) ;
	}

	atom.parse( str ) ;
	return atom ;
} ;



Atom.prototype.parse = function parse( str ) {
	var runtime = {
		i: 0 ,
		atom: this
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseStandAloneAtom( str , runtime ) ;
} ;



Atom.parseFromSentence = function parse( str , runtime , part ) {
	runtime.atom = part.atom = new Atom( { babel: runtime.sentence.babel } ) ;
	parseAtom( str , runtime ) ;
} ;



function parseStandAloneAtom( str , runtime ) {
	parseTranslatable( str , runtime ) ;
	parseAtom( str , runtime ) ;
}



function parseTranslatable( str , runtime ) {
	var start = runtime.i ;

	while ( runtime.i < str.length && str[ runtime.i ] !== '[' ) { runtime.i ++ ; }

	if ( start < runtime.i ) {
		runtime.atom.k = str.slice( start , runtime.i ) ;
	}
}



function parseAtom( str , runtime ) {
	var bracketStr , iBkup ;

	bracketStr = parseLevelContent( str , runtime ) ;

	if ( ! bracketStr ) { return ; }

	iBkup = runtime.i ;
	runtime.i = 0 ;

	parseInner( bracketStr , runtime ) ;

	runtime.i = iBkup ;
}



function parseInner( str , runtime ) {

	if ( str[ runtime.i ] === '/' ) { runtime.i ++ ; }

	while ( runtime.i < str.length ) {

		if ( str[ runtime.i ] === '/' ) {
			runtime.atom.filters = parseFilters( str.slice( runtime.i + 1 ) ) ;
			return ;
		}

		parseKeyValue( str , runtime ) ;
		if ( str[ runtime.i ] !== '/' ) { break ; }
		runtime.i ++ ;

	}
}



function parseKeyValue( str , runtime ) {
	var key , value , iBkup , c ;

	key = parseKey( str , runtime ) ;
	value = parseValue( str , runtime ) ;

	key = aliases[ key ] || key ;

	if ( altAliasesOrd[ key ] ) {
		runtime.atom.ord = Array.from( altAliasesOrd[ key ] ) ;
		key = 'alt' ;
	}

	iBkup = runtime.i ;
	runtime.i = 0 ;

	switch ( key ) {
		case 'k' :
		case 's' :
		case 'n' :
		case 'g' :
		case 'um' :
		case 'p' :
		case 'u' :
		case 'd' :
		case 'b' :
			if ( value !== null ) { runtime.atom[ key ] = unescape( value ) ; }
			break ;

		case 'alt' :
		case 'list' :
			if ( value !== null ) { runtime.atom[ key ] = parseArray( value , runtime ) ; }
			break ;

		case 'uv' :
			if ( value !== null ) { runtime.atom[ key ] = parseArray( value , runtime ).map( v => parseFloat( v ) ) ; }
			break ;

		case 'uf' :
		case 'uenum' :
		case 'enum' :
			if ( value === null ) {
				runtime.atom[ key ] = true ;
			}
			else {
				runtime.atom[ key ] = parseArray( value , runtime )
					.map( e => Sentence.parse( e , runtime.atom.babel ) ) ;
			}
			break ;

		default :
			if ( key[ 0 ] === '$' ) {
				if ( key === '$' ) {
					runtime.atom.$ = {
						index: Sentence.REPEAT_LAST_INDEX ,
						ref: value && Ref.parse( value , { noInitialDollar: true } )
					} ;
				}
				else if ( key.length === 2 ) {
					c = key.charCodeAt( 1 ) ;
					if ( c >= 0x30 && c <= 0x39 ) {
						runtime.atom.$ = {
							index: Math.max( 0 , c - 0x31 ) ,
							ref: value && Ref.parse( value , { noInitialDollar: true } )
						} ;
					}
				}
			}
			else {
				// Special function
				if ( value !== null ) {
					value = parseArray( value , runtime ) ;
				}

				if ( runtime.atom.fn ) { runtime.atom.fn.push( { key: key , value: value } ) ; }
				else { runtime.atom.fn = [ { key: key , value: value } ] ; }
			}
	}

	runtime.i = iBkup ;
	//runtime.atom[ key ] = value ;
}



function parseKey( str , runtime ) {
	var start = runtime.i , c ;

	runtime.noValue = false ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( c === ':' ) {
			runtime.i ++ ;
			return str.slice( start , runtime.i - 1 ) ;
		}
		else if ( c === '?' ) {
			runtime.i ++ ;
			return str.slice( start , runtime.i ) ;
		}
		else if ( c === '/' ) {
			// This is a special function
			runtime.noValue = true ;
			return str.slice( start , runtime.i ) ;
		}

		runtime.i ++ ;
	}

	// This is a special function
	runtime.noValue = true ;
	return str.slice( start ) ;
}



function parseValue( str , runtime ) {
	if ( runtime.noValue ) { return null ; }

	var start = runtime.i ;

	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === '\\' ) {
			runtime.i ++ ;
		}
		else if ( str[ runtime.i ] === '/' ) {
			return str.slice( start , runtime.i ) ;
		}

		runtime.i ++ ;
	}

	return str.slice( start , runtime.i ) ;
}



function parseArray( str , runtime ) {
	var c , subStr , subValue , iBkup ,
		start = runtime.i ,
		array = [] ;

	while ( runtime.i < str.length ) {
		c = str[ runtime.i ] ;

		if ( str[ runtime.i ] === '\\' ) {
			runtime.i += 2 ;
		}
		else if ( c === '[' ) {
			// Skip the bracket
			parseLevelContent( str , runtime ) ;
		}
		else if ( c === '(' ) {
			subStr = parseLevelContent( str , runtime , '(' , ')' ) ;

			iBkup = runtime.i ;
			runtime.i = 0 ;
			subValue = parseArray( subStr , runtime ) ;
			runtime.i = iBkup ;
		}
		else if ( c === ']' || c === ')' ) {
			return array ;
		}
		else if ( c === '|' ) {
			if ( subValue ) {
				array.push( subValue ) ;
				subValue = null ;
			}
			else {
				array.push( unescape( str.slice( start , runtime.i ) ) ) ;
			}

			start = ++ runtime.i ;
		}
		else {
			runtime.i ++ ;
		}
	}

	if ( subValue ) {
		array.push( subValue ) ;
	}
	else {
		array.push( unescape( str.slice( start , runtime.i ) ) ) ;
	}

	return array ;
}



function parseLevelContent( str , runtime , openChar = '[' , closeChar = ']' ) {
	if ( str[ runtime.i ] !== openChar ) { return ; }

	runtime.i ++ ;

	var start = runtime.i , level = 1 ;

	while ( runtime.i < str.length && level ) {
		if ( str[ runtime.i ] === '\\' ) { runtime.i ++ ; }
		else if ( str[ runtime.i ] === openChar ) { level ++ ; }
		else if ( str[ runtime.i ] === closeChar ) { level -- ; }
		runtime.i ++ ;
	}

	if ( level ) { return ; }

	return str.slice( start , runtime.i - 1 ) ;
}



function parseFilters( str ) {
	return str.split( '/' ) ;
}



function unescape( str ) {
	return str.replace( /\\(.)/g , match => match[ 1 ] ) ;
}



function unescapeAny( value ) {
	if ( Array.isArray( value ) ) {
		return value.map( v => unescapeAny( v ) ) ;
	}
	else if ( typeof value === 'string' ) {
		return value.replace( /\\(.)/g , match => match[ 1 ] ) ;
	}

	return value ;
}

