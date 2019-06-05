
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

export default function Triggers(tempo = 250)
{
    this.remove = false;
    this.add = false;
    this.tempo = tempo;
    this.counter = tempo;
    this.removePending = false;
    this.addPending = false;
    let minusBtn = document.getElementById('btn-minus');
    let plusBtn = document.getElementById('btn-plus');
    if (minusBtn) {
        minusBtn.addEventListener('mousedown', () => { this.removePending = true; });
    }
    if (plusBtn) {
        plusBtn.addEventListener('mousedown', () => { this.addPending = true; });
    }
    document.addEventListener('mouseup', () => { this.removePending = this.addPending = false; });
}

Triggers.prototype.update = function(delta)
{
    this.counter -= delta;
    if (this.counter < 0)    {
        this.counter = this.tempo;
        this.remove = this.removePending;
        this.add = this.addPending;
    } else {
        this.remove = this.add = false;
    }
};
