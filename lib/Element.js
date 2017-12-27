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
	- n: element gender, char: 'm' (male), 'f' (female), 'n' (neutral), 'h' (hermaphrodite, or both - plural)
	- nOffset: offset for the altn variation
	- altn: array of variations by element number
	- altg: array of variations by element gender
	- altng: array of variations by element number and gender (array of array, [number][gender])
	- uv: unit of measurements: list of values
	- uf: unit of measurements: format, should match 'uv'
	- um: unit of measurements: mode
	- uenum: enumeration, when the mode include concatenation of multiple units, e.g.: 2 feets and 3 inches
*/



Element.create = function create( w , babel , inheritKv , proto )
{
	var self , elements , k , i , iMax ;
	
	proto = proto || Element.prototype ;
	
	// Create an array of element!
	if ( Array.isArray( w ) )
	{
		elements = [] ;
		
		for ( i = 0 , iMax = w.length ; i < iMax ; i ++ )
		{
			elements[ i ] = Element.create( w[ i ] , babel , inheritKv ) ;
		}
		
		return elements ;
	}
	
	if ( inheritKv && typeof inheritKv === 'object' )
	{
		// Normal extend mode
		
		self = Object.create( w ) ;
		self.extend( inheritKv ) ;
		
		if ( babel ) { self.babel = babel ; }
		
		return self ;
	}
	
	
	// Normal creation mode
	
	
	if ( w instanceof Element )
	{
		if ( w.t && babel && babel.db[ babel.locale ].elements[ w.t ] )
		{
			self = Object.create( babel.db[ babel.locale ].elements[ w.t ] ) ;
			
			// Inherits only unexistant key, and of course don't inherit 't'
			for ( k in w ) { if ( ! ( k in self ) && k !== 't' ) { self[ k ] = w[ k ] ; } }
		}
		else
		{
			self = Object.create( w ) ;
		}
		
		if ( babel ) { self.babel = babel ; }
		
		return self ;
	}
	
	if ( w && typeof w === 'object' &&
		( w.toString === Object.prototype.toString || ( Object.getPrototypeOf( w ) ) === null ) )
	{
		if ( w.t && babel && babel.db[ babel.locale ].elements[ w.t ] )
		{
			self = Object.create( babel.db[ babel.locale ].elements[ w.t ] ) ;
			
			// Inherits only unexistant key, and of course don't inherit 't'
			for ( k in w ) { if ( ! ( k in self ) && k !== 't' ) { self[ k ] = w[ k ] ; } }
		}
		else
		{
			self = Object.create( proto ) ;
			
			// Inherits everything here
			for ( k in w ) { self[ k ] = w[ k ] ; }
		}
		
		if ( babel ) { self.babel = babel ; }
		
		return self ;
	}
	
	if ( typeof w === 'number' )
	{
		self = Object.create( proto ) ;
		self.n = w ;
		
		if ( babel ) { self.babel = babel ; }
		
		return self ;
	}
	
	if ( typeof w !== 'string' ) { w = '' + w ; }
	
	if ( babel && babel.db[ babel.locale ].elements[ w ] )
	{
		self = Object.create( babel.db[ babel.locale ].elements[ w ] ) ;
	}
	else
	{
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



// /!\ Some code are shared with Babel.prototype.format() (regexp and operators) /!\
Element.parse = function parse( str , babel , proto )
{
	var matches , ops , object , i , iMax , op , opArgs , opCount ;
	
	//matches = str.match( /^([^\[]*)(?:\[([^\]]*)\])?/ ) ;
	matches = str.match( /^([^\[]*)(?:\[((?:\[[^\]]*\]|[^\]])*)\])?/ ) ;
	
	//console.log( matches ) ;
	
	if ( ! matches ) { return undefined ; }
	
	object = {} ;
	
	if ( matches[ 1 ] ) { object.t = matches[ 1 ] ; }
	
	ops = matches[ 2 ] ? matches[ 2 ].split( '/' ) : [] ;
	
	for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ )
	{
		matches = ops[ i ].match( /^([a-zA-Z0-9_-]+)(?:(:|\?)(.+))?$/ ) ;
		
		if ( ! matches ) { continue ; }	// Throw an error?
		
		op = matches[ 1 ] ;
		if ( matches[ 2 ] === '?' ) { op += '?' ; }
		if ( Babel.altOp[ op ] ) { op = Babel.altOp[ op ] ; }
		
		opArgs = matches[ 3 ] ;
		
		//console.log( 'replaceArgs --   index:' , index , '   op:' , op , '   opArgs:' , opArgs ) ;
		
		opCount ++ ;
		
		//console.log( "Arg before:" , object ) ;
		switch ( op )
		{
			case 't' :
			case 's' :
			case 'n' :
			case 'g' :
			case 'um' :
				object[ op ] = opArgs ;
				break ;
			
			case 'altn0' :
				object.nOffset = 0 ;
				object.altn = opArgs ? opArgs.split( '|' ) : [] ;
				break ;
				
			case 'altn' :
				object.altn = opArgs ? opArgs.split( '|' ) : [] ;
				break ;
			
			case 'altg' :
				object.altg = opArgs ? opArgs.split( '|' ) : [] ;
				break ;
			
			case 'altn0g' :
				// altng format: (xxx|xxx)|(xxx|xxx)...
				object.nOffset = 0 ;
				object.altng = Babel.parseArrayOfArray( opArgs ) ;
				break ;
				
			case 'altng' :
				// altng format: (xxx|xxx)|(xxx|xxx)...
				object.altng = Babel.parseArrayOfArray( opArgs ) ;
				break ;
			
			case 'uv' :
				object.uv = opArgs ? opArgs.split( '|' ) : [] ;
				break ;
			
			case 'uf' :
				// uf are recursive, so we should avoid splitting a '|' inside brackets
				object.uf = opArgs ? opArgs.split( /\|(?![^\[]*\])/ ) : [] ;
				break ;
			
			case 'uenum' :
				// uenum are recursive, so we should avoid splitting a '|' inside brackets
				object.uenum = opArgs ? opArgs.split( /\|(?![^\[]*\])/ ) : [] ;
				break ;
		}
	}
	
	return Element.create( object , babel , undefined , proto ) ;
} ;



