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



function Element() { throw new Error( 'Use Element.create() instead' ) ; }

module.exports = Element ;



var Babel = require( './Babel.js' ) ;



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
	- uv: unit of measurements: list of values
	- uf: unit of measurements: format, should match 'uv'
	- um: unit of measurements: mode
	- uenum: enumeration, when the mode include concatenation of multiple units, e.g.: 2 feets and 3 inches
*/



Element.create = function create( w , babel , inheritKv , proto ) {
	var self , elements , k , i , iMax ;

	proto = proto || Element.prototype ;

	// Create an array of element!
	if ( Array.isArray( w ) ) {
		elements = [] ;

		for ( i = 0 , iMax = w.length ; i < iMax ; i ++ ) {
			elements[ i ] = Element.create( w[ i ] , babel , inheritKv ) ;
		}

		return elements ;
	}

	if ( inheritKv && typeof inheritKv === 'object' ) {
		// Normal extend mode

		self = Object.create( w ) ;
		self.extend( inheritKv ) ;

		if ( babel ) { self.babel = babel ; }

		return self ;
	}


	// Normal creation mode


	if ( w instanceof Element ) {
		if ( w.t && babel && babel.db[ babel.locale ].elements[ w.t ] ) {
			self = Object.create( babel.db[ babel.locale ].elements[ w.t ] ) ;

			// Inherits only unexistant key, and of course don't inherit 't'
			for ( k in w ) { if ( ! ( k in self ) && k !== 't' ) { self[ k ] = w[ k ] ; } }
		}
		else {
			self = Object.create( w ) ;
		}

		if ( babel ) { self.babel = babel ; }

		return self ;
	}

	if ( w && typeof w === 'object' &&
		( w.toString === Object.prototype.toString || ( Object.getPrototypeOf( w ) ) === null ) ) {
		if ( w.t && babel && babel.db[ babel.locale ].elements[ w.t ] ) {
			self = Object.create( babel.db[ babel.locale ].elements[ w.t ] ) ;

			// Inherits only unexistant key, and of course don't inherit 't'
			for ( k in w ) { if ( ! ( k in self ) && k !== 't' ) { self[ k ] = w[ k ] ; } }
		}
		else {
			self = Object.create( proto ) ;

			// Inherits everything here
			for ( k in w ) { self[ k ] = w[ k ] ; }
		}

		if ( babel ) { self.babel = babel ; }

		return self ;
	}

	if ( typeof w === 'number' ) {
		self = Object.create( proto ) ;
		self.n = w ;

		if ( babel ) { self.babel = babel ; }

		return self ;
	}

	if ( w === undefined ) {
		self = Object.create( proto ) ;

		if ( babel ) {
			self.babel = babel ;
			self.d = babel.undefinedString ;
		}

		return self ;
	}

	if ( typeof w !== 'string' ) { w = '' + w ; }

	if ( babel && babel.db[ babel.locale ].elements[ w ] ) {
		self = Object.create( babel.db[ babel.locale ].elements[ w ] ) ;
	}
	else {
		self = Object.create( proto ) ;
		self.t = w ;
	}

	if ( babel ) { self.babel = babel ; }

	return self ;
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



Element.prototype.extend = function extend_( inheritKv , value , shouldUnescape ) {
	var k , i , iMax ;

	if ( value !== undefined ) {
		k = inheritKv ;		// Here we do not use .extend( object ) but the .extend( k , v ) syntax
		this[ k ] = shouldUnescape ? unescapeAny( value ) : value ;
	}
	else if ( Array.isArray( inheritKv ) ) {
		for ( i = 0 , iMax = inheritKv.length - 1 ; i < iMax ; i += 2 ) {
			this[ inheritKv[ i ] ] = inheritKv[ i + 1 ] ;
		}
	}
	else {
		for ( k in inheritKv ) {
			this[ k ] = inheritKv[ k ] ;
		}
	}
} ;



Element.prototype.solve = Element.prototype.toString = function solve( babel ) {
	var element = this , t , p , n , g , nOffset , gIndex ;

	babel = babel || this.babel ;

	t = element.t !== undefined ? element.t : element.d ;

	gIndex = babel.db[ babel.locale ].gIndex  ;

	//console.log( "\n\n>>>>>>" ) ;
	//console.log( element ) ;
	if ( t && babel.db[ babel.locale ].elements[ t ] ) {
		//console.log( "translate" ) ;
		element = Element.create( babel.db[ babel.locale ].elements[ t ] , null , element ) ;
	}

	nOffset = element.nOffset !== undefined ? element.nOffset : babel.db[ babel.locale ].nOffset ;

	//console.log( 'solve:' , element , nOffset ) ;

	n = element.n ;
	//console.log( n ) ;

	if ( n === 'many' ) {
		n = Infinity ;
	}
	else {
		n = + n ;	// Cast anything to a number
		if ( isNaN( n ) ) { n = undefined ; }
	}

	//console.log( n ) ;

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
		return this.measure( babel , n , element ) ;
	}

	// There is an alternative using g
	if ( element.altg && element.g ) {
		g = gIndex[ element.g ] || 0 ;
		if ( g >= element.altg.length ) { g = 0 ; }
		return element.altg[ g ] ;
	}

	// There is an alternative using n
	if ( element.altn ) {
		return element.altn[ 0 ] ;
	}

	// There is an alternative using g
	if ( element.altg ) {
		return element.altg[ 0 ] ;
	}

	// This is an invariable string
	if ( element.s !== undefined ) {
		return element.s ;
	}

	// This is a translation key
	if ( t !== undefined ) {
		return t ;
	}

	// This is the default value
	if ( element.d !== undefined ) {
		return element.d ;
	}

	// This is a number
	if ( n !== undefined ) {
		return '' + n ;
	}

	return t ;
} ;



