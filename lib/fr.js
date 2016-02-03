/*
	The Cedric's Swiss Knife (CSK) - CSK i18n toolbox

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



var apostropheNeeded = {
	a: true ,
	e: true ,
	i: true ,
	o: true ,
	u: true ,
	y: true ,
	h: true
} ;



module.exports = {
	fr: {
		nOffset: -1 ,
		gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
		fn: {
			"1erePersonne": { altng: [ [ 'je' ] , [ 'nous' ] ] } ,
			"2emePersonne": { altng: [ [ 'tu' ] , [ 'vous' ] ] } ,
			"3emePersonne": { altng: [ [ 'il' , 'elle' ] , [ 'ils' , 'elles' ] ] } ,
			
			"artDef": function( word ) {
				if ( word.n > 1 )
				{
					return { s: "les" } ;
				}
				else
				{
					console.log( "word.c:" , word.c , word ) ;
					if ( apostropheNeeded[ word.c[ 0 ] ] ) { return { s: "l'" } ; }
					else if ( word.g === 'f' ) { return { s: "la" } ; }
					else { return { s: "le" } ; }
				}
			}
		}
	}
} ;


