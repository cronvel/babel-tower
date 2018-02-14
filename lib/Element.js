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
	Element parts:

	- babel: Babel instance
	- t: translatable string
	- s: invariable string
	- c: (getter) canonical string
	- n: element count (integer), or 'many' (=Infinity)
	- g: element gender, char: 'm' (male), 'f' (female), 'n' (neutral), 'h' (hermaphrodite, or both - plural)
	- nOffset: offset for the altn variation
	- altn: array of variations by element number
	- altg: array of variations by element gender
	- altng: array of variations by element number and gender (array of array, [number][gender])
	- list: list of things
	- enum: handle enumeration of list
	- uv: unit of measurements: list of values
	- uf: unit of measurements: format, should match 'uv'
	- um: unit of measurements: mode
	- uenum: enumeration, when the mode include concatenation of multiple units, e.g.: 2 feets and 3 inches
*/



//function Element() { throw new Error( 'Use Element.create() instead' ) ; }
function Element( arg ) {
	if ( arg && typeof arg === 'object' ) {
		this.assign( arg ) ;
	}
	else if ( typeof arg === 'string' ) {
		this.t = arg ;
	}
	else if ( typeof arg === 'number' ) {
		this.n = arg ;
	}
}

module.exports = Element ;



var Babel = require( './Babel.js' ) ;
var Sentence = require( './Sentence.js' ) ;



// For backward compatibility
Element.create = function create( arg , proto ) {
	var element ;

	if ( proto ) {
		element = Object.create( proto ) ;
		Element.call( element , arg ) ;
		return element ;
	}

	return new Element( arg ) ;

} ;



// Canonical form
Object.defineProperty( Element.prototype , 'c' , {
	enumerable: false ,
	get: function() {
		return ( this.altng && this.altng[ 0 ] && this.altng[ 0 ][ 0 ] ) ||
			( this.altn && this.altn[ 0 ] ) ||
			( this.altg && this.altg[ 0 ] ) ||
			this.s ||
			this.t ;
	}
} ) ;



Element.prototype.toStringKFG = function toStringKFG( ctx ) {
	return this.solve( ( ctx && ctx.__babel ) || Babel.default , [ ctx ] , 0 , ctx ) ;
} ;



Element.prototype.toString =
Element.prototype.render =
Element.prototype.solve = function solve( babel , args , lastIndex = 0 , kungFigCtx = null ) {
	var element = this , l10n , str , i , iMax , arg , filterFn ;

	babel = babel || this.babel || Babel.default ;

	if ( this.t && babel ) {
		l10n = babel.db[ babel.locale ].elements[ this.t ] ;
		if ( l10n && l10n !== this ) {
			// We found a translation for this element, so we overwrite current properties with the existing translation.
			// We merge because things like n should be preserved if there are not defined in the l10n element.
			element = this.merge( l10n ) ;
		}
	}

	if ( element.$ && args ) {
		if ( element.$.index === Sentence.REPEAT_LAST_INDEX ) {
			arg = args[ lastIndex ] ;
		}
		else {
			arg = args[ element.$.index ] ;
		}

		if ( element.$.ref ) {
			arg = element.$.ref.getValue( arg ) ;
		}

		if ( arg && typeof arg === 'object' ) {
			if ( arg instanceof Element ) {
				element = arg.merge( element ) ;
			}
			else {
				element = ( new Element( arg ) ).merge( element ) ;
			}
		}
	}

	if ( element.fn ) {
		element = element.solveFn( babel , kungFigCtx ) ;
	}

	if ( element.enum ) {
		if ( ! Array.isArray( element.list ) ) {
			if ( element.s !== undefined ) { element.list = [ element.s ] ; }
			else if ( element.n !== undefined ) { element.list = [ element.n ] ; }
			else if ( element.t !== undefined ) { element.list = [ element.t ] ; }
			else { element.list = [] ; }
		}

		str = element.solveEnum( babel , null , kungFigCtx ) ;
	}
	else {
		str = element.solveOne( babel , kungFigCtx ) ;
	}

	// Apply filters here
	if ( element.filters ) {
		// Post-filters
		for ( i = 0 , iMax = element.filters.length ; i < iMax ; i ++ ) {
			filterFn = postFilters[ element.filters[ i ] ] ;
			if ( filterFn ) { str = filterFn( str ) ; }
		}
	}

	return str ;
} ;



