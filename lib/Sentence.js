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



var Babel = require( './Babel.js' ) ;



function Sentence() { throw new Error( 'Use Sentence.create() instead' ) ; }
module.exports = Sentence ;



Sentence.create = function create( template , babel , self )
{
	if ( ! self ) { self = Object.create( Sentence.prototype ) ; }
	
	Object.defineProperties( self , {
		template: { value: template , writable: true , enumerable: true } ,
		babel: { value: babel || Babel.default , writable: true , enumerable: true } ,
		indirection: { value: null , enumerable: true }
	} ) ;
	
	return self ;
} ;



Sentence.createWithIndirection = function createWithIndirection( template , indirection , self )
{
	if ( ! self ) { self = Object.create( Sentence.prototype ) ; }
	
	Object.defineProperties( self , {
		template: { value: template , writable: true , enumerable: true } ,
		babel: { get: function() { return this.indirection.babel ; } } ,
		indirection: { value: indirection , enumerable: true }
	} ) ;
	
	return self ;
} ;



Sentence.prototype.toString = function toString()
{
	return this.babel.solveArray(
		this.template ,
		arguments.length === 0 && this.indirection && this.indirection.templateData ?
			[ this.indirection.templateData ] :
			Array.prototype.slice.call( arguments )
	) ;
} ;

