
export default function Triggers(tempo = 250)
{
    this.remove = false;
    this.add = false;
    this.tempo = tempo;
    this.counter = tempo;
    this.removePending = false;
    this.addPending = false;
    this.minusBtn = document.getElementById('btn-minus');
    this.plusBtn = document.getElementById('btn-plus');
    if (this.minusBtn) {
        this.minusBtn.addEventListener('mousedown', () => { this.removePending = true; });
    }
    if (this.plusBtn) {
        this.plusBtn.addEventListener('mousedown', () => { this.addPending = true; });
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
