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



var treePath = require( 'tree-kit/lib/path.js' ) ;



function Babel() { throw new Error( 'Use Babel.create() instead' ) ; }
module.exports = Babel ;

var Word = Babel.Word = require( './Word.js' ) ;
var Sentence = Babel.Sentence = require( './Sentence.js' ) ;
var postFilters = require( './postFilters.js' ) ;



Babel.create = function create( autoEscape )
{
	var babel = Object.create( Babel.prototype , {
		db: { value: {} , enumerable: true } ,
		locale: { value: null , enumerable: true , writable: true } ,
		autoEscape: { value: ( autoEscape instanceof RegExp ) && autoEscape.substitution ? autoEscape : null , enumerable: true , writable: true }
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



// Alternative operator form
Babel.altOp = {
	"n?" : "altn" ,
	"n0?" : "altn0" ,
	"g?" : "altg" ,
	"ng?" : "altng" ,
	"n0g?" : "altn0g"
} ;



Babel.prototype.format = function format( str , args , ctxArg )
{
	var self = this , fn , hasMarkup = false ;
	
	if ( ! Array.isArray( args ) ) { args = [ args ] ; }
	
	//console.log( "Args:" , args ) ;
	
	//str = str.replace( /\$(?:\$|([a-zA-Z0-9_-]*)(?:\[((?:\[[^\]]*\]|[^\]])*)\])?( *))/g ,
	//str = str.replace( /\$\$|\$(?:(#|[0-9]*)(?:\{([%$a-zA-Z0-9_.\[\]-]*)(?:\/\/([a-zA-Z0-9\/]*))?\})?(?:\[((?:\[[^\]]*\]|[^\]])*)\])?( *))|(%%|%[0-9+-]*(?:\/[^\/]*\/)?[a-zA-Z]|%\[[^\]]\]|\^.?)/g ,
	//str = str.replace( /\$\$|\$(#|[0-9]*)(?:\{([%$a-zA-Z0-9_.\[\]-]*)(?:\/\/([a-zA-Z0-9\/]*))?\})?(?:\[((?:\[[^\]]*\]|[^\]])*)\])?( *)|(%%|%[0-9+-]*(?:\/[^\/]*\/)?[a-zA-Z]|%\[[^\]]\]|\^.?)/g ,
	str = str.replace( /\$\$|\$(#|[0-9]*)(?:\{([%$a-zA-Z0-9_.\[\]-]*)(?:\/\/([a-zA-Z0-9\/]*))?\})?(?:\[((?:\[[^\]]*\]|[^\]])*)\])?( *)/g ,
		function( fullMatch , index , path , inPathFilters , ops , trailingSpaces ) {		// jshint ignore:line
			
			var arg , baseArg , op , opArgs , filters , matches , opCount = 0 , i , iMax , str , tmp ;
			
			if ( fullMatch === '$$' ) { return '$' ; }
			
			// Create a local copy... never alter the original argument!
			if ( index === '#' ) { arg = ctxArg ; }
			else { arg = args[ ( parseInt( index ) - 1 ) || 0 ] ; }
			
			baseArg = arg ;
			
			if ( path ) { arg = treePath.get( arg , path ) ; }
			
			// Kung-Fig compatibility
			if ( arg.__isDynamic__ ) { arg = arg.getRecursiveFinalValue( baseArg ) ; }
			
			arg = arg !== undefined ? Word.create( arg , undefined , self ) : Word.create( '(undefined)' , undefined , self ) ;
			
			//console.log( "Arg:" , arg ) ;
			
			filters = inPathFilters ? inPathFilters.split( '/' ) : [] ;
			
			if ( ops )
			{
				tmp = ops.split( '//' ) ;
				ops = tmp[ 0 ].split( '/' ) ;
				if ( tmp[ 1 ] ) { filters = filters.concat( tmp[ 1 ].split( '/' ) ) ; }
			}
			else
			{
				ops = [] ;
			}
			
			
			for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ )
			{
				//if ( ops[ i ] === '' ) { i ++ ; break ; }	// switch to filters
				
				matches = ops[ i ].match( /^([a-zA-Z0-9_-]+)(?:(:|\?)(.+))?$/ ) ;
				
				if ( ! matches ) { continue ; }	// Throw an error?
				
				op = matches[ 1 ] ;
				if ( matches[ 2 ] === '?' ) { op += '?' ; }
				if ( Babel.altOp[ op ] ) { op = Babel.altOp[ op ] ; }
				
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
						opArgs = self.parseArrayOfArray( opArgs ) ;
						arg.extend( 'altng' , opArgs ) ;
						break ;
						
					case 'altng' :
						// altng format: (xxx|xxx)|(xxx|xxx)...
						//if ( Array.isArray( arg ) ) { arg = Word.create( { n: arg.length } ) ; }
						if ( Array.isArray( arg ) ) { arg = self.arrayToN( arg ) ; }
						opArgs = self.parseArrayOfArray( opArgs ) ;
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
							if ( fn.arrayOfArray )
							{
								// altng format: (xxx|xxx)|(xxx|xxx)...
								opArgs = self.parseArrayOfArray( opArgs ) ;
							}
							else
							{
								opArgs = opArgs ? opArgs.split( '|' ) : [] ;
							}
							
							arg = Word.create( fn( arg , opArgs ) ) ;
						}
						else if ( typeof fn === 'object' )
						{
							arg.extend( fn ) ;
						}
						
						break ;
				}
				//console.log( "Arg after:" , arg ) ;
			}
			
			
			if ( Array.isArray( arg ) )
			{
				str = '' ;
			}
			else
			{
				str = arg.solve( self ) ;
				if ( typeof arg.sp === 'string' ) { trailingSpaces = arg.sp ; }
			}
			
			
			if ( ! str ) { return trailingSpaces ; }
			
			
			// Post-filters
			for ( i = 0 , iMax = filters.length ; i < iMax ; i ++ )
			{
				if ( postFilters[ filters[ i ] ] ) { str = postFilters[ filters[ i ] ]( str ) ; }
			}
			
			if ( self.autoEscape )
			{
				str = str.replace( self.autoEscape , self.autoEscape.substitution ) ;
			}
			
			return str + trailingSpaces ;
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



Babel.prototype.parseArrayOfArray = function parseArrayOfArray( arrayOfArray )
{
	var i , iMax ;
	
	arrayOfArray = arrayOfArray ? arrayOfArray.split( ')|(' ) : [] ;
	
	if ( arrayOfArray.length )
	{
		arrayOfArray[ 0 ] = arrayOfArray[ 0 ].slice( 1 ) ;	// remove the first parens '('
		arrayOfArray[ arrayOfArray.length - 1 ] = arrayOfArray[ arrayOfArray.length - 1 ].slice( 0 , -1 ) ;	// remove the last parens ')'
		
		for ( i = 0 , iMax = arrayOfArray.length ; i < iMax ; i ++ )
		{
			arrayOfArray[ i ] = arrayOfArray[ i ].split( '|' ) ;
		}
	}
	
	return arrayOfArray ;
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



// Useful for Sentence constructor, when no Babel instances are given
Babel.default = Babel.create() ;
