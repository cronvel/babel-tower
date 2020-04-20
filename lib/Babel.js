/*
	Babel Tower

	Copyright (c) 2016 - 2020 Cédric Ronvel

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



const Atom = Babel.Atom = require( './Atom.js' ) ;
Babel.Element = Atom ;	// Backward compatibility
const Sentence = Babel.Sentence = require( './Sentence.js' ) ;



// For backward compatibility
Babel.create = function( autoEscape ) { return new Babel( autoEscape ) ; } ;



Babel.prototype.initLocale = function( locale ) {
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
		propertyIndexes: {
			// Default index for 'g' (gender) for all languages, unless redefined
			g: {
				m: 0 , f: 1 , n: 2 , h: 3 , default: 2
			} ,
			// Default index for 'p' (person) for all languages, unless redefined
			p: {
				'1': 0 , '2': 1 , '3': 2 , default: 2
			} ,
			// Default index for 'a' (article) for all languages, unless redefined
			a: {
				i: 0 ,
				d: 1 ,
				p: 2 ,
				P: 3 ,
				z: 4 ,
				default: 4
			}
		} ,
		functions: {} ,
		sentences: new Map() ,
		atoms: new Map()
	} ;
} ;



Babel.prototype.setLocale = function( locale ) {
	if ( ! locale ) { locale = 'none' ; }
	if ( ! this.db[ locale ] ) { this.initLocale( locale ) ; }
	this.locale = locale ;
} ;



Babel.prototype.use = function( locale ) {
	var babel = Object.create( this ) ;
	babel.setLocale( locale ) ;
	return babel ;
} ;



Babel.prototype.extend = function( db ) {
	var locale ;

	for ( locale in db ) {
		this.extendLocale( locale , db[ locale ] ) ;
	}
} ;



// .extendLocale( [locale=this.locale] , localeDb )
Babel.prototype.extendLocale = function( locale , localeDb ) {
	var k , from , to ;

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


	// 'from' should be a string, while 'to' should be a Sentence instance
	if ( localeDb.sentences instanceof Map ) {
		for ( [ from , to ] of localeDb.sentences ) {
			if ( from instanceof Sentence ) { from = from.key ; }
			if ( ! ( to instanceof Sentence ) ) { to = new Sentence( to , this ) ; }
			this.db[ locale ].sentences.set( from , to ) ;
		}
	}
	else {
		for ( from in localeDb.sentences ) {
			to = localeDb.sentences[ from ] ;
			if ( ! ( to instanceof Sentence ) ) { to = new Sentence( to , this ) ; }
			this.db[ locale ].sentences.set( from , to ) ;
		}
	}


	if ( localeDb.atoms instanceof Map ) {
		for ( [ from , to ] of localeDb.atoms ) {
			if ( from instanceof Atom ) { from = from.k ; }
			if ( ! ( to instanceof Atom ) ) {
				if ( typeof to === 'string' ) { to = Atom.parse( to ) ; }
				else { to = new Atom( to ) ; }
			}

			this.db[ locale ].atoms.set( from , to ) ;
		}
	}
	else {
		for ( from in localeDb.atoms ) {
			to = localeDb.atoms[ from ] ;

			if ( ! ( to instanceof Atom ) ) {
				if ( typeof to === 'string' ) { to = Atom.parse( to ) ; }
				else { to = new Atom( to ) ; }
			}

			this.db[ locale ].atoms.set( from , to ) ;
		}
	}
} ;



// Adhoc rendering
Babel.prototype.render =
Babel.prototype.solve = function( str , ... args ) {
	return ( new Sentence( str , this ) ).solveWithBabel( this , ... args ) ;
} ;



// Adhoc variable names
Babel.getNamedVars = function( str ) {
	return ( new Sentence( str ) ).getNamedVars() ;
} ;



// Useful for Sentence constructor, when no Babel instances are given
Babel.default = new Babel() ;

