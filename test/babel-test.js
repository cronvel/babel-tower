/*
	The Cedric's Swiss Knife (CSK) - CSK string toolbox test suite

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



/* jshint unused:false */
/* global describe, it, before, after */



var Babel = require( '../lib/Babel.js' ) ;
var Word = Babel.Word ;

var expect = require( 'expect.js' ) ;





			/* Tests */



describe( "Word solver" , function() {
	
	var babel = Babel.create() ;
	var word ;
	
	babel.extend( {
		fr: {
			gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
			word: {
				apple: { g:'f', altn: [ 'pomme' , 'pommes' ] } ,
				horse: { altng: [ [ 'cheval' , 'jument' ] , [ 'chevaux' , 'juments' ] ] } ,
			}
		}
	} ) ;
	
	var babelFr = babel.use( 'fr' ) ;
	
	it( "creating a word from a string should create a translatable Word object" , function() {
		expect( Word.create( "horse" ) ).to.eql( { t: "horse" } ) ;
	} ) ;
	
	it( "creating a word from a number should create a Word object with a 'n' (number) property" , function() {
		expect( Word.create( 3 ) ).to.eql( { n: 3 } ) ;
	} ) ;
	
	it( "a Word created from a string should resolve to itself when the word is not in the dictionary" , function() {
		expect( Word.create( "horse" ).solve( babel ) ).to.be( "horse" ) ;
	} ) ;
	
	it( "a Word created from a string should resolve to the word existing in the dictionary" , function() {
		expect( Word.create( "apple" ).solve( babelFr ) ).to.be( "pomme" ) ;
	} ) ;
	
	it( "a Word created with a 'n' and a 'altn' should resolve to the appropriate alternative" , function() {
		expect( Word.create( { n: 0 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
		expect( Word.create( { n: 1 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
		expect( Word.create( { n: 2 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
		expect( Word.create( { n: 3 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
		
		expect( Word.create( { altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
	} ) ;
	
	it( "a Word created with a 'g' and a 'altg' should resolve to the appropriate alternative" , function() {
		expect( Word.create( { g: 'm' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { g: 'f' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( Word.create( { g: 'n' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { g: 'h' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
		
		expect( Word.create( { altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
	} ) ;
	
	it( "a Word created with a 'n' and/or a 'g' and a 'altng' should resolve to the appropriate alternative" , function() {
		expect( Word.create( { n: 0 , g: 'm' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 1 , g: 'm' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 2 , g: 'm' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( Word.create( { n: 3 , g: 'm' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( Word.create( { n: 0 , g: 'f' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( Word.create( { n: 1 , g: 'f' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		expect( Word.create( { n: 2 , g: 'f' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "juments" ) ;
		expect( Word.create( { n: 3 , g: 'f' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "juments" ) ;
		
		expect( Word.create( { n: 0 , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 1 , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 2 , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		expect( Word.create( { n: 3 , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "chevaux" ) ;
		
		expect( Word.create( { g: 'm' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
		expect( Word.create( { g: 'f' , altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "jument" ) ;
		
		expect( Word.create( { altng: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] } ).solve( babel ) ).to.be( "cheval" ) ;
	} ) ;
	
	it( "a Word created with a 'n' and/or 'g' and a 't' should extend the word existing in the dictionary with 'n' and resolve to the appropriate alternative" , function() {
		expect( Word.create( { n: 0 , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 1 , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 2 , t: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		expect( Word.create( { n: 3 , t: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		
		expect( Word.create( { n: 0 , g: 'm' , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 1 , g: 'm' , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( Word.create( { n: 2 , g: 'm' , t: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		expect( Word.create( { n: 3 , g: 'm' , t: "horse" } ).solve( babelFr ) ).to.be( "chevaux" ) ;
		
		expect( Word.create( { n: 0 , g: 'f' , t: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( Word.create( { n: 1 , g: 'f' , t: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( Word.create( { n: 2 , g: 'f' , t: "horse" } ).solve( babelFr ) ).to.be( "juments" ) ;
		expect( Word.create( { n: 3 , g: 'f' , t: "horse" } ).solve( babelFr ) ).to.be( "juments" ) ;
		
		expect( Word.create( { g: 'm' , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( Word.create( { g: 'f' , t: "horse" } ).solve( babelFr ) ).to.be( "jument" ) ;
		expect( Word.create( { g: 'n' , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		expect( Word.create( { g: 'h' , t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
		
		expect( Word.create( { t: "horse" } ).solve( babelFr ) ).to.be( "cheval" ) ;
	} ) ;
} ) ;



describe( "Basic usage without language pack" , function() {
	
	it( "should format things accordingly" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
		
	it( "should format things accordingly using short-hand notation" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
	
	it( "should format things using the 'ng?' or 'altng' notation" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[altng:(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
	} ) ;
	
	it( "should format things using the 'ng?' or 'altng' notation" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[altng:(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
	} ) ;
	
	it( "should format things using the 'n0?' or 'altn0' notation" , function() {
		var babel = Babel.create() ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 0 ) ).to.be( "There is no horse..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 1 ) ).to.be( "There is an horse..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
		expect( babel.solve( "There $1[n?is|are] $1[altn0:no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
	} ) ;
	
	it( "should format things using the 'n0g?' or 'altn0g' notation" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
		expect( babel.solve( "J'aime $1[altn0g:(aucun|aucune)|(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
		expect( babel.solve( "J'aime $1[altn0g:(aucun|aucune)|(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:1,g:'f'} ) ).to.be( "J'aime la jument!" ) ;
		expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 0 ) ).to.be( "J'aime aucun cheval!" ) ;
		expect( babel.solve( "J'aime $1[altn0g:(aucun|aucune)|(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:0,g:'f'} ) ).to.be( "J'aime aucune jument!" ) ;
	} ) ;
} ) ;



describe( "Basic usage with language pack" , function() {
	
	it( "should format and localize" , function() {
		var babel = Babel.create() ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				sentence: {
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
		var babel = Babel.create() ;
		var babelFr = babel.use( 'fr' ) ;
		
		var n2w = require( 'number-to-words' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			none: {
				fn: {
					nw: function( arg ) {
						arg.s = n2w.toWords( arg.n ) ;
						return arg ;
					}
				}
			} ,
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				fn: {
					nw: function( arg ) {
						
						switch ( arg.n )
						{
							case 0: arg.s = 'zero' ; break ;
							case 1: arg.altg = [ 'un' , 'une' ] ; break ;
							case 2: arg.s = 'deux' ; break ;
							case 3: arg.s = 'trois' ; break ;
							default: arg.s = '' + arg.n ;
						}
						
						return arg ;
					}
				} ,
				sentence: {
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
		var babel = Babel.create() ;
		var babelFr = babel.use( 'fr' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				sentence: {
					"Give me an $1!" : "Donne-moi $1[g?un|une] $1!" ,
					"I like $1[n:many]!" : "J'aime les $1[n:many]!"
				} ,
				word: {
					apple: { g:'f', altn: [ 'pomme' , 'pommes' ] } ,
					horse: { g:'m', altn: [ 'cheval' , 'chevaux' ] } ,
				}
			}
		} ) ;
		
		expect( babel.solve( "Give me an $1!" , "apple" ) ).to.be( "Give me an apple!" ) ;
		expect( babelFr.solve( "Give me an $1!" , "apple" ) ).to.be( "Donne-moi une pomme!" ) ;
		
		expect( babel.solve( "I like $1[n:many]!" , { altn: [ "horse" , "horses" ] } ) ).to.be( "I like horses!" ) ;
		expect( babelFr.solve( "I like $1[n:many]!" , "horse" ) ).to.be( "J'aime les chevaux!" ) ;
	} ) ;
} ) ;



describe( "Advanced feature: enumeration" , function() {
	
	it( "context object should be used as '$'" , function() {
		var babel = Babel.create() ;
		expect( babel.solveArray( "I want $." , [] , "you" ) ).to.be( "I want you." ) ;
	} ) ;
	
	it( "basic enumeration with no rules should simply join with a space" , function() {
		var babel = Babel.create() ;
		expect( babel.solve( "I want $1[enum]." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want apple pear orange." ) ;
	} ) ;
	
	it( "enumeration with variable length" , function() {
		var babel = Babel.create() ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [] ) ).to.be( "I want nothing." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" ] ) ).to.be( "I want apples." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" ] ) ).to.be( "I want apples and pears." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" ] ) ).to.be( "I want apples, pears and oranges." ) ;
		expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" , "strawberries" ] ) ).to.be( "I want apples, pears, oranges and strawberries." ) ;
	} ) ;
	
	it( "enumeration with variable length, translation and operators in enumeration" , function() {
		var babel = Babel.create() ;
		var babelFr = babel.use( 'fr' ) ;
		
		var n2w = require( 'number-to-words' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				sentence: {
					"I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." :
						"Je $1[n0?ne |]veux $1[n0?rien|quelque chose: |deux choses: |plusieurs choses: ]$1[enum:|$[ng?(un|une)|(des)] $|, $[ng?(un|une)|(des)] $| et $[ng?(un|une)|(des)] $]."
				} ,
				word: {
					"pear": { altn: [ 'poire' , 'poires' ] , g: 'f' } ,
					"banana": { altn: [ 'banane' , 'bananes' ] , g: 'f' } ,
					"strawberry": { altn: [ 'fraise' , 'fraises' ] , g: 'f' }
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
		
		expect( babelFr.solve( sentence , [ { t:"pear",n:'many'} ] ) ).to.be( "Je veux plusieurs choses: des poires." ) ;
		expect( babelFr.solve( sentence , [ { t:"pear",n:'many'} , "banana" ] ) ).to.be( "Je veux plusieurs choses: des poires et une banane." ) ;
	} ) ;
} ) ;



describe( "Post-filters" , function() {
	
	it( "should apply post-filters 'uc1' (upper-case first letter)" , function() {
		var babel = Babel.create() ;
		var babelFr = babel.use( 'fr' ) ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
				sentence: {
					"$1[//uc1]: I like that!": "$1[//uc1]: j'adore ça!",
					"$1[n:many//uc1]: I like that!": "$1[n:many//uc1]: j'adore ça!"
				} ,
				word: {
					apple: { g:'f', altn: [ 'pomme' , 'pommes' ] } ,
					pear: { g:'f', altn: [ 'poire' , 'poires' ] }
				}
			}
		} ) ;
		
		expect( babel.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Apple: I like that!" ) ;
		expect( babel.solve( "$1[//uc1]: I like that!" , "pear" ) ).to.be( "Pear: I like that!" ) ;
		
		expect( babelFr.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Pomme: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[//uc1]: I like that!" , "pear" ) ).to.be( "Poire: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[n:many//uc1]: I like that!" , "apple" ) ).to.be( "Pommes: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[n:many//uc1]: I like that!" , "pear" ) ).to.be( "Poires: j'adore ça!" ) ;
		expect( babelFr.solve( "$1[//uc1]: I like that!" , { t:"apple", n:'many'} ) ).to.be( "Pommes: j'adore ça!" ) ;
	} ) ;
} ) ;



describe( "'en'/'fr' core langpack features" , function() {
	
	it( "testing few features" , function() {
		var babel = Babel.create() ;
		var babelEn = babel.use( 'en' ) ;
		var babelFr = babel.use( 'fr' ) ;
		
		babel.extend( require( '../lib/en.js' ) ) ;
		babel.extend( require( '../lib/fr.js' ) ) ;
		
		babel.extend( {
			fr: {
				sentence: {
					"$1[1stPerson//uc1] $1[n?am|are] happy.": "$1[1erePersonne//uc1] $1[n?suis|sommes] content$1[n?|s]." ,
					"$1[3rdPerson//uc1] $1[n?is|are] happy.": "$1[3emePersonne//uc1] $1[n?est|sont] content$1[n?|s]." ,
					"$1[//uc1], beautiful $1.": "$1[artDef//uc1] $1, $1[gl?(le beau|le bel)|(la belle)] $1." ,
					"I want a $1.": "Je veux $1[artIndef] $1."
				} ,
				word: {
					tree: { altn: [ "arbre" , "arbres" ] , g: 'm' } ,
					oak: { altn: [ "chêne" , "chênes" ] , g: 'm' } ,
					flower: { altn: [ "fleur" , "fleurs" ] , g: 'f' } ,
					bee: { altn: [ "abeille" , "abeilles" ] , g: 'f' } ,
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
		expect( babelFr.solve( "I want a $1." , { t:"flower",n:"many"} ) ).to.be( "Je veux des fleurs." ) ;
	} ) ;
} ) ;



describe( "String-kit's format() interoperability" , function() {
	
	var ansi = require( 'string-kit' ).ansi ;
	
	it( "should format things mixing string-kit format()'s '%' (percent)syntax and babel-tower syntax accordingly" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "Give me %1d apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me %1d apple$1[altn:|s]! %2J" , 1 , {a:1,b:2} ) ).to.be( 'Give me 1 apple! {"a":1,"b":2}' ) ;
	} ) ;
	
	it( "should format things mixing string-kit format()'s '^' (caret) syntax and babel-tower syntax accordingly" , function() {
		var babel = Babel.create() ;
		
		//console.log( babel.solve( "Give me ^r%1d ^g^/apple$1[altn:|s]^:!" , 1 ) ) ;
		expect( babel.solve( "Give me ^r%1d ^g^/apple$1[altn:|s]^:!" , 1 ) ).to.be( "Give me " + ansi.red + "1 " + ansi.green + ansi.italic + "apple" + ansi.reset + "!" + ansi.reset ) ;
	} ) ;
	
} ) ;



 