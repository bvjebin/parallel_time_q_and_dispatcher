# Parallel Time Queue And Dispatcher

*Disclaimer: This is not an usual Job queue which has multiple job handlers that pick jobs and run them.*

* This implementation allows to create multiple queues.
* Each queue has unique name, and the jobs can be loaded on each queue.
* Jobs may or may not be future jobs(delayed execution - promise, setTimeout, etc).
* Each job is executed only when the previous job is completed in a queue. That said delay specified for one job will delay the rest of the items in the queue.
* The delay specified in one item of a queue doesnot affect the jobs in other queue.

Is there a gaurantee that the jobs will execute in specified time delay? Nope. [That is not in the nature of JavaScript](http://ejohn.org/blog/how-javascript-timers-work/).  But it is gauranteed that they will execute as long as the system is alive :p.

Let's see some code.

```
"use strict";
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

/** Adding new non-async job(testModule.print) to new queue1 which will execute on or after 1000ms **/
pTQD.add("queue1", {
    fn: testModule.print,
    context: testModule,
    args: ["queue1-Job1", "After 1000ms", "Simple method"],
    delay: 1000
})
/** Adding another non-async job(testModule.print) to the queue queue1 which will execute after 100ms after completion of the previous job **/
.add("queue1", {
    fn: testModule.print,
    context: testModule,
    args: ["queue1-Job2", "After 100ms", "Simple method"],
    delay: 100
})
/** Adding an async job(testModule.promisePrint) to a new queue queue2 which will execute on or after 3000ms but not affected by any previous jobs because they are in different queue **/
.add("queue2", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["queue2-Job1", "After 3000ms", "Async method"],
    delay: 3000
})
/** Adding an async job(testModule.promisePrint) to the queue queue2 which will execute on or after 3000ms after the completion of the previous job in queue queue2 **/
.add("queue2", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["queue2-Job1", "After 3000ms", "Async method"],
    delay: 3000
})
/** Destroying queue2 which will destroy the queue once all the jobs in queue2 are completed **/
.destroy("queue2")
/** Adding an async job(testModule.promisePrint) to the destroyed queue queue2 and this will be discarded because the queue is marked for deletion **/
.add("queue2", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["queue2-destroyed", "After 3000ms", "Async method"],
    delay: 3000
})
/** Adding an async job(testModule.promisePrint) to a new queue preempt which will execute on or after 1000ms but not affected by any previous jobs because they are in different queue **/
.add("preempt", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["no_delay-Job1", "After 2000ms", "Async method"],
    delay: 1000
})
/** Adding an non-async job(testModule.promisePrint) to the queue `preempt` which will execute after the completion of the previous job in queue preempt **/
.add("preempt", {
    fn: testModule.print,
    context: testModule,
    args: ["no_delay-Job2", "No delay", "Sync method"],
})
/** Watch the second argument. That is marking the queue to clear preemptively. Destroying `preempt` queue which will destroy the queue without waiting for jobs to complete. **/
.destroy("preempt", true)
/** Adding an async job(testModule.promisePrint) to a new `no_delay` preempt which will execute in the next tick but not affected by any previous jobs because they are in different queue **/
.add("no_delay", {
    fn: testModule.promisePrint,
    context: testModule,
    args: ["no_delay-Job1", "After 2000ms", "Async method"]
})
/** Adding an non-async job(testModule.print) to the queue `no_delay` which will execute after the completion of the previous job in queue no_delay **/
.add("no_delay", {
    fn: testModule.print,
    context: testModule,
    args: ["no_delay-Job2", "No delay", "Sync method"],
});

console.log(`Total queues alive ${pTQD.total()} and they are ${pTQD.liveQueues()}`);

//Logs output
===> Job <<print>> added to queue:: queue1
===> Job <<print>> added to queue:: queue1
===> Job <<promisePrint>> added to queue:: queue2
===> Job <<promisePrint>> added to queue:: queue2
Can't add any more job. This queue will be destroyed.
===> Job <<promisePrint>> added to queue:: queue2
===> Job <<promisePrint>> added to queue:: preempt
===> Job <<print>> added to queue:: preempt
===> Job <<promisePrint>> added to queue:: no_delay
===> Job <<print>> added to queue:: no_delay
Total queues alive 4 and they are queue1,queue2,preempt,no_delay
Queue preempt is destroyed
queue1-Job1 After 1000ms Simple method
queue1-Job2 After 100ms Simple method
no_delay-Job1 After 2000ms Async method
no_delay-Job2 No delay Sync method
queue2-Job1 After 3000ms Async method
queue2-Job1 After 3000ms Async method
Queue queue2 is destroyed
```

Use it at your own risk. Licensed under MIT license.
