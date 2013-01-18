<!---
layout: intro
title: DollarJS
-->

# DollarJS

> * A jQuery-compatible and non-All-in-One library which is more "Zepto" than Zepto.js
> * Focus on DOM operations and mobile platform, wrap native API wherever possible.

## AMD and OzJS

* DollarJS can either be viewed as an independent library, or as a part of [OzJS mirco-framework](http://ozjs.org/#framework).
* It's wrapped as an [AMD (Asynchronous Module Definition)](https://github.com/amdjs/amdjs-api/wiki/AMD) module. You should use it with [oz.js](http://ozjs.org/#start) (or require.js or [similar](http://wiki.commonjs.org/wiki/Implementations) for handling dependencies). 
* If you want to make it available for both other AMD code and traditional code based on global namespace. OzJS provides [a mini define/require implementation](http://ozjs.org/examples/adapter/) to transform AMD module into traditional [module pattern](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth).
* See [http://ozjs.org](http://ozjs.org) for details.

## Dependencies

* [mo/lang/es5](https://github.com/dexteryy/mo)
* [mo/lang/mix](https://github.com/dexteryy/mo)
* [mo/lang/type](https://github.com/dexteryy/mo)

## Examples

Under construction...

## Get the code

* [View/download on Github](https://github.com/dexteryy/DollarJS/blob/master/dollar.js)
* Add/update to your project as new dependency:
    * via [istatic](https://github.com/mockee/istatic.git)
    * via [volo](https://github.com/volojs/volo)

## API and usage

```javascript 
var $ = require('dollar');
```

* `$()` -- 

### API inherited from Array.prototype

* support All Array methods

### API for traversing

* `find()` -- 
* `eq()` -- 
* `not()` -- 
* `has()` -- 
* `parent()` -- 
* `parents()` -- 
* `closest()` -- 
* `siblings()` -- 
* `next()` -- 
* `nextAll()` -- 
* `nextUntil()` -- 
* `prev()` -- 
* `prevAll()` -- 
* `prevUntil()` -- 
* `children()` -- 
* `contents()` -- 

### API for detection

* `is()` -- 
* `hasClass()` -- 

### API for properties

* `addClass()` -- 
* `removeClass()` -- 
* `toggleClass()` -- 
* `attr()` -- 
* `removeAttr()` -- 
* `prop()` -- 
* `removeProp()` -- 
* `data()` -- 
* `removeData()` -- 
* `val()` -- 
* `empty()` -- 
* `html()` -- 
* `text()` -- 
* `css()` -- 
* `hide()` -- 
* `show()` -- 

### API for dimensions

* `offset()` -- 
* `width()` -- 
* `height()` -- 

### API for manipulation

* `appendTo()` -- 
* `append()` -- 
* `prependTo()` -- 
* `prepend()` -- 
* `insertBefore()` -- 
* `before()` -- 
* `insertAfter()` -- 
* `after()` -- 
* `replaceAll()` -- 
* `replaceWith()` -- 
* `wrap(boxes)` -- 
* `wrapAll()` -- 
* `wrapInner()` -- 
* `unwrap()` -- 
* `clone()` -- 
* `remove()` -- 

### API for event

* `bind()` -- 
* `unbind()` -- 
* `trigger()` -- 

### API for miscellaneous

* `end()` -- 
* `each()` -- 

### Public static API

* `$.matchesSelector` -- 
* `$.createNodes` -- 
* `$.camelize` -- 
* `$.dasherize` -- 
* `$.Event` -- 

### Why not add XXX

* `$.ajax()` -- 
* `$.when()` -- 
* `$.type()` -- 
* `$.isArray()` -- 
* `$.proxy()` -- 
* `$.extend()` -- 
* `$.fn.ready()` -- 
* `$.fn.animate()` -- 
* `$.fn.delegate()` -- 
* `$.fn.on()` -- 
* `$.fn.map()` -- 
* `$.fn.data(object)` -- 
* `$.fn.detach(object)` -- 

Under construction...

## More References

See [OzJS References](http://ozjs.org/#ref)

## Release History

See [OzJS Release History](http://ozjs.org/#release)

## License

Copyright (c) 2010 - 2013 dexteryy  
Licensed under the MIT license.


