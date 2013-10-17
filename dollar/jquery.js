/**
 * DollarJS
 * A jQuery-compatible and non-All-in-One library which is more "Zepto" than Zepto.js
 * Focus on DOM operations and mobile platform, wrap native API wherever possible.
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define("dollar/jquery", [
    "mo/lang/es5",
    "mo/lang/mix",
    "jquery"
], function(es, _, $){

    ['forEach', 'every', 'some', 'indexOf', 'lastIndexOf', 'join', 
            'push', 'pop', 'shift', 'unshift'].forEach(function(method){
        this[method] = Array.prototype[method];
    }, $.fn);

    ['slice', 'reverse', 'sort'].forEach(function(method){
        var origin = this['_' + method] = Array.prototype[method];
        this[method] = function(){
            return $(origin.apply(this, arguments));
        };
    }, $.fn);

    $.fn.once = $.fn.one;

    var origin_trigger = $.event.trigger;
	$.event.trigger = function(event, data) {
        var args = [].slice.apply(arguments);
        if (typeof data === 'object' && !Array.isArray(data)) {
            if (typeof event === 'string') {
                event = new $.Event(event);
            }
            for (var i in data) {
                if (typeof data[i] !== 'function'
                        && i !== 'type') {
                    event[i] = data[i];
                }
            }
            args[0] = event;
        }
        return origin_trigger.apply(this, args);
    };

    return $;

});

