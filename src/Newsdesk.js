
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
