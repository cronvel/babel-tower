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
	var word = this , p , n , g ,
		nOffset = babel.db[ babel.locale ].nOffset ,
		gIndex = babel.db[ babel.locale ].gIndex  ;
	
	//console.log( "\n\n>>>>>>" ) ;
	//console.log( word ) ;
	if ( word.t && babel.db[ babel.locale ].word[ word.t ] )
	{
		//console.log( "translate" ) ;
		word = Word.create( babel.db[ babel.locale ].word[ word.t ] , word ) ;
	}
	
	//console.log( word ) ;
	
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





function Babel() { throw new Error( 'Use Babel.create() instead' ) ; }
module.exports = Babel ;

Babel.Word = Word ;



Babel.create = function create()
{
	var babel = Object.create( Babel.prototype , {
		db: { value: {} , enumerable: true } ,
		locale: { value: null , enumerable: true , writable: true }
	} ) ;
	
	babel.setLocale() ;
	
	return babel ;
} ;



Babel.prototype.initLocale = function initLocale( locale )
{
	this.db[ locale ] = {
		nOffset: -1 ,	// Default offset for 'n' (number) for all languages, unless redefined
		gIndex: { m: 0 , f: 1 , n: 2 , h: 3 } ,	// Default index for 'g' (gender) for all languages, unless redefined
		fn: {} ,
		sentence: {} ,
		word: {}
	} ;
} ;



Babel.prototype.setLocale = function setLocale( locale )
{
	if ( ! locale ) { locale = 'none' ; }
	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }
	this.locale = locale ;
} ;



Babel.prototype.use = function use( locale )
{
	var babel = Object.create( this ) ;
	babel.setLocale( locale ) ;
	return babel ;
} ;



Babel.prototype.extend = function extend_( db )
{
	var locale , k ;
	
	for ( locale in db )
	{
		if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }
		
		for ( k in db[ locale ].fn )
		{
			this.db[ locale ].fn[ k ] = db[ locale ].fn[ k ] ;
		}
		
		for ( k in db[ locale ].sentence )
		{
			this.db[ locale ].sentence[ k ] = db[ locale ].sentence[ k ] ;
		}
		
		for ( k in db[ locale ].word )
		{
			this.db[ locale ].word[ k ] = Word.create( db[ locale ].word[ k ] ) ;
		}
	}
} ;



Babel.prototype.solve = function solve( sentenceKey )
{
	if ( this.db[ this.locale ].sentence[ sentenceKey ] ) { sentenceKey = this.db[ this.locale ].sentence[ sentenceKey ] ; }
	return this.format( sentenceKey , Array.prototype.slice.call( arguments , 1 ) ) ;
} ;



Babel.prototype.solveNamed = function solve( sentenceKey , namedArgs )
{
	return this.format( sentenceKey , namedArgs ) ;
} ;



Babel.interoOp = {
	n : "altn" ,
	g : "altg" ,
	ng : "altng"
} ;



/*
	Markup format:
	$<argument's number>[<function>:<argument1>|<argument2>]
	
	Common functions:
	s			display a literal non-translatable string
	t			display a translatable string
	altn n?		alternative plural forms
	altg g?		alternative gender forms
	altng ng?	alternative plural and gender forms
	nw			display a number using letters
	
	Arguments:
	number:	a number, used for plural forms or to display as string
	string:	can be a litteral string, or a translatable string
	object:	a translate object, can contains some of those properties:
		s:	a literal non-translatable string
		t:	a translatable string
		n:	number
		g:	gender, one of n,m,f,h or anything recognized by the language
	
	"Give me $1[nw] $1[n?apple|apples]!" , 3	-> "Give me three apples!"
	"Donne-moi $1[nw/g:f] $1[n?pomme|pommes]!" , 1 -> "Donne-moi une pomme!"
	
	"Give me one $1!" , apple 	-> "Give me one apple!"
	"Donne-moi $1[nw] $1!" , apple	-> "Donne-moi une pomme!"
	
	"Give me two $1[n:2]!" , apple 	-> "Give me two apples!"
	"Donne-moi deux $1[n:2]!" , apple	-> "Donne-moi deux pommes!"
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
	
	//console.log( "Args:" , args ) ;
	
	//str = str.replace( /\$(\$|([a-zA-Z0-9_-]+)(?:\[(?:([a-zA-Z0-9_-]+)(?:(:|\?)([^\]]*))?)?\])?)/g ,
	//	function( match , index , op , separator , opArgs ) {		// jshint ignore:line
	str = str.replace( /\$(?:\$|([a-zA-Z0-9_-]+)(?:\[([^\]]*)\])?)/g ,
		function( fullMatch , index , ops ) {		// jshint ignore:line
			
			var word , arg , op , opArgs , matches , opCount = 0 ;
			
			if ( fullMatch === '$$' ) { return '$'; }
			
			
			if ( argsIsArray ) { index = parseInt( index ) - 1 ; }
			
			arg = index in args ? Word.create( args[ index ] ) : Word.create( '(undefined)' ) ;
			//console.log( "Arg:" , arg ) ;
			
			if ( ! ops ) { return arg.solve( self ) ; }
			
			ops = ops.split( '/' ) ;
			
			for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ )
			{
				matches = ops[ i ].match( /^([a-zA-Z0-9_-]+)(?:(:|\?)(.+))?$/ ) ;
				
				if ( ! matches ) { continue ; }	// Throw an error?
				
				op = matches[ 1 ] ;
				if ( matches[ 2 ] === '?' ) { op = Babel.interoOp[ op ] ; }
				opArgs = matches[ 3 ] ;
				
				//console.log( 'replaceArgs --   index:' , index , '   op:' , op , '   opArgs:' , opArgs ) ;
				
				opCount ++ ;
				
				//console.log( "Arg before:" , arg ) ;
				switch ( op )
				{
					case 't' :
					case 's' :
					case 'n' :
					case 'g' :
						arg.extend( op , opArgs ) ;
						break ;
					case 'altn' :
					case 'altg' :
						arg.extend( op , opArgs ? opArgs.split( '|' ) : [] ) ;
						break ;
					case 'altng' :
						// /!\ how to parse altng?
						arg.extend( op , opArgs ? opArgs.split( '|' ) : [] ) ;
						break ;
						
					case 'nw' :
						if ( self.db[ self.locale ].fn[ op ] )
						{
							arg = self.db[ self.locale ].fn[ op ]( arg ) ;
						}
						break ;
						
					default :
						break ;
				}
				//console.log( "Arg after:" , arg ) ;
			}
			
			return arg.solve( self ) ;
		}
	) ;
	
	return str ;
} ;





