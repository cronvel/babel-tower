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
<a name=""></a>
 
<a name="basic-usage-without-language-pack"></a>
# Basic usage without language pack
should replace.

```js
babel = Babel.create() ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 0 ) ).to.be( "Give me 0 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 1 ) ).to.be( "Give me 1 apple!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 2 ) ).to.be( "Give me 2 apples!" ) ;
expect( babel.solve( "Give me $1 apple$1[altn:|s]!" , 3 ) ).to.be( "Give me 3 apples!" ) ;
```

