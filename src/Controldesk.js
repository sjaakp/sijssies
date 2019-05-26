
export default function(ctrls, prefix = 'control_') {
    Object.assign(this, this, ctrls);
    Object.keys(ctrls).forEach(s => {
        const el = document.getElementById(prefix + s);
        if (el) {
            if (el.type === 'range') {
                el.addEventListener('input', e => {
                    this[s] = Number(e.target.previousElementSibling.lastChild.innerText = e.target.value);
                });
                el.addEventListener('dblclick', e => {
                    e.target.value = 0;
                    e.target.dispatchEvent(new Event('input'));
                });
                el.dispatchEvent(new Event('input'));
            }
            else {     // checkbox
                el.addEventListener('change', e => {
                    this[s] = e.target.checked;
                });
                el.dispatchEvent(new Event('change'));
            }
        }
    });
}