Element.prototype.measure = function measure( babel , value , element ) {
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

				strArray.push( babel.solveArray( element.uf[ i ] , null , currentValue ) ) ;
			}

			return babel.solveEnum( element.uenum , strArray , null ) ;

		case 'R1+' :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = value >= element.uv[ i ] ? value - element.uv[ i ] : 2 * element.uv[ i ] - value ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			//return element.uf[ closestIndex ].replace( /\$#/ , value / element.uv[ closestIndex ] ) ;
			return babel.solveArray( element.uf[ closestIndex ] , null , value / element.uv[ closestIndex ] ) ;

		case 'R' :
		default :
			for ( i = 0 ; i < iMax ; i ++ ) {
				currentRatio = Math.abs( value - element.uv[ i ] ) ;
				if ( currentRatio >= closestDelta ) { continue ; }

				closestDelta = currentRatio ;
				closestIndex = i ;
			}

			//return element.uf[ closestIndex ].replace( /\$#/ , value / element.uv[ closestIndex ] ) ;
			return babel.solveArray( element.uf[ closestIndex ] , null , value / element.uv[ closestIndex ] ) ;
	}
} ;



Element.prototype.toStringKFG = function toStringKFG( ctx ) {
	return this.solve( ( ctx && ctx.__babel ) || Babel.default ) ;
} ;



// Alternative operator form
var availableOps = {
	t: 't' ,
	s: 's' ,
	n: 'n' ,
	g: 'g' ,
	d: 'd' ,
	altn: 'altn' ,
	altn0: 'altn0' ,
	altg: 'altg' ,
	altng: 'altng' ,
	altn0g: 'altn0g' ,
	uv: 'uv' ,
	uf: 'uf' ,
	um: 'um' ,
	uenum: 'uenum' ,
	"n?": "altn" ,
	"n0?": "altn0" ,
	"g?": "altg" ,
	"ng?": "altng" ,
	"n0g?": "altn0g" ,
	"default": "d"
} ;



// Parser



Element.parse = function parse( str , options ) {
	options = options || {}  ;
	
	var element = Object.create( options.proto || Element.prototype ) ;
	
	if ( options.babel ) { element.babel = options.babel ; }

	var runtime = {
		i: 0 ,
		element: element
	} ;

	if ( typeof str !== 'string' ) {
		if ( str && typeof str === 'object' ) { str = str.toString() ; }
		else { throw new TypeError( "Argument #0 should be a string or an object with a .toString() method" ) ; }
	}

	parseStandAloneElement( str , runtime ) ;

	return element ;
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
	
	while ( runtime.i < str.length ) {
		
		// Is it supposed to happend here?
		if ( str[ runtime.i ] === '/' && str[ runtime.i + 1 ] === '//' ) {
			throw new Error( 'Filters!' ) ;
		}
		else {
			parseKeyValue( str , runtime ) ;
			if ( str[ runtime.i ] !== '/' ) { break ; }
			runtime.i ++ ;
		}
	}
}



function parseKeyValue( str , runtime ) {
	var key , value , iBkup ;
	
	key = parseKey( str , runtime ) ;
	value = parseValue( str , runtime ) ;
	
	if ( ! availableOps[ key ] ) {
		throw new SyntaxError( "Unknown operator: '" + key + "'" ) ;
	}
	
	key = availableOps[ key ] ;
	
	iBkup = runtime.i ;
	runtime.i = 0 ;
	
	switch ( key ) {
		case 't' :
		case 's' :
		case 'n' :
		case 'g' :
		case 'um' :
		case 'd' :
			runtime.element[ key ] = unescape( value ) ;
			break ;
		
		case 'altg' :
		case 'altn' :
		case 'altng' :
		case 'uv' :
		case 'uf' :
		case 'uenum' :
			runtime.element[ key ] = parseArray( value , runtime ) ;
			break ;
			
		case 'altn0' :
			runtime.element.nOffset = 0 ;
			runtime.element.altn = parseArray( value , runtime ) ;
			break ;

		case 'altn0g' :
			runtime.element.nOffset = 0 ;
			runtime.element.altng = parseArray( value , runtime ) ;
			break ;
	}
	
	runtime.i = iBkup ;
	//runtime.element[ key ] = value ;
}



