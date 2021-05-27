const scheduler = Object.seal({
    queue: [],
    busy: false,
    running: false,
    idle: 0
})

export function setFrameInterval(fn, interval) {
    let busy = false;
    const queue = [];

    function runner() {
        requestAnimationFrame(function () {
            if (queue.length > 0) {
                let task = queue.shift();
                let time = Date.now();
                busy = true;
                task();
            }
            let to = interval - (Date.now() - time);
            setTimeout(runner, to);
        })
    }


}

export function runner() {
    if (scheduler.queue.length === 0) {
        scheduler.idle++;
        if (scheduler.idle>3) {
            scheduler.running = false;
            return;
        }
        return;
    }
    scheduler.idle = 0;
    if (!scheduler.busy) {
        let task = scheduler.queue.shift();
        scheduler.busy = true;
        task();
        task = null;
        setTimeout(function () {
            scheduler.busy = false;
        })
    }
    setTimeout(runner, 20)
}

export function start() {
    if (!scheduler.running) setTimeout(runner, 1);
}

export function dispatchTask(task) {
    if (task) {
        scheduler.queue.push(task);
        start()
    }
}

export default {dispatchTask, scheduler};