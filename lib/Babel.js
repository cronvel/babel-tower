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



function Babel() { throw new Error( 'Use Babel.create() instead' ) ; }
module.exports = Babel ;

var Word = require( './Word.js' ) ;
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



Babel.prototype.solveArray = function solveArray( sentenceKey , array , ctx )
{
	if ( this.db[ this.locale ].sentence[ sentenceKey ] ) { sentenceKey = this.db[ this.locale ].sentence[ sentenceKey ] ; }
	return this.format( sentenceKey , array , ctx ) ;
} ;



Babel.prototype.solveHash = function solveHash( sentenceKey , hash , ctx )
{
	if ( this.db[ this.locale ].sentence[ sentenceKey ] ) { sentenceKey = this.db[ this.locale ].sentence[ sentenceKey ] ; }
	return this.format( sentenceKey , hash , ctx ) ;
} ;



Babel.interoOp = {
	n : "altn" ,
	n0 : "altn0" ,
	g : "altg" ,
	ng : "altng" ,
	n0g : "altn0g"
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

Babel.prototype.format = function format( str , args , ctxArg )
{
	var self = this , k , i , iMax , argsIsArray , fn ;
	
	if ( ! args || typeof args !== 'object' ) { args = [ args ] ; }
	
	argsIsArray = Array.isArray( args ) ;
	
	//console.log( "Args:" , args ) ;
	
	//str = str.replace( /\$(?:\$|([a-zA-Z0-9_-]+)(?:\[([^\]]*)\])?)/g ,
	str = str.replace( /\$(?:\$|([a-zA-Z0-9_-]*)(?:\[((?:\[[^\]]*\]|[^\]])*)\])?)/g ,
		function( fullMatch , index , ops ) {		// jshint ignore:line
			
			var arg , op , opArgs , matches , opCount = 0 , i , iMax , j , jMax , str ;
			
			if ( fullMatch === '$$' ) { return '$'; }
			
			
			// First, create a local copy... never alter the original argument!
			if ( ! index )
			{
				arg = ctxArg !== undefined ? Word.create( ctxArg , undefined , self ) : Word.create( '(undefined)' , undefined , self ) ;
			}
			else
			{
				if ( argsIsArray ) { index = parseInt( index ) - 1 ; }
				arg = index in args ? Word.create( args[ index ] , undefined , self ) : Word.create( '(undefined)' , undefined , self ) ;
			}
			
			//console.log( "Arg:" , arg ) ;
			
			if ( ! ops ) { return arg.solve( self ) ; }
			
			ops = ops.split( '/' ) ;
			
			for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ )
			{
				if ( ops[ i ] === '' ) { break ; }	// switch to filters
				
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
						if ( Array.isArray( arg ) ) { break ; }
						arg.extend( op , opArgs ) ;
						break ;
					
					case 'altn0' :
						//if ( Array.isArray( arg ) ) { arg = Word.create( { n: arg.length } ) ; }
						if ( Array.isArray( arg ) ) { arg = self.arrayToN( arg ) ; }
						arg.extend( 'nOffset' , 0 ) ;
						arg.extend( 'altn' , opArgs ? opArgs.split( '|' ) : [] ) ;
						break ;
						
					case 'altn' :
						//if ( Array.isArray( arg ) ) { arg = Word.create( { n: arg.length } ) ; }
						if ( Array.isArray( arg ) ) { arg = self.arrayToN( arg ) ; }
						arg.extend( 'altn' , opArgs ? opArgs.split( '|' ) : [] ) ;
						break ;
					
					case 'altg' :
						if ( Array.isArray( arg ) ) { break ; }
						arg.extend( 'altg' , opArgs ? opArgs.split( '|' ) : [] ) ;
						break ;
					
					case 'altn0g' :
						// altng format: (xxx|xxx)|(xxx|xxx)...
						//if ( Array.isArray( arg ) ) { arg = Word.create( { n: arg.length } ) ; }
						if ( Array.isArray( arg ) ) { arg = self.arrayToN( arg ) ; }
						arg.extend( 'nOffset' , 0 ) ;
						opArgs = opArgs ? opArgs.split( ')|(' ) : [] ;
						
						if ( opArgs.length )
						{
							opArgs[ 0 ] = opArgs[ 0 ].slice( 1 ) ;	// remove the first parens '('
							opArgs[ opArgs.length - 1 ] = opArgs[ opArgs.length - 1 ].slice( 0 , -1 ) ;	// remove the last parens ')'
							for ( j = 0 , jMax = opArgs.length ; j < jMax ; j ++ ) { opArgs[ j ] = opArgs[ j ].split( '|' ) ; }
						}
						
						arg.extend( 'altng' , opArgs ) ;
						
						break ;
						
					case 'altng' :
						// altng format: (xxx|xxx)|(xxx|xxx)...
						//if ( Array.isArray( arg ) ) { arg = Word.create( { n: arg.length } ) ; }
						if ( Array.isArray( arg ) ) { arg = self.arrayToN( arg ) ; }
						opArgs = opArgs ? opArgs.split( ')|(' ) : [] ;
						
						if ( opArgs.length )
						{
							opArgs[ 0 ] = opArgs[ 0 ].slice( 1 ) ;	// remove the first parens '('
							opArgs[ opArgs.length - 1 ] = opArgs[ opArgs.length - 1 ].slice( 0 , -1 ) ;	// remove the last parens ')'
							for ( j = 0 , jMax = opArgs.length ; j < jMax ; j ++ ) { opArgs[ j ] = opArgs[ j ].split( '|' ) ; }
						}
						
						arg.extend( 'altng' , opArgs ) ;
						
						break ;
						
					case 'enum' :
						// enum are recursive, so we should avoid splitting a '|' inside brackets
						opArgs = opArgs ? opArgs.split( /\|(?![^\[]*\])/ ) : [] ;
						arg = Word.create( { s: self.solveEnum( opArgs , arg , args ) } ) ;
						break ;
						
					case 'nw' :
						//if ( Array.isArray( arg ) ) { arg = Word.create( { n: arg.length } ) ; }
						if ( Array.isArray( arg ) ) { arg = self.arrayToN( arg ) ; }
						fn = self.db[ self.locale ].fn[ op ] ;
						if ( fn ) { arg = Word.create( fn( arg ) ) ; }
						break ;
						
					default :
						fn = self.db[ self.locale ].fn[ op ] ;
						
						if ( typeof fn === 'function' )
						{
							arg = Word.create( fn( arg ) ) ;
						}
						else if ( typeof fn === 'object' )
						{
							arg.extend( fn ) ;
						}
						
						break ;
				}
				//console.log( "Arg after:" , arg ) ;
			}
			
			str = Array.isArray( arg ) ? '' : arg.solve( self ) ;
			
			if ( ! str ) { return str ; }
			
			// Post-filters
			for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ )
			{
				switch ( ops[ i ] )
				{
					case 'uc1' :
						str = str[ 0 ].toUpperCase() + str.slice( 1 ) ;
						break ;
				}
			}
			
			return str ;
		}
	) ;
	
	return str ;
} ;



