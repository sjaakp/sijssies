
/**
 * sjaakp/sijssies
 * ---------------
 *
 * Amsterdam variant of the famous 'boids' swarm-intelligence algorithm
 * Version 0.9.0
 * Copyright (c) 2019
 * Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/sijssies
 * https://sjaakpriester.nl
 */

import Averager from './Averager';

export default function Clock(view, tick, render, controls, indicators)
{
    this.view = view;
    this.tick = tick;
    this.render = render;
    this.controls = controls;
    this.indicators = indicators;

    this.reportPeriod = 500;

    this.avg = new Averager(10);
    this.prevTime = 0;
    this.prevReport = 0;

/*
    this.wasHidden = false;

    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === 'hidden') {
            this.wasHidden = true;
        }
    }.bind(this));
*/
}

Clock.prototype.calcDelta = function(time)
{
    if (! this.prevTime) {
        this.prevTime = this.prevReport = time;
        return 0;
    } else {
        let delta = time - this.prevTime;
        this.prevTime = time;
/*
        if (this.wasHidden) {
            this.wasHidden = false;
            return 0;
        }
*/
        if (delta > 100)    {  // avoid ridiculous huge delta as a result of browser tab switch
             return 0;
        }
        let a = this.avg.avg(delta);
        if (time > (this.prevReport + this.reportPeriod))   {
            this.prevReport = time;
            this.indicators.fps = (1000 / a).toFixed(1);
        }
        return delta;
    }
};

Clock.prototype.loop = function(time)
{
    let delta = this.calcDelta(time);

    let worldView = this.view();
    if (delta && ! this.controls.freeze)  {
        this.tick(delta);
    }
    this.render(worldView);

    requestAnimationFrame(this.loop.bind(this));
};

Clock.prototype.run = function()
{
    requestAnimationFrame(this.loop.bind(this));
};
