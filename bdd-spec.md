# TOC
   - [Word solver](#word-solver)
   - [Basic usage without language pack](#basic-usage-without-language-pack)
   - [Basic usage with language pack](#basic-usage-with-language-pack)
   - [Language pack and functions](#language-pack-and-functions)
<a name=""></a>
 
<a name="word-solver"></a>
# Word solver
creating a word from a string should create a translatable Word object.

```js
expect( Word.create( "horse" ) ).to.eql( { t: "horse" } ) ;
```

creating a word from a number should create a Word object with a 'n' (number) property.

```js
expect( Word.create( 3 ) ).to.eql( { n: 3 } ) ;
```

a Word created from a string should resolve to itself when the word is not in the dictionary.

```js
expect( Word.create( "horse" ).solve( babel ) ).to.be( "horse" ) ;
```

a Word created from a string should resolve to the word existing in the dictionary.

```js
expect( Word.create( "apple" ).solve( babelFr ) ).to.be( "pomme" ) ;
```

a Word created with a 'n' and a 'altn' should resolve to the appropriate alternative.

```js
expect( Word.create( { n: 0 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
expect( Word.create( { n: 1 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
expect( Word.create( { n: 2 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
expect( Word.create( { n: 3 , altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;

expect( Word.create( { altn: [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
```

a Word created with a 'g' and a 'altg' should resolve to the appropriate alternative.

```js
expect( Word.create( { g: 'm' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( Word.create( { g: 'f' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
expect( Word.create( { g: 'n' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( Word.create( { g: 'h' , altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;

expect( Word.create( { altg: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
```

a Word created with a 'n' and/or a 'g' and a 'altng' should resolve to the appropriate alternative.

```js
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
```

a Word created with a 'n' and/or 'g' and a 't' should extend the word existing in the dictionary with 'n' and resolve to the appropriate alternative.

```js
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
```

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
				return Word.create( arg , [ 's' , n2w.toWords( arg.n ) ] ) ;
			}
		}
	} ,
	fr: {
		gIndex: { m: 0 , f: 1 , n: 2 , h: 2 } ,
		fn: {
			nw: function( arg ) {
				
				switch ( arg.n )
				{
					case 0: return Word.create( arg , [ 's' , 'zero' ] ) ;
					case 1: return Word.create( arg , [ 'altg' , [ 'un' , 'une' ] ] ) ;
					case 2: return Word.create( arg , [ 's' , 'deux' ] ) ;
					case 3: return Word.create( arg , [ 's' , 'trois' ] ) ;
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

expect( babel.solve( "I like $1[n:3]!" , "horses" ) ).to.be( "I like horses!" ) ;
expect( babel.solve( "I like $1[n:3]!" , { altn: [ "horse" , "horses" ] } ) ).to.be( "I like horses!" ) ;
```