Element.prototype.solveOne = function solveOne( babel , kungFigCtx ) {
	var element = this , t , p , n , g , nOffset , gIndex , st ;

	t = element.t !== undefined ? element.t : element.d ;

	gIndex = babel.db[ babel.locale ].gIndex  ;

	nOffset = element.nOffset !== undefined ? element.nOffset : babel.db[ babel.locale ].nOffset ;

	n = element.n ;

	if ( n === undefined && element.list ) {
		n = this.listToN( element.list , babel ) ;
	}

	if ( n === 'many' ) {
		n = Infinity ;
	}
	else {
		n = + n ;	// Cast anything to a number
		if ( isNaN( n ) ) { n = undefined ; }
	}

	// s or t
	st = element.s || t ;

	// There is an alternative using n and g
	if ( element.altng ) {
		n = Math.max( 0 , Math.min( n + nOffset , element.altng.length - 1 ) ) || 0 ;
		p = element.altng[ n ] ;

		g = gIndex[ element.g ] || 0 ;
		if ( g >= p.length ) { g = 0 ; }

		return p[ g ] ;
	}

	// There is an alternative using n
	if ( element.altn && n !== undefined ) {
		n = Math.max( 0 , Math.min( n + nOffset , element.altn.length - 1 ) ) ;
		return element.altn[ n ] ;
	}

	// There is a unit system using n
	if ( element.uv && element.uf && typeof n === 'number' ) {
		return this.solveMeasure( babel , n , element , kungFigCtx ) ;
	}

	// There is an alternative using g
	if ( element.altg && element.g ) {
		g = gIndex[ element.g ] || 0 ;
		if ( g >= element.altg.length ) { g = 0 ; }
		return element.altg[ g ] ;
	}

	// There is an alternative using n, but no n, try to use s or t
	if ( element.altn ) {
		if ( st === 'many' ) { n = Infinity ; }
		else { n = + st || 0 ; }

		n = Math.max( 0 , Math.min( n + nOffset , element.altn.length - 1 ) ) ;
		return element.altn[ n ] ;
	}

	// There is a unit system using n, but no n, try using s or t
	if ( element.uv && element.uf ) {
		if ( st === 'many' ) { n = Infinity ; }
		else { n = + st || 0 ; }

		return this.solveMeasure( babel , n , element , kungFigCtx ) ;
	}

	// There is an alternative using g, but no g, try to use s or t
	if ( element.altg ) {
		g = gIndex[ st ] || 0 ;
		if ( g >= element.altg.length ) { g = 0 ; }
		return element.altg[ g ] ;
	}

	// This is an invariable string
	if ( element.s !== undefined ) {
		return element.s ;
	}

	// This is a translation key
	if ( t !== undefined ) {
		return t ;
	}

	// This is a number
	if ( n !== undefined ) {
		return '' + n ;
	}

	// This is the default value
	if ( element.d !== undefined ) {
		return element.d ;
	}

	if ( babel ) {
		return babel.db[ babel.locale ].undefinedString ;
	}

	return t ;
} ;



Element.prototype.solveEnum = function solveEnum( babel , enum_ , kungFigCtx ) {
	var element = this , i , iMax , enumIndex , str = '' ;

	if ( ! enum_ ) {
		enum_ = Array.isArray( element.enum ) && element.enum.length ? element.enum : babel.db[ babel.locale ].defaultEnum ;
	}

	// Empty list, return the first sub-sentence in the list
	if ( ! element.list.length ) { return enum_[ 0 ].solveWithBabel( babel , null , kungFigCtx ) ; }

	for ( i = 0 , iMax = element.list.length ; i < iMax ; i ++ ) {
		if ( i === 0 ) { enumIndex = 1 ; }
		else if ( i === iMax - 1 ) { enumIndex = 3 ; }
		else { enumIndex = 2 ; }

		enumIndex = Math.min( enumIndex , enum_.length - 1 ) ;
		str += enum_[ enumIndex ].solveWithBabel( babel , element.list[ i ] , kungFigCtx ) ;
	}

	return str ;
} ;



Element.prototype.solveMeasure = function solveMeasure( babel , value , element , kungFigCtx ) {
	var i , iMax = element.uf.length , currentValue , strArray = [] ,
		currentRatio , closestIndex , closestDelta = Infinity ;

	if ( ! iMax ) { return '' ; }

	switch ( element.um ) {
		case 'N+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentValue = value / element.uv[ i ] ;

				if ( currentValue < 1 ) { continue ; }

				currentValue = Math.trunc( currentValue ) ;
				value = value - currentValue * element.uv[ i ] ;

				strArray.push( element.uf[ i ].solveWithBabel( babel , currentValue , kungFigCtx ) ) ;
			}

			return this.merge( { list: strArray } ).solveEnum( babel , element.uenum , kungFigCtx ) ;

		case 'R1+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = value >= element.uv[ i ] ? value - element.uv[ i ] : 2 * element.uv[ i ] - value ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			return element.uf[ closestIndex ].solveWithBabel( babel , value / element.uv[ closestIndex ] , kungFigCtx ) ;

		case 'R' :
		default :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = Math.abs( value - element.uv[ i ] ) ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			return element.uf[ closestIndex ].solveWithBabel( babel , value / element.uv[ closestIndex ] , kungFigCtx ) ;
	}
} ;



Element.prototype.solveFn = function solveFn( babel , kungFigCtx ) {
	var i , iMax , fn , returnVal ,
		element = Object.create( this ) ;

	for ( i = 0 , iMax = element.fn.length ; i < iMax ; i ++ ) {
		fn = babel.db[ babel.locale ].functions[ element.fn[ i ].key ] ;

		if ( typeof fn === 'function' ) {
			returnVal = fn( element , element.fn[ i ].value , babel ) ;

			if ( returnVal !== undefined ) {
				if ( returnVal instanceof Element ) {
					element = returnVal ;
				}
				else {
					element = new Element( returnVal ) ;
				}

				// Preserve filters...
				if ( this.filters ) { element.filters = this.filters ; }
			}
		}
		else if ( fn && typeof fn === 'object' ) {
			element.assign( fn ) ;
		}
	}

	return element ;
} ;



Element.prototype.solveWith = function solveWith( babel , tvar , args , lastIndex , kungFigCtx ) {
	if ( typeof tvar === 'string' ) {
		return this.merge( { t: tvar } ).solve( babel , args , lastIndex , kungFigCtx ) ;
	}
	else if ( typeof tvar === 'number' ) {
		return this.merge( { n: tvar } ).solve( babel , args , lastIndex , kungFigCtx ) ;
	}
	else if ( tvar && typeof tvar === 'object' ) {
		if ( Array.isArray( tvar ) ) {
			return this.merge( { list: tvar } ).solve( babel , args , lastIndex , kungFigCtx ) ;
		}

		/*	Should be done by Sentence#solve()
		// Kung-Fig inter-operability
		if ( tvar.__isDynamic__ && ! ( tvar instanceof Element ) ) {
			tvar = tvar.getRecursiveFinalValue( kungFigCtx ) ;
		}
		//*/

		return this.merge( tvar ).solve( babel , args , lastIndex , kungFigCtx ) ;
	}

	// /!\ What about the difference between undefined/null/false/true?
	return this.solve( babel , args , lastIndex , kungFigCtx ) ;
} ;



