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



// Because this file is still a work in progress:
/* eslint-disable no-unused-vars */

var elisionNeeded = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	h: true
} ;



function needElision( atom ) { return !! elisionNeeded[ atom.canon[ 0 ] ] ; }



function altElision( atom , alt ) {
	if ( alt.length <= 1 || ! elisionNeeded[ atom.canon[ 0 ] ] ) { return alt[ 0 ] ; }

	// If the alternative finish with an isApostrophe, remove spaces
	//if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] , sp: '' } ; }

	return alt[ 1 ] ;
}



function indefiniteArticle( atom ) {
	if ( atom.u === 'p' || atom.n > 1 || atom.n === 'many' ) {
		return atom ;
	}

	if ( needElision( atom ) ) { atom.before = 'an ' ; }
	else { atom.before = 'a ' ; }

	return atom ;
}



function definiteArticle( atom ) {
	if ( atom.u === 'p' ) {
		return atom ;
	}

	atom.before = 'the ' ;
	return atom ;
}



// Switch a person, using a string
function switchPersonStr( str ) {
	var switchPersonStrVerb = {} ;

	return str.replace( /\s+|(i|you|he|she|it|we|they)\s+(\S+)(?=\s)/gi , ( match , pronoun , verb ) => {
		if ( ! pronoun ) { return match ; }

		var person = null , plural = null , switchedPronoun = null ;

		pronoun = pronoun.toLowerCase() ;
		verb = verb.toLowerCase() ;

		switch ( pronoun ) {
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
}



var functions = {
	// 1st person pronoun
	"1p": { "ng?": [ [ 'I' ] , [ 'we' ] ] } ,
	"2p": { "ng?": [ [ 'you' ] ] } ,
	"3p": { "ng?": [ [ 'it' , 'he' , 'she' ] , [ 'they' ] ] } ,

	// 1st person direct/indirect object pronoun
	"1po": { "ng?": [ [ 'me' ] , [ 'us' ] ] } ,
	"2po": { "ng?": [ [ 'you' ] ] } ,
	"3po": { "ng?": [ [ 'it' , 'him' , 'her' ] , [ 'them' ] ] } ,

	// add definite article
	"+da": definiteArticle ,
	// add indefinite article
	"+ia": indefiniteArticle
} ;



module.exports = {
	en: {
		nOffset: -1 ,
		propertyIndexes: {
			g: {
				n: 0 , m: 1 , f: 2 , h: 0 , default: 0
			}
		} ,
		functions ,
		utils: {
			switchPerson: switchPersonStr
		}
	}
} ;

