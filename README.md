

# Babel Tower

i18n.
 
Args: [ Word { n: 0 } ]
Arg: Word { n: 0 }
Arg: Word { n: 0 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 1 } ]
Arg: Word { n: 1 }
Arg: Word { n: 1 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 2 } ]
Arg: Word { n: 2 }
Arg: Word { n: 2 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 3 } ]
Arg: Word { n: 3 }
Arg: Word { n: 3 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 0 } ]
Arg: Word { n: 0 }
Arg: Word { n: 0 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 1 } ]
Arg: Word { n: 1 }
Arg: Word { n: 1 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 2 } ]
Arg: Word { n: 2 }
Arg: Word { n: 2 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 3 } ]
Arg: Word { n: 3 }
Arg: Word { n: 3 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 0 } ]
Arg: Word { n: 0 }
Arg: Word { n: 0 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 1 } ]
Arg: Word { n: 1 }
Arg: Word { n: 1 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 2 } ]
Arg: Word { n: 2 }
Arg: Word { n: 2 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 3 } ]
Arg: Word { n: 3 }
Arg: Word { n: 3 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 0 } ]
Arg: Word { n: 0 }
Arg: Word { n: 0 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 1 } ]
Arg: Word { n: 1 }
Arg: Word { n: 1 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 2 } ]
Arg: Word { n: 2 }
Arg: Word { n: 2 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 3 } ]
Arg: Word { n: 3 }
Arg: Word { n: 3 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 0 } ]
Arg: Word { n: 0 }
Arg: Word { n: 0 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 1 } ]
Arg: Word { n: 1 }
Arg: Word { n: 1 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 2 } ]
Arg: Word { n: 2 }
Arg: Word { n: 2 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
Args: [ Word { n: 3 } ]
Arg: Word { n: 3 }
Arg: Word { n: 3 }
replaceArgs --   index: 0    op: altn    opArgs: [ '', 's' ]
# TOC
   - [Basic usage without language pack](#basic-usage-without-language-pack)
   - [Basic usage with language pack](#basic-usage-with-language-pack)
<a name=""></a>
 
<a name="basic-usage-without-language-pack"></a>
# Basic usage without language pack
should replace.

```js
var babel = Babel.create() ;

expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
```

<a name="basic-usage-with-language-pack"></a>
# Basic usage with language pack
should replace.

```js
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
```

