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
	- n: element gender, char: 'm' (male), 'f' (female), 'n' (neutral), 'h' (hermaphrodite)
	- nOffset: offset for the altn variation
	- altn: array of variations by element number
	- altg: array of variations by element gender
	- altng: array of variations by element number and gender (array of array, [number][gender])
*/



/*
	Element.create( w ) ;
	Element.create( w , kv ) ;
*/
Element.create = function create( w , kv , babel )
{
	var element , elements , k , i , iMax ;
	
	// Create an array of element!
	if ( Array.isArray( w ) )
	{
		elements = [] ;
		
		for ( i = 0 , iMax = w.length ; i < iMax ; i ++ )
		{
			elements[ i ] = Element.create( w[ i ] , kv , babel ) ;
		}
		
		return elements ;
	}
	
	if ( kv && typeof kv === 'object' )
	{
		// Normal extend mode
		
		element = Object.create( w ) ;
		element.extend( kv ) ;
		
		if ( babel ) { element.babel = babel ; }
		
		return element ;
	}
	
	
	// Normal creation mode
	
	
	if ( w instanceof Element )
	{
		if ( w.t && babel && babel.db[ babel.locale ].element[ w.t ] )
		{
			element = Object.create( babel.db[ babel.locale ].element[ w.t ] ) ;
			
			// Inherits only unexistant key, and of course don't inherit 't'
			for ( k in w ) { if ( ! ( k in element ) && k !== 't' ) { element[ k ] = w[ k ] ; } }
		}
		else
		{
			element = Object.create( w ) ;
		}
		
		if ( babel ) { element.babel = babel ; }
		
		return element ;
	}
	
	if ( w && typeof w === 'object' &&
		( w.toString === Object.prototype.toString || ( Object.getPrototypeOf( w ) ) === null ) )
	{
		if ( w.t && babel && babel.db[ babel.locale ].element[ w.t ] )
		{
			element = Object.create( babel.db[ babel.locale ].element[ w.t ] ) ;
			
			// Inherits only unexistant key, and of course don't inherit 't'
			for ( k in w ) { if ( ! ( k in element ) && k !== 't' ) { element[ k ] = w[ k ] ; } }
		}
		else
		{
			element = Object.create( Element.prototype ) ;
			
			// Inherits everything here
			for ( k in w ) { element[ k ] = w[ k ] ; }
		}
		
		if ( babel ) { element.babel = babel ; }
		
		return element ;
	}
	
	if ( typeof w === 'number' )
	{
		element = Object.create( Element.prototype ) ;
		element.n = w ;
		
		if ( babel ) { element.babel = babel ; }
		
		return element ;
	}
	
	if ( typeof w !== 'string' ) { w = '' + w ; }
	
	if ( babel && babel.db[ babel.locale ].element[ w ] )
	{
		element = Object.create( babel.db[ babel.locale ].element[ w ] ) ;
	}
	else
	{
		element = Object.create( Element.prototype ) ;
		element.t = w ;
	}
	
	if ( babel ) { element.babel = babel ; }
	
	return element ;
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



Element.prototype.extend = function extend_( kv )
{
	var k , i , iMax ;
	
	if ( arguments.length === 2 )
	{
		this[ arguments[ 0 ] ] = arguments[ 1 ] ;
	}
	else if ( Array.isArray( kv ) )
	{
		for ( i = 0 , iMax = kv.length - 1 ; i < iMax ; i += 2 )
		{
			this[ kv[ i ] ] = kv[ i + 1 ] ;
		}
	}
	else
	{
		for ( k in kv )
		{
			this[ k ] = kv[ k ] ;
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
	if ( element.t && babel.db[ babel.locale ].element[ element.t ] )
	{
		//console.log( "translate" ) ;
		element = Element.create( babel.db[ babel.locale ].element[ element.t ] , element ) ;
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



Element.prototype.toStringKFG = function toStringKFG( ctx )
{
	return this.solve( ( ctx && ctx.__babel ) || Babel.default ) ;
} ;


