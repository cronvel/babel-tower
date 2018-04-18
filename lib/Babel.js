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



function Babel( autoEscape ) {
	Object.defineProperties( this , {
		db: { value: {} , enumerable: true } ,
		locale: { value: null , enumerable: true , writable: true } ,
		autoEscape: {
			value: ( autoEscape instanceof RegExp ) && autoEscape.substitution ? autoEscape : null ,
			enumerable: true ,
			writable: true
		}
	} ) ;

	this.setLocale() ;
}

module.exports = Babel ;



var Atom = Babel.Atom = require( './Atom.js' ) ;
Babel.Element = Atom ;	// Backward compatibility
var Sentence = Babel.Sentence = require( './Sentence.js' ) ;



// For backward compatibility
Babel.create = function create( autoEscape ) { return new Babel( autoEscape ) ; } ;



Babel.prototype.initLocale = function initLocale( locale ) {
	var defaultEnum = [
		new Sentence( '' , this ) ,
		new Sentence( '$' , this ) ,
		new Sentence( ' $' , this )
	] ;

	this.db[ locale ] = {
		undefinedString: '(undefined)' ,
		trueString: 'true' ,
		falseString: 'false' ,
		defaultEnum: defaultEnum ,
		nOffset: -1 ,	// Default offset for 'n' (number) for all languages, unless redefined
		// Default index for 'g' (gender) for all languages, unless redefined
		propertyIndexes: {
			g: {
				m: 0 , f: 1 , n: 2 , h: 3 , default: 2
			} ,
			// Default index for 'p' (person) for all languages, unless redefined
			p: {
				'1': 0 , '2': 1 , '3': 2 , '1st': 0 , '2nd': 1 , '3rd': 2 , default: 2
			} ,
			// Default index for 'u' (noun type -- Unique) for all languages, unless redefined
			u: {
				'c': 0 , 'p': 1 , 'common': 0 , 'proper': 1 , default: 0
			}
		} ,
		functions: {} ,
		sentences: {} ,
		atoms: {}
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



// /!\ DEPRECATED, use .extendLocale( localeDb )
Babel.prototype.extendCurrentLocale = function extendCurrentLocale( localeDb ) {
	this.extendLocale( this.locale , localeDb ) ;
} ;




// .extendLocale( [locale=this.locale] , localeDb )
Babel.prototype.extendLocale = function extendLocale( locale , localeDb ) {
	var k ;

	// Manage arguments
	if ( ! localeDb ) {
		localeDb = locale ;
		locale = this.locale ;
	}

	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }

	if ( typeof localeDb.undefinedString === 'string' ) { this.db[ locale ].undefinedString = localeDb.undefinedString ; }
	if ( typeof localeDb.trueString === 'string' ) { this.db[ locale ].trueString = localeDb.trueString ; }
	if ( typeof localeDb.falseString === 'string' ) { this.db[ locale ].falseString = localeDb.falseString ; }
	if ( typeof localeDb.nOffset === 'number' ) { this.db[ locale ].nOffset = localeDb.nOffset ; }

	if ( Array.isArray( localeDb.defaultEnum ) ) {
		this.db[ locale ].defaultEnum = localeDb.defaultEnum.map( e => e instanceof Sentence ? e : new Sentence( e ) ) ;
	}

	for ( k in localeDb.propertyIndexes ) {
		this.db[ locale ].propertyIndexes[ k ] = localeDb.propertyIndexes[ k ] ;
	}

	for ( k in localeDb.functions ) {
		this.db[ locale ].functions[ k ] = typeof localeDb.functions[ k ] === 'string' ?
			Atom.parse( localeDb.functions[ k ] ) :
			localeDb.functions[ k ] ;
	}

	for ( k in localeDb.sentences ) {
		this.db[ locale ].sentences[ k ] = typeof localeDb.sentences[ k ] === 'string' ?
			new Sentence( localeDb.sentences[ k ] , this ) :
			localeDb.sentences[ k ] ;
	}

	for ( k in localeDb.atoms ) {
		if ( localeDb.atoms[ k ] instanceof Atom ) {
			this.db[ locale ].atoms[ k ] = localeDb.atoms[ k ] ;
		}
		else {
			this.db[ locale ].atoms[ k ] = typeof localeDb.atoms[ k ] === 'string' ?
				Atom.parse( localeDb.atoms[ k ] ) :
				new Atom( localeDb.atoms[ k ] ) ;
		}
	}
} ;



// Adhoc rendering
Babel.prototype.render =
Babel.prototype.solve = function solve( str , ... args ) {
	return ( new Sentence( str , this ) ).solveWithBabel( this , ... args ) ;
} ;



// Adhoc variable names
Babel.getNamedVars = function getNamedVars( str ) {
	return ( new Sentence( str ) ).getNamedVars() ;
} ;



// Useful for Sentence constructor, when no Babel instances are given
Babel.default = new Babel() ;

