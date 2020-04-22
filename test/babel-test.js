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



const Babel = require( '../lib/Babel.js' ) ;
const Atom = Babel.Atom ;
const Sentence = Babel.Sentence ;

const string = require( 'string-kit' ) ;



function deb( v ) {
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}



describe( "Atom parser and solver" , () => {
	var babel = new Babel() ;
	var atom ;
	
	babel.extend( {
		fr: {
			propertyIndexes: {
				g: { m: 0 , f: 1 , n: 2 , h: 2 }
			} ,
			atoms: {
				apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
				horse: { "ng?": [ [ 'cheval' , 'jument' ] , [ 'chevaux' , 'juments' ] ] } ,
			}
		}
	} ) ;
	
	var babelFr = babel.use( 'fr' ) ;


	it( "should parse an atom" , () => {
		expect( Atom.parse( "horse" ) ).to.be.like( { k: "horse" } ) ;
		expect( Atom.parse( "[k:horse]" ) ).to.be.like( { k: "horse" } ) ;
		expect( Atom.parse( "horse[ng?(cheval|jument)|(chevaux|juments)]" ) ).to.be.like( {
			k: "horse" ,
			alt: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] ,
			ord: ['n','g']
		} ) ;
		expect( Atom.parse( "horse[n?cheval|chevaux]" ) ).to.be.like( {
			k: "horse" ,
			alt: [ "cheval" , "chevaux" ] ,
			ord: ['n']
		} ) ;
		expect( Atom.parse( "horse[g?cheval|jument]" ) ).to.be.like( {
			k: "horse" ,
			alt: [ "cheval" , "jument" ] ,
			ord: ['g']
		} ) ;
	} ) ;
	
	it( "creating an atom from a string should create a translatable Atom object" , () => {
		expect( new Atom( "horse" ) ).to.be.like( { k: "horse" } ) ;
	} ) ;
	
	it( "creating an atom from a number should create an Atom object with a 'n' (number) property" , () => {
		expect( new Atom( 3 ) ).to.be.like( { n: 3 } ) ;
	} ) ;
	
	it( "an Atom created from a string should resolve to itself when the atom is not in the dictionary" , () => {
		expect( new Atom( "horse" ).solve( babel ) ).to.be( "horse" ) ;
	} ) ;
	
	it( "an Atom created from a string should resolve to the atom existing in the dictionary" , () => {
		expect( new Atom( "apple" ).solve( babelFr ) ).to.be( "pomme" ) ;
	} ) ;
	
	it( "an Atom created directly with 'alt' and 'ord'" , () => {
		expect( new Atom( { g: 'm' , ord: ['g'] , alt: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { g: 'f' , ord: ['g'] , alt: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
		
		expect( new Atom( { n: 0 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 1 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 2 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: 5 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: '++' , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( new Atom( { n: 0 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "rien" ) ;
		expect( new Atom( { n: 1 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 2 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: 5 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: '++' , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		var npg = [
			[
				"je" ,
				"tu" ,
				[ "il" , "elle" ]
			] ,
			[
				"nous" ,
				"vous" ,
				[ "ils" , "elles" ]
			]
		] ;
		
		var ord = [ 'n' , 'p' , 'g' ] ;
		
		expect( new Atom( { p: '1' , n: 1 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "je" ) ;
		expect( new Atom( { p: '2' , n: 1 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "tu" ) ;
		expect( new Atom( { p: '3' , n: 1 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "il" ) ;
		expect( new Atom( { p: '3' , n: 1 , g: 'f' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "elle" ) ;
		expect( new Atom( { p: '1' , n: 2 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "nous" ) ;
		expect( new Atom( { p: '2' , n: 2 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "vous" ) ;
		expect( new Atom( { p: '3' , n: 2 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "ils" ) ;
		expect( new Atom( { p: '3' , n: 2 , g: 'f' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "elles" ) ;
	} ) ;
	
	it( "an Atom created with a 'n' and 'n?' should resolve to the appropriate alternative" , () => {
		expect( new Atom( { n: 0 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
		expect( new Atom( { n: 1 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
		expect( new Atom( { n: 2 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
		expect( new Atom( { n: 3 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
		
		expect( new Atom( { "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
	} ) ;
	
	it( "an Atom created with a 'p' and 'p?' should resolve to the appropriate alternative" , () => {
		expect( new Atom( { p: '1' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "je" ) ;
		expect( new Atom( { p: '2' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "tu" ) ;
		expect( new Atom( { p: '3' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "il" ) ;
	
		expect( new Atom( { "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "il" ) ;
	} ) ;
	
	it( "an Atom created with a 'a' and 'a?' should resolve to the appropriate alternative" , () => {
		expect( new Atom( { a: 'i' , "a?": [ "a cat" , "the cat" , "some cat" , "Misty" ] } ).solve( babel ) ).to.be( "a cat" ) ;
		expect( new Atom( { a: 'd' , "a?": [ "a cat" , "the cat" , "some cat" , "Misty" ] } ).solve( babel ) ).to.be( "the cat" ) ;
		expect( new Atom( { a: 'p' , "a?": [ "a cat" , "the cat" , "some cat" , "Misty" ] } ).solve( babel ) ).to.be( "some cat" ) ;
		expect( new Atom( { a: 'P' , "a?": [ "a cat" , "the cat" , "some cat" , "Misty" ] } ).solve( babel ) ).to.be( "Misty" ) ;

		expect( new Atom( { "a?": [ "a cat" , "the cat" , "some cat" , "Misty" ] } ).solve( babel ) ).to.be( "a cat" ) ;
	} ) ;
	
	it( "an Atom created with a 'g' and 'g?' should resolve to the appropriate alternative" , () => {
		expect( new Atom( { g: 'm' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { g: 'f' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( new Atom( { g: 'n' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { g: 'h' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		
		expect( new Atom( { "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
	} ) ;
	
	it( "an Atom created with a 'n' and/or 'g' and 'ng?' should resolve to the appropriate alternative" , () => {
		expect( new Atom( { n: 0 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 1 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 2 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: 3 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( new Atom( { n: 0 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( new Atom( { n: 1 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( new Atom( { n: 2 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "juments" ) ;
		expect( new Atom( { n: 3 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "juments" ) ;
		
		expect( new Atom( { n: 0 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 1 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 2 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: 3 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( new Atom( { g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Atom( { g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		
		expect( new Atom( { "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
	} ) ;
	
	it( "an Atom created with a 'n', 'p', 'g' and 'npg?' should resolve to the appropriate alternative" , () => {
		var npg = [
			[
				[ "je" ] ,
				[ "tu" ] ,
				[ "il" , "elle" ]
			] ,
			[
				[ "nous" ] ,
				[ "vous" ] ,
				[ "ils" , "elles" ]
			]
		] ;
		expect( new Atom( { p: '1' , n: 1 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "je" ) ;
		expect( new Atom( { p: '2' , n: 1 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "tu" ) ;
		expect( new Atom( { p: '3' , n: 1 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "il" ) ;
		expect( new Atom( { p: '3' , n: 1 , g: 'f' , "npg?": npg } ).solve( babel ) ).to.be( "elle" ) ;
		expect( new Atom( { p: '1' , n: 2 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "nous" ) ;
		expect( new Atom( { p: '2' , n: 2 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "vous" ) ;
		expect( new Atom( { p: '3' , n: 2 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "ils" ) ;
		expect( new Atom( { p: '3' , n: 2 , g: 'f' , "npg?": npg } ).solve( babel ) ).to.be( "elles" ) ;
	} ) ;
	
	it( "an Atom created with a 'n' and/or 'g' and 'k' should extend the atom existing in the dictionary with 'n' and resolve to the appropriate alternative" , () => {
		expect( new Atom( { n: 0 , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 1 , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 2 , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: 3 , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		
		expect( new Atom( { n: 0 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 1 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Atom( { n: 2 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		expect( new Atom( { n: 3 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		
		expect( new Atom( { n: 0 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( new Atom( { n: 1 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( new Atom( { n: 2 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "juments" ) ;
		expect( new Atom( { n: 3 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "juments" ) ;
		
		expect( new Atom( { g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Atom( { g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( new Atom( { g: 'n' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Atom( { g: 'h' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		
		expect( new Atom( { k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
	} ) ;
	
	it.skip( "parse units" , () => {
		deb( Atom.parse( "[n:1/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:N+]" ) ) ;
		expect( Atom.parse( "[n:1/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:N+]" ) ).to.be.like( {
			n: "1" ,
			uv: [ 1000 , 1 ] ,
			uf: [ "$km" , "$m" ] ,
			uenum: [ "0" , "$" , ", $" , " and $" ] ,
			um: "N+"
		} ) ;
		
		expect( Atom.parse( "[n:30/uv:12|1/uf:$ $[n?foot|feet]|$ $[n?inch|inches]/uenum:0|$|, $| and $/um:N+]" ) ).to.be.like( {
			n: "30" ,
			uv: [ 12 , 1 ] ,
			uf: [ "$ $[n?foot|feet]" , "$ $[n?inch|inches]" ] ,
			uenum: [ "0" , "$" , ", $" , " and $" ] ,
			um: "N+"
		} ) ;
	} ) ;

	it( "Article" , () => {
		var babel = new Babel() ;

		expect( babel.solve( "$1[a?A |The ]$ jumps on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "A cat jumps on the table!" ) ;
		expect( babel.solve( "$1[a?A |The ]$ jumps on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cat jumps on the table!" ) ;

		expect( babel.solve( "$1[n0a?No |(A |The )]$ jumps on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "A cat jumps on the table!" ) ;
		expect( babel.solve( "$1[n0a?No |(A |The )]$ jumps on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cat jumps on the table!" ) ;
		expect( babel.solve( "$1[n0a?No |(A |The )]$ jumps on the table!" , Atom.parse( "cat[a:i/n:0]" ) ) ).to.be( "No cat jumps on the table!" ) ;
		expect( babel.solve( "$1[n0a?No |(A |The )]$ jumps on the table!" , Atom.parse( "cat[a:d/n:0]" ) ) ).to.be( "No cat jumps on the table!" ) ;
	} ) ;
} ) ;



describe( "Units of measurement" , () => {
	var babel = new Babel() ;
	
	it( "using an enumeration of natural positive integer units" , () => {
		expect( Atom.parse( "[n:1004/uv:1000|1/uf:$km|$m/um:N+]" ).solve( babel ) )
			.to.be( '1km 4m' ) ;
		expect( Atom.parse( "[n:1004/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1km and 4m' ) ;
		expect( Atom.parse( "[n:1/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1 inch' ) ;
		expect( Atom.parse( "[n:3/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '3 inches' ) ;
		expect( Atom.parse( "[n:12/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1 foot' ) ;
		expect( Atom.parse( "[n:24/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '2 feet' ) ;
		expect( Atom.parse( "[n:25/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '2 feet and 1 inch' ) ;
		expect( Atom.parse( "[n:27/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '2 feet and 3 inches' ) ;
		expect( Atom.parse( "[n:50/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1 yard, 1 foot and 2 inches' ) ;
		// 10km
		expect( Atom.parse( "[n:393700.7874015748/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '6 miles, 376 yards and 4 inches' ) ;
	} ) ;
	
	it( "using a real of the closest unit" , () => {
		expect( Atom.parse( "[n:1200/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Atom.parse( "[n:1200/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Atom.parse( "[n:800/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.8km' ) ;
		expect( Atom.parse( "[n:600/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.6km' ) ;
		expect( Atom.parse( "[n:500/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '5hm' ) ;
		expect( Atom.parse( "[n:600/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.6km' ) ;
		expect( Atom.parse( "[n:500/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '500m' ) ;
		expect( Atom.parse( "[n:0.2/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.2m' ) ;
	} ) ;
	
	it( "using a real >= 1 (when possible) of the closest unit" , () => {
		expect( Atom.parse( "[n:1200/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Atom.parse( "[n:1200/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Atom.parse( "[n:800/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '8hm' ) ;
		expect( Atom.parse( "[n:600/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '6hm' ) ;
		expect( Atom.parse( "[n:500/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '5hm' ) ;
		expect( Atom.parse( "[n:600/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '600m' ) ;
		expect( Atom.parse( "[n:500/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '500m' ) ;
		expect( Atom.parse( "[n:0.2/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '0.2m' ) ;
	} ) ;
} ) ;



describe( "Basic usage without language pack" , () => {
	
	it( "should format $$ into $" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "Give me $$!" ) ).to.be( "Give me $!" ) ;
	} ) ;
	
	it( "single $ behaviour should default to the first argument or to the last used argument+path" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $!" , "apples" , "pears" ) ).to.be( "Give me apples!" ) ;
		expect( babel.solve( "Give me $2!" , "apples" , "pears" ) ).to.be( "Give me pears!" ) ;
		expect( babel.solve( "Give me $ and $2!" , "apples" , "pears" ) ).to.be( "Give me apples and pears!" ) ;
		expect( babel.solve( "Give me $2 and $!" , "apples" , "pears" ) ).to.be( "Give me pears and pears!" ) ;
		
		var ctx = {
			fruit1: "apples" ,
			fruit2: "pears"
		} ;
		
		expect( babel.solve( "Give me ${fruit1} and $!" , ctx ) ).to.be( "Give me apples and apples!" ) ;
		expect( babel.solve( "Give me ${fruit2} and $!" , ctx ) ).to.be( "Give me pears and pears!" ) ;
		expect( babel.solve( "Give me ${fruit1}[//uc] and $[//uc1]!" , ctx ) ).to.be( "Give me APPLES and Apples!" ) ;
	} ) ;
	
	it( "variable as number" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $1 apple!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apples!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apples!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
	
	it( "variable as boolean" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "This is $1!" , true ) ).to.be( "This is true!" ) ;
		expect( babel.solve( "This is $1!" , false ) ).to.be( "This is false!" ) ;
	} ) ;
	
	it( "should format things using the 'n?' notation" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
	
	it( "should format things using the 'b?' notation" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , true ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , 'true' ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , 1 ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , 10 ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , '1' ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , '10' ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , '++' ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , false ) ).to.be( "This is a lie!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , 'false' ) ).to.be( "This is a lie!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , 0 ) ).to.be( "This is a lie!" ) ;
		expect( babel.solve( "This is $1[b?the truth|a lie]!" , '0' ) ).to.be( "This is a lie!" ) ;
	} ) ;
	
	it( "should format things using the '?' (alias of 'n?') notation" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "This is $1[?the truth|a lie]!" , true ) ).to.be( "This is the truth!" ) ;
		expect( babel.solve( "This is $1[?the truth|a lie]!" , false ) ).to.be( "This is a lie!" ) ;
	} ) ;

	it( "should format things using the 'ng?' notation" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
	} ) ;
	
	it( "should format things using the 'n0?' notation" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 0 ) ).to.be( "There is no horse..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 1 ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
	} ) ;
	
	it( "should format things using the 'n?' notation" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "There is an $1[n:1]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There are $1[n:2]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There are horses..." ) ;
		expect( babel.solve( "There are $1[n:++]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There are horses..." ) ;
		
		var atom = new Atom( { "n?": [ "horse" , "horses" ] } ) ;
		expect( babel.solve( "There is an $1[n:1]..." , atom ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There are $1[n:2]..." , atom ) ).to.be( "There are horses..." ) ;
		expect( babel.solve( "There are $1[n:++]..." , atom ) ).to.be( "There are horses..." ) ;
		
		atom = Atom.parse( "[n?horse|horses]" ) ;
		expect( babel.solve( "There is an $1[n:1]..." , atom ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There are $1[n:2]..." , atom ) ).to.be( "There are horses..." ) ;
		expect( babel.solve( "There are $1[n:++]..." , atom ) ).to.be( "There are horses..." ) ;
	} ) ;
	
	it( "should format things using the 'n0g?' notation" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:1,g:'f'} ) ).to.be( "J'aime la jument!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 0 ) ).to.be( "J'aime aucun cheval!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:0,g:'f'} ) ).to.be( "J'aime aucune jument!" ) ;
	} ) ;
	
	it( "should format things using the 'a?' notation" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "$1[a?A |The |Some ||]$ jumps on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "A cat jumps on the table!" ) ;
		expect( babel.solve( "$1[a?A |The |Some ||]$ jumps on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cat jumps on the table!" ) ;
		expect( babel.solve( "$1[a?A |The |Some ||]$ jumps on the table!" , Atom.parse( "Misty[a:P]" ) ) ).to.be( "Misty jumps on the table!" ) ;
	} ) ;
	
	it( "should work with objects, using the path syntax" , () => {
		var babel = new Babel() ;
		
		var data = {
			bob: { firstName: "Bobby" , lastName: "Fischer" } ,
			alice: { firstName: "Alice" , lastName: "M." } ,
		} ;
		
		expect( babel.solve( "Hello $1{firstName}!" , data.bob ) ).to.be( "Hello Bobby!" ) ;
		expect( babel.solve( "Hello $1{firstName} $1{lastName}!" , data.bob ) ).to.be( "Hello Bobby Fischer!" ) ;
		expect( babel.solve( "Hello $1{bob.firstName} $1{bob.lastName} and $1{alice.firstName} $1{alice.lastName}!" , data ) ).to.be( "Hello Bobby Fischer and Alice M.!" ) ;
	} ) ;
	
	it( "$ without number should use the first arg, just like $1" , () => {
		var babel = new Babel() ;
		
		var data = {
			bob: { firstName: "Bobby" , lastName: "Fischer" } ,
			alice: { firstName: "Alice" , lastName: "M." } ,
		} ;
		
		expect( babel.solve( "Hello ${bob.firstName} ${bob.lastName} and ${alice.firstName} ${alice.lastName}!" , data ) ).to.be( "Hello Bobby Fischer and Alice M.!" ) ;
	} ) ;
	
	it( "undefined values for missing variable index/path" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $1 and $3!" , "apples" , "pears" ) ).to.be( "Give me apples and (undefined)!" ) ;
		expect( babel.solve( "Give me $3 and $2!" , "apples" , "pears" ) ).to.be( "Give me (undefined) and pears!" ) ;
		
		var ctx = {
			fruit: "apples"
		} ;
		
		expect( babel.solve( "Give me ${fruit} and ${excellentFruit}!" , ctx ) ).to.be( "Give me apples and (undefined)!" ) ;
		expect( babel.solve( "Give me ${excellentFruit} and ${fruit}!" , ctx ) ).to.be( "Give me (undefined) and apples!" ) ;
		expect( babel.solve( "Give me ${fruit}[//uc1] and ${excellentFruit}[//uc]!" , ctx ) ).to.be( "Give me Apples and (UNDEFINED)!" ) ;
	} ) ;
	
	it( "default values for missing variable index/path" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $1 and $3[def:strawberries]!" , "apples" , "pears" ) ).to.be( "Give me apples and strawberries!" ) ;
		expect( babel.solve( "Give me $3[default:strawberries] and $2!" , "apples" , "pears" ) ).to.be( "Give me strawberries and pears!" ) ;
		
		var ctx = {
			fruit: "apples"
		} ;
		
		expect( babel.solve( "Give me ${fruit} and ${excellentFruit}[default:strawberries]!" , ctx ) ).to.be( "Give me apples and strawberries!" ) ;
		expect( babel.solve( "Give me ${excellentFruit}[default:strawberries] and ${fruit}!" , ctx ) ).to.be( "Give me strawberries and apples!" ) ;
		expect( babel.solve( "Give me ${fruit}[//uc1] and ${excellentFruit}[def:strawberries//uc]!" , ctx ) ).to.be( "Give me Apples and STRAWBERRIES!" ) ;
	} ) ;
} ) ;



describe( "Escape special character" , () => {
	
	it( "escape inside sentence bracket" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $[default:pears/n:2]!" ) ).to.be( "Give me pears!" ) ;
		expect( babel.solve( "Give me $[default:pears and\\/or apples]!" ) ).to.be( "Give me pears and/or apples!" ) ;
	} ) ;
	
	it( "escape inside atom bracket" , () => {
		var babel = new Babel() ;
		
		expect( Atom.parse( "atom[default:pears/n:2]!" ) ).to.be.like( {
			k: "atom" ,
			def: "pears" ,
			n: '2'
		} ) ;
		
		expect( Atom.parse( "atom[default:pears and\\/or apples]!" ) ).to.be.like( {
			k: "atom" ,
			def: "pears and/or apples"
		} ) ;
		
		expect( Atom.parse( "num[n?one\\|1|two\\|2]" ) ).to.be.like( {
			k: "num" ,
			alt: [ "one|1" , "two|2" ] ,
			ord: ['n']
		} ) ;
	} ) ;
	
	it( "escape of | [ ] ( ) chars" ) ;
	it( "escape enum" ) ;
} ) ;



describe( "Sentence instances" , () => {
		
	it( "Basic sentence" , () => {
		var sentence = new Sentence( "Give me $1 apple$1[n?|s]!" ) ;
		
		expect( sentence.toString( 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( sentence.toString( 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( sentence.toString( 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( sentence.toString( 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
		
	it( ".toStringKFG()" , () => {
		var sentence = new Sentence( "I like ${name}!" ) ;
		
		expect( sentence.toStringKFG( { name: 'strawberries' } ) ).to.be( "I like strawberries!" ) ;
	} ) ;
} ) ;



describe( "Basic usage with language pack" , () => {
	
	it( "should format and localize" , () => {
		var babel = new Babel() ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				sentences: {
					"Give me $1 apple$1[n?|s]!" : "Donne-moi $1 pomme$1[n?|s]!"
				}
			}
		} ) ;
		
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
		
		// Change locale to fr
		babel.setLocale( 'fr' ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Donne-moi 0 pomme!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Donne-moi 1 pomme!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Donne-moi 2 pommes!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Donne-moi 3 pommes!" ) ;
		
		// Change locale back to the default, and create a new babel object using the fr locale, using the first one as its prototype
		babel.setLocale( null ) ;
		var babelFr = babel.use( 'fr' ) ;
		
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
		
		expect( babelFr.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Donne-moi 0 pomme!" ) ;
		expect( babelFr.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Donne-moi 1 pomme!" ) ;
		expect( babelFr.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Donne-moi 2 pommes!" ) ;
		expect( babelFr.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Donne-moi 3 pommes!" ) ;
	} ) ;
} ) ;



describe( "Language pack and functions" , () => {
	
	it( "should format and localize, using language functions" , () => {
		var babel = new Babel() ;
		var babelFr = babel.use( 'fr' ) ;
		
		var n2w = require( 'number-to-words' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			none: {
				functions: {
					nw: function( arg ) {
						arg.s = n2w.toWords( arg.n ) ;
						return arg ;
					}
				}
			} ,
			fr: {
				propertyIndexes: {
					g: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				} ,
				functions: {
					nw: function( arg ) {
						
						switch ( arg.n )
						{
							case 0: arg.s = 'zero' ; break ;
							case 1: arg.alt = [ 'un' , 'une' ] ; arg.ord = ['g'] ; break ;
							case 2: arg.s = 'deux' ; break ;
							case 3: arg.s = 'trois' ; break ;
							default: arg.s = '' + arg.n ;
						}
						
						return arg ;
					}
				} ,
				sentences: {
					"Give me $1[nw] apple$1[n?|s]!" : "Donne-moi $1[nw/g:f] pomme$1[n?|s]!" ,
					"There $1[n?is|are] $1[nw] horse$1[n?|s]!" : "Il y a $1[nw] chev$1[n?al|aux]!"
				}
			}
		} ) ;
		
		expect( babel.solve( "Give me $1[nw] apple$1[n?|s]!" , 0 ) ).to.be( "Give me zero apple!" ) ;
		expect( babel.solve( "Give me $1[nw] apple$1[n?|s]!" , 1 ) ).to.be( "Give me one apple!" ) ;
		expect( babel.solve( "Give me $1[nw] apple$1[n?|s]!" , 2 ) ).to.be( "Give me two apples!" ) ;
		expect( babel.solve( "Give me $1[nw] apple$1[n?|s]!" , 3 ) ).to.be( "Give me three apples!" ) ;
		
		expect( babel.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 0 ) ).to.be( "There is zero horse!" ) ;
		expect( babel.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 1 ) ).to.be( "There is one horse!" ) ;
		expect( babel.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 2 ) ).to.be( "There are two horses!" ) ;
		
		expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 0 ) ).to.be( "Donne-moi zero pomme!" ) ;
		expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 1 ) ).to.be( "Donne-moi une pomme!" ) ;
		expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 2 ) ).to.be( "Donne-moi deux pommes!" ) ;
		expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 3 ) ).to.be( "Donne-moi trois pommes!" ) ;
		
		expect( babelFr.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 0 ) ).to.be( "Il y a zero cheval!" ) ;
		expect( babelFr.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 1 ) ).to.be( "Il y a un cheval!" ) ;
		expect( babelFr.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 2 ) ).to.be( "Il y a deux chevaux!" ) ;
		
	} ) ;
	
	it( "should format and localize, and localize translatable variables" , () => {
		var babel = new Babel() ;
		var babelFr = babel.use( 'fr' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				propertyIndexes: {
					g: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				} ,
				sentences: {
					"Give me an $1!" : "Donne-moi $1[g?un|une] $1!" ,
					"I like $1[n:++]!" : "J'aime les $1[n:++]!"
				} ,
				atoms: {
					apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
					horse: { g:'m', "n?": [ 'cheval' , 'chevaux' ] } ,
				}
			}
		} ) ;
		
		//expect( babel.solve( "Give me an $1!" , "apple" ) ).to.be( "Give me an apple!" ) ;
		expect( babelFr.solve( "Give me an $1!" , "apple" ) ).to.be( "Donne-moi une pomme!" ) ;
		
		expect( babel.solve( "I like $1[n:++]!" , { "n?": [ "horse" , "horses" ] } ) ).to.be( "I like horses!" ) ;
		expect( babelFr.solve( "I like $1[n:++]!" , "horse" ) ).to.be( "J'aime les chevaux!" ) ;
	} ) ;

	it( "When a translation key does not exist, it should fallback to the root babel locale (so functions keep working)" , () => {
		var babel = new Babel( 'en' ) ;
		//var babelEn = babel.use( 'en' ) ;
		var babelFr = babel.use( 'fr' ) ;
		
		// When a translation is missing, it should use the base locale
		expect( babel.solve( "$1[1p//uc1] $1[n?am|are] sad..." , 1 ) ).to.be( "I am sad..." ) ;
		expect( babelFr.solve( "$1[1p//uc1] $1[n?am|are] sad..." , 1 ) ).to.be( "I am sad..." ) ;
	} ) ;
} ) ;



describe( "Advanced feature: list and enumeration" , () => {
	
	it( "basic enumeration with no rules should simply join with a space" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1[enum]." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want apple pear orange." ) ;
	} ) ;
	
	// TODO...
	it.skip( "array and no enum behavior" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want ???." ) ;
	} ) ;
	
	it( "when a string is given instead of an array, it should be equivalent to an array of the given string" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1[enum]." , "apple" ) ).to.be( "I want apple." ) ;
		expect( babel.solve( "I want $1." , "apple" ) ).to.be( "I want apple." ) ;
	} ) ;
	
	it( "enumeration with variable length" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [] ) ).to.be( "I want nothing." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" ] ) ).to.be( "I want apples." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" ] ) ).to.be( "I want apples and pears." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" ] ) ).to.be( "I want apples, pears and oranges." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" , "strawberries" ] ) ).to.be( "I want apples, pears, oranges and strawberries." ) ;
	} ) ;
	
	it( "the array length should be used as n" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [] ) ).to.be( "I want nothing." ) ;
		expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [ "apple" ] ) ).to.be( "I want something." ) ;
		expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [ "apple" , "pear" ] ) ).to.be( "I want two things." ) ;
		expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want many things." ) ;
		
		expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [] ) ).to.be( "I want nothing." ) ;
		expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [ "pear" ] ) ).to.be( "I want something: a pear." ) ;
		expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [ "pear" , "banana" ] ) ).to.be( "I want two things: a pear and a banana." ) ;
		expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [ "pear" , "banana" , "strawberry" ] ) ).to.be( "I want many things: a pear, a banana and a strawberry." ) ;
	} ) ;
	
	it( "enumeration with variable length, translation and operators in enumeration" , () => {
		var babel = new Babel() ;
		var babelFr = babel.use( 'fr' ) ;
		
		var n2w = require( 'number-to-words' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				sentences: {
					"I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." :
						"Je $1[n0?ne |]veux $1[n0?rien|quelque chose: |deux choses: |plusieurs choses: ]$1[enum:|$[ng?(un|une)|(des)] $|, $[ng?(un|une)|(des)] $| et $[ng?(un|une)|(des)] $]."
				} ,
				atoms: {
					"pear": { "n?": [ 'poire' , 'poires' ] , g: 'f' } ,
					"banana": { "n?": [ 'banane' , 'bananes' ] , g: 'f' } ,
					"strawberry": { "n?": [ 'fraise' , 'fraises' ] , g: 'f' }
				}
			}
		} ) ;
		
		var sentence = "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." ;

		expect( babel.solve( sentence , [] ) ).to.be( "I want nothing." ) ;
		expect( babel.solve( sentence , [ "pear" ] ) ).to.be( "I want something: a pear." ) ;
		expect( babel.solve( sentence , [ "pear" , "strawberry" ] ) ).to.be( "I want two things: a pear and a strawberry." ) ;
		expect( babel.solve( sentence , [ "pear" , "banana" , "strawberry" ] ) ).to.be( "I want many things: a pear, a banana and a strawberry." ) ;
		
		expect( babelFr.solve( sentence , [] ) ).to.be( "Je ne veux rien." ) ;
		expect( babelFr.solve( sentence , [ "pear" ] ) ).to.be( "Je veux quelque chose: une poire." ) ;
		expect( babelFr.solve( sentence , [ "pear" , "strawberry" ] ) ).to.be( "Je veux deux choses: une poire et une fraise." ) ;
		expect( babelFr.solve( sentence , [ "pear" , "banana" , "strawberry" ] ) ).to.be( "Je veux plusieurs choses: une poire, une banane et une fraise." ) ;
		
		expect( babelFr.solve( sentence , [ { k:"pear" , n:3 } ] ) ).to.be( "Je veux plusieurs choses: des poires." ) ;
		expect( babelFr.solve( sentence , [ { k:"pear" , n:'++' } , "banana" ] ) ).to.be( "Je veux plusieurs choses: des poires et une banane." ) ;
	} ) ;
} ) ;



describe( "Advanced feature: reference operator" , () => {
	
	var babel = new Babel() ;
	
	it( "using reference operator that point to an atom should extend the current atom/part" , () => {
		var e = Atom.parse( "[uv:1000|1/uf:$km|$m/um:N+]" ) ;
		
		expect( babel.solve( "$1[$2]" , 3 , e ) ).to.be( "3m" ) ;
		
		expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		expect( babel.solve( "${length}[$1:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		expect( babel.solve( "$1{length}[$:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		expect( babel.solve( "$1{length}[$1:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		
		expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3km 21m" ) ;
	} ) ;
	
	it( "using reference operator stacked with other operators" , () => {
		var e = Atom.parse( "[uv:1000|1/uf:$km|$m/um:N+]" ) ;
		
		expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3km 21m" ) ;
		expect( babel.solve( "${length}[$:lengthUnit/um:R]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3.021km" ) ;
		expect( babel.solve( "${length}[$:lengthUnit/uf:$ km|$ m/uenum:0|$|, $| and $]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3 km and 21 m" ) ;
	} ) ;
} ) ;



describe( "Post-filters" , () => {
	
	it( "should apply post-filters 'uc1' (upper-case first letter)" , () => {
		var babel = new Babel() ;
		var babelFr = babel.use( 'fr' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				sentences: {
					"$1[//uc1]: I like that!": "$1[//uc1]: j'adore ça!",
					"$1[n:++//uc1]: I like that!": "$1[n:++//uc1]: j'adore ça!"
				} ,
				atoms: {
					apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
					pear: { g:'f', "n?": [ 'poire' , 'poires' ] }
				}
			}
		} ) ;
		
		expect( babel.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Apple: I like that!" ) ;
		expect( babel.solve( "$1[//uc1]: I like that!" , "pear" ) ).to.be( "Pear: I like that!" ) ;
		
		expect( babelFr.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Pomme: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[//uc1]: I like that!" , "pear" ) ).to.be( "Poire: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[n:++//uc1]: I like that!" , "apple" ) ).to.be( "Pommes: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[n:++//uc1]: I like that!" , "pear" ) ).to.be( "Poires: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[//uc1]: I like that!" , { k:"apple", n:'++'} ) ).to.be( "Pommes: j'adore ça!" ) ;
		
		expect( babel.solve( "${fruit//uc1}: I like that!" , { fruit: "apple" } ) ).to.be( "Apple: I like that!" ) ;
	} ) ;
	
	it( "should apply post-filters various filters combination" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Apple: I like that!" ) ;
		expect( babel.solve( "$1[//uc]: I like that!" , "apple" ) ).to.be( "APPLE: I like that!" ) ;
		expect( babel.solve( "$1[//lc]: I like that!" , "APPLE" ) ).to.be( "apple: I like that!" ) ;
		expect( babel.solve( "$1[//lc/uc1]: I like that!" , "APPLE" ) ).to.be( "Apple: I like that!" ) ;
		
		expect( babel.solve( "${fruit//lc/uc1}: I like that!" , { fruit: "APPLE" } ) ).to.be( "Apple: I like that!" ) ;
		
		expect( babel.solve( "echo ${arg//shellarg}" , { arg: "simple" } ) ).to.be( "echo 'simple'" ) ;
		expect( babel.solve( "echo ${arg//shellarg}" , { arg: "with single ' quote" } ) ).to.be( "echo 'with single '\\'' quote'" ) ;
	} ) ;
	
	it( "should apply english post-filters" , () => {
		var babel = new Babel() ;
		
		expect( babel.solve( "You take $1[//en:the]." , "apple" ) ).to.be( "You take the apple." ) ;
		expect( babel.solve( "You take $1[//en:the]." , "Excalibur" ) ).to.be( "You take Excalibur." ) ;
		expect( babel.solve( "You take $1[//en:a]." , "apple" ) ).to.be( "You take an apple." ) ;
		expect( babel.solve( "You take $1[//en:a]." , "banana" ) ).to.be( "You take a banana." ) ;
		expect( babel.solve( "You take $1[//en:a]." , "Excalibur" ) ).to.be( "You take Excalibur." ) ;
		
		expect( babel.solve( "You take ${noun//en:the}." , { noun: "apple" } ) ).to.be( "You take the apple." ) ;
	} ) ;
	
	it( "should apply path post-filters" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "$[//extname]" , "README.md" ) ).to.be( ".md" ) ;
		expect( babel.solve( "$[//extname]" , "~/somedir/README.md" ) ).to.be( ".md" ) ;
		expect( babel.solve( "$[//basename]" , "~/somedir/README.md" ) ).to.be( "README.md" ) ;
		expect( babel.solve( "$[//basenameNoExt]" , "~/somedir/README.md" ) ).to.be( "README" ) ;
		expect( babel.solve( "$[//dirname]" , "~/somedir/README.md" ) ).to.be( "~/somedir" ) ;
	} ) ;
	
	it( "more filters tests..." ) ;
} ) ;



describe( "Misc" , () => {
	
	it( "should extract the named variables from the format string" , () => {
		expect( Babel.getNamedVars( "Hello bob" ) ).to.equal( [] ) ;
		expect( Babel.getNamedVars( "Hello ${friend}" ) ).to.equal( [ 'friend' ] ) ;
		expect( Babel.getNamedVars( "Hello ${first} and ${second}" ) ).to.equal( [ 'first' , 'second' ] ) ;
		expect( Babel.getNamedVars( "Hello $1, ${first}, $2, $ and ${second} love $$..." ) ).to.equal( [ 'first' , 'second' ] ) ;
		expect( Babel.getNamedVars( "Hello ${person.name} and ${person2.name}" ) ).to.equal( [ 'person.name' , 'person2.name' ] ) ;
		expect( Babel.getNamedVars( "Hello ${first} and ${second}, glad to meet you ${first}" ) ).to.equal( [ 'first' , 'second' ] ) ;
	} ) ;

	it( "edge cases" , () => {
		var babel = new Babel() ;
		expect( babel.solve( "--'${content}'--" , { content: new String( 'content' ) } ) ).to.be( "--'content'--" ) ;
		
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: null } ) ).to.be( "nothing" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [] } ) ).to.be( "nothing" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ '' ] } ) ).to.be( "something: --''--" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ 'content' ] } ) ).to.be( "something: --'content'--" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ new String( 'content' ) ] } ) ).to.be( "something: --'content'--" ) ;
	} ) ;
} ) ;



describe( "Core langpack features" , () => {
	
	describe( "'en' core langpack" , () => {

		it( "English articles" , () => {
			var babel = new Babel( 'en' ) ;

			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "A cat jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "animal[a:i]" ) ) ).to.be( "An animal jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "Misty[a:P]" ) ) ).to.be( "Misty jumps on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cat jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "animal[a:d]" ) ) ).to.be( "The animal jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "Misty[a:P]" ) ) ).to.be( "Misty jumps on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "animal[a:i/n:0]" ) ) ).to.be( "No animal jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "animal[a:d/n:0]" ) ) ).to.be( "No animal jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "Misty[a:P/n:0]" ) ) ).to.be( "No Misty jumps on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "animal[a:i/n:1]" ) ) ).to.be( "An animal jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "animal[a:d/n:1]" ) ) ).to.be( "The animal jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "Misty[a:P/n:1]" ) ) ).to.be( "Misty jumps on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] jump on the table!" , Atom.parse( "animals[a:i/n:2]" ) ) ).to.be( "Animals jump on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jump on the table!" , Atom.parse( "animals[a:d/n:2]" ) ) ).to.be( "The animals jump on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "Misty[a:P/n:2]" ) ) ).to.be( "Misty jumps on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] jump on the table!" , Atom.parse( "animals[a:i/n:++]" ) ) ).to.be( "Animals jump on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jump on the table!" , Atom.parse( "animals[a:d/n:++]" ) ) ).to.be( "The animals jump on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] jumps on the table!" , Atom.parse( "Misty[a:P/n:++]" ) ) ).to.be( "Misty jumps on the table!" ) ;

			// Override
			expect( babel.solve( "$1[+d/a:d//uc1] jumps on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "The cat jumps on the table!" ) ;
		} ) ;

		it( "English noun flexion tests" , () => {
			var babel = new Babel( 'en' ) ;

			babel.extendLocale( 'en' , {
				atoms: {
					cat: Atom.parse( "cat[n?cat|cats]" ) ,
					jump: Atom.parse( "jump[np?(jump|jump|jumps)|(jump|jump|jump)]" )
				}
			} ) ;
			
			expect( babel.solve( "$1[+d//uc1] $[k:jump] on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "A cat jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:jump] on the table!" , Atom.parse( "cat[a:i/n:++]" ) ) ).to.be( "Cats jump on the table!" ) ;
			expect( babel.solve( "$1[+d/n:++//uc1] jump on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "Cats jump on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] $[k:jump] on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cat jumps on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:jump] on the table!" , Atom.parse( "cat[a:d/n:++]" ) ) ).to.be( "The cats jump on the table!" ) ;
			expect( babel.solve( "$1[+d/n:++//uc1] jump on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cats jump on the table!" ) ;
		} ) ;

		it( "English verbs" , () => {
			var babel = new Babel( 'en' ) ;

			babel.extendLocale( 'en' , {
				atoms: {
					cat: Atom.parse( "cat[n?cat|cats]" ) ,
					be: Atom.parse( "be[np?(am|are|is)|(are|are|are)]" )
				}
			} ) ;
			
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:1]" ) ) ).to.be( "I am on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:1/n:1]" ) ) ).to.be( "I am on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:1/n:2]" ) ) ).to.be( "We are on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:2]" ) ) ).to.be( "You are on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:2/n:1]" ) ) ).to.be( "You are on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:2/n:2]" ) ) ).to.be( "You are on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:3]" ) ) ).to.be( "It is on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:3/n:1]" ) ) ).to.be( "It is on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:3/g:m]" ) ) ).to.be( "He is on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:3/n:1/g:f]" ) ) ).to.be( "She is on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "[+p:3/n:2]" ) ) ).to.be( "They are on the table!" ) ;

			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "cat[a:i]" ) ) ).to.be( "A cat is on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "The cat is on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "cat[a:i/n:++]" ) ) ).to.be( "Cats are on the table!" ) ;
			expect( babel.solve( "$1[+d//uc1] $[k:be] on the table!" , Atom.parse( "cat[a:d/n:++]" ) ) ).to.be( "The cats are on the table!" ) ;
		} ) ;

		it( "zzz English possessives" , () => {
			var babel = new Babel( 'en' ) ;

			babel.extendLocale( 'en' , {
				atoms: {
					cat: Atom.parse( "cat[l:n/n?cat|cats]" ) ,
					be: Atom.parse( "be[l:v/np?(am|are|is)|(are|are|are)]" )
				}
			} ) ;
			
			expect( babel.solve( "$1[+d:p|1|1//uc1] $[k:be] on the table!" , Atom.parse( "cat[a:d]" ) ) ).to.be( "My cat is on the table!" ) ;
			expect( babel.solve( "$1[+d:p|1|1//uc1] $[k:be] on the table!" , Atom.parse( "cat[+p:1/n:++]" ) ) ).to.be( "My cats are on the table!" ) ;
		} ) ;
	} ) ;

	it( "testing few beta features" , () => {
		var babel = new Babel( 'en' ) ;
		var babelFr = babel.use( 'fr' ) ;

		babel.extend( {
			fr: {
				sentences: {
					"$1[1p//uc1] $1[n?am|are] happy.": "$1[1p//uc1] $1[n?suis|sommes] content$1[n?|s]." ,
					"$1[3p//uc1] $1[n?is|are] happy.": "$1[3p//uc1] $1[n?est|sont] content$1[n?|s]." ,
					"$1[//uc1], beautiful $1.": "$1[+d/a:d//uc1], $1[gel?(le beau|le bel)|(la belle)]$1." ,
					"I want a $1.": "Je veux $1[+d:i]."
				} ,
				atoms: {
					tree: { "n?": [ "arbre" , "arbres" ] , g: 'm' } ,
					oak: { "n?": [ "chêne" , "chênes" ] , g: 'm' } ,
					flower: { "n?": [ "fleur" , "fleurs" ] , g: 'f' } ,
					bee: { "n?": [ "abeille" , "abeilles" ] , g: 'f' } ,
				}
			}
		} ) ;
		
		expect( babel.solve( "$1[1p//uc1] $1[n?am|are] happy." , 1 ) ).to.be( "I am happy." ) ;
		expect( babel.solve( "$1[1p//uc1] $1[n?am|are] happy." , 3 ) ).to.be( "We are happy." ) ;
		expect( babel.solve( "$1[3p//uc1] $1[n?is|are] happy." , 1 ) ).to.be( "It is happy." ) ;
		expect( babel.solve( "$1[3p//uc1] $1[n?is|are] happy." , 3 ) ).to.be( "They are happy." ) ;
		
		expect( babelFr.solve( "$1[1p//uc1] $1[n?am|are] happy." , 1 ) ).to.be( "Je suis content." ) ;
		expect( babelFr.solve( "$1[1p//uc1] $1[n?am|are] happy." , 3 ) ).to.be( "Nous sommes contents." ) ;
		expect( babelFr.solve( "$1[3p//uc1] $1[n?is|are] happy." , 1 ) ).to.be( "Il est content." ) ;
		expect( babelFr.solve( "$1[3p//uc1] $1[n?is|are] happy." , 3 ) ).to.be( "Ils sont contents." ) ;
		
		expect( babel.solve( "$1[//uc1], beautiful $1." , "tree" ) ).to.be( "Tree, beautiful tree." ) ;
		
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "tree" ) ).to.be( "L'arbre, le bel arbre." ) ;
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "oak" ) ).to.be( "Le chêne, le beau chêne." ) ;
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "flower" ) ).to.be( "La fleur, la belle fleur." ) ;
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "bee" ) ).to.be( "L'abeille, la belle abeille." ) ;
		
		expect( babel.solve( "I want a $1." , "tree" ) ).to.be( "I want a tree." ) ;
		
		expect( babelFr.solve( "I want a $1." , "tree" ) ).to.be( "Je veux un arbre." ) ;
		expect( babelFr.solve( "I want a $1." , "flower" ) ).to.be( "Je veux une fleur." ) ;
		expect( babelFr.solve( "I want a $1." , { k: "flower" , n: "++" } ) ).to.be( "Je veux des fleurs." ) ;
	} ) ;
} ) ;



describe( "String-kit's format() interoperability" , () => {
	
	it( "should escape argument using the autoEscape regexp" , () => {
		var babel , regex ;
		
		babel = new Babel() ;
		expect( babel.solve( "Give me ^g^/$^:!" , 'apple' ) ).to.be( "Give me ^g^/apple^:!" ) ;
		expect( babel.solve( "Give me ^g^/$^:!" , 'app^le' ) ).to.be( "Give me ^g^/app^le^:!" ) ;
		
		regex = /(\^|%)/g ;
		regex.substitution = '$1$1' ;
		babel = new Babel( regex ) ;
		expect( babel.solve( "Give me ^g^/$^:!" , 'apple' ) ).to.be( "Give me ^g^/apple^:!" ) ;
		expect( babel.solve( "Give me ^g^/$^:!" , 'app^le' ) ).to.be( "Give me ^g^/app^^le^:!" ) ;
	} ) ;
} ) ;

