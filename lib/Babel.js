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
var escape = require( './escape.js' ) ;



function Babel() { throw new Error( 'Use Babel.create() instead' ) ; }
module.exports = Babel ;

var Element = Babel.Element = require( './Element.js' ) ;
var Sentence = Babel.Sentence = require( './Sentence.js' ) ;
var postFilters = require( './postFilters.js' ) ;



Babel.create = function create( autoEscape ) {
	var babel = Object.create( Babel.prototype , {
		db: { value: {} , enumerable: true } ,
		locale: {
			value: null , enumerable: true , writable: true
		} ,
		autoEscape: {
			value: ( autoEscape instanceof RegExp ) && autoEscape.substitution ? autoEscape : null ,
			enumerable: true ,
			writable: true
		}
	} ) ;

	babel.setLocale() ;

	return babel ;
} ;



Babel.prototype.initLocale = function initLocale( locale ) {
	var defaultEnum = [
		new Sentence( '' , this ) ,
		new Sentence( '$' , this ) ,
		new Sentence( ' $' , this )
	] ;

	this.db[ locale ] = {
		undefinedString: '(undefined)' ,
		defaultEnum: defaultEnum ,
		nOffset: -1 ,	// Default offset for 'n' (number) for all languages, unless redefined
		gIndex: {
			m: 0 , f: 1 , n: 2 , h: 3
		} ,	// Default index for 'g' (gender) for all languages, unless redefined
		functions: {} ,
		sentences: {} ,
		elements: {}
	} ;
} ;



Babel.prototype.setLocale = function setLocale( locale ) {
	if ( ! locale ) { locale = 'none' ; }
	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }
	this.locale = locale ;
} ;



Babel.prototype.use = function use( locale ) {
	var babel = Object.create( this ) ;
	babel.setLocale( locale ) ;
	return babel ;
} ;



Babel.prototype.extend = function extend_( db ) {
	var locale ;

	for ( locale in db ) {
		this.extendLocale( locale , db[ locale ] ) ;
	}
} ;



Babel.prototype.extendCurrentLocale = function extendCurrentLocale( localeDb ) {
	this.extendLocale( this.locale , localeDb ) ;
} ;



Babel.prototype.extendLocale = function extendLocale( locale , localeDb ) {
	var k ;

	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }

	if ( typeof localeDb.undefinedString === 'string' ) { this.db[ locale ].undefinedString = localeDb.undefinedString ; }
	if ( Array.isArray( localeDb.defaultEnum ) ) { this.db[ locale ].defaultEnum = localeDb.defaultEnum ; }
	if ( typeof localeDb.nOffset === 'number' ) { this.db[ locale ].nOffset = localeDb.nOffset ; }
	if ( localeDb.gIndex && typeof localeDb.gIndex === 'object' ) { this.db[ locale ].gIndex = localeDb.gIndex ; }

	for ( k in localeDb.functions ) {
		this.db[ locale ].functions[ k ] = localeDb.functions[ k ] ;
	}

	for ( k in localeDb.sentences ) {
		this.db[ locale ].sentences[ k ] = typeof localeDb.sentences[ k ] === 'string' ?
			new Sentence( localeDb.sentences[ k ] , this ) :
			localeDb.sentences[ k ] ;
	}

	for ( k in localeDb.elements ) {
		this.db[ locale ].elements[ k ] = localeDb.elements[ k ] instanceof Element ?
			localeDb.elements[ k ] :
			new Element( localeDb.elements[ k ] ) ;
	}
} ;



Babel.prototype.render =
Babel.prototype.solve = function solve( str , ... args ) {
	return ( new Sentence( str , this ) ).solveWithBabel( this , ... args ) ;
} ;



Babel.prototype.solveArray = function solveArray( sentenceKey , array , ctx ) {
	if ( this.db[ this.locale ].sentences[ sentenceKey ] ) { sentenceKey = this.db[ this.locale ].sentences[ sentenceKey ] ; }
	return this.format( sentenceKey , array , ctx ) ;
} ;



