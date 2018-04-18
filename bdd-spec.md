# TOC
   - [Atom parser and solver](#atom-parser-and-solver)
   - [Units of measurement](#units-of-measurement)
   - [Basic usage without language pack](#basic-usage-without-language-pack)
   - [Escape special character](#escape-special-character)
   - [Sentence instances](#sentence-instances)
   - [Basic usage with language pack](#basic-usage-with-language-pack)
   - [Language pack and functions](#language-pack-and-functions)
   - [Advanced feature: list and enumeration](#advanced-feature-list-and-enumeration)
   - [Advanced feature: reference operator](#advanced-feature-reference-operator)
   - [Post-filters](#post-filters)
   - [Misc](#misc)
   - ['en'/'fr' core langpack features](#enfr-core-langpack-features)
   - [String-kit's format() interoperability](#string-kits-format-interoperability)
   - [Lab](#lab)
<a name=""></a>
 
<a name="atom-parser-and-solver"></a>
# Atom parser and solver
should parse an atom.

```js
expect( Atom.parse( "horse" ) ).to.eql( { k: "horse" } ) ;
expect( Atom.parse( "[k:horse]" ) ).to.eql( { k: "horse" } ) ;
expect( Atom.parse( "horse[ng?(cheval|jument)|(chevaux|juments)]" ) ).to.eql( {
	k: "horse" ,
	alt: [ [ "cheval" , "jument" ] , [ "chevaux" , "juments" ] ] ,
	ord: ['n','g']
} ) ;
expect( Atom.parse( "horse[n?cheval|chevaux]" ) ).to.eql( {
	k: "horse" ,
	alt: [ "cheval" , "chevaux" ] ,
	ord: ['n']
} ) ;
expect( Atom.parse( "horse[g?cheval|jument]" ) ).to.eql( {
	k: "horse" ,
	alt: [ "cheval" , "jument" ] ,
	ord: ['g']
} ) ;
```

creating an atom from a string should create a translatable Atom object.

```js
expect( new Atom( "horse" ) ).to.eql( { k: "horse" } ) ;
```

creating an atom from a number should create an Atom object with a 'n' (number) property.

```js
expect( new Atom( 3 ) ).to.eql( { n: 3 } ) ;
```

an Atom created from a string should resolve to itself when the atom is not in the dictionary.

```js
expect( new Atom( "horse" ).solve( babel ) ).to.be( "horse" ) ;
```

an Atom created from a string should resolve to the atom existing in the dictionary.

```js
expect( new Atom( "apple" ).solve( babelFr ) ).to.be( "pomme" ) ;
```

an Atom created directly with 'alt' and 'ord'.

```js
expect( new Atom( { g: 'm' , ord: ['g'] , alt: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( new Atom( { g: 'f' , ord: ['g'] , alt: [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;

expect( new Atom( { n: 0 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( new Atom( { n: 1 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( new Atom( { n: 2 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
expect( new Atom( { n: 5 , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
expect( new Atom( { n: 'many' , ord: ['n'] , alt: [ "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;

expect( new Atom( { n: 0 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "rien" ) ;
expect( new Atom( { n: 1 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( new Atom( { n: 2 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
expect( new Atom( { n: 5 , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;
expect( new Atom( { n: 'many' , ord: ['n0'] , alt: [ "rien" , "cheval" , "chevaux" ] } ).solve( babel ) ).to.be( "chevaux" ) ;

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
```

an Atom created with a 'n' and 'n?' should resolve to the appropriate alternative.

```js
expect( new Atom( { n: 0 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
expect( new Atom( { n: 1 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
expect( new Atom( { n: 2 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;
expect( new Atom( { n: 3 , "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horses" ) ;

expect( new Atom( { "n?": [ "horse" , "horses" ] } ).solve( babel ) ).to.be( "horse" ) ;
```

an Atom created with a 'p' and 'p?' should resolve to the appropriate alternative.

```js
expect( new Atom( { p: '1' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "je" ) ;
expect( new Atom( { p: '2' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "tu" ) ;
expect( new Atom( { p: '3' , "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "il" ) ;
	
expect( new Atom( { "p?": [ "je" , "tu" , "il" ] } ).solve( babel ) ).to.be( "il" ) ;
```

an Atom created with a 'u' and 'u?' should resolve to the appropriate alternative.

```js
expect( new Atom( { u: 'c' , "u?": [ "cat" , "Misty" ] } ).solve( babel ) ).to.be( "cat" ) ;
expect( new Atom( { u: 'p' , "u?": [ "cat" , "Misty" ] } ).solve( babel ) ).to.be( "Misty" ) ;

expect( new Atom( { "u?": [ "cat" , "Misty" ] } ).solve( babel ) ).to.be( "cat" ) ;
```

an Atom created with a 'g' and 'g?' should resolve to the appropriate alternative.

```js
expect( new Atom( { g: 'm' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( new Atom( { g: 'f' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "jument" ) ;
expect( new Atom( { g: 'n' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
expect( new Atom( { g: 'h' , "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;

expect( new Atom( { "g?": [ "cheval" , "jument" ] } ).solve( babel ) ).to.be( "cheval" ) ;
```

an Atom created with a 'n' and/or 'g' and 'ng?' should resolve to the appropriate alternative.

```js
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
```

an Atom created with a 'n', 'p', 'g' and 'npg?' should resolve to the appropriate alternative.

```js
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
```

an Atom created with a 'n' and/or 'g' and 'k' should extend the atom existing in the dictionary with 'n' and resolve to the appropriate alternative.

```js
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
```

<a name="units-of-measurement"></a>
# Units of measurement
using an enumeration of natural positive integer units.

```js
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
```

using a real of the closest unit.

```js
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
```

using a real >= 1 (when possible) of the closest unit.

```js
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
```

<a name="basic-usage-without-language-pack"></a>
# Basic usage without language pack
should format $$ into $.

```js
var babel = new Babel() ;
expect( babel.solve( "Give me $$!" ) ).to.be( "Give me $!" ) ;
```

single $ behaviour should default to the first argument or to the last used argument+path.

```js
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
```

variable as number.

```js
var babel = new Babel() ;

expect( babel.solve( "Give me $1 apple!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( babel.solve( "Give me $1 apple!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( babel.solve( "Give me $1 apples!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( babel.solve( "Give me $1 apples!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
```

variable as boolean.

```js
var babel = new Babel() ;

expect( babel.solve( "This is $1!" , true ) ).to.be( "This is true!" ) ;
expect( babel.solve( "This is $1!" , false ) ).to.be( "This is false!" ) ;
```

should format things using the 'n?' notation.

```js
var babel = new Babel() ;

expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( babel.solve( "Give me $1 apple$1[n?|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
```

should format things using the 'b?' notation.

```js
var babel = new Babel() ;

expect( babel.solve( "This is $1[b?the truth|a lie]!" , true ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , 'true' ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , 1 ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , 10 ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , '1' ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , '10' ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , 'many' ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , false ) ).to.be( "This is a lie!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , 'false' ) ).to.be( "This is a lie!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , 0 ) ).to.be( "This is a lie!" ) ;
expect( babel.solve( "This is $1[b?the truth|a lie]!" , '0' ) ).to.be( "This is a lie!" ) ;
```

should format things using the '?' (alias of 'n?') notation.

```js
var babel = new Babel() ;

expect( babel.solve( "This is $1[?the truth|a lie]!" , true ) ).to.be( "This is the truth!" ) ;
expect( babel.solve( "This is $1[?the truth|a lie]!" , false ) ).to.be( "This is a lie!" ) ;
```

should format things using the 'ng?' notation.

```js
var babel = new Babel() ;

expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;

expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 3 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[ng?(le|la)] $1[ng?(cheval|jument)]!" , {g:'f'} ) ).to.be( "J'aime la jument!" ) ;
```

should format things using the 'n0?' notation.

```js
var babel = new Babel() ;
expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 0 ) ).to.be( "There is no horse..." ) ;
expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 1 ) ).to.be( "There is an horse..." ) ;
expect( babel.solve( "There $1[n?is|are] $1[n0?no|an|many] horse$1[n?|s]..." , 2 ) ).to.be( "There are many horses..." ) ;
```

should format things using the 'n?' notation.

```js
var babel = new Babel() ;
expect( babel.solve( "There is an $1[n:1]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There is an horse..." ) ;
expect( babel.solve( "There are $1[n:2]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There are horses..." ) ;
expect( babel.solve( "There are $1[n:many]..." , { "n?": [ "horse" , "horses" ] } ) ).to.be( "There are horses..." ) ;

var atom = new Atom( { "n?": [ "horse" , "horses" ] } ) ;
expect( babel.solve( "There is an $1[n:1]..." , atom ) ).to.be( "There is an horse..." ) ;
expect( babel.solve( "There are $1[n:2]..." , atom ) ).to.be( "There are horses..." ) ;
expect( babel.solve( "There are $1[n:many]..." , atom ) ).to.be( "There are horses..." ) ;

atom = Atom.parse( "[n?horse|horses]" ) ;
expect( babel.solve( "There is an $1[n:1]..." , atom ) ).to.be( "There is an horse..." ) ;
expect( babel.solve( "There are $1[n:2]..." , atom ) ).to.be( "There are horses..." ) ;
expect( babel.solve( "There are $1[n:many]..." , atom ) ).to.be( "There are horses..." ) ;
```

should format things using the 'n0g?' notation.

```js
var babel = new Babel() ;

expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 3 ) ).to.be( "J'aime les chevaux!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:3,g:'f'} ) ).to.be( "J'aime les juments!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 1 ) ).to.be( "J'aime le cheval!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:1,g:'f'} ) ).to.be( "J'aime la jument!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , 0 ) ).to.be( "J'aime aucun cheval!" ) ;
expect( babel.solve( "J'aime $1[n0g?(aucun|aucune)|(le|la)|(les)] $1[ng?(cheval|jument)|(chevaux|juments)]!" , {n:0,g:'f'} ) ).to.be( "J'aime aucune jument!" ) ;
```

should work with objects, using the path syntax.

```js
var babel = new Babel() ;

var data = {
	bob: { firstName: "Bobby" , lastName: "Fischer" } ,
	alice: { firstName: "Alice" , lastName: "M." } ,
} ;

expect( babel.solve( "Hello $1{firstName}!" , data.bob ) ).to.be( "Hello Bobby!" ) ;
expect( babel.solve( "Hello $1{firstName} $1{lastName}!" , data.bob ) ).to.be( "Hello Bobby Fischer!" ) ;
expect( babel.solve( "Hello $1{bob.firstName} $1{bob.lastName} and $1{alice.firstName} $1{alice.lastName}!" , data ) ).to.be( "Hello Bobby Fischer and Alice M.!" ) ;
```

$ without number should use the first arg, just like $1.

```js
var babel = new Babel() ;

var data = {
	bob: { firstName: "Bobby" , lastName: "Fischer" } ,
	alice: { firstName: "Alice" , lastName: "M." } ,
} ;

expect( babel.solve( "Hello ${bob.firstName} ${bob.lastName} and ${alice.firstName} ${alice.lastName}!" , data ) ).to.be( "Hello Bobby Fischer and Alice M.!" ) ;
```

undefined values for missing variable index/path.

```js
var babel = new Babel() ;

expect( babel.solve( "Give me $1 and $3!" , "apples" , "pears" ) ).to.be( "Give me apples and (undefined)!" ) ;
expect( babel.solve( "Give me $3 and $2!" , "apples" , "pears" ) ).to.be( "Give me (undefined) and pears!" ) ;

var ctx = {
	fruit: "apples"
} ;

expect( babel.solve( "Give me ${fruit} and ${excellentFruit}!" , ctx ) ).to.be( "Give me apples and (undefined)!" ) ;
expect( babel.solve( "Give me ${excellentFruit} and ${fruit}!" , ctx ) ).to.be( "Give me (undefined) and apples!" ) ;
expect( babel.solve( "Give me ${fruit}[//uc1] and ${excellentFruit}[//uc]!" , ctx ) ).to.be( "Give me Apples and (UNDEFINED)!" ) ;
```

default values for missing variable index/path.

```js
var babel = new Babel() ;

expect( babel.solve( "Give me $1 and $3[d:strawberries]!" , "apples" , "pears" ) ).to.be( "Give me apples and strawberries!" ) ;
expect( babel.solve( "Give me $3[default:strawberries] and $2!" , "apples" , "pears" ) ).to.be( "Give me strawberries and pears!" ) ;

var ctx = {
	fruit: "apples"
} ;

expect( babel.solve( "Give me ${fruit} and ${excellentFruit}[default:strawberries]!" , ctx ) ).to.be( "Give me apples and strawberries!" ) ;
expect( babel.solve( "Give me ${excellentFruit}[default:strawberries] and ${fruit}!" , ctx ) ).to.be( "Give me strawberries and apples!" ) ;
expect( babel.solve( "Give me ${fruit}[//uc1] and ${excellentFruit}[d:strawberries//uc]!" , ctx ) ).to.be( "Give me Apples and STRAWBERRIES!" ) ;
```

<a name="escape-special-character"></a>
# Escape special character
escape inside sentence bracket.

```js
var babel = new Babel() ;

expect( babel.solve( "Give me $[default:pears/n:2]!" ) ).to.be( "Give me pears!" ) ;
expect( babel.solve( "Give me $[default:pears and\\/or apples]!" ) ).to.be( "Give me pears and/or apples!" ) ;
```

escape inside atom bracket.

```js
var babel = new Babel() ;

expect( Atom.parse( "atom[default:pears/n:2]!" ) ).to.eql( {
	k: "atom" ,
	d: "pears" ,
	n: 2
} ) ;

expect( Atom.parse( "atom[default:pears and\\/or apples]!" ) ).to.eql( {
	k: "atom" ,
	d: "pears and/or apples"
} ) ;

expect( Atom.parse( "num[n?one\\|1|two\\|2]" ) ).to.eql( {
	k: "num" ,
	alt: [ "one|1" , "two|2" ] ,
	ord: ['n']
} ) ;
```

<a name="sentence-instances"></a>
# Sentence instances
Basic sentence.

```js
var sentence = new Sentence( "Give me $1 apple$1[n?|s]!" ) ;

expect( sentence.toString( 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( sentence.toString( 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( sentence.toString( 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( sentence.toString( 3 ) ).to.be( "Give me 3 apples!" ) ;
```

.toStringKFG().

```js
var sentence = new Sentence( "I like ${name}!" ) ;

expect( sentence.toStringKFG( { name: 'strawberries' } ) ).to.be( "I like strawberries!" ) ;
```

<a name="basic-usage-with-language-pack"></a>
# Basic usage with language pack
should format and localize.

```js
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
```

<a name="language-pack-and-functions"></a>
# Language pack and functions
should format and localize, using language functions.

```js
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
```

should format and localize, and localize translatable variables.

```js
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
		atoms: {
			apple: { g:'f', "n?": [ 'pomme' , 'pommes' ] } ,
			horse: { g:'m', "n?": [ 'cheval' , 'chevaux' ] } ,
		}
	}
} ) ;

//expect( babel.solve( "Give me an $1!" , "apple" ) ).to.be( "Give me an apple!" ) ;
expect( babelFr.solve( "Give me an $1!" , "apple" ) ).to.be( "Donne-moi une pomme!" ) ;

expect( babel.solve( "I like $1[n:many]!" , { "n?": [ "horse" , "horses" ] } ) ).to.be( "I like horses!" ) ;
expect( babelFr.solve( "I like $1[n:many]!" , "horse" ) ).to.be( "J'aime les chevaux!" ) ;
```

<a name="advanced-feature-list-and-enumeration"></a>
# Advanced feature: list and enumeration
basic enumeration with no rules should simply join with a space.

```js
var babel = new Babel() ;
expect( babel.solve( "I want $1[enum]." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want apple pear orange." ) ;
```

when a string is given instead of an array, it should be equivalent to an array of the given string.

```js
var babel = new Babel() ;
expect( babel.solve( "I want $1[enum]." , "apple" ) ).to.be( "I want apple." ) ;
expect( babel.solve( "I want $1." , "apple" ) ).to.be( "I want apple." ) ;
```

enumeration with variable length.

```js
var babel = new Babel() ;
expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [] ) ).to.be( "I want nothing." ) ;
expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" ] ) ).to.be( "I want apples." ) ;
expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" ] ) ).to.be( "I want apples and pears." ) ;
expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" ] ) ).to.be( "I want apples, pears and oranges." ) ;
expect( babel.solve( "I want $1[enum:nothing|$|, $| and $]." , [ "apples" , "pears" , "oranges" , "strawberries" ] ) ).to.be( "I want apples, pears, oranges and strawberries." ) ;
```

the array length should be used as n.

```js
var babel = new Babel() ;

expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [] ) ).to.be( "I want nothing." ) ;
expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [ "apple" ] ) ).to.be( "I want something." ) ;
expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [ "apple" , "pear" ] ) ).to.be( "I want two things." ) ;
expect( babel.solve( "I want $1[n0?nothing|something|two things|many things]." , [ "apple" , "pear" , "orange" ] ) ).to.be( "I want many things." ) ;

expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [] ) ).to.be( "I want nothing." ) ;
expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [ "pear" ] ) ).to.be( "I want something: a pear." ) ;
expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [ "pear" , "banana" ] ) ).to.be( "I want two things: a pear and a banana." ) ;
expect( babel.solve( "I want $1[n0?nothing|something: |two things: |many things: ]$1[enum:|a $|, a $| and a $]." , [ "pear" , "banana" , "strawberry" ] ) ).to.be( "I want many things: a pear, a banana and a strawberry." ) ;
```

enumeration with variable length, translation and operators in enumeration.

```js
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
expect( babelFr.solve( sentence , [ { k:"pear" , n:'many' } , "banana" ] ) ).to.be( "Je veux plusieurs choses: des poires et une banane." ) ;
```

<a name="advanced-feature-reference-operator"></a>
# Advanced feature: reference operator
using reference operator that point to an atom should extend the current atom/part.

```js
var e = Atom.parse( "[uv:1000|1/uf:$km|$m/um:N+]" ) ;

expect( babel.solve( "$1[$2]" , 3 , e ) ).to.be( "3m" ) ;

expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
expect( babel.solve( "${length}[$1:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
expect( babel.solve( "$1{length}[$:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;
expect( babel.solve( "$1{length}[$1:lengthUnit]" , { length: 3 , lengthUnit: e } ) ).to.be( "3m" ) ;

expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3km 21m" ) ;
```

using reference operator stacked with other operators.

```js
var e = Atom.parse( "[uv:1000|1/uf:$km|$m/um:N+]" ) ;

expect( babel.solve( "${length}[$:lengthUnit]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3km 21m" ) ;
expect( babel.solve( "${length}[$:lengthUnit/um:R]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3.021km" ) ;
expect( babel.solve( "${length}[$:lengthUnit/uf:$ km|$ m/uenum:0|$|, $| and $]" , { length: 3021 , lengthUnit: e } ) ).to.be( "3 km and 21 m" ) ;
```

<a name="post-filters"></a>
# Post-filters
should apply post-filters 'uc1' (upper-case first letter).

```js
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
expect( babelFr.solve( "$1[n:many//uc1]: I like that!" , "apple" ) ).to.be( "Pommes: j'adore ça!" ) ;
expect( babelFr.solve( "$1[n:many//uc1]: I like that!" , "pear" ) ).to.be( "Poires: j'adore ça!" ) ;
expect( babelFr.solve( "$1[//uc1]: I like that!" , { k:"apple", n:'many'} ) ).to.be( "Pommes: j'adore ça!" ) ;

expect( babel.solve( "${fruit//uc1}: I like that!" , { fruit: "apple" } ) ).to.be( "Apple: I like that!" ) ;
```

should apply post-filters various filters combination.

```js
var babel = new Babel() ;

expect( babel.solve( "$1[//uc1]: I like that!" , "apple" ) ).to.be( "Apple: I like that!" ) ;
expect( babel.solve( "$1[//uc]: I like that!" , "apple" ) ).to.be( "APPLE: I like that!" ) ;
expect( babel.solve( "$1[//lc]: I like that!" , "APPLE" ) ).to.be( "apple: I like that!" ) ;
expect( babel.solve( "$1[//lc/uc1]: I like that!" , "APPLE" ) ).to.be( "Apple: I like that!" ) ;

expect( babel.solve( "${fruit//lc/uc1}: I like that!" , { fruit: "APPLE" } ) ).to.be( "Apple: I like that!" ) ;

expect( babel.solve( "echo ${arg//shellarg}" , { arg: "simple" } ) ).to.be( "echo 'simple'" ) ;
expect( babel.solve( "echo ${arg//shellarg}" , { arg: "with single ' quote" } ) ).to.be( "echo 'with single '\\'' quote'" ) ;
```

should apply english post-filters.

```js
var babel = new Babel() ;

expect( babel.solve( "You take $1[//en:the]." , "apple" ) ).to.be( "You take the apple." ) ;
expect( babel.solve( "You take $1[//en:the]." , "Excalibur" ) ).to.be( "You take Excalibur." ) ;
expect( babel.solve( "You take $1[//en:a]." , "apple" ) ).to.be( "You take an apple." ) ;
expect( babel.solve( "You take $1[//en:a]." , "banana" ) ).to.be( "You take a banana." ) ;
expect( babel.solve( "You take $1[//en:a]." , "Excalibur" ) ).to.be( "You take Excalibur." ) ;

expect( babel.solve( "You take ${noun//en:the}." , { noun: "apple" } ) ).to.be( "You take the apple." ) ;
```

should apply path post-filters.

```js
var babel = new Babel() ;
expect( babel.solve( "$[//extname]" , "README.md" ) ).to.be( ".md" ) ;
expect( babel.solve( "$[//extname]" , "~/somedir/README.md" ) ).to.be( ".md" ) ;
expect( babel.solve( "$[//basename]" , "~/somedir/README.md" ) ).to.be( "README.md" ) ;
expect( babel.solve( "$[//basenameNoExt]" , "~/somedir/README.md" ) ).to.be( "README" ) ;
expect( babel.solve( "$[//dirname]" , "~/somedir/README.md" ) ).to.be( "~/somedir" ) ;
```

<a name="misc"></a>
# Misc
should extract the named variables from the format string.

```js
expect( Babel.getNamedVars( "Hello bob" ) ).to.eql( [] ) ;
expect( Babel.getNamedVars( "Hello ${friend}" ) ).to.eql( [ 'friend' ] ) ;
expect( Babel.getNamedVars( "Hello ${first} and ${second}" ) ).to.eql( [ 'first' , 'second' ] ) ;
expect( Babel.getNamedVars( "Hello $1, ${first}, $2, $ and ${second} love $$..." ) ).to.eql( [ 'first' , 'second' ] ) ;
expect( Babel.getNamedVars( "Hello ${person.name} and ${person2.name}" ) ).to.eql( [ 'person.name' , 'person2.name' ] ) ;
expect( Babel.getNamedVars( "Hello ${first} and ${second}, glad to meet you ${first}" ) ).to.eql( [ 'first' , 'second' ] ) ;
```

edge cases.

```js
var babel = new Babel() ;
expect( babel.solve( "--'${content}'--" , { content: new String( 'content' ) } ) ).to.be( "--'content'--" ) ;

expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: null } ) ).to.be( "nothing" ) ;
expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [] } ) ).to.be( "nothing" ) ;
expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ '' ] } ) ).to.be( "something: --''--" ) ;
expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ 'content' ] } ) ).to.be( "something: --'content'--" ) ;
expect( babel.solve( "${contentList}[enum:nothing|something: --'$'--]" , { contentList: [ new String( 'content' ) ] } ) ).to.be( "something: --'content'--" ) ;
```

<a name="enfr-core-langpack-features"></a>
# 'en'/'fr' core langpack features
testing few features.

```js
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
		atoms: {
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
```

<a name="string-kits-format-interoperability"></a>
# String-kit's format() interoperability
should escape argument using the autoEscape regexp.

```js
var babel , regex ;

babel = new Babel() ;
expect( babel.solve( "Give me ^g^/$^:!" , 'apple' ) ).to.be( "Give me ^g^/apple^:!" ) ;
expect( babel.solve( "Give me ^g^/$^:!" , 'app^le' ) ).to.be( "Give me ^g^/app^le^:!" ) ;

regex = /(\^|%)/g ;
regex.substitution = '$1$1' ;
babel = new Babel( regex ) ;
expect( babel.solve( "Give me ^g^/$^:!" , 'apple' ) ).to.be( "Give me ^g^/apple^:!" ) ;
expect( babel.solve( "Give me ^g^/$^:!" , 'app^le' ) ).to.be( "Give me ^g^/app^^le^:!" ) ;
```

<a name="lab"></a>
# Lab
using reference operator as verb.

```js
var babel = new Babel() ;

var ctx = {
	verbe: {
		"être": Atom.parse( "être[p?suis|es|est]" )
	} ,
	sujet: {
		moi: Atom.parse( "[p:1/s:je]" ) ,
		bob: Atom.parse( "[s:Bob]" )
	}
} ;

expect( babel.solve( "${sujet.moi//uc1} $[$:verbe.être] content!" , ctx ) ).to.be( "Je suis content!" ) ;
expect( babel.solve( "${sujet.bob//uc1} $[$:verbe.être] content!" , ctx ) ).to.be( "Bob est content!" ) ;
expect( babel.solve( "Tu ${sujet.bob}[$:verbe.être/p:2] content!" , ctx ) ).to.be( "Tu es content!" ) ;
```

using a function as verb.

```js
var babel = new Babel() ;

babel.extendLocale( {
	defaultEnum: [ "" , "$" , ", $" , " et $" ] ,
	functions: {
		"être": "être[np?(suis|es|est)|(sommes|êtes|sont)]" ,
		"pronom": "pronom[npg?(je|tu|(il|elle))|(nous|vous|(ils|elles))]"
	}
} ) ;

var ctx = {
	moi: Atom.parse( "[p:1/s:je]" ) ,
	alice: Atom.parse( "[s:Alice/g:f]" ) ,
	bob: Atom.parse( "[s:Bob/g:m]" ) ,
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
```

