/*
	The Cedric's Swiss Knife (CSK) - CSK string toolbox test suite

	Copyright (c) 2014 Cédric Ronvel 
	
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
var expect = require( 'expect.js' ) ;





			/* Tests */



describe( "Basic usage without language pack" , function() {
	
	it( "should replace" , function() {
		var babel = Babel.create() ;
		
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
	} ) ;
} ) ;



describe( "Basic usage with language pack" , function() {
	
	it( "should replace" , function() {
		var babel = Babel.create() ;
		
		// Load a pseudo DB
		babel.extend( {
			fr: {
				sentence: {
					"Give me $1 apple$1[altn:|s]!" : "Donne-moi $1 pomme$1[altn:|s]!"
				}
			}
		} ) ;
		
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
		
		// Change locale to fr
		babel.setLocale( 'fr' ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Donne-moi 0 pomme!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Donne-moi 1 pomme!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Donne-moi 2 pommes!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Donne-moi 3 pommes!" ) ;
		
		// Change locale back to the default, and create a new babel object using the fr locale, using the first one as its prototype
		babel.setLocale( null ) ;
		var babelFr = babel.use( 'fr' ) ;
		
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
		expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
		
		expect( babelFr.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Donne-moi 0 pomme!" ) ;
		expect( babelFr.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Donne-moi 1 pomme!" ) ;
		expect( babelFr.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Donne-moi 2 pommes!" ) ;
		expect( babelFr.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Donne-moi 3 pommes!" ) ;
	} ) ;
} ) ;
	



 