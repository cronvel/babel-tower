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



var elidationNeeded = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	h: true
} ;



function needElidation( word ) { return !! elidationNeeded[ word.c[ 0 ] ] ; }



function altElidation( word , alt )
{
	if ( alt.length <= 1 || ! elidationNeeded[ word.c[ 0 ] ] ) { return alt[ 0 ] ; }
	
	// If the alternative finish with an isApostrophe, remove spaces
	//if ( isApostrophe[    alt[ 1 ][  alt[ 1 ].length - 1  ]    ] ) { return { s: alt[ 1 ] , sp: '' } ; }
	
	return alt[ 1 ] ;
}



function indefArt( word )
{
	if ( word.n > 1 || word.n === 'many' )
	{
		return { s: '' , sp: '' } ;
	}
	else
	{
		if ( needElidation( word ) ) { return { s: "an" } ; }
		else { return { s: "a" } ; }
	}
}



module.exports = {
	en: {
		nOffset: -1 ,
		gIndex: { n: 0 , m: 1 , f: 2 , h: 0 } ,
		fn: {
			"1stPerson": { altng: [ [ 'I' ] , [ 'we' ] ] } ,
			"2ndPerson": { altng: [ [ 'you' ] ] } ,
			"3rdPerson": { altng: [ [ 'it' , 'he' , 'she' ] , [ 'they' ] ] } ,
			
			"1stPersonObl": { altng: [ [ 'me' ] , [ 'us' ] ] } ,
			"2ndPersonObl": { altng: [ [ 'you' ] ] } ,
			"3rdPersonObl": { altng: [ [ 'it' , 'him' , 'her' ] , [ 'them' ] ] } ,
			
			"indefArt": indefArt ,
		}
	}
} ;


