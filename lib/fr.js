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



function needElision( element ) { return !! elisionNeeded[ element.c[ 0 ] ] ; }



function altElision( element , alt ) {
	if ( alt.length <= 1 || ! elisionNeeded[ element.c[ 0 ] ] ) { return { s: alt[ 0 ] + ' ' } ; }

	// If the alternative finish with an isApostrophe, remove spaces
	if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] } ; }

	return { s: alt[ 1 ] + ' ' } ;
}



function altGenderElision( element , alt ) {
	var g , p ;

	g = gIndex[ element.g ] || 0 ;
	if ( g >= alt.length ) { g = 0 ; }
	p = alt[ g ] ;

	if ( p.length <= 1 || ! elisionNeeded[ element.c[ 0 ] ] ) { return { s: p[ 0 ] + ' ' } ; }

	// If the alternative finish with an apostrophe, remove spaces
	if ( isApostrophe[    p[ 1 ][  p[ 1 ].length - 1  ]    ] ) { return { s: p[ 1 ] } ; }

	return { s: p[ 1 ] + ' ' } ;
}



function artDef( element ) {
	if ( element.n > 1 || element.n === 'many' ) {
		return { s: "les " } ;
	}

	//console.log( "element.c:" , element.c , element ) ;
	if ( needElision( element ) ) { return { s: "l'" } ; }
	else if ( element.g === 'f' ) { return { s: "la " } ; }

	return { s: "le " } ;
}



function artIndef( element ) {
	if ( element.n > 1 || element.n === 'many' ) {
		return { s: "des " } ;
	}

	return { s: element.g === 'f' ? "une " : "un " } ;

}



module.exports = {
	fr: {
		nOffset: nOffset ,
		propertyIndexes: {
			g: gIndex
		} ,
		functions: {
			"1erePersonne": { "ng?": [ [ 'je' ] , [ 'nous' ] ] } ,
			"2emePersonne": { "ng?": [ [ 'tu' ] , [ 'vous' ] ] } ,
			"3emePersonne": { "ng?": [ [ 'il' , 'elle' ] , [ 'ils' , 'elles' ] ] } ,

			"1erePersonneCOD": { "ng?": [ [ 'me' ] , [ 'nous' ] ] } ,
			"2emePersonneCOD": { "ng?": [ [ 'te' ] , [ 'vous' ] ] } ,
			"3emePersonneCOD": { "ng?": [ [ 'le' , 'la' ] , [ 'les' ] ] } ,

			"1erePersonneCOI": { "ng?": [ [ 'me' ] , [ 'nous' ] ] } ,
			"2emePersonneCOI": { "ng?": [ [ 'te' ] , [ 'vous' ] ] } ,
			"3emePersonneCOI": { "ng?": [ [ 'lui' ] , [ 'leur' ] ] } ,

			"el?": altElision ,
			"gel?": altGenderElision ,
			"gel": altGenderElision ,

			"artDef": artDef ,
			"artIndef": artIndef
		}
	}
} ;


