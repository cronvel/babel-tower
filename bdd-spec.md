# TOC
   - [Basic usage without language pack](#basic-usage-without-language-pack)
   - [Basic usage with language pack](#basic-usage-with-language-pack)
   - [Language pack and functions](#language-pack-and-functions)
<a name=""></a>
 
<a name="basic-usage-without-language-pack"></a>
# Basic usage without language pack
should format things accordingly.

```js
var babel = Babel.create() ;

expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
```

should format things accordingly using short-hand notation.

```js
var babel = Babel.create() ;

expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
```

<a name="basic-usage-with-language-pack"></a>
# Basic usage with language pack
should format and localize.

```js
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
```

<a name="language-pack-and-functions"></a>
# Language pack and functions
should format and localize, using language functions.

```js
var babel = Babel.create() ;

var n2w = require( 'number-to-words' ) ;

// Load a pseudo DB
babel.extend( {
	none: {
		fn: {
			nw: function( arg ) {
				return Babel.Word.create( babel , arg , [ 's' , n2w.toWords( arg.n ) ] ) ;
			}
		}
	} ,
	fr: {
		gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
		fn: {
			nw: function( arg ) {
				
				switch ( arg.n )
				{
					case 0: return Babel.Word.create( babel , arg , [ 's' , 'zero' ] ) ;
					case 1: return Babel.Word.create( babel , arg , [ 'altg' , [ 'un' , 'une' ] ] ) ;
					case 2: return Babel.Word.create( babel , arg , [ 's' , 'deux' ] ) ;
					case 3: return Babel.Word.create( babel , arg , [ 's' , 'trois' ] ) ;
					default: return '' + arg.n ;
				}
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

var babelFr = babel.use( 'fr' ) ;

expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 0 ) ).to.be( "Donne-moi zero pomme!" ) ;
expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 1 ) ).to.be( "Donne-moi une pomme!" ) ;
expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 2 ) ).to.be( "Donne-moi deux pommes!" ) ;
expect( babelFr.solve( "Give me $1[nw] apple$1[n?|s]!" , 3 ) ).to.be( "Donne-moi trois pommes!" ) ;

expect( babelFr.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 0 ) ).to.be( "Il y a zero cheval!" ) ;
expect( babelFr.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 1 ) ).to.be( "Il y a un cheval!" ) ;
expect( babelFr.solve( "There $1[n?is|are] $1[nw] horse$1[n?|s]!" , 2 ) ).to.be( "Il y a deux chevaux!" ) ;
```

should format and localize, and localize translatable variables.

```js
var babel = Babel.create() ;

// Load a pseudo DB
babel.extend( {
	fr: {
		gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
		sentence: {
			"Give me an $1!" : "Donne-moi $1[g?un|une] $1!"
		} ,
		word: {
			apple: { g:'f', altn: [ 'pomme' , 'pommes' ] } ,
			horse: { g:'m', altn: [ 'cheval' , 'chevaux' ] } ,
		}
	}
} ) ;

expect( babel.solve( "Give me an $1!" , "apple" ) ).to.be( "Give me an apple!" ) ;

var babelFr = babel.use( 'fr' ) ;

expect( babelFr.solve( "Give me an $1!" , "apple" ) ).to.be( "Donne-moi une pomme!" ) ;
```

