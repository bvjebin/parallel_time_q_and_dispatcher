"use strict";
const _ = require("lodash"),
    Promise = require("bluebird"),
    dispatcher = {
        _queue: null,
        init(id) {
            this.name = id;
            if(global.Proxy) {
                this._queue = new Proxy([], {
                    set(array, prop, value) {
                        arr[prop] = val;
                        if(prop === "length" && val === 0 && typeof this.resolver === "function") {
                            this.resolver();
                            this.resolver = undefined;
                        }
                        return true;
                    }
                });
            } else {
                this._queue = [];
                Object.observe(this._queue, (changes) => {
                    changes.find((change) => {
                        if(change.type === "update" && change.name === "length" && this._queue.length === 0 && typeof this.resolver === "function") {
                            this.resolver();
                            this.resolver = undefined;
                        }
                    });
                });
            }
            return this;
        },
        add(job) {
            this._queue.push(job);
            if(this._queue.length === 1) {
                this._dispatcher(job.delay);
            }
        },
        _dispatcher(delay) {
            if(delay) {
                setTimeout(() => {
                    this._call();
                }, (delay));
            } else {
                this._call();
            }
        },
        _callDispatcher() {
            this._queue.splice(0, 1);
            this._queue[0] && this._dispatcher(this._queue[0].delay);
        },
        _call() {
            let item = this._queue[0];
            if(item && typeof item.fn === "function") {
                try {
                    let result = item.fn.apply(item.context, item.args);
                    if(Promise.resolve(result) == result) {
                        result.then(()=> {
                            this._callDispatcher();
                        }).catch((e) => {
                            console.log(`Error caught while executing function :: ${item.fn.name} in queue ${this.name}`);
                            this._callDispatcher();
                        });
                    } else {
                        this._callDispatcher();
                    }
                } catch(e) {
                    console.log(`Error caught while executing function :: ${item.fn.name} in queue ${this.name}`);
                    this._callDispatcher();
                }

            }
        },
        destroy(preemptiveDestroy) {
            this.add = () => {
                console.log(`Can't add any more job. This queue will be destroyed.`);
            };
            return new Promise((resolve) => {
                this.resolver = resolve;
                if(preemptiveDestroy == true) {
                    this._queue.length = 0;
                }
            });
        }
    };

module.exports = function queue(id) {
    let newDispatcher = _.cloneDeep(dispatcher);
    return newDispatcher.init(id);
};
