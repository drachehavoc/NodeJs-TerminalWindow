const zeroCoord = () => ({ x: NaN, y: NaN });

export class LinkedBox {
    #parentBox: Box;
    #adapt: { start: { x: number, y: number }, size: { x: number, y: number } };

    constructor(parentBox: Box, startX: number = 0, startY: number = 0, sizeX: number = 0, sizeY: number = 0) {
        this.#parentBox = parentBox;
        this.#adapt = {
            start: { x: startX, y: startY },
            size: { x: sizeX, y: sizeY },
        }
    }

    get start() {
        const p = this.#parentBox.start;
        const a = this.#adapt.start;
        return {
            x: p.x + a.x,
            y: p.y + a.y
        };
    }

    get end() {
        const p = this.#parentBox.end;
        const a = this.#adapt.size;
        return {
            x: p.x + a.x,
            y: p.y + a.y
        };
    }

    get size() {
        const s = this.#parentBox.size;
        const a = this.#adapt.size;
        const x = s.x + a.x
        const y = s.y + a.y
        const l = {
            x: x < 0 ? 0 : x,
            y: y < 0 ? 0 : y,
        }
        return l;
    }
}

export class Box {
    #start: coord = zeroCoord();
    #end: coord = zeroCoord();
    #size: coord = zeroCoord();
    #linkedBoxex: Set<LinkedBox> = new Set();

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

    linkedBox(startX: number = 0, startY: number = 0, sizeX: number = 0, sizeY: number = 0) {
        const linkedBox = new LinkedBox(this, startX, startY, sizeX, sizeY);
        this.#linkedBoxex.add(linkedBox);
        return linkedBox;
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