function parseKey( str , runtime ) {
	var start = runtime.i ;

	while ( runtime.i < str.length ) {
		if ( str[ runtime.i ] === ':' ) {
			runtime.i ++ ;
			return str.slice( start , runtime.i - 1 ) ;
		}
		else if ( str[ runtime.i ] === '?' ) {
			runtime.i ++ ;
			return str.slice( start , runtime.i ) ;
		}
		
		runtime.i ++ ;
	}

	throw new SyntaxError( 'Unexpected end' ) ;
}



function parseValue( str , runtime ) {
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



// Old Regexp-based parser

/*
// /!\ Some code are shared with Babel.prototype.format() (regexp and operators) /!\
var escape = require( './escape.js' ) ;
Element.parse = function parse( str , babel , proto ) {
	var matches , ops , object , i , iMax , op , opArgs ;
	//var opCount = 0 ;

	matches = str.match( /^([^[]*)(?:\[((?:\\.|\[[^\]]*\]|[^\]])*)\])?/ ) ;

	//console.log( matches ) ;

	if ( ! matches ) { return undefined ; }

	object = {} ;

	if ( matches[ 1 ] ) { object.t = matches[ 1 ] ; }

	//ops = matches[ 2 ] ? matches[ 2 ].split( '/' ) : [] ;
	ops = matches[ 2 ] ? escape.split( matches[ 2 ] , '/' ) : [] ;

	for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ ) {
		matches = ops[ i ].match( /^([a-zA-Z0-9_-]+)(?:(:|\?)(.+))?$/ ) ;

		if ( ! matches ) { continue ; }	// Throw an error?

		op = matches[ 1 ] ;
		if ( matches[ 2 ] === '?' ) { op += '?' ; }
		if ( Babel.altOp[ op ] ) { op = Babel.altOp[ op ] ; }

		opArgs = matches[ 3 ] ;

		//console.log( 'replaceArgs --   index:' , index , '   op:' , op , '   opArgs:' , opArgs ) ;

		//opCount ++ ;

		//console.log( "Arg before:" , object ) ;
		switch ( op ) {
			case 't' :
			case 's' :
			case 'n' :
			case 'g' :
			case 'um' :
			case 'd' :
				object[ op ] = unescapeAny( opArgs ) ;
				break ;

			case 'altn0' :
				object.nOffset = 0 ;
				//object.altn = unescapeAny( opArgs ? opArgs.split( '|' ) : [] ) ;
				object.altn = unescapeAny( opArgs ? escape.split( opArgs , '|' ) : [] ) ;
				break ;

			case 'altn' :
				//object.altn = unescapeAny( opArgs ? opArgs.split( '|' ) : [] ) ;
				object.altn = unescapeAny( opArgs ? escape.split( opArgs , '|' ) : [] ) ;
				break ;

			case 'altg' :
				//object.altg = unescapeAny( opArgs ? opArgs.split( '|' ) : [] ) ;
				object.altg = unescapeAny( opArgs ? escape.split( opArgs , '|' ) : [] ) ;
				break ;

			case 'altn0g' :
				// altng format: (xxx|xxx)|(xxx|xxx)...
				object.nOffset = 0 ;
				object.altng = unescapeAny( Babel.parseArrayOfArray( opArgs ) ) ;
				break ;

			case 'altng' :
				// altng format: (xxx|xxx)|(xxx|xxx)...
				object.altng = unescapeAny( Babel.parseArrayOfArray( opArgs ) ) ;
				break ;

			case 'uv' :
				//object.uv = unescapeAny( opArgs ? opArgs.split( '|' ) : [] ) ;
				object.uv = unescapeAny( opArgs ? escape.split( opArgs , '|' ) : [] ) ;
				break ;

			case 'uf' :
				// uf are recursive, so we should avoid splitting a '|' inside brackets
				//object.uf = unescapeAny( opArgs ? opArgs.split( /\|(?![^[]*\])/ ) : [] ) ;
				object.uf = unescapeAny( opArgs ? escape.split( opArgs , '|nested' ) : [] ) ;
				break ;

			case 'uenum' :
				// uenum are recursive, so we should avoid splitting a '|' inside brackets
				//object.uenum = unescapeAny( opArgs ? opArgs.split( /\|(?![^[]*\])/ ) : [] ) ;
				object.uenum = unescapeAny( opArgs ? escape.split( opArgs , '|nested' ) : [] ) ;
				break ;
		}
	}

	return Element.create( object , babel , undefined , proto ) ;
} ;
//*/
