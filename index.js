"use strict";
const dispatcher = require("./lib/dispatcher"),
    parallelQueue = {};
module.exports = {
    /*
        Add job to a queue using identifier and each job will
            run serially within a queue but the queues doesn't affect one another
        id = Unique identifer for your queue
        job = {fn, context, args, delay}
     */
    add(id, job, selfDestroy) {
        if(!id) {
            throw "ID for the queue is mandatory";
        }
        if(!job) {
            return false;
        }
        let queue = parallelQueue[id] || (parallelQueue[id] = dispatcher(id));
        queue.add(job);
        console.log(`===> Job <<${job.fn.name}>> added to queue:: ${id}`);
        return this;
    },
    destroy(id, preemptiveDestroy) {
        if(!id) {
            throw "ID for the queue is mandatory";
        }
        if(!parallelQueue[id]) {
            console.log("No such queue. Either destroyed already or never created one in that name");
            return this;
        }
        parallelQueue[id].destroy(preemptiveDestroy).then(() => {
            delete parallelQueue[id];
            console.log(`Queue ${id} is destroyed`);
        });
        return this;
    },
    total() {
        return Object.keys(parallelQueue).length;
    },
    liveQueues() {
        return Object.keys(parallelQueue);
    }
};
