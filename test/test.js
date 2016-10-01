"use strict";
const Promise = require("bluebird"),
    pTQD = require("./../index"),
    testModule = {
        print() {
            console.log.apply(null, arguments);
        },
        promisePrint() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log.apply(null, arguments);
                    resolve();
                }, 1000);
            });
        }
    };

pTQD.add("queue1", {
    fn: testModule.print,
    context: testModule,
    args: ["queue1-Job1", "After 1000ms", "Simple method"],
    delay: 1000
}).add("queue1", {
    fn: testModule.print,
    context: testModule,
    args: ["queue1-Job2", "After 100ms", "Simple method"],
    delay: 100
})
.add("queue2", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["queue2-Job1", "After 3000ms", "Async method"],
    delay: 3000
})
.add("queue2", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["queue2-Job1", "After 3000ms", "Async method"],
    delay: 3000
})
.destroy("queue2")
.add("queue2", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["queue2-destroyed", "After 3000ms", "Async method"],
    delay: 3000
})
.add("preempt", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["no_delay-Job1", "After 2000ms", "Async method"],
    delay: 1000
})
.add("preempt", {
    fn: testModule.print,
    context: testModule,
    args: ["no_delay-Job2", "No delay", "Sync method"],
})
.destroy("preempt", true)
.add("no_delay", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["no_delay-Job1", "After 2000ms", "Async method"],
    delay: 2000
})
.add("no_delay", {
    fn: testModule.print,
    context: testModule,
    args: ["no_delay-Job2", "No delay", "Sync method"],
});

console.log(`Total queues alive ${pTQD.total()} and they are ${pTQD.liveQueues()}`);
