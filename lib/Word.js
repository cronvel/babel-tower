/*
	The Cedric's Swiss Knife (CSK) - CSK i18n toolbox

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



function Word() { throw new Error( 'Use Word.create() instead' ) ; }
module.exports = Word ;



/*
	Word.create( w ) ;
	Word.create( w , kv ) ;
*/
Word.create = function create( w , kv )
{
	var word , words , k , i , iMax , isArrayOfArray ;
	
	// Create an array of word!
	if ( Array.isArray( w ) )
	{
		words = [] ;
		
		for ( i = 0 , iMax = w.length ; i < iMax ; i ++ )
		{
			words[ i ] = Word.create( w[ i ] , kv ) ;
		}
		
		return words ;
	}
	
	if ( kv && typeof kv === 'object' )
	{
		word = Object.create( w ) ;
		word.extend( kv ) ;
	}
	else
	{
		// Normal creation mode
		
		if ( w instanceof Word ) { return Object.create( w ) ; }
		
		if ( w && typeof w === 'object' )
		{
			word = Object.create( Word.prototype ) ;
			for ( k in w ) { word[ k ] = w[ k ] ; }
		}
		else if ( typeof w === 'string' )
		{
			word = Object.create( Word.prototype ) ;
			word.t = w ;
		}
		else if ( typeof w === 'number' )
		{
			word = Object.create( Word.prototype ) ;
			word.n = w ;
		}
		else
		{
			word = Object.create( Word.prototype ) ;
			word.t = '' + w ;
		}
	}
	
	return word ;
} ;



// Canonical form
Object.defineProperty( Word.prototype , 'c' , {
	enumerable: false ,
	get: function() {
		return ( this.altng && this.altng[ 0 ] && this.altng[ 0 ][ 0 ] ) ||
			( this.altn && this.altn[ 0 ] ) ||
			( this.altg && this.altg[ 0 ] ) ||
			this.s ||
			this.t ;
	}
} ) ;



Word.prototype.extend = function extend_( kv )
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



// Word solver
Word.prototype.solve = function solve( babel )
{
	var word = this , p , n , g , nOffset ,
		gIndex = babel.db[ babel.locale ].gIndex  ;
	
	//console.log( "\n\n>>>>>>" ) ;
	//console.log( word ) ;
	if ( word.t && babel.db[ babel.locale ].word[ word.t ] )
	{
		//console.log( "translate" ) ;
		word = Word.create( babel.db[ babel.locale ].word[ word.t ] , word ) ;
	}
	
	nOffset = word.nOffset !== undefined ? word.nOffset : babel.db[ babel.locale ].nOffset ;
	
	//console.log( 'solve:' , word , nOffset ) ;
	
	n = word.n ;
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
	if ( word.altng )
	{
		n = Math.max( 0 , Math.min( n + nOffset , word.altng.length - 1 ) ) || 0 ;
		p = word.altng[ n ] ;
		
		g = gIndex[ word.g ] || 0 ;
		if ( g >= p.length ) { g = 0 ; }
		
		return p[ g ] ;
	}
	
	// There is an alternative using n
	if ( word.altn && n !== undefined )
	{
		n = Math.max( 0 , Math.min( n + nOffset , word.altn.length - 1 ) ) ;
		return word.altn[ n ] ;
	}
	
	// There is an alternative using g
	if ( word.altg && word.g )
	{
		g = gIndex[ word.g ] || 0 ;
		if ( g >= word.altg.length ) { g = 0 ; }
		return word.altg[ g ] ;
	}
	
	// There is an alternative using n
	if ( word.altn )
	{
		return word.altn[ 0 ] ;
	}
	
	// There is an alternative using g
	if ( word.altg )
	{
		return word.altg[ 0 ] ;
	}
	
	// This is an invariable string
	if ( word.s !== undefined )
	{
		return word.s ;
	}
	
	// This is an invariable string
	if ( word.t !== undefined )
	{
		return word.t ;
	}
	
	// This is a number
	if ( n !== undefined )
	{
		return '' + n ;
	}
	
	return word.t ;
} ;


