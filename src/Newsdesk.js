
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

export default function(indicators, prefix = 'msg_') {
    let me = this;
    this.elements = {};
    indicators.forEach(s => {
        const el = document.getElementById(prefix + s);
        if (el) {
            this.elements[s] = el;
            Object.defineProperty(this, s, {
                set(v)  { me.elements[s].innerHTML = v; },
                enumerable: true,
                configurable: true
            });
        }
    });
}