Element.prototype.extend = function extend_( inheritKv )
{
	var k , i , iMax ;
	
	if ( arguments.length === 2 )
	{
		this[ arguments[ 0 ] ] = arguments[ 1 ] ;
	}
	else if ( Array.isArray( inheritKv ) )
	{
		for ( i = 0 , iMax = inheritKv.length - 1 ; i < iMax ; i += 2 )
		{
			this[ inheritKv[ i ] ] = inheritKv[ i + 1 ] ;
		}
	}
	else
	{
		for ( k in inheritKv )
		{
			this[ k ] = inheritKv[ k ] ;
		}
	}
} ;



Element.prototype.solve = Element.prototype.toString = function solve( babel )
{
	var element = this , p , n , g , nOffset , gIndex ;
	
	babel = babel || this.babel ;
	
	gIndex = babel.db[ babel.locale ].gIndex  ;
	
	//console.log( "\n\n>>>>>>" ) ;
	//console.log( element ) ;
	if ( element.t && babel.db[ babel.locale ].elements[ element.t ] )
	{
		//console.log( "translate" ) ;
		element = Element.create( babel.db[ babel.locale ].elements[ element.t ] , null , element ) ;
	}
	
	nOffset = element.nOffset !== undefined ? element.nOffset : babel.db[ babel.locale ].nOffset ;
	
	//console.log( 'solve:' , element , nOffset ) ;
	
	n = element.n ;
	//console.log( n ) ;
	
	if ( n === 'many' )
	{
		n = Infinity ;
	}
	else
	{
		n = + n ;	// Cast anything to a number
		if ( isNaN( n ) ) { n = undefined ; }
	}
	
	//console.log( n ) ;
	
	// There is an alternative using n and g
	if ( element.altng )
	{
		n = Math.max( 0 , Math.min( n + nOffset , element.altng.length - 1 ) ) || 0 ;
		p = element.altng[ n ] ;
		
		g = gIndex[ element.g ] || 0 ;
		if ( g >= p.length ) { g = 0 ; }
		
		return p[ g ] ;
	}
	
	// There is an alternative using n
	if ( element.altn && n !== undefined )
	{
		n = Math.max( 0 , Math.min( n + nOffset , element.altn.length - 1 ) ) ;
		return element.altn[ n ] ;
	}
	
	// There is a unit system using n
	if ( element.uv && element.uf && typeof n === 'number' )
	{
		return this.measure( babel , n , element ) ;
	}
	
	// There is an alternative using g
	if ( element.altg && element.g )
	{
		g = gIndex[ element.g ] || 0 ;
		if ( g >= element.altg.length ) { g = 0 ; }
		return element.altg[ g ] ;
	}
	
	// There is an alternative using n
	if ( element.altn )
	{
		return element.altn[ 0 ] ;
	}
	
	// There is an alternative using g
	if ( element.altg )
	{
		return element.altg[ 0 ] ;
	}
	
	// This is an invariable string
	if ( element.s !== undefined )
	{
		return element.s ;
	}
	
	// This is an invariable string
	if ( element.t !== undefined )
	{
		return element.t ;
	}
	
	// This is a number
	if ( n !== undefined )
	{
		return '' + n ;
	}
	
	return element.t ;
} ;



