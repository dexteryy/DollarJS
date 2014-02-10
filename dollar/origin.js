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
define("dollar/origin", [
    "mo/lang/es5",
    "mo/lang/mix",
    "mo/lang/type"
], function(es5, _, detect){

    var window = this,
        doc = window.document,
        NEXT_SIB = 'nextElementSibling',
        PREV_SIB = 'previousElementSibling',
        FIRST_CHILD = 'firstElementChild',
        MATCHES_SELECTOR = [
            'webkitMatchesSelector', 
            'mozMatchesSelector', 
            'msMatchesSelector', 
            'matchesSelector'
        ].map(function(name){
            return this[name] && name;
        }, doc.body).filter(pick)[0],
        MOUSE_EVENTS = { click: 1, mousedown: 1, mouseup: 1, mousemove: 1 },
        TOUCH_EVENTS = { touchstart: 1, touchmove: 1, touchend: 1, touchcancel: 1 },
        SPECIAL_TRIGGERS = { submit: 1, focus: 1, blur: 1 },
        CSS_NUMBER = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },
        RE_HTMLTAG = /^\s*<(\w+|!)[^>]*>/,
        is_function = detect.isFunction,
        is_window = detect.isWindow,
        _array_map = Array.prototype.map,
        _array_push = Array.prototype.push,
        _array_slice = Array.prototype.slice,
        _elm_display = {},
        _html_containers = {};


    function $(selector, context){
        if (selector) {
            if (selector.constructor === $) {
                return selector;
            } else if (typeof selector !== 'string') {
                var nodes = new $();
                if (detect.isArraylike(selector)
                        && selector.nodeType !== 1) {
                    _array_push.apply(nodes, _array_slice.call(selector));
                } else {
                    _array_push.call(nodes, selector);
                }
                return nodes;
            } else {
                selector = selector.trim();
                if (RE_HTMLTAG.test(selector)) {
                    return $.createNodes(selector);
                } else if (context) {
                    return $(context).find(selector);
                } else {
                    return ext.find(selector);
                }
            }
        } else if (is_window(this)) {
            return new $();
        }
    }

    var ext = $.fn = $.prototype = [];

    ['map', 'filter', 'slice', 'reverse', 'sort'].forEach(function(method){
        var origin = this['_' + method] = this[method];
        this[method] = function(){
            return $(origin.apply(this, arguments));
        };
    }, ext);

    var origin_concat = ext._concat = ext.concat;
    ext.concat = function(){
        return $(origin_concat.apply(this._slice(), check_array_argument(arguments)));
    };

    var origin_splice = ext._splice = ext.splice;
    ext.splice = function(){
        return $(origin_splice.apply(this, check_array_argument(arguments)));
    };

    _.mix(ext, {

        constructor: $,

        toString: function(){
            return this.join(',');
        },

        // Traversing

        find: function(selector){
            var nodes = new $(), contexts;
            if (this === ext) {
                contexts = [doc];
            } else {
                nodes.prevObject = contexts = this;
            }
            if (/^#[\w_]+$/.test(selector)) {
                var elm = ((contexts[0] || doc).getElementById 
                    || doc.getElementById).call(doc, selector.substr(1));
                if (elm) {
                    nodes.push(elm);
                }
            } else {
                if (contexts[1]) {
                    contexts.forEach(function(context){
                        _array_push.apply(this, 
                            $._querySelector(context, selector));
                    }, nodes);
                } else if (contexts[0]) {
                    _array_push.apply(nodes, 
                        $._querySelector(contexts[0], selector));
                }
            }
            return nodes;
        },

        eq: function(i){
            i = parseInt(i, 10);
            return i === -1 ? this.slice(-1) : this.slice(i, i + 1);
        },

        not: function(selector){
            return this.filter(function(node){
                return node && !this(node, selector);
            }, $.matches);
        },

        matches: function(selector){
            return this.filter(function(node){
                return node && this(node, selector);
            }, $.matches);
        },

        has: function(selector){
            return this.filter(function(node){
                if (!node) {
                    return false;
                }
                if (typeof selector === 'string') {
                    return $(selector, node).length;
                } else {
                    return $.contains(node, $(selector)[0]);
                }
            });
        },

        parent: find_near('parentNode'),

        parents: function(selector){
            var ancestors = new $(), p = this,
                finding = selector 
                    ? find_selector(selector, 'parentNode') 
                    : function(node){
                        return this[this.push(node.parentNode) - 1];
                    };
            while (p.length) {
                p = p.map(finding, ancestors);
            }
            return ancestors;
        },

        closest: function(selector){
            var ancestors = new $(), p = this, 
                finding = find_selector(selector, 'parentNode');
            while (p.length && !ancestors.length) {
                p = p.map(finding, ancestors);
            }
            return ancestors.length && ancestors || this;
        },

        siblings: find_sibs(NEXT_SIB, FIRST_CHILD),

        next: find_near(NEXT_SIB),

        nextAll: find_sibs(NEXT_SIB),

        nextUntil: find_sibs(NEXT_SIB, false, true),

        prev: find_near(PREV_SIB),

        prevAll: find_sibs(PREV_SIB),

        prevUntil: find_sibs(PREV_SIB, false, true),

        children: function(){
            var r = new $();
            this.forEach(function(node){
                this(r, $(node.children));
            }, _.merge);
            return r;
        },

        contents: function(){
            var r = new $();
            this.forEach(function(node){
                this(r, $(node.childNodes));
            }, _.merge);
            return r;
        },

        // Detection

        is: function(selector){
            return this.some(function(node){
                return node && $.matches(node, selector);
            });
        },

        hasClass: function(cname){
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i].classList.contains(cname)) {
                    return true;
                }
            }
            return false;
        },

        // Properties

        addClass: function(cname){
            return nodes_access.call(this, cname, function(node, value){
                node.classList.add(value);
            }, function(node){
                return node.className;
            });
        },

        removeClass: function(cname){
            return nodes_access.call(this, cname, function(node, value){
                node.classList.remove(value);
            }, function(node){
                return node.className;
            });
        },

        toggleClass: function(cname, force){
            return nodes_access.call(this, cname, function(node, value){
                node.classList[force === undefined && 'toggle'
                    || force && 'add' || 'remove'](value);
            }, function(node){
                return node.className;
            });
        },

        attr: kv_access(function(node, name, value){
            node.setAttribute(name, value);
        }, function(node, name){
            return node.getAttribute(name);
        }),

        removeAttr: function(name){
            this.forEach(function(node){
                node.removeAttribute(this);
            }, name);
            return this;
        },

        prop: kv_access(function(node, name, value){
            node[name] = value;
        }, function(node, name){
            return node[name];
        }),

        removeProp: function(name){
            this.forEach(function(node){
                delete node[this];
            }, name);
            return this;
        },

        data: kv_access(function(node, name, value){
            node.dataset[css_method(name)] = value;
        }, function(node, name){
            var data = node.dataset;
            if (!data) {
                return;
            }
            return name ? data[css_method(name)] 
                : _.mix({}, data);
        }),

        removeData: function(name){
            this.forEach(function(node){
                delete node.dataset[this];
            }, name);
            return this;
        },

        val: v_access(function(node, value){
            node.value = value;
        }, function(node){
            if (this.multiple) {
                return $('option', this).filter(function(item){
                    return item.selected;
                }).map(function(item){
                    return item.value;
                });
            }
            return node.value;
        }),

        empty: function(){
            this.forEach(function(node){
                node.innerHTML = '';
            });
            return this;
        },

        html: v_access(function(node, value){
            if (RE_HTMLTAG.test(value)) {
                $(node).empty().append(value);
            } else {
                node.innerHTML = value;
            }
        }, function(node){
            return node.innerHTML;
        }),

        text: v_access(function(node, value){
            node.textContent = value;
        }, function(node){
            return node.textContent;
        }),

        clone: function(){
            return this.map(function(node){
                return node.cloneNode(true);
            });
        },

        css: kv_access(function(node, name, value){
            var prop = css_prop(name);
            if (!value && value !== 0) {
                node.style.removeProperty(prop);
            } else {
                node.style.cssText += ';' + prop + ":" + css_unit(prop, value);
            }
        }, function(node, name){
            return node.style[css_method(name)] 
                || $.getPropertyValue(node, name);
        }, function(dict){
            var prop, value, css = '';
            for (var name in dict) {
                value = dict[name];
                prop = css_prop(name);
                if (!value && value !== 0) {
                    this.forEach(function(node){
                        node.style.removeProperty(this);
                    }, prop);
                } else {
                    css += prop + ":" + css_unit(prop, value) + ';';
                }
            }
            this.forEach(function(node){
                node.style.cssText += ';' + this;
            }, css);
        }),

        hide: function(){
            return this.css("display", "none");
        },

        show: function(){
            this.forEach(function(node){
                if (node.style.display === "none") {
                    node.style.display = null;
                }
                if (this(node, "display") === "none") {
                    node.style.display = default_display(node.nodeName);
                }
            }, $.getPropertyValue);
            return this;
        },

        // Dimensions

        offset: function(){
            if (!this[0]) {
                return;
            }
            var set = this[0].getBoundingClientRect();
            return {
                left: set.left + window.pageXOffset,
                top: set.top + window.pageYOffset,
                width: set.width,
                height: set.height
            };
        },

        width: dimension('Width'),

        height: dimension('Height'),

        scrollLeft: scroll_offset(),

        scrollTop: scroll_offset(true),

        // Manipulation

        appendTo: operator_insert_to(1),

        append: operator_insert(1),

        prependTo: operator_insert_to(3),

        prepend: operator_insert(3),

        insertBefore: operator_insert_to(2),

        before: operator_insert(2),

        insertAfter: operator_insert_to(4),

        after: operator_insert(4),

        replaceAll: function(targets){
            var t = $(targets);
            this.insertBefore(t);
            t.remove();
            return this;
        },

        replaceWith: function(contents){
            return $(contents).replaceAll(this);
        },

        wrap: function(boxes){
            return nodes_access.call(this, boxes, function(node, value){
                $(value).insertBefore(node).append(node);
            });
        },

        wrapAll: function(boxes){
            $(boxes).insertBefore(this.eq(0)).append(this);
            return this;
        },

        wrapInner: function(boxes){
            return nodes_access.call(this, boxes, function(node, value){
                $(node).contents().wrapAll(value);
            });
        },

        unwrap: function(){
            this.parent().forEach(function(node){
                this(node).children().replaceAll(node);
            }, $);
            return this;
        },

        remove: function(){
            this.forEach(function(node){
                var parent = node.parentNode;
                if (parent) {
                    parent.removeChild(node);
                }
            });
            return this;
        },

        // Event

        on: event_access('add'),

        off: event_access('remove'),

        once: function(subject, cb){
            var fn = function(){
                $(this).off(subject, fn);
                return cb.apply(this, arguments);
            };
            return $(this).on(subject, fn);
        },

        trigger: trigger,

        // Miscellaneous

        end: function(){
            return this.prevObject || new $();
        },

        each: function(fn){
            for (var i = 0, l = this.length; i < l; i++){
                var re = fn.call(this[i], i);
                if (re === false) {
                    break;      
                }
            }
            return this;
        }

    });

    ext.bind = ext.on;
    ext.unbind = ext.off;
    ext.one = ext.once;

    // private

    function pick(v){ 
        return v; 
    }

    function find_selector(selector, attr){
        return function(node){
            if (attr) {
                node = node[attr];
            }
            if ($.matches(node, selector)) {
                this.push(node);
            }
            return node;
        };
    }

    function find_near(prop){
        return function(selector){
            return $(_.unique([undefined, doc, null].concat(
                this._map(selector ? function(node){
                    var n = node[prop];
                    if (n && $.matches(n, selector)) {
                        return n;
                    }
                } : function(node){
                    return node[prop];
                })
            )).slice(3));
        };
    }

    function find_sibs(prop, start, has_until){
        return function(target, selector){
            if (!has_until) {
                selector = target;
            }
            var sibs = new $();
            this.forEach(function(node){
                var until,
                    n = start ? node.parentNode[start] : node;
                if (has_until) {
                    until = $(target, node.parentNode);
                }
                do {
                    if (until && until.indexOf(n) > -1) {
                        break;
                    }
                    if (node !== n && (!selector 
                        || $.matches(n, selector))) {
                        this.push(n);
                    }
                } while (n = n[prop]);
            }, sibs);
            return _.unique(sibs);
        };
    }

    function nodes_access(value, setter, getter, name){
        if (value === null || value === undefined) {
            return this;
        }
        var is_fn_arg = is_function(value);
        this.forEach(function(node, i){
            if (!node) {
                return;
            }
            var v = !is_fn_arg 
                ? value 
                : value.call(this, i, 
                    getter && getter.call(this, node, name));
            setter.call(this, node, name || v, v);
        }, this);
        return this;
    }

    function v_access(setter, getter){
        return function(value){
            if (arguments.length > 0) {
                return nodes_access.call(this, value, setter, getter);
            } else {
                return this[0] ? getter.call(this, this[0]) : undefined;
            }
            return this;
        };
    }

    function kv_access(setter, getter, map){
        return function(name, value){
            if (typeof name === 'object') {
                if (map) {
                    map.call(this, name);
                } else {
                    for (var k in name) {
                        this.forEach(function(node){
                            if (!node) {
                                return;
                            }
                            setter.call(this, node, k, name[k]);
                        }, this);
                    }
                }
            } else {
                if (arguments.length > 1) {
                    return nodes_access.call(this, value, setter, getter, name);
                } else {
                    return this[0] ? getter.call(this, this[0], name) : undefined;
                }
            }
            return this;
        };
    }

    function event_access(action){
        function access(subject, cb){
            if (typeof subject === 'object') {
                for (var i in subject) {
                    access.call(this, [i, subject[i]]);
                }
            } else if (cb) {
                subject = $.Event.aliases[subject] || subject;
                this.forEach(function(node){
                    node[action + 'EventListener'](subject, this, false);
                }, cb);
            }  // not support 'removeAllEventListener'
            return this;
        }
        return access;
    }

    function trigger(me, event, data){
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
        me.forEach((SPECIAL_TRIGGERS[event.type]
                && !event.defaultPrevented) 
            ? function(node){
                node[event.type]();
            } : function(node){
                if ('dispatchEvent' in node) {
                    node.dispatchEvent(this);
                }
            }, event);
        return this;
    }

    function css_method(name){
        return name.replace(/-+(.)?/g, function($0, $1){
            return $1 ? $1.toUpperCase() : '';
        }); 
    }

    function css_prop(name) {
        return name.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function css_unit(name, value) {
        return typeof value == "number" && !CSS_NUMBER[name] 
            && value + "px" || value;
    }

    function default_display(tag) {
        var display = _elm_display[tag];
        if (!display) {
            var tmp = document.createElement(tag);
            doc.body.appendChild(tmp);
            display = $.getPropertyValue(tmp, "display");
            tmp.parentNode.removeChild(tmp);
            if (display === "none") {
                display = "block";
            }
            _elm_display[tag] = display;
        }
        return display;
    }

    function dimension(method){
        return function(){
            var node = this[0];
            if (!node) {
                return;
            }
            return is_window(node)
                ? node['inner' + method]
                : node.nodeType === 9 
                    ? node.documentElement['offset' + method] 
                    : (this.offset() || {})[method.toLowerCase()];
        };
    }

    function scroll_offset(is_top){
        var method = 'scroll' + is_top ? 'Top' : 'Left',
            prop = 'page' + (is_top ? 'Y' : 'X') + 'Offset';
        return function(){
            var node = this[0];
            if (!node) {
                return;
            }
            return is_window(node) ? node[prop] : node[method];
        };
    }

    function insert_node(target, node, action){
        if (node.nodeName.toUpperCase() === 'SCRIPT' 
                && (!node.type || node.type === 'text/javascript')) {
            window['eval'].call(window, node.innerHTML);
        }
        switch(action) {
        case 1:
            target.appendChild(node);
            break;
        case 2: 
            target.parentNode.insertBefore(node, target);
            break;
        case 3:
            target.insertBefore(node, target.firstChild);
            break;
        case 4:
            target.parentNode.insertBefore(node, target.nextSibling);
            break;
        default:
            break;
        }
    }

    function insert_nodes(action, is_reverse){
        var fn = is_reverse ? function(target){
            insert_node(target, this, action);
        } : function(content){
            insert_node(this, content, action);
        };
        return function(selector){
            this.forEach(function(node){
                this.forEach(fn, node);
            }, is_reverse 
                    || typeof selector !== 'string'
                    || RE_HTMLTAG.test(selector)
                ? $(selector)
                : $.createNodes(selector));
            return this;
        };
    }

    function operator_insert_to(action){
        return insert_nodes(action, true);
    }

    function operator_insert(action){
        return insert_nodes(action);
    }

    function check_array_argument(args){
        return _array_map.call(args, function(i){
            if (typeof i === 'object') {
                return i._slice();
            } else {
                return i;
            }
        });
    }

    // public static API

    $.find = $;

    $._querySelector = function(context, selector){
        try {
            return _array_slice.call(context.querySelectorAll(selector));
        } catch (ex) {
            return [];
        }
    };

    $.matches = $.matchesSelector = function(elm, selector){
        return elm && elm.nodeType === 1 && elm[MATCHES_SELECTOR](selector);
    };

    $.contains = function(parent, elm){
        return parent !== elm && parent.contains(elm);
    };

    $.createNodes = function(str, attrs){
        var tag = (RE_HTMLTAG.exec(str) || [])[0] || str;
        var temp = _html_containers[tag];
        if (!temp) {
            temp = _html_containers[tag] = tag === 'tr' 
                    && document.createElement('tbody')
                || (tag === 'tbody' || tag === 'thead' || tag === 'tfoot') 
                    && document.createElement('table')
                || (tag === 'td' || tag === 'th') 
                    && document.createElement('tr')
                || document.createElement('div');
        }
        temp.innerHTML = str;
        var nodes = new $();
        _array_push.apply(nodes, _array_slice.call(temp.childNodes));
        nodes.forEach(function(node){
            this.removeChild(node);
        }, temp);
        if (attrs) {
            for (var k in attrs) {
                nodes.attr(k, attrs[k]);
            }
        }
        return nodes;
    };

    $.getStyles = window.getComputedStyle && function(elm){
        return window.getComputedStyle(elm, null);
    } || document.documentElement.currentStyle && function(elm){
        return elm.currentStyle;
    };

    $.getPropertyValue = function(elm, name){
        var styles = $.getStyles(elm);
        return styles.getPropertyValue 
            && styles.getPropertyValue(name) || styles[name];
    };

    $.Event = function(type, props) {
        var real_type = $.Event.aliases[type] || type;
        var bubbles = true,
            is_touch = TOUCH_EVENTS[type],
            event = document.createEvent(is_touch && 'TouchEvent' 
                || MOUSE_EVENTS[type] && 'MouseEvents' 
                || 'Events');
        if (props) {
            if ('bubbles' in props) {
                bubbles = !!props.bubbles;
                delete props.bubbles;
            }
            _.mix(event, props);
        }
        event[is_touch && 'initTouchEvent' 
            || 'initEvent'](real_type, bubbles, true);
        return event;
    };

    $.Event.aliases = {};

    $.trigger = trigger;

    $.camelize = css_method;
    $.dasherize = css_prop;
    $._vAccess = v_access;
    $._kvAccess = kv_access;
    $._nodesAccess = nodes_access;

    return $;

});
