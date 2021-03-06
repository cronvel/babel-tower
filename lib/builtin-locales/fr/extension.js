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



const nOffset = -1 ;
const gIndex = {
	m: 0 , f: 1 , n: 2 , h: 2 , default: 0
} ;



const elisionNeeded = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	h: true
} ;



const isApostrophe = {
	"'": true ,
	"’": true
} ;



const needElision = atom => !! elisionNeeded[ atom.canon[ 0 ] ] ;
const isPlural = atom => atom.n !== undefined && atom.n > 1 ;


const functions = {} ;
/*
	// 1ère personne pronom
	"1p": { "ng?": [ [ 'je' ] , [ 'nous' ] ] } ,
	"2p": { "ng?": [ [ 'tu' ] , [ 'vous' ] ] } ,
	"3p": { "ng?": [ [ 'il' , 'elle' ] , [ 'ils' , 'elles' ] ] } ,

	// 1ère personne objet direct pronom
	"1pod": { "ng?": [ [ 'me' ] , [ 'nous' ] ] } ,
	"2pod": { "ng?": [ [ 'te' ] , [ 'vous' ] ] } ,
	"3pod": { "ng?": [ [ 'le' , 'la' ] , [ 'les' ] ] } ,

	// 1ère personne objet indirect pronom
	"1poi": { "ng?": [ [ 'me' ] , [ 'nous' ] ] } ,
	"2poi": { "ng?": [ [ 'te' ] , [ 'vous' ] ] } ,
	"3poi": { "ng?": [ [ 'lui' ] , [ 'leur' ] ] }
} ;

// 'en' function name compatibilities
functions['1po'] = functions['1pod'] ;
functions['2po'] = functions['2pod'] ;
functions['3po'] = functions['3pod'] ;
*/



function article( atom , args ) {
	switch ( atom.a ) {
		case 'i' :
			if ( atom.n === 0 ) {
				atom.before( atom.g === 'f' ? 'aucune ' : 'aucun ' ) ;
			}
			else if ( atom.n === undefined || atom.n === 1 ) {
				atom.before( atom.g === 'f' ? 'une ' : 'un ' ) ;
			}
			else {
				atom.before( 'des ' ) ;
			}

			return atom ;

		case 'd' :
			if ( atom.n === 0 ) {
				atom.before( atom.g === 'f' ? 'aucune ' : 'aucun ' ) ;
			}
			else if ( atom.n === undefined || atom.n === 1 ) {
				atom.before(
					needElision( atom ) ? "l'" :
					atom.g === 'f' ? 'la ' :
					'le '
				) ;
			}
			else {
				atom.before( 'les ' ) ;
			}

			return atom ;

		case 'P' :
		case 'z' :
			if ( atom.n === 0 ) { atom.before( 'pas de ' ) ; }
			return atom ;

		case 'p' :
		default :
			if ( atom.n === 0 ) {
				atom.before( needElision( atom ) ? "pas d'" : 'pas de ' ) ;
			}
			else {
				atom.before(
					atom.g === 'f' ? 'de la ' :
					needElision( atom ) ? "de l'" :
					'du '
				) ;
			}

			return atom ;
	}
}



function possessive( atom , lastAtom , babel , kungFigCtx ) {
	var str ;

	if ( ! lastAtom ) { return atom ; }

	switch ( lastAtom.p ) {
		case '1' :
			if ( isPlural( lastAtom ) ) {
				atom.before( isPlural( atom ) ? 'nos ' : 'notre ' ) ;
			}
			else if ( isPlural( atom ) ) {
				atom.before( 'mes ' ) ;
			}
			else {
				atom.before( atom.g === 'f' ? 'ma ' : 'mon ' ) ;
			}

			return atom ;

		case '2' :
			if ( isPlural( lastAtom ) ) {
				atom.before( isPlural( atom ) ? 'vos ' : 'votre ' ) ;
			}
			else if ( isPlural( atom ) ) {
				atom.before( 'tes ' ) ;
			}
			else {
				atom.before( atom.g === 'f' ? 'ta ' : 'ton ' ) ;
			}

			return atom ;

		case '3' :
			if ( isPlural( lastAtom ) ) {
				atom.before( isPlural( atom ) ? 'leurs ' : 'leur ' ) ;
			}
			else if ( isPlural( atom ) ) {
				atom.before( 'ses ' ) ;
			}
			else {
				atom.before( atom.g === 'f' ? 'sa ' : 'son ' ) ;
			}

			return atom ;

		default :
			// TODO: it's way more complicated here, can be: à, à la, au, aux, ...
			// En fonction des noms propres, noms communs, pluriels, genre...
			str = ' à ' ;
			str += lastAtom.solve( babel , null , kungFigCtx ) ;
			atom.after( str ) ;
			return atom ;
	}
}



functions['+d'] = ( atom , args , lastAtom , babel , kungFigCtx ) => {
	if ( args ) { atom.d = args[ 0 ] ; }

	switch ( atom.d ) {
		case 'd' :
		case 'dp' :
		case 'dd' :
			atom.before(
				atom.g === 'f' ? 'cette ' :
				needElision( atom ) ? 'cet ' :
				'ce '
			) ;
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
			return isPlural( atom ) ? 'nous' : 'je' ;

		case '2' :
			return isPlural( atom ) ? 'vous' : 'tu' ;

		case '3' :
		default :
			if ( atom.n === 0 ) {
				return 'personne' ;
			}

			if ( atom.n === undefined || atom.n === 1 ) {
				return atom.g === 'f' ? 'elle' : 'il' ;
			}

			return atom.g === 'f' ? 'elles' : 'ils' ;

	}
}



functions['+p'] = ( atom , args ) => {
	atom.sOrBefore( pronoun( atom , args ) ) ;
	return atom ;
} ;

functions['+p!'] = ( atom , args ) => {
	return pronoun( atom , args ) ;
} ;



// Beta/unstable
functions['el?'] = ( atom , alt ) => {
	if ( alt.length <= 1 || ! elisionNeeded[ atom.canon[ 0 ] ] ) { return { s: alt[ 0 ] + ' ' } ; }

	// If the alternative finish with an isApostrophe, remove spaces
	if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] } ; }

	return { s: alt[ 1 ] + ' ' } ;
} ;



// Beta/unstable
functions['gel?'] = functions['gel'] = ( atom , alt ) => {
	var g , p ;

	g = gIndex[ atom.g ] || 0 ;
	if ( g >= alt.length ) { g = 0 ; }
	p = alt[ g ] ;

	if ( p.length <= 1 || ! elisionNeeded[ atom.canon[ 0 ] ] ) { return { s: p[ 0 ] + ' ' } ; }

	// If the alternative finish with an apostrophe, remove spaces
	if ( isApostrophe[    p[ 1 ][  p[ 1 ].length - 1  ]    ] ) { return { s: p[ 1 ] } ; }

	return { s: p[ 1 ] + ' ' } ;
} ;



module.exports = {
	nOffset: nOffset ,
	propertyIndexes: {
		g: gIndex
	} ,
	functions
} ;