Babel.prototype.solveEnum = function solveEnum( enum_ , items , args )
{
	var i , iMax , index , str = '' ;
	
	if ( ! enum_.length )
	{
		// By default, join with a space
		for ( i = 0 , iMax = items.length ; i < iMax ; i ++ )
		{
			if ( i > 0 ) { str += ' '; }
			str += items[ i ].solve( this ) ;
			//console.log( 'str:' , str ) ;
		}
		
		return str ;
	}
	
	if ( ! items.length )
	{
		return this.solve( enum_[ 0 ] ) ;
	}
	
	for ( i = 0 , iMax = items.length ; i < iMax ; i ++ )
	{
		if ( i === 0 ) { index = 1 ; }
		else if ( i === iMax - 1 ) { index = 3 ; }
		else { index = 2 ; }
		
		index = Math.min( index , enum_.length - 1 ) ;
		
		//console.log( 'enum #' + index + ':' , enum_[ index ] ) ;
		str += this.solveArray( enum_[ index ] , args , items[ i ] ) ;
	}
	
	return str ;
} ;



Babel.prototype.arrayToN = function arrayToN( array )
{
	var i , iMax , count = 0 , n ;
	
	for ( i = 0 , iMax = array.length ; i < iMax ; i ++ )
	{
		n = array[ i ].n ;
		
		if ( n === undefined ) { count ++ ; }
		else if ( n === 'many' ) { count = 'many' ; break ; }
		else { count += + n || 0 ; }
	}
	
	return Word.create( { n: count } ) ;
} ;