Element.prototype.measure = function measure( babel , value , element )
{
	var i , iMax = element.uf.length , currentValue , strArray = [] ,
		currentRatio , closestIndex , closestDelta = Infinity ;
	
	if ( ! iMax ) { return '' ; }
	
	switch ( element.um )
	{
		case 'N+' :
			for ( i = 0 ; i < iMax ; i ++ )
			{
				currentValue = value / element.uv[ i ] ;
				
				if ( currentValue < 1 ) { continue ; }
				
				currentValue = Math.trunc( currentValue ) ;
				value = value - currentValue * element.uv[ i ] ;
				
				strArray.push( babel.solveArray( element.uf[ i ] , null , currentValue ) ) ;
			}
			
			return babel.solveEnum( element.uenum , strArray , null ) ;
		
		case 'R1+' :
			for ( i = 0 ; i < iMax ; i ++ )
			{
				currentRatio = value >= element.uv[ i ] ? value - element.uv[ i ] : 2 * element.uv[ i ] - value ;
				if ( currentRatio >= closestDelta ) { continue ; }
				
				closestDelta = currentRatio ;
				closestIndex = i ;
			}
			
			//return element.uf[ closestIndex ].replace( /\$#/ , value / element.uv[ closestIndex ] ) ;
			return babel.solveArray( element.uf[ closestIndex ] , null , value / element.uv[ closestIndex ] ) ;
			
		case 'R' :
		default :
			for ( i = 0 ; i < iMax ; i ++ )
			{
				currentRatio = Math.abs( value - element.uv[ i ] ) ;
				if ( currentRatio >= closestDelta ) { continue ; }
				
				closestDelta = currentRatio ;
				closestIndex = i ;
			}
			
			//return element.uf[ closestIndex ].replace( /\$#/ , value / element.uv[ closestIndex ] ) ;
			return babel.solveArray( element.uf[ closestIndex ] , null , value / element.uv[ closestIndex ] ) ;
	}
} ;



Element.prototype.toStringKFG = function toStringKFG( ctx )
{
	return this.solve( ( ctx && ctx.__babel ) || Babel.default ) ;
} ;


