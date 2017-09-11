jQuery.namespace('SEMS');

window.SEMS.HashTable = function (initItems) {
    this.length = 0;
    this.items = { };

    for (var newItem in initItems) {
        this.items[newItem] = initItems[newItem];
        this.length++;
    }

    this.addItem = function(key, value) {
        if (!this.hasKey(key)) {
            this.length++;
        }

        this.items[key] = value;

        return value;
    };

    this.getItem = function(key) {
        return this.hasKey(key)
            ? this.items[key]
            : null;
    };

    this.hasKey = function(key) {
        return this.items.hasOwnProperty(key);
    };

    this.removeItem = function(key) {
        if (!this.hasKey(key))
            return;

        this.length--;
        
        delete this.items[key];
    };

    this.keys = function() {
        var keys = [];

        for (var k in this.items) {
            if (this.hasKey(k)) {
                keys.push(k);
            }
        }

        return keys;
    };

    this.values = function() {
        var values = [];

        for (var k in this.items) {
            if (this.hasKey(k)) {
                values.push(this.items[k]);
            }
        }

        return values;
    };

    this.each = function (fn) {
        for (var key in this.items) {
            if (!this.hasKey(key))
                continue;
            
            fn(key, this.items[key]);
        }
    };

    this.clear = function() {
        this.items = { };
        this.length = 0;
    };
};