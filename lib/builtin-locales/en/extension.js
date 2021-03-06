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



// Because this file is still a work in progress:
/* eslint-disable no-unused-vars */

const elisionNeeded = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	h: true
} ;



const needElision = atom => !! elisionNeeded[ atom.canon[ 0 ] ] ;
const isPlural = atom => atom.n !== undefined && atom.n > 1 ;



function altElision( atom , alt ) {
	if ( alt.length <= 1 || ! elisionNeeded[ atom.canon[ 0 ] ] ) { return alt[ 0 ] ; }

	// If the alternative finish with an isApostrophe, remove spaces
	//if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] , sp: '' } ; }

	return alt[ 1 ] ;
}



const functions = {} ;
/*
	// 1st person pronoun
	"1p": { "ng?": [ [ 'I' ] , [ 'we' ] ] } ,
	"2p": { "ng?": [ [ 'you' ] ] } ,
	"3p": { "ng?": [ [ 'it' , 'he' , 'she' , 'they' ] , [ 'they' ] ] } ,

	// 1st person direct/indirect object pronoun
	"1po": { "ng?": [ [ 'me' ] , [ 'us' ] ] } ,
	"2po": { "ng?": [ [ 'you' ] ] } ,
	"3po": { "ng?": [ [ 'it' , 'him' , 'her' , 'them' ] , [ 'them' ] ] }
*/



function article( atom ) {
	switch ( atom.a ) {
		case 'i' :
			if ( atom.n === 0 ) {
				atom.before( 'no ' ) ;
			}
			else if ( atom.n === undefined || atom.n === 1 ) {
				atom.before( needElision( atom ) ? 'an ' : 'a ' ) ;
			}

			return atom ;

		case 'd' :
			atom.before( atom.n === 0 ? 'no ' : 'the ' ) ;
			return atom ;

		case 'p' :
			atom.before( atom.n === 0 ? 'no ' : 'some ' ) ;
			return atom ;

		case 'P' :
			if ( atom.n === 0 ) { atom.before( 'no ' ) ; }
			return atom ;

		case 'z' :
		default :
			if ( atom.n === 0 ) { atom.before( 'no ' ) ; }
			return atom ;
	}
}



function possessive( atom , lastAtom , babel , kungFigCtx ) {
	var str ;

	if ( ! lastAtom ) { return atom ; }

	switch ( lastAtom.p ) {
		case '1' :
			atom.before( lastAtom.n === undefined || lastAtom.n <= 1 ? 'my ' : 'our ' ) ;
			return atom ;

		case '2' :
			atom.before( 'your ' ) ;
			return atom ;

		case '3' :
			if ( lastAtom.n === 0 ) {
				atom.before( "no one's " ) ;
			}
			else if ( lastAtom.n === undefined || lastAtom.n === 1 ) {
				atom.before(
					lastAtom.g === 'm' ? 'his ' :
					lastAtom.g === 'f' ? 'her ' :
					'its '
				) ;
			}
			else {
				atom.before( 'their ' ) ;
			}

			return atom ;

		default :
			str = lastAtom.solve( babel , null , kungFigCtx ) ;
			str += str[ str.length - 1 ] === 's' ? "' " : "'s " ;
			atom.before( str ) ;
			return atom ;
	}
}



functions['+d'] = ( atom , args , lastAtom , babel , kungFigCtx ) => {
	if ( args ) { atom.d = args[ 0 ] ; }

	switch ( atom.d ) {
		case 'd' :
		case 'dp' :
			atom.before( atom.n > 1 ? 'these ' : 'this ' ) ;
			return atom ;

		case 'dd' :
			atom.before( atom.n === 0 ? 'those ' : 'that ' ) ;
			return atom ;

		case 'p' :
			return possessive( atom , lastAtom , babel , kungFigCtx ) ;

		case 'a' :
		default :
			return article( atom ) ;
	}
} ;



function pronoun( atom , args ) {
	if ( args ) {
		atom.p = args[ 0 ] ;
	}

	switch ( atom.p ) {
		case '1' :
			return atom.n === undefined || atom.n <= 1 ? 'I' : 'we' ;

		case '2' :
			return 'you' ;

		case '3' :
		default :
			if ( atom.n === 0 ) {
				return 'no one' ;
			}
			else if ( atom.n === undefined || atom.n === 1 ) {
				return atom.g === 'm' ? 'he' :
					atom.g === 'f' ? 'she' :
					'it' ;
			}

			return 'they' ;

	}
}



functions['+p'] = ( atom , args ) => {
	atom.sOrBefore( pronoun( atom , args ) ) ;
	return atom ;
} ;

functions['+p!'] = ( atom , args ) => {
	return pronoun( atom , args ) ;
} ;



const utils = {} ;

// Switch a person, using a string
utils.switchPerson = str => {
	var switchPersonStrVerb = {} ;

	return str.replace( /\s+|(i|you|he|she|it|we|they)\s+(\S+)(?=\s)/gi , ( match , pronoun_ , verb ) => {
		if ( ! pronoun_ ) { return match ; }

		var person = null , plural = null , switchedPronoun = null ;

		pronoun_ = pronoun_.toLowerCase() ;
		verb = verb.toLowerCase() ;

		switch ( pronoun_ ) {
			case 'he' :
			case 'she' :
			case 'it' :
			case 'they' :
				return match ;
			case 'i' : person = 1 ; plural = false ; switchedPronoun = 'you' ; break ;
			case 'you' : person = 2 ; switchedPronoun = 'I' ; break ;
			case 'we' : person = 1 ; plural = true ; switchedPronoun = 'you' ; break ;
		}

		if ( ! switchPersonStrVerb[ verb ] ) {
			// Damned! We don't know that verb!
			return switchedPronoun + ' ' + verb ;
		}

		return switchedPronoun + ' ' + switchPersonStrVerb[ verb ] ;
	} ) ;
} ;



module.exports = {
	nOffset: -1 ,
	propertyIndexes: {
		g: {
			n: 0 , m: 1 , f: 2 , e: 3 , default: 0
		}
	} ,
	functions ,
	utils
} ;

