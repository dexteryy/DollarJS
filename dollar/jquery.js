
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
            args[0] = _.mix(event, data);
        }
        return origin_trigger.apply(this, args);
    };

    return $;

});