// Alternative operator form
Babel.altOp = {
	"n?": "altn" ,
	"n0?": "altn0" ,
	"g?": "altg" ,
	"ng?": "altng" ,
	"n0g?": "altn0g" ,
	"default": "d"
} ;



// The regexp used by .format()
var formatRegexp = /\$\$|\$(#|[0-9]*)(?:\{([^/ {}\x00-\x1f\x7f]*)(?:\/\/([a-zA-Z0-9/:]*))?\})?(?:\[((?:\\.|\[[^\]]*\]|[^\]])*)\])?( *)/g ;



// /!\ Some code are shared with Element.parse() (regexp and operators) /!\
Babel.prototype.format = function format( str , args , ctxArg ) {
	var fn , lastArg ;

	if ( ! Array.isArray( args ) ) { args = [ args ] ; }

	lastArg = args[ 0 ] ;

	str = str.replace( formatRegexp , ( fullMatch , index , path , inPathFilters , ops , trailingSpaces ) => {

		var arg , op , opArgs , opVar , filters , matches , i , iMax , str_ , tmp ;

		if ( fullMatch === '$$' ) { return '$' ; }

		if ( index || path ) {
			if ( index === '#' ) { arg = ctxArg ; }
			else { arg = args[ ( parseInt( index , 10 ) - 1 ) || 0 ] ; }

			if ( path ) { arg = treePath.get( arg , path ) ; }

			lastArg = arg ;
		}
		else {
			arg = lastArg ;
		}

		// Kung-Fig compatibility
		if ( arg && typeof arg === 'object' && arg.__isDynamic__ && ! ( arg instanceof Element ) ) {
			arg = arg.getRecursiveFinalValue( args[ 0 ] ) ;
		}

		// Create a local copy... never alter the original argument!
		arg = Element.create( arg , this ) ;

		filters = inPathFilters ? inPathFilters.split( '/' ) : [] ;

		if ( ops ) {
			//tmp = ops.split( '//' ) ;
			tmp = escape.split( ops , '//' ) ;

			//ops = tmp[ 0 ].split( '/' ) ;
			ops = escape.split( tmp[ 0 ] , '/' ) ;

			if ( tmp[ 1 ] ) { filters = filters.concat( tmp[ 1 ].split( '/' ) ) ; }
		}
		else {
			ops = [] ;
		}


		for ( i = 0 , iMax = ops.length ; i < iMax ; i ++ ) {
			//if ( ops[ i ] === '' ) { i ++ ; break ; }	// switch to filters

			matches = ops[ i ].match( /^(?:([a-zA-Z0-9_-]+)(?:(:|\?)(.+))?|\$(#|[0-9]*)(?::([%$a-zA-Z0-9_.[\]-]*))?)$/ ) ;

			if ( ! matches ) { continue ; }	// Throw an error?

			if ( matches[ 4 ] !== undefined ) {
				// The operator is a reference, extend the current arg with the pointed object
				if ( matches[ 4 ] === '#' ) { opVar = ctxArg ; }
				else { opVar = args[ ( parseInt( matches[ 4 ] , 10 ) - 1 ) || 0 ] ; }

				if ( matches[ 5 ] ) { opVar = treePath.get( opVar , matches[ 5 ] ) ; }

				arg.extend( opVar ) ;

				continue ;
			}

			op = matches[ 1 ] ;
			if ( matches[ 2 ] === '?' ) { op += '?' ; }
			if ( Babel.altOp[ op ] ) { op = Babel.altOp[ op ] ; }

			opArgs = matches[ 3 ] ;

			switch ( op ) {
				case 't' :
				case 's' :
				case 'n' :
				case 'g' :
				case 'um' :
				case 'd' :
					if ( Array.isArray( arg ) ) { break ; }
					arg.extend( op , opArgs , true ) ;
					break ;

				case 'altn0' :
					//if ( Array.isArray( arg ) ) { arg = Element.create( { n: arg.length } ) ; }
					if ( Array.isArray( arg ) ) { arg = Babel.arrayToN( arg ) ; }
					arg.extend( 'nOffset' , 0 , true ) ;
					//arg.extend( 'altn' , opArgs ? opArgs.split( '|' ) : [] , true ) ;
					arg.extend( 'altn' , opArgs ? escape.split( opArgs , '|' ) : [] , true ) ;
					break ;

				case 'altn' :
					//if ( Array.isArray( arg ) ) { arg = Element.create( { n: arg.length } ) ; }
					if ( Array.isArray( arg ) ) { arg = Babel.arrayToN( arg ) ; }
					//arg.extend( 'altn' , opArgs ? opArgs.split( '|' ) : [] , true ) ;
					arg.extend( 'altn' , opArgs ? escape.split( opArgs , '|' ) : [] , true ) ;
					break ;

				case 'altg' :
					if ( Array.isArray( arg ) ) { break ; }
					//arg.extend( 'altg' , opArgs ? opArgs.split( '|' ) : [] , true ) ;
					arg.extend( 'altg' , opArgs ? escape.split( opArgs , '|' ) : [] , true ) ;
					break ;

				case 'altn0g' :
					// altng format: (xxx|xxx)|(xxx|xxx)...
					//if ( Array.isArray( arg ) ) { arg = Element.create( { n: arg.length } ) ; }
					if ( Array.isArray( arg ) ) { arg = Babel.arrayToN( arg ) ; }
					arg.extend( 'nOffset' , 0 , true ) ;
					opArgs = Babel.parseArrayOfArray( opArgs ) ;
					arg.extend( 'altng' , opArgs , true ) ;
					break ;

				case 'altng' :
					// altng format: (xxx|xxx)|(xxx|xxx)...
					//if ( Array.isArray( arg ) ) { arg = Element.create( { n: arg.length } ) ; }
					if ( Array.isArray( arg ) ) { arg = Babel.arrayToN( arg ) ; }
					opArgs = Babel.parseArrayOfArray( opArgs ) ;
					arg.extend( 'altng' , opArgs , true ) ;
					break ;

				case 'uv' :
					if ( Array.isArray( arg ) ) { break ; }
					//arg.extend( 'uv' , opArgs ? opArgs.split( '|' ) : [] , true ) ;
					arg.extend( 'uv' , opArgs ? escape.split( opArgs , '|' ) : [] , true ) ;
					break ;

				case 'uf' :
					// uf are recursive, so we should avoid splitting a '|' inside brackets
					if ( Array.isArray( arg ) ) { break ; }
					//arg.extend( op , opArgs ? opArgs.split( /\|(?![^[]*\])/ ) : [] , true ) ;
					arg.extend( op , opArgs ? escape.split( opArgs , '|nested' ) : [] , true ) ;
					break ;

				case 'uenum' :
					// uenum are recursive, so we should avoid splitting a '|' inside brackets
					if ( Array.isArray( arg ) ) { break ; }
					//arg.extend( op , opArgs ? opArgs.split( /\|(?![^[]*\])/ ) : [] , true ) ;
					arg.extend( op , opArgs ? escape.split( opArgs , '|nested' ) : [] , true ) ;
					break ;

				case 'enum' :
					// enum are recursive, so we should avoid splitting a '|' inside brackets
					//opArgs = opArgs ? opArgs.split( /\|(?![^[]*\])/ ) : [] ;
					opArgs = opArgs ? escape.split( opArgs , '|nested' ) : [] ;
					arg = Element.create( { s: this.solveEnum( opArgs , arg , args ) } ) ;
					break ;

				case 'nw' :
					//if ( Array.isArray( arg ) ) { arg = Element.create( { n: arg.length } ) ; }
					if ( Array.isArray( arg ) ) { arg = Babel.arrayToN( arg ) ; }
					fn = this.db[ this.locale ].functions[ op ] ;
					if ( fn ) { arg = Element.create( fn( arg ) ) ; }
					break ;

				default :
					fn = this.db[ this.locale ].functions[ op ] ;

					if ( typeof fn === 'function' ) {
						if ( fn.arrayOfArray ) {
							// altng format: (xxx|xxx)|(xxx|xxx)...
							opArgs = Babel.parseArrayOfArray( opArgs ) ;
						}
						else {
							//opArgs = opArgs ? opArgs.split( '|' ) : [] ;
							opArgs = opArgs ? escape.split( opArgs , '|' ) : [] ;
						}

						arg = Element.create( fn( arg , opArgs ) ) ;
					}
					else if ( typeof fn === 'object' ) {
						arg.extend( fn ) ;
					}

					break ;
			}
		}


		if ( Array.isArray( arg ) ) {
			str_ = '' ;
		}
		else {
			str_ = arg.solve( this ) ;
			if ( typeof arg.sp === 'string' ) { trailingSpaces = arg.sp ; }
		}


		if ( ! str_ ) { return trailingSpaces ; }


		// Post-filters
		for ( i = 0 , iMax = filters.length ; i < iMax ; i ++ ) {
			if ( postFilters[ filters[ i ] ] ) { str_ = postFilters[ filters[ i ] ]( str_ ) ; }
		}

		if ( this.autoEscape ) {
			str_ = str_.replace( this.autoEscape , this.autoEscape.substitution ) ;
		}

		return str_ + trailingSpaces ;
	} ) ;

	return str ;
} ;



Babel.getNamedVars = function getNamedVars( str ) {
	var matches , namedVars = new Set() ;

	// Reset the regexp
	formatRegexp.lastIndex = 0 ;

	while ( ( matches = formatRegexp.exec( str ) ) !== null ) {
		//if ( matches[ 0 ] === '$$' ) { continue ; }	// useless
		if ( matches[ 2 ] ) { namedVars.add( matches[ 2 ] ) ; }
	}

	// Reset the regexp, again...
	formatRegexp.lastIndex = 0 ;

	return [ ... namedVars ] ;
} ;



Babel.prototype.solveEnum = function solveEnum( enum_ , items , args ) {
	var i , iMax , index , str = '' ;

	if ( ! enum_ || ! enum_.length ) { enum_ = [ '' , '$#' , ' $#' ] ; }

	if ( ! Array.isArray( items ) ) { items = [ items ] ; }
	else if ( ! items.length ) { return this.solve( enum_[ 0 ] ) ; }

	for ( i = 0 , iMax = items.length ; i < iMax ; i ++ ) {
		if ( i === 0 ) { index = 1 ; }
		else if ( i === iMax - 1 ) { index = 3 ; }
		else { index = 2 ; }

		index = Math.min( index , enum_.length - 1 ) ;

		str += this.solveArray( enum_[ index ] , args , items[ i ] ) ;
	}

	return str ;
} ;



Babel.parseArrayOfArray = function parseArrayOfArray( arrayOfArray ) {
	var i , iMax ;

	//arrayOfArray = arrayOfArray ? arrayOfArray.split( ')|(' ) : [] ;
	arrayOfArray = arrayOfArray ? escape.split( arrayOfArray , ')|(' ) : [] ;

	if ( arrayOfArray.length ) {
		arrayOfArray[ 0 ] = arrayOfArray[ 0 ].slice( 1 ) ;	// remove the first parens '('
		arrayOfArray[ arrayOfArray.length - 1 ] = arrayOfArray[ arrayOfArray.length - 1 ].slice( 0 , -1 ) ;	// remove the last parens ')'

		for ( i = 0 , iMax = arrayOfArray.length ; i < iMax ; i ++ ) {
			//arrayOfArray[ i ] = arrayOfArray[ i ].split( '|' ) ;
			arrayOfArray[ i ] = escape.split( arrayOfArray[ i ] , '|' ) ;
		}
	}

	return arrayOfArray ;
} ;



// DEPRECATED
Babel.arrayToN = function arrayToN( array ) {
	var i , iMax , count = 0 , n ;

	for ( i = 0 , iMax = array.length ; i < iMax ; i ++ ) {
		n = array[ i ].n ;

		if ( n === undefined ) { count ++ ; }
		else if ( n === 'many' ) { count = 'many' ; break ; }
		else { count += + n || 0 ; }
	}

	return Element.create( { n: count } ) ;
} ;



// Useful for Sentence constructor, when no Babel instances are given
Babel.default = Babel.create() ;

