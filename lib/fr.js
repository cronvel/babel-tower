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



var nOffset = -1 ;
var gIndex = {
	m: 0 , f: 1 , n: 2 , h: 2 , default: 0
} ;



var elisionNeeded = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	h: true
} ;



var isApostrophe = {
	"'": true ,
	"’": true
} ;



function needElision( atom ) { return !! elisionNeeded[ atom.canon[ 0 ] ] ; }



function altElision( atom , alt ) {
	if ( alt.length <= 1 || ! elisionNeeded[ atom.canon[ 0 ] ] ) { return { s: alt[ 0 ] + ' ' } ; }

	// If the alternative finish with an isApostrophe, remove spaces
	if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] } ; }

	return { s: alt[ 1 ] + ' ' } ;
}



function altGenderElision( atom , alt ) {
	var g , p ;

	g = gIndex[ atom.g ] || 0 ;
	if ( g >= alt.length ) { g = 0 ; }
	p = alt[ g ] ;

	if ( p.length <= 1 || ! elisionNeeded[ atom.canon[ 0 ] ] ) { return { s: p[ 0 ] + ' ' } ; }

	// If the alternative finish with an apostrophe, remove spaces
	if ( isApostrophe[    p[ 1 ][  p[ 1 ].length - 1  ]    ] ) { return { s: p[ 1 ] } ; }

	return { s: p[ 1 ] + ' ' } ;
}



function articleDefini( atom ) {
	if ( atom.n > 1 || atom.n === 'many' ) {
		return { s: "les " } ;
	}

	//console.log( "atom.canon:" , atom.canon , atom ) ;
	if ( needElision( atom ) ) { return { s: "l'" } ; }
	else if ( atom.g === 'f' ) { return { s: "la " } ; }

	return { s: "le " } ;
}



function articleIndefini( atom ) {
	if ( atom.n > 1 || atom.n === 'many' ) {
		return { s: "des " } ;
	}

	return { s: atom.g === 'f' ? "une " : "un " } ;
}



var functions = {
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
	"3poi": { "ng?": [ [ 'lui' ] , [ 'leur' ] ] } ,

	"el?": altElision ,
	"gel?": altGenderElision ,
	"gel": altGenderElision ,

	"+ad": articleDefini ,
	"+ai": articleIndefini
} ;

// 'en' function name compatibilities
functions["1po"] = functions["1pod"] ;
functions["2po"] = functions["2pod"] ;
functions["3po"] = functions["3pod"] ;
functions["+da"] = functions["+ad"] ;
functions["+ia"] = functions["+ai"] ;



module.exports = {
	fr: {
		nOffset: nOffset ,
		propertyIndexes: {
			g: gIndex
		} ,
		functions
	}
} ;

