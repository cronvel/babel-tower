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



/*
	Word.create( w ) ;
	Word.create( w , kv ) ;
*/
Word.create = function create( w , kv )
{
	var word , k , i , iMax , isArrayOfArray ;
	
	if ( ! Array.isArray( kv ) )
	{
		if ( w instanceof Word ) { return w ; }
		
		word = Object.create( Word.prototype ) ;
		
		if ( w && typeof w === 'object' )
		{
			if ( Array.isArray( w ) )
			{
				for ( i = 0 , iMax = w.length ; i < iMax ; i ++ )
				{
					if ( Array.isArray( w[ i ] ) )
					{
						isArrayOfArray = true ;
						break ;
					}
				}
				
				if ( isArrayOfArray ) { word.altng = w ; }
				else { word.altn = w ; }
			}
			else
			{
				for ( k in w ) { word[ k ] = w[ k ] ; }
			}
		}
		else if ( typeof w === 'string' )
		{
			word.t = w ;
		}
		else if ( typeof w === 'number' )
		{
			word.n = w ;
		}
		else
		{
			word.t = '' + w ;
		}
	}
	else
	{
		word = Object.create( w ) ;
		
		for ( i = 0 , iMax = kv.length - 1 ; i < iMax ; i += 2 )
		{
			word[ kv[ i ] ] = kv[ i + 1 ] ;
		}
	}
	
	return word ;
} ;



// Word solver
Word.prototype.solve = function solve( babel )
{
	var p , n , g ,
		offsetN = -1 , offsetG = 0 ;
	
	
	
	// There is an alternative using n and g
	if ( this.altng )
	{
		n = Math.max( 0 , Math.min( this.n + offsetN , this.altng.length - 1 ) ) ;
		p = this.altng[ n ] ;
		
		// temp:
		g = Math.max( 0 , Math.min( this.g + offsetG , p.length - 1 ) ) ;
		
		return p[ g ] ;
	}
	
	// There is an alternative using n
	if ( this.altn && this.n !== undefined )
	{
		n = Math.max( 0 , Math.min( this.n + offsetN , this.altn.length - 1 ) ) ;
		return this.altn[ n ] ;
	}
	
	// There is an alternative using g
	if ( this.altg && this.g )
	{
		// temp:
		g = Math.max( 0 , Math.min( this.g + offsetG , this.altg.length - 1 ) ) ;
		return this.altg[ g ] ;
	}
	
	// There is an alternative using n
	if ( this.altn )
	{
		return this.altn[ 0 ] ;
	}
	
	// There is an alternative using g
	if ( this.altg )
	{
		return this.altg[ 0 ] ;
	}
	
	// This is an invariable string
	if ( this.s !== undefined )
	{
		return this.s ;
	}
	
	// This is a number
	if ( this.n !== undefined )
	{
		return '' + this.n ;
	}
	
	return this.t ;
} ;





function Babel() { throw new Error( 'Use Babel.create() instead' ) ; }
module.exports = Babel ;



Babel.create = function create()
{
	var babel = Object.create( Babel.prototype , {
	} ) ;
	
	babel.locale = null ;
	
	return babel ;
} ;



/*
	Markup format:
	$<argument's number>[<function>:<argument1>|<argument2>]
	
	Common functions:
	s:		display a literal non-translatable string
	t:		display a translatable string
	altn:	alternative plural forms
	altg:	alternative gender forms
	altng:	alternative plural and gender forms
	num:	display a number using letters
	
	Arguments:
	number:	a number, used for plural forms or to display as string
	string:	can be a litteral string, or a translatable string
	object:	a translate object, can contains some of those properties:
		s:	a literal non-translatable string
		t:	a translatable string
		n:	number
		g:	gender, one of n,m,f or anything recognized by the language
	
	"Give me $1[num] $1[altn:apple|apples]!" , 3	-> "Give me three apples!"
	"Donne-moi $1[num:f] $1[altn:pomme|pommes]!" , 1 -> "Donne-moi une pomme!"
	
	"Give me one $1[t]!" , apple 	-> "Give me one apple!"
	"Donne-moi $1[articleIndefini] $1[t]!" , apple	-> "Donne-moi une pomme!"
	
	"Give me two $1[t:2]!" , apple 	-> "Give me one apple!"
	"Donne-moi deux $1[t:2]!" , apple	-> "Donne-moi deux pommes!"
*/

Babel.prototype.format = function format( str , args )
{
	var self = this , k , i , iMax , argsIsArray , value ;
	
	if ( ! args || typeof args !== 'object' ) { args = [ args ] ; }
	
	if ( Array.isArray( args ) )
	{
		argsIsArray = true ;
		for ( i = 0 , iMax = args.length ; i < iMax ; i ++ ) { args[ i ] = Word.create( args[ i ] ) ; }
	}
	else
	{
		argsIsArray = false ;
		for ( k in args ) { args[ k ] = Word.create( args[ k ] ) ; }
	}
	
	console.log( "Args:" , args ) ;
	
	str = str.replace( /\$(\$|([a-zA-Z0-9_-]+)(?:\[(?:([a-zA-Z0-9_-]+)(?::([^\]]*))?)?\])?)/g ,
		function( match , fullOp , index , op , opArgs ) {		// jshint ignore:line
			
			var word , arg ;
			
			if ( fullOp === '$' ) { return '$'; }
			
			if ( argsIsArray ) { index = parseInt( index ) - 1 ; }
			
			arg = index in args ? args[ index ] : Word.create( '(undefined)' ) ;
			console.log( "Arg:" , arg ) ;
			
			if ( ! op ) { return arg.solve( self ) ; }
			
			opArgs = opArgs ? opArgs.split( '|' ) : [] ;
			
			console.log( 'replaceArgs --   index:' , index , '   op:' , op , '   opArgs:' , opArgs ) ;
			
			switch ( op )
			{
				case 't' :
				case 's' :
				case 'n' :
				case 'g' :
				case 'altn' :
				case 'altg' :
				case 'altng' :
					return Word.create( arg , [ op , opArgs ] ).solve( self ) ;
				default :
					return '' ;
			}
	} ) ;
	
	return str ;
} ;



Babel.prototype.solve = function solve( sentenceKey )
{
	return this.format( sentenceKey , Array.prototype.slice.call( arguments , 1 ) ) ;
} ;



Babel.prototype.solveNamed = function solve( sentenceKey , namedArgs )
{
	return this.format( sentenceKey , namedArgs ) ;
} ;




