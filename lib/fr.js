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



var nOffset = -1 ;
var gIndex = { m: 0 , f: 1 , n: 2 , h: 2 } ;



var elidationNeeded = {
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



function needElidation( word ) { return !! elidationNeeded[ word.c[ 0 ] ] ; }



function altElidation( word , alt )
{
	if ( alt.length <= 1 || ! elidationNeeded[ word.c[ 0 ] ] ) { return alt[ 0 ] ; }
	
	// If the alternative finish with an isApostrophe, remove spaces
	if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] , sp: '' } ; }
	
	return alt[ 1 ] ;
}



function altGenderElidation( word , alt )
{
	var g , p ;
	
	g = gIndex[ word.g ] || 0 ;
	if ( g >= alt.length ) { g = 0 ; }
	p = alt[ g ] ;
	
	if ( p.length <= 1 || ! elidationNeeded[ word.c[ 0 ] ] ) { return p[ 0 ] ; }
	
	// If the alternative finish with an apostrophe, remove spaces
	if ( isApostrophe[    p[ 1 ][  p[ 1 ].length - 1  ]    ] ) { return { s: p[ 1 ] , sp: '' } ; }
	
	return p[ 1 ] ;
}

altGenderElidation.arrayOfArray = true ;



function artDef( word )
{
	if ( word.n > 1 || word.n === 'many' )
	{
		return { s: "les" } ;
	}
	else
	{
		//console.log( "word.c:" , word.c , word ) ;
		if ( needElidation( word ) ) { return { s: "l'" , sp: '' } ; }
		else if ( word.g === 'f' ) { return { s: "la" } ; }
		else { return { s: "le" } ; }
	}
}



function artIndef( word )
{
	if ( word.n > 1 || word.n === 'many' )
	{
		return { s: "des" } ;
	}
	else
	{
		return { s: word.g === 'f' ? "une" : "un" } ;
	}
}



module.exports = {
	fr: {
		nOffset: nOffset ,
		gIndex: gIndex ,
		fn: {
			"1erePersonne": { altng: [ [ 'je' ] , [ 'nous' ] ] } ,
			"2emePersonne": { altng: [ [ 'tu' ] , [ 'vous' ] ] } ,
			"3emePersonne": { altng: [ [ 'il' , 'elle' ] , [ 'ils' , 'elles' ] ] } ,
			
			"1erePersonneCOD": { altng: [ [ 'me' ] , [ 'nous' ] ] } ,
			"2emePersonneCOD": { altng: [ [ 'te' ] , [ 'vous' ] ] } ,
			"3emePersonneCOD": { altng: [ [ 'le' , 'la' ] , [ 'les' ] ] } ,
			
			"1erePersonneCOI": { altng: [ [ 'me' ] , [ 'nous' ] ] } ,
			"2emePersonneCOI": { altng: [ [ 'te' ] , [ 'vous' ] ] } ,
			"3emePersonneCOI": { altng: [ [ 'lui' ] , [ 'leur' ] ] } ,
			
			"el?": altElidation ,
			"gel?": altGenderElidation ,
			
			"artDef": artDef ,
			"artIndef": artIndef ,
		}
	}
} ;


