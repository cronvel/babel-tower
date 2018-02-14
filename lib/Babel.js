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



var escape = require( './escape.js' ) ;
var postFilters = require( './postFilters.js' ) ;



function Babel( autoEscape ) {
	Object.defineProperties( this , {
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

	this.setLocale() ;
}

module.exports = Babel ;



var Element = Babel.Element = require( './Element.js' ) ;
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



// /!\ To be refactored
var formatRegexp = /\$\$|\$(#|[0-9]*)(?:\{([^/ {}\x00-\x1f\x7f]*)(?:\/\/([a-zA-Z0-9/:]*))?\})?(?:\[((?:\\.|\[[^\]]*\]|[^\]])*)\])?( *)/g ;

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



// Useful for Sentence constructor, when no Babel instances are given
Babel.default = new Babel() ;

