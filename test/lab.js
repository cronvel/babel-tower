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



describe( "Lab" , function() {
	
	it( "using reference operator as verb" , function() {
		var babel = new Babel() ;
		
		var ctx = {
			verbe: {
				"être": Element.parse( "être[p?suis|es|est]" )
			} ,
			sujet: {
				moi: Element.parse( "[p:1/s:je]" ) ,
				bob: Element.parse( "[s:Bob]" )
			}
		} ;
		
		expect( babel.solve( "${sujet.moi//uc1} $[$:verbe.être] content!" , ctx ) ).to.be( "Je suis content!" ) ;
		expect( babel.solve( "${sujet.bob//uc1} $[$:verbe.être] content!" , ctx ) ).to.be( "Bob est content!" ) ;
		expect( babel.solve( "Tu ${sujet.bob}[$:verbe.être/p:2] content!" , ctx ) ).to.be( "Tu es content!" ) ;
	} ) ;
	
	
	
	it( "using a function as verb" , function() {
		var babel = new Babel() ;
		
		babel.extendLocale( {
			defaultEnum: [ "" , "$" , ", $" , " et $" ] ,
			functions: {
				"être": "être[np?(suis|es|est)|(sommes|êtes|sont)]" ,
				"pronom": "pronom[npg?(je|tu|(il|elle))|(nous|vous|(ils|elles))]"
			}
		} ) ;
		
		var ctx = {
			moi: Element.parse( "[p:1/s:je]" ) ,
			alice: Element.parse( "[s:Alice/g:f]" ) ,
			bob: Element.parse( "[s:Bob/g:m]" ) ,
		} ;
		
		ctx.people = [ ctx.alice , ctx.bob ] ;
		
		expect( babel.solve( "${moi//uc1} $[être] content!" , ctx ) ).to.be( "Je suis content!" ) ;
		expect( babel.solve( "${alice//uc1} $[être] content$[g?|e]!" , ctx ) ).to.be( "Alice est contente!" ) ;
		expect( babel.solve( "${bob//uc1} $[être] content$[g?|e]!" , ctx ) ).to.be( "Bob est content!" ) ;
		expect( babel.solve( "${alice}[pronom//uc1] $[être] content$[g?|e]!" , ctx ) ).to.be( "Elle est contente!" ) ;
		expect( babel.solve( "${bob}[pronom//uc1] $[être] content$[g?|e]!" , ctx ) ).to.be( "Il est content!" ) ;
		expect( babel.solve( "${alice}[pronom/p:2//uc1] $[être/p:2] content$[g?|e]!" , ctx ) ).to.be( "Tu es contente!" ) ;
		expect( babel.solve( "${bob}[pronom/p:2//uc1] $[être/p:2] content$[g?|e]!" , ctx ) ).to.be( "Tu es content!" ) ;
		
		expect( babel.solve( "${people}[enum] $[être] content$[ng?(|e)|(s|es)]!" , ctx ) ).to.be( "Alice et Bob sont contents!" ) ;
		expect( babel.solve( "${alice}[enum] $[être] content$[ng?(|e)|(s|es)]!" , ctx ) ).to.be( "Alice est contente!" ) ;
		expect( babel.solve( "${bob}[enum] $[être] content$[ng?(|e)|(s|es)]!" , ctx ) ).to.be( "Bob est content!" ) ;
	} ) ;
} ) ;

