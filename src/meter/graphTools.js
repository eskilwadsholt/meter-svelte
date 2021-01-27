export class LinearScale {
    domain(D) {
        this._domain = D;
        this.createMaps();
        return this;
    }
    range(R) {
        this._range = R;
        this.createMaps();
        return this;
    }
    createMaps() {
        if (this._domain && this._range) {
            this.map = function(t) {
                const [tmin, tmax] = this._domain;
                const [ymin, ymax] = this._range;
                return (ymax - ymin) / (tmax - tmin) * (t - tmin) + ymin;
            }
            this.invert = function(t) {
                const [tmin, tmax] = this._range;
                const [ymin, ymax] = this._domain;
                return (ymax - ymin) / (tmax - tmin) * (t - tmin) + ymin;
            }
        }
    }
}