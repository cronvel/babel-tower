

# Babel Tower

i18n.
 
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

should format things using the 'ng?' or 'altng' notation.

```js
var babel = Babel.create() ;

expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
expect( babel.solve( "J'aime $1[altng:(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;

expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
```

should format things using the 'ng?' or 'altng' notation.

```js
var babel = Babel.create() ;

expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
expect( babel.solve( "J'aime $1[altng:(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;

expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
```

should format things using the 'n0?' or 'altn0' notation.

```js
var babel = Babel.create() ;
expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 0 ) ).to.be( "There is no horse..." ) ;
expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 1 ) ).to.be( "There is an horse..." ) ;
expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
expect( babel.solve( "There $1[n?is|are] $1[altn0:no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
```

should format things using the 'n0g?' or 'altn0g' notation.

```js
var babel = Babel.create() ;

expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
expect( babel.solve( "J'aime $1[altn0g:(aucun|aucune)|(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[altn0g:(aucun|aucune)|(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:1,g:'f'} ) ).to.be( "J'aime la jument!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 0 ) ).to.be( "J'aime aucun cheval!" ) ;
expect( babel.solve( "J'aime $1[altn0g:(aucun|aucune)|(le|la)|(les)] $1[altng:(cheval|jument)|(chevaux|juments)]!" , {n:0,g:'f'} ) ).to.be( "J'aime aucune jument!" ) ;
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
```

should format and localize, and localize translatable variables.

```js
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
```