Element.prototype.listToN = function listToN( list , babel ) {
	var i , iMax , item , l10n , nSum = 0 , n ;

	for ( i = 0 , iMax = list.length ; i < iMax ; i ++ ) {
		item = list[ i ] ;

		if ( item && typeof item === 'object' ) {

			if ( 'n' in item ) {
				n = item.n ;
			}
			else if ( item.t && babel && ( l10n = babel.db[ babel.locale ].elements[ item.t ] ) && l10n.n ) {
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



Element.prototype.assign = function assign( object ) {
	var k ;

	for ( k in object ) {
		if ( object[ k ] !== undefined ) {
			this[ k ] = object[ k ] ;
		}
	}

	return this ;
} ;



Element.prototype.merge = function merge( object ) {
	return Object.create( this ).assign( object ) ;
} ;



// Parser



Element.parse = function parse( str , options ) {
	var element ;

	options = options || {}  ;

	if ( options.proto ) {
		element = Object.create( options.proto ) ;
		Element.call( element , { babel: options.babel } ) ;
	}
	else {
		element = new Element( { babel: options.babel } ) ;
	}

	element.parse( str ) ;
	return element ;
} ;



Element.prototype.parse = function parse( str ) {
	var runtime = {
		i: 0 ,
		element: this
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseStandAloneElement( str , runtime ) ;
} ;



Element.parseFromSentence = function parse( str , runtime , part ) {
	runtime.element = part.element = new Element( { babel: runtime.sentence.babel } ) ;
	parseElement( str , runtime ) ;
} ;



function parseStandAloneElement( str , runtime ) {
	parseTranslatable( str , runtime ) ;
	parseElement( str , runtime ) ;
}



function parseTranslatable( str , runtime ) {
	var start = runtime.i ;

	while ( runtime.i < str.length && str[ runtime.i ] !== '[' ) { runtime.i ++ ; }

	if ( start < runtime.i ) {
		runtime.element.t = str.slice( start , runtime.i ) ;
	}
}



function parseElement( str , runtime ) {
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
			runtime.element.filters = parseFilters( str.slice( runtime.i + 1 ) ) ;
			return ;
		}

		parseKeyValue( str , runtime ) ;
		if ( str[ runtime.i ] !== '/' ) { break ; }
		runtime.i ++ ;

	}
}



// Alternative operator form
var altOps = {
	"n?": "altn" ,
	"n0?": "altn0" ,
	"g?": "altg" ,
	"ng?": "altng" ,
	"n0g?": "altn0g" ,
	"default": "d"
} ;



function parseKeyValue( str , runtime ) {
	var key , value , iBkup , c ;

	key = parseKey( str , runtime ) ;
	value = parseValue( str , runtime ) ;

	key = altOps[ key ] || key ;

	iBkup = runtime.i ;
	runtime.i = 0 ;

	switch ( key ) {
		case 't' :
		case 's' :
		case 'n' :
		case 'g' :
		case 'um' :
		case 'd' :
			if ( value !== null ) { runtime.element[ key ] = unescape( value ) ; }
			break ;

		case 'altg' :
		case 'altn' :
		case 'altng' :
		case 'list' :
			if ( value !== null ) { runtime.element[ key ] = parseArray( value , runtime ) ; }
			break ;

		case 'altn0' :
			if ( value !== null ) {
				runtime.element.nOffset = 0 ;
				runtime.element.altn = parseArray( value , runtime ) ;
			}
			break ;

		case 'altn0g' :
			if ( value !== null ) {
				runtime.element.nOffset = 0 ;
				runtime.element.altng = parseArray( value , runtime ) ;
			}
			break ;

		case 'uv' :
			if ( value !== null ) { runtime.element[ key ] = parseArray( value , runtime ).map( v => parseFloat( v ) ) ; }
			break ;

		case 'uf' :
		case 'uenum' :
		case 'enum' :
			if ( value === null ) {
				runtime.element[ key ] = true ;
			}
			else {
				runtime.element[ key ] = parseArray( value , runtime )
				.map( e => Sentence.parse( e , runtime.element.babel ) ) ;
			}
			break ;

		default :
			if ( key[ 0 ] === '$' ) {
				if ( key === '$' ) {
					runtime.element.$ = {
						index: Sentence.REPEAT_LAST_INDEX ,
						ref: value && Ref.parse( value , { noInitialDollar: true } )
					} ;
				}
				else if ( key.length === 2 ) {
					c = key.charCodeAt( 1 ) ;
					if ( c >= 0x30 && c <= 0x39 ) {
						runtime.element.$ = {
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

				if ( runtime.element.fn ) { runtime.element.fn.push( { key: key , value: value } ) ; }
				else { runtime.element.fn = [ { key: key , value: value } ] ; }
			}
	}

	runtime.i = iBkup ;
	//runtime.element[ key ] = value ;
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

