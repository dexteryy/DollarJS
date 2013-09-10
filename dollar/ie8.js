
define('dollar/ie8', [
    'mo/lang/es5',
    'mo/lang/mix',
    'mo/lang/type',
    'dollar/android23',
    'jquery'
], function(es5, _, detect, $, jq){

    var _array_slice = Array.prototype.slice;

    var ext = $.fn;

    ['offset', 'width', 'height'].forEach(function(method){
        ext[method] = function(){
            return jq(this)[method](); 
        };
    });

    ['show', 'hide'].forEach(function(method){
        ext[method] = function(){
            jq(this)[method](); 
            return this;
        };
    });

    _.mix(ext, {

        css: $._kvAccess(function(node, name, value){
            jq(node).css(name, value);
        }, function(node, name){
            return jq(node).css(name);
        }, function(dict){
            jq(this).css(dict);
        }),

        on: function(subject, cb){
            jq(this).on(subject, cb);
            return this;
        },

        off: function(subject, cb){
            jq(this).off(subject, cb);
            return this;
        }

    });

    ext.bind = ext.on;
    ext.unbind = ext.off;

    $._querySelector = function(context, selector){
        return _array_slice.call(jq.find(selector, context));
    };

    $.matchesSelector = jq.find.matchesSelector;

    $.createNodes = function(str, attrs){
        return $(jq(str, attrs));
    };

    $.Event = function(type, props){
        return new jq.Event(type, props);
    };

    $.trigger = $.fn.trigger = function(me, event, data){
        if (this === $) {
            me = $(me);
        } else {
            data = event;
            event = me;
            me = this;
        }
        if (typeof event === 'string') {
            event = $.Event(event);
        }
        _.mix(event, data);
        me.forEach(function(node){
            jq(node).trigger(event);
        });
        return this;
    };

    return $;

});

