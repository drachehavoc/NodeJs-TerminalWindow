type coord = { x: number, y: number };

type square = { start: coord, end: coord }

export class TerminalWindow {
    #border: square;
    #content: square;
    #cursorPosition: coord;
    #stdout = process.stdout;

    #write = (buffer: Uint8Array | string) => {
        return this.#stdout.write(buffer);
    };

    #cursor = (origin: square, xFromStart: boolean, x: number, yFromStart: boolean, y: number) => {
        x = xFromStart
            ? x + origin.start.x
            : x + origin.end.x;

        y = yFromStart
            ? y + origin.start.y
            : y + origin.end.y;

        this.#stdout.cursorTo(y, x);
    };

    #cursorUp = (times: number = 1) => {
        this.#write("\x1b[" + times + "A")
    }

    #cursorDown = (times: number = 1) => {
        this.#write("\x1b[" + times + "D")
    }

    #cursorRight = (times: number = 1) => {
        this.#write("\x1b[" + times + "C")
    }

    #cursorLeft = (times: number = 1) => {
        this.#write("\x1b[" + times + "B")
    }

    #drawBorders = () => {
        // CORNERS -------------------------------------------------------------
        // - TOP LEFT
        this.#cursor(this.#border, true, 0, true, 0);
        this.#write("+");

        // - TOP RIGHT
        this.#cursor(this.#border, true, 0, false, 0);
        this.#write("+");

        // - BOTTOM LEFT
        this.#cursor(this.#border, false, 0, true, 0);
        this.#write("+");

        // - BOTTOM RIGHT
        this.#cursor(this.#border, false, 0, false, 0);
        this.#write("+");

        // BAR - HORIZONTAL ----------------------------------------------------
        const horizontalBar = "-".repeat(this.#border.end.x - 1);

        // - HORIZONTAL TOP
        this.#cursor(this.#border, true, 0, true, 1);
        this.#write(horizontalBar);

        // - HORIZONTAL BOTTOM
        this.#cursor(this.#border, false, 0, true, 1);
        this.#write(horizontalBar);

        // BAR - VERTICAL ------------------------------------------------------
        const verticalBar = "|\x1b[1B\x1b[1D".repeat(this.#border.end.y - 1);

        // - VERTICAL LEFT
        this.#cursor(this.#border, true, 1, true, 0);
        this.#write(verticalBar);

        // - VERTICAL RIGHT
        this.#cursor(this.#border, true, 1, false, 0);
        this.#write(verticalBar);

    }

    constructor(start: coord, end: coord) {
        this.#cursorPosition = {
            ...start
        };

        this.#border = {
            start: { ...start },
            end: { ...end },
        };

        this.#content = {
            start: { x: start.x + 1, y: start.y + 1 },
            end: { x: end.x - 1, y: end.y - 1 },
        };

        this.#drawBorders();
    }
}