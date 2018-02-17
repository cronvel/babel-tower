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



var Babel = require( '../lib/Babel.js' ) ;
var Element = Babel.Element ;
var Sentence = Babel.Sentence ;

var string = require( 'string-kit' ) ;
var expect = require( 'expect.js' ) ;



function deb( v )
{
	console.log( string.inspect( { style: 'color' , depth: 15 } , v ) ) ;
}



			/* Tests */



describe( "Element parser and solver" , function() {
	
	var babel = new Babel() ;
	var element ;
	
	babel.extend( {
		fr: {
			propertyIndexes: {
				g: { m: 0 , f: 1 , n: 2 , h: 2 }
			} ,
			elements: {
				apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
				horse: { "ng?": [ [ 'cheval' , 'jument' ] , [ 'chevaux' , 'juments' ] ] } ,
			}
		}
	} ) ;
	
	var babelFr = babel.use( 'fr' ) ;
	
	it( "should parse an element" , function() {
		expect( Element.parse( "horse" ) ).to.eql( { k: "horse" } ) ;
		expect( Element.parse( "[k:horse]" ) ).to.eql( { k: "horse" } ) ;
		expect( Element.parse( "horse[ng?(cheval|jument)|(chevaux|juments)]" ) ).to.eql( {
			k: "horse" ,
			alt: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] ,
			ord: ['n','g']
		} ) ;
		expect( Element.parse( "horse[n?cheval|chevaux]" ) ).to.eql( {
			k: "horse" ,
			alt: [ "cheval" , "chevaux" ] ,
			ord: ['n']
		} ) ;
		expect( Element.parse( "horse[g?cheval|jument]" ) ).to.eql( {
			k: "horse" ,
			alt: [ "cheval" , "jument" ] ,
			ord: ['g']
		} ) ;
	} ) ;
	
	it( "creating an element from a string should create a translatable Element object" , function() {
		expect( new Element( "horse" ) ).to.eql( { k: "horse" } ) ;
	} ) ;
	
	it( "creating an element from a number should create a Element object with a 'n' (number) property" , function() {
		expect( new Element( 3 ) ).to.eql( { n: 3 } ) ;
	} ) ;
	
	it( "a Element created from a string should resolve to itself when the element is not in the dictionary" , function() {
		expect( new Element( "horse" ).solve( babel ) ).to.be( "horse" ) ;
	} ) ;
	
	it( "a Element created from a string should resolve to the element existing in the dictionary" , function() {
		expect( new Element( "apple" ).solve( babelFr ) ).to.be( "pomme" ) ;
	} ) ;
	
	it( "a Element created directly with 'alt' and 'ord'" , function() {
		expect( new Element( { g: 'm' , ord: ['g'] , alt: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { g: 'f' , ord: ['g'] , alt: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
		
		expect( new Element( { n: 0 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 1 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 2 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 5 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 'many' , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( new Element( { n: 0 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "rien" ) ;
		expect( new Element( { n: 1 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 2 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 5 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 'many' , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
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
		
		expect( new Element( { p: '1' , n: 1 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "je" ) ;
		expect( new Element( { p: '2' , n: 1 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "tu" ) ;
		expect( new Element( { p: '3' , n: 1 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "il" ) ;
		expect( new Element( { p: '3' , n: 1 , g: 'f' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "elle" ) ;
		expect( new Element( { p: '1' , n: 2 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "nous" ) ;
		expect( new Element( { p: '2' , n: 2 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "vous" ) ;
		expect( new Element( { p: '3' , n: 2 , g: 'm' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "ils" ) ;
		expect( new Element( { p: '3' , n: 2 , g: 'f' , ord: ord , alt: npg } ).solve( babel ) ).to.be( "elles" ) ;
	} ) ;
	
	it( "a Element created with a 'n' and 'n?' should resolve to the appropriate alternative" , function() {
		expect( new Element( { n: 0 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
		expect( new Element( { n: 1 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
		expect( new Element( { n: 2 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
		expect( new Element( { n: 3 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
		
		expect( new Element( { "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
	} ) ;
	
	it( "a Element created with a 'p' and 'p?' should resolve to the appropriate alternative" , function() {
		expect( new Element( { p: '1' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "je" ) ;
		expect( new Element( { p: '2' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "tu" ) ;
		expect( new Element( { p: '3' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "il" ) ;
	
		expect( new Element( { "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "il" ) ;
	} ) ;
	
	it( "a Element created with a 'u' and 'u?' should resolve to the appropriate alternative" , function() {
		expect( new Element( { u: 'c' , "u?": [ "cat" , "Misty" ] } ).solve( babel ) ).to.be( "cat" ) ;
		expect( new Element( { u: 'p' , "u?": [ "cat" , "Misty" ] } ).solve( babel ) ).to.be( "Misty" ) ;
		
		expect( new Element( { "u?": [ "cat" , "Misty" ] } ).solve( babel ) ).to.be( "cat" ) ;
	} ) ;
	
	it( "a Element created with a 'g' and 'g?' should resolve to the appropriate alternative" , function() {
		expect( new Element( { g: 'm' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { g: 'f' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( new Element( { g: 'n' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { g: 'h' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		
		expect( new Element( { "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
	} ) ;
	
	it( "a Element created with a 'n' and/or 'g' and 'ng?' should resolve to the appropriate alternative" , function() {
		expect( new Element( { n: 0 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 1 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 2 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 3 , g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( new Element( { n: 0 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( new Element( { n: 1 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( new Element( { n: 2 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "juments" ) ;
		expect( new Element( { n: 3 , g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "juments" ) ;
		
		expect( new Element( { n: 0 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 1 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 2 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 3 , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( new Element( { g: 'm' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( new Element( { g: 'f' , "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		
		expect( new Element( { "ng?": [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
	} ) ;
	
	it( "a Element created with a 'n', 'p', 'g' and 'npg?' should resolve to the appropriate alternative" , function() {
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
		expect( new Element( { p: '1' , n: 1 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "je" ) ;
		expect( new Element( { p: '2' , n: 1 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "tu" ) ;
		expect( new Element( { p: '3' , n: 1 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "il" ) ;
		expect( new Element( { p: '3' , n: 1 , g: 'f' , "npg?": npg } ).solve( babel ) ).to.be( "elle" ) ;
		expect( new Element( { p: '1' , n: 2 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "nous" ) ;
		expect( new Element( { p: '2' , n: 2 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "vous" ) ;
		expect( new Element( { p: '3' , n: 2 , g: 'm' , "npg?": npg } ).solve( babel ) ).to.be( "ils" ) ;
		expect( new Element( { p: '3' , n: 2 , g: 'f' , "npg?": npg } ).solve( babel ) ).to.be( "elles" ) ;
	} ) ;
	
	it( "a Element created with a 'n' and/or 'g' and 'k' should extend the element existing in the dictionary with 'n' and resolve to the appropriate alternative" , function() {
		expect( new Element( { n: 0 , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 1 , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 2 , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 3 , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		
		expect( new Element( { n: 0 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 1 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Element( { n: 2 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		expect( new Element( { n: 3 , g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		
		expect( new Element( { n: 0 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( new Element( { n: 1 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( new Element( { n: 2 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "juments" ) ;
		expect( new Element( { n: 3 , g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "juments" ) ;
		
		expect( new Element( { g: 'm' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Element( { g: 'f' , k: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( new Element( { g: 'n' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( new Element( { g: 'h' , k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		
		expect( new Element( { k: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
	} ) ;
	
	it.skip( "parse units" , function() {
		deb( Element.parse( "[n:1/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:N+]" ) ) ;
		expect( Element.parse( "[n:1/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:N+]" ) ).to.eql( {
			n: "1" ,
			uv: [ 1000 , 1 ] ,
			uf: [ "$km" , "$m" ] ,
			uenum: [ "0" , "$" , ", $" , " and $" ] ,
			um: "N+"
		} ) ;
		
		expect( Element.parse( "[n:30/uv:12|1/uf:$ $[n?foot|feet]|$ $[n?inch|inches]/uenum:0|$|, $| and $/um:N+]" ) ).to.eql( {
			n: "30" ,
			uv: [ 12 , 1 ] ,
			uf: [ "$ $[n?foot|feet]" , "$ $[n?inch|inches]" ] ,
			uenum: [ "0" , "$" , ", $" , " and $" ] ,
			um: "N+"
		} ) ;
	} ) ;
} ) ;



describe( "Units of measurement" , function() {
	
	var babel = new Babel() ;
	
	it( "using an enumeration of natural positive integer units" , function() {
		expect( Element.parse( "[n:1004/uv:1000|1/uf:$km|$m/um:N+]" ).solve( babel ) )
			.to.be( '1km 4m' ) ;
		expect( Element.parse( "[n:1004/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1km and 4m' ) ;
		expect( Element.parse( "[n:1/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1 inch' ) ;
		expect( Element.parse( "[n:3/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '3 inches' ) ;
		expect( Element.parse( "[n:12/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1 foot' ) ;
		expect( Element.parse( "[n:24/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '2 feet' ) ;
		expect( Element.parse( "[n:25/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '2 feet and 1 inch' ) ;
		expect( Element.parse( "[n:27/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '2 feet and 3 inches' ) ;
		expect( Element.parse( "[n:50/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '1 yard, 1 foot and 2 inches' ) ;
		// 10km
		expect( Element.parse( "[n:393700.7874015748/uv:63360|36|12|1/uf:$ mile$[n?|s]|$ yard$[n?|s]|$ $[n?foot|feet]|$ inch$[n?|es]/uenum:0|$|, $| and $/um:N+]" ).solve( babel ) )
			.to.be( '6 miles, 376 yards and 4 inches' ) ;
	} ) ;
	
	it( "using a real of the closest unit" , function() {
		expect( Element.parse( "[n:1200/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Element.parse( "[n:1200/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Element.parse( "[n:800/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.8km' ) ;
		expect( Element.parse( "[n:600/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.6km' ) ;
		expect( Element.parse( "[n:500/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '5hm' ) ;
		expect( Element.parse( "[n:600/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.6km' ) ;
		expect( Element.parse( "[n:500/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '500m' ) ;
		expect( Element.parse( "[n:0.2/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R]" ).solve( babel ) )
			.to.be( '0.2m' ) ;
	} ) ;
	
	it( "using a real >= 1 (when possible) of the closest unit" , function() {
		expect( Element.parse( "[n:1200/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Element.parse( "[n:1200/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '1.2km' ) ;
		expect( Element.parse( "[n:800/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '8hm' ) ;
		expect( Element.parse( "[n:600/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '6hm' ) ;
		expect( Element.parse( "[n:500/uv:1000|100|1/uf:$km|$hm|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '5hm' ) ;
		expect( Element.parse( "[n:600/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '600m' ) ;
		expect( Element.parse( "[n:500/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '500m' ) ;
		expect( Element.parse( "[n:0.2/uv:1000|1/uf:$km|$m/uenum:0|$|, $| and $/um:R1+]" ).solve( babel ) )
			.to.be( '0.2m' ) ;
	} ) ;
} ) ;



describe( "Basic usage without language pack" , function() {
	
	it( "should format $$ into $" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "Give me $$!" ) ).to.be( "Give me $!" ) ;
	} ) ;
	
	it( "single $ behaviour should default to the first argument or to the last used argument+path" , function() {
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
	
	it( "should format things accordingly" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
	
	it( "should format things using the 'ng?' notation" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
	} ) ;
	
	it( "should format things using the 'n0?' notation" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 0 ) ).to.be( "There is no horse..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 1 ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
	} ) ;
	
	it( "should format things using the 'n?' notation" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "There is an $1[n:1]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There are $1[n:2]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There are horses..." ) ;
		expect( babel.solve( "There are $1[n:many]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There are horses..." ) ;
		
		var element = new Element( { "n?": [ "horse" , "horses" ] } ) ;
		expect( babel.solve( "There is an $1[n:1]..." , element ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There are $1[n:2]..." , element ) ).to.be( "There are horses..." ) ;
		expect( babel.solve( "There are $1[n:many]..." , element ) ).to.be( "There are horses..." ) ;
		
		element = Element.parse( "[n?horse|horses]" ) ;
		expect( babel.solve( "There is an $1[n:1]..." , element ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There are $1[n:2]..." , element ) ).to.be( "There are horses..." ) ;
		expect( babel.solve( "There are $1[n:many]..." , element ) ).to.be( "There are horses..." ) ;
	} ) ;
	
	it( "should format things using the 'n0g?' notation" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:1,g:'f'} ) ).to.be( "J'aime la jument!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 0 ) ).to.be( "J'aime aucun cheval!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:0,g:'f'} ) ).to.be( "J'aime aucune jument!" ) ;
	} ) ;
	
	it( "should work with objects, using the path syntax" , function() {
		var babel = new Babel() ;
		
		var data = {
			bob: { firstName: "Bobby" , lastName: "Fischer" } ,
			alice: { firstName: "Alice" , lastName: "M." } ,
		} ;
		
		expect( babel.solve( "Hello $1{firstName}!" , data.bob ) ).to.be( "Hello Bobby!" ) ;
		expect( babel.solve( "Hello $1{firstName} $1{lastName}!" , data.bob ) ).to.be( "Hello Bobby Fischer!" ) ;
		expect( babel.solve( "Hello $1{bob.firstName} $1{bob.lastName} and $1{alice.firstName} $1{alice.lastName}!" , data ) ).to.be( "Hello Bobby Fischer and Alice M.!" ) ;
	} ) ;
	
	it( "$ without number should use the first arg, just like $1" , function() {
		var babel = new Babel() ;
		
		var data = {
			bob: { firstName: "Bobby" , lastName: "Fischer" } ,
			alice: { firstName: "Alice" , lastName: "M." } ,
		} ;
		
		expect( babel.solve( "Hello ${bob.firstName} ${bob.lastName} and ${alice.firstName} ${alice.lastName}!" , data ) ).to.be( "Hello Bobby Fischer and Alice M.!" ) ;
	} ) ;
	
	it( "undefined values for missing variable index/path" , function() {
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
	
	it( "default values for missing variable index/path" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $1 and $3[d:strawberries]!" , "apples" , "pears" ) ).to.be( "Give me apples and strawberries!" ) ;
		expect( babel.solve( "Give me $3[default:strawberries] and $2!" , "apples" , "pears" ) ).to.be( "Give me strawberries and pears!" ) ;
		
		var ctx = {
			fruit: "apples"
		} ;
		
		expect( babel.solve( "Give me ${fruit} and ${excellentFruit}[default:strawberries]!" , ctx ) ).to.be( "Give me apples and strawberries!" ) ;
		expect( babel.solve( "Give me ${excellentFruit}[default:strawberries] and ${fruit}!" , ctx ) ).to.be( "Give me strawberries and apples!" ) ;
		expect( babel.solve( "Give me ${fruit}[//uc1] and ${excellentFruit}[d:strawberries//uc]!" , ctx ) ).to.be( "Give me Apples and STRAWBERRIES!" ) ;
	} ) ;
} ) ;



describe( "Escape special character" , function() {
	
	it( "escape inside sentence bracket" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "Give me $[default:pears/n:2]!" ) ).to.be( "Give me pears!" ) ;
		expect( babel.solve( "Give me $[default:pears and\\/or apples]!" ) ).to.be( "Give me pears and/or apples!" ) ;
	} ) ;
	
	it( "escape inside element bracket" , function() {
		var babel = new Babel() ;
		
		expect( Element.parse( "element[default:pears/n:2]!" ) ).to.eql( {
			k: "element" ,
			d: "pears" ,
			n: 2
		} ) ;
		
		expect( Element.parse( "element[default:pears and\\/or apples]!" ) ).to.eql( {
			k: "element" ,
			d: "pears and/or apples"
		} ) ;
		
		expect( Element.parse( "num[n?one\\|1|two\\|2]" ) ).to.eql( {
			k: "num" ,
			alt: [ "one|1" , "two|2" ] ,
			ord: ['n']
		} ) ;
	} ) ;
	
	it( "escape of | [ ] ( ) chars" ) ;
	it( "escape enum" ) ;
} ) ;



describe( "Sentence instances" , function() {
		
	it( "Basic sentence" , function() {
		var sentence = new Sentence( "Give me $1 apple$1[n?|s]!" ) ;
		
		expect( sentence.toString( 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( sentence.toString( 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( sentence.toString( 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( sentence.toString( 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
		
	it( ".toStringKFG()" , function() {
		var sentence = new Sentence( "I like ${name}!" ) ;
		
		expect( sentence.toStringKFG( { name: 'strawberries' } ) ).to.be( "I like strawberries!" ) ;
	} ) ;
} ) ;



describe( "Basic usage with language pack" , function() {
	
	it( "should format and localize" , function() {
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



describe( "Language pack and functions" , function() {
	
	it( "should format and localize, using language functions" , function() {
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
	
	it( "should format and localize, and localize translatable variables" , function() {
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
					"I like $1[n:many]!" : "J'aime les $1[n:many]!"
				} ,
				elements: {
					apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
					horse: { g:'m', "n?": [ 'cheval' , 'chevaux' ] } ,
				}
			}
		} ) ;
		
		//expect( babel.solve( "Give me an $1!" , "apple" ) ).to.be( "Give me an apple!" ) ;
		expect( babelFr.solve( "Give me an $1!" , "apple" ) ).to.be( "Donne-moi une pomme!" ) ;
		
		expect( babel.solve( "I like $1[n:many]!" , { "n?": [ "horse" , "horses" ] } ) ).to.be( "I like horses!" ) ;
		expect( babelFr.solve( "I like $1[n:many]!" , "horse" ) ).to.be( "J'aime les chevaux!" ) ;
	} ) ;
} ) ;



describe( "Advanced feature: list and enumeration" , function() {
	
	it( "basic enumeration with no rules should simply join with a space" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1[enum]." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want apple pear orange." ) ;
	} ) ;
	
	// TODO...
	it.skip( "array and no enum behavior" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want ???." ) ;
	} ) ;
	
	it( "when a string is given instead of an array, it should be equivalent to an array of the given string" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1[enum]." , "apple" ) ).to.be( "I want apple." ) ;
		expect( babel.solve( "I want $1." , "apple" ) ).to.be( "I want apple." ) ;
	} ) ;
	
	it( "enumeration with variable length" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [] ) ).to.be( "I want nothing." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" ] ) ).to.be( "I want apples." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" ] ) ).to.be( "I want apples and pears." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" ] ) ).to.be( "I want apples, pears and oranges." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" , "strawberries" ] ) ).to.be( "I want apples, pears, oranges and strawberries." ) ;
	} ) ;
	
	it( "the array length should be used as n" , function() {
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
	
	it( "enumeration with variable length, translation and operators in enumeration" , function() {
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
				elements: {
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
		expect( babelFr.solve( sentence , [ { k:"pear" , n:'many' } , "banana" ] ) ).to.be( "Je veux plusieurs choses: des poires et une banane." ) ;
	} ) ;
} ) ;



describe( "Advanced feature: reference operator" , function() {
	
	var babel = new Babel() ;
	
	it( "using reference operator that point to verb element" , function() {
		var ctx = {
			verbe: {
				"etre": Element.parse( "être[p?suis|es|est]" ) ,
				//"avoir": 
			} ,
			sujet: {
				moi: Element.parse( "[p:1/s:je]" ) ,
				bob: Element.parse( "[s:Bob]" ) ,
			}
		} ;
		
		expect( babel.solve( "${sujet.moi//uc1} $[$:verbe.etre] content!" , ctx ) ).to.be( "Je suis content!" ) ;
		expect( babel.solve( "${sujet.bob//uc1} $[$:verbe.etre] content!" , ctx ) ).to.be( "Bob est content!" ) ;
		expect( babel.solve( "Tu ${sujet.bob}[$:verbe.etre/p:2] content!" , ctx ) ).to.be( "Tu es content!" ) ;
	} ) ;
	
	it( "using reference operator that point to an element should extend the current element/part" , function() {
		var e = Element.parse( "[uv:1000|1/uf:$km|$m/um:N+]" ) ;
		
		expect( babel.solve( "$1[$2]" , 3 , e ) ).to.be( "3m" ) ;
		
		expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		expect( babel.solve( "${length}[$1:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		expect( babel.solve( "$1{length}[$:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		expect( babel.solve( "$1{length}[$1:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
		
		expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3km 21m" ) ;
	} ) ;
	
	it( "using reference operator stacked with other operators" , function() {
		var e = Element.parse( "[uv:1000|1/uf:$km|$m/um:N+]" ) ;
		
		expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3km 21m" ) ;
		expect( babel.solve( "${length}[$:lengthUnit/um:R]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3.021km" ) ;
		expect( babel.solve( "${length}[$:lengthUnit/uf:$ km|$ m/uenum:0|$|, $| and $]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3 km and 21 m" ) ;
	} ) ;
} ) ;



describe( "Post-filters" , function() {
	
	it( "should apply post-filters 'uc1' (upper-case first letter)" , function() {
		var babel = new Babel() ;
		var babelFr = babel.use( 'fr' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				sentences: {
					"$1[//uc1]: I like that!": "$1[//uc1]: j'adore ça!",
					"$1[n:many//uc1]: I like that!": "$1[n:many//uc1]: j'adore ça!"
				} ,
				elements: {
					apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
					pear: { g:'f', "n?": [ 'poire' , 'poires' ] }
				}
			}
		} ) ;
		
		expect( babel.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Apple: I like that!" ) ;
		expect( babel.solve( "$1[//uc1]: I like that!" , "pear" ) ).to.be( "Pear: I like that!" ) ;
		
		expect( babelFr.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Pomme: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[//uc1]: I like that!" , "pear" ) ).to.be( "Poire: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[n:many//uc1]: I like that!" , "apple" ) ).to.be( "Pommes: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[n:many//uc1]: I like that!" , "pear" ) ).to.be( "Poires: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[//uc1]: I like that!" , { k:"apple", n:'many'} ) ).to.be( "Pommes: j'adore ça!" ) ;
		
		expect( babel.solve( "${fruit//uc1}: I like that!" , { fruit: "apple" } ) ).to.be( "Apple: I like that!" ) ;
	} ) ;
	
	it( "should apply post-filters various filters combination" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Apple: I like that!" ) ;
		expect( babel.solve( "$1[//uc]: I like that!" , "apple" ) ).to.be( "APPLE: I like that!" ) ;
		expect( babel.solve( "$1[//lc]: I like that!" , "APPLE" ) ).to.be( "apple: I like that!" ) ;
		expect( babel.solve( "$1[//lc/uc1]: I like that!" , "APPLE" ) ).to.be( "Apple: I like that!" ) ;
		
		expect( babel.solve( "${fruit//lc/uc1}: I like that!" , { fruit: "APPLE" } ) ).to.be( "Apple: I like that!" ) ;
		
		expect( babel.solve( "echo ${arg//shellarg}" , { arg: "simple" } ) ).to.be( "echo 'simple'" ) ;
		expect( babel.solve( "echo ${arg//shellarg}" , { arg: "with single ' quote" } ) ).to.be( "echo 'with single '\\'' quote'" ) ;
	} ) ;
	
	it( "should apply english post-filters" , function() {
		var babel = new Babel() ;
		
		expect( babel.solve( "You take $1[//en:the]." , "apple" ) ).to.be( "You take the apple." ) ;
		expect( babel.solve( "You take $1[//en:the]." , "Excalibur" ) ).to.be( "You take Excalibur." ) ;
		expect( babel.solve( "You take $1[//en:a]." , "apple" ) ).to.be( "You take an apple." ) ;
		expect( babel.solve( "You take $1[//en:a]." , "banana" ) ).to.be( "You take a banana." ) ;
		expect( babel.solve( "You take $1[//en:a]." , "Excalibur" ) ).to.be( "You take Excalibur." ) ;
		
		expect( babel.solve( "You take ${noun//en:the}." , { noun: "apple" } ) ).to.be( "You take the apple." ) ;
	} ) ;
	
	it( "should apply path post-filters" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "$[//extname]" , "README.md" ) ).to.be( ".md" ) ;
		expect( babel.solve( "$[//extname]" , "~/somedir/README.md" ) ).to.be( ".md" ) ;
		expect( babel.solve( "$[//basename]" , "~/somedir/README.md" ) ).to.be( "README.md" ) ;
		expect( babel.solve( "$[//basenameNoExt]" , "~/somedir/README.md" ) ).to.be( "README" ) ;
		expect( babel.solve( "$[//dirname]" , "~/somedir/README.md" ) ).to.be( "~/somedir" ) ;
	} ) ;
	
	it( "more filters tests..." ) ;
} ) ;



describe( "Misc" , function() {
	
	it( "should extract the named variables from the format string" , function() {
		expect( Babel.getNamedVars( "Hello bob" ) ).to.eql( [] ) ;
		expect( Babel.getNamedVars( "Hello ${friend}" ) ).to.eql( [ 'friend' ] ) ;
		expect( Babel.getNamedVars( "Hello ${first} and ${second}" ) ).to.eql( [ 'first' , 'second' ] ) ;
		expect( Babel.getNamedVars( "Hello $1, ${first}, $2, $ and ${second} love $$..." ) ).to.eql( [ 'first' , 'second' ] ) ;
		expect( Babel.getNamedVars( "Hello ${person.name} and ${person2.name}" ) ).to.eql( [ 'person.name' , 'person2.name' ] ) ;
		expect( Babel.getNamedVars( "Hello ${first} and ${second}, glad to meet you ${first}" ) ).to.eql( [ 'first' , 'second' ] ) ;
	} ) ;
		
	it( "edge cases" , function() {
		var babel = new Babel() ;
		expect( babel.solve( "--'${content}'--" , { content: new String( 'content' ) } ) ).to.be( "--'content'--" ) ;
		
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: null } ) ).to.be( "nothing" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [] } ) ).to.be( "nothing" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ '' ] } ) ).to.be( "something: --''--" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ 'content' ] } ) ).to.be( "something: --'content'--" ) ;
		expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ new String( 'content' ) ] } ) ).to.be( "something: --'content'--" ) ;
	} ) ;
} ) ;



describe( "'en'/'fr' core langpack features" , function() {
	
	it( "testing few features" , function() {
		var babel = new Babel() ;
		var babelEn = babel.use( 'en' ) ;
		var babelFr = babel.use( 'fr' ) ;
		
		babel.extend( require( '../lib/en.js' ) ) ;
		babel.extend( require( '../lib/fr.js' ) ) ;
		
		babel.extend( {
			fr: {
				sentences: {
					"$1[1stPerson//uc1] $1[n?am|are] happy.": "$1[1erePersonne//uc1] $1[n?suis|sommes] content$1[n?|s]." ,
					"$1[3rdPerson//uc1] $1[n?is|are] happy.": "$1[3emePersonne//uc1] $1[n?est|sont] content$1[n?|s]." ,
					"$1[//uc1], beautiful $1.": "$1[artDef//uc1]$1, $1[gel:(le beau|le bel)|(la belle)]$1." ,
					"I want a $1.": "Je veux $1[artIndef]$1."
				} ,
				elements: {
					tree: { "n?": [ "arbre" , "arbres" ] , g: 'm' } ,
					oak: { "n?": [ "chêne" , "chênes" ] , g: 'm' } ,
					flower: { "n?": [ "fleur" , "fleurs" ] , g: 'f' } ,
					bee: { "n?": [ "abeille" , "abeilles" ] , g: 'f' } ,
				}
			}
		} ) ;
		
		expect( babelEn.solve( "$1[1stPerson//uc1] $1[n?am|are] happy." , 1 ) ).to.be( "I am happy." ) ;
		expect( babelEn.solve( "$1[1stPerson//uc1] $1[n?am|are] happy." , 3 ) ).to.be( "We are happy." ) ;
		expect( babelEn.solve( "$1[3rdPerson//uc1] $1[n?is|are] happy." , 1 ) ).to.be( "It is happy." ) ;
		expect( babelEn.solve( "$1[3rdPerson//uc1] $1[n?is|are] happy." , 3 ) ).to.be( "They are happy." ) ;
		
		expect( babelFr.solve( "$1[1stPerson//uc1] $1[n?am|are] happy." , 1 ) ).to.be( "Je suis content." ) ;
		expect( babelFr.solve( "$1[1stPerson//uc1] $1[n?am|are] happy." , 3 ) ).to.be( "Nous sommes contents." ) ;
		expect( babelFr.solve( "$1[3rdPerson//uc1] $1[n?is|are] happy." , 1 ) ).to.be( "Il est content." ) ;
		expect( babelFr.solve( "$1[3rdPerson//uc1] $1[n?is|are] happy." , 3 ) ).to.be( "Ils sont contents." ) ;
		
		expect( babelEn.solve( "$1[//uc1], beautiful $1." , "tree" ) ).to.be( "Tree, beautiful tree." ) ;
		
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "tree" ) ).to.be( "L'arbre, le bel arbre." ) ;
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "oak" ) ).to.be( "Le chêne, le beau chêne." ) ;
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "flower" ) ).to.be( "La fleur, la belle fleur." ) ;
		expect( babelFr.solve( "$1[//uc1], beautiful $1." , "bee" ) ).to.be( "L'abeille, la belle abeille." ) ;
		
		expect( babelEn.solve( "I want a $1." , "tree" ) ).to.be( "I want a tree." ) ;
		
		expect( babelFr.solve( "I want a $1." , "tree" ) ).to.be( "Je veux un arbre." ) ;
		expect( babelFr.solve( "I want a $1." , "flower" ) ).to.be( "Je veux une fleur." ) ;
		expect( babelFr.solve( "I want a $1." , { k: "flower" , n: "many" } ) ).to.be( "Je veux des fleurs." ) ;
	} ) ;
} ) ;



describe( "String-kit's format() interoperability" , function() {
	
	it( "should escape argument using the autoEscape regexp" , function() {
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



 