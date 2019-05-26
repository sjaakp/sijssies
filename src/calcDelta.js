
function Averager(nValues)
{
    this.values = [];
    this.sum = 0;
    this.nValues = nValues;
}

Averager.prototype.avg = function(v)
{
    this.values.push(v);
    this.sum += v;
    if (this.values.length > this.nValues) {
        this.sum -= this.values.shift();
    }
    return this.sum / this.values.length;
};

let avg = new Averager(10);

let prevTime, prevReport;

export default function(time, indicators)
{
    if (!prevTime) {
        prevTime = prevReport = time;
        return 0;
    } else {
        let delta = time - prevTime;
        prevTime = time;
        let a = avg.avg(delta);
        if (time > (prevReport + 500))   {
            prevReport = time;
            indicators.fps = (1000 / a).toFixed(1);
        }
        return delta;
    }
}