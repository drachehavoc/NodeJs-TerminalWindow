const zeroCoord = () => ({ x: NaN, y: NaN });

export class Box {
    #start: coord = zeroCoord();
    #end: coord = zeroCoord();
    #size: coord = zeroCoord();

    constructor(startX: number, startY: number) {
        this.setStart(startX, startY);
    }

    get start() {
        return { ...this.#start };
    }

    get end() {
        return { ...this.#end };
    }

    get size() {
        return { ...this.#size };
    }

    #calculateSize = () => {
        if (!this.#start.x || !this.#start.y || !this.#end.x || !this.#end.y)
            return;

        this.#size.x = this.#start.x - this.#end.x;
        this.#size.y = this.#start.y - this.#end.y;
    }

    clone(startX: number = 0, startY: number = 0, sizeX: number = 0, sizeY: number = 0) {
        const n = new Box(this.#start.x + startX, this.#start.y + startY);
        n.setSize(this.#size.x + sizeX, this.#size.y + sizeY);
        return n;
    }

    setStart(x: number, y: number) {
        if (x < 0)
            x = process.stdout.columns + x;

        if (y < 0)
            y = process.stdout.rows + y;

        this.#start.x = x;
        this.#start.y = y;
        this.#calculateSize();
    }

    setEnd(x: number, y: number) {
        this.#end.x = x;
        this.#end.y = y;
        this.#calculateSize();
    }

    setSize(x: number | null, y: number | null) {
        if (x == null)
            x = process.stdout.columns - this.#start.x - 1;

        if (y == null)
            y = process.stdout.rows - this.start.y - 1;

        if (x < 0)
            x = process.stdout.columns - this.#start.x + x;

        if (y < 0)
            y = process.stdout.rows - this.start.y + y;

        this.#size.x = x;
        this.#size.y = y;

        this.#end.x = this.#start.x + x;
        this.#end.y = this.#start.y + y;
    }
}