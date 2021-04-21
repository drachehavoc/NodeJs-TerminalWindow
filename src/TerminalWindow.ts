type coord = { x: number, y: number };

type square = { start: coord, end: coord, size: coord }

export class TerminalWindow {
    #title: string;
    #border!: square;
    #contentPanel!: square;
    #stdout = process.stdout;

    #updateSizes = (positionX: number, positionY: number, sizeX: number | null, sizeY: number | null) => {
        sizeX = sizeX ?? this.#stdout.columns - positionX - 1;
        sizeY = sizeY ?? this.#stdout.rows - positionY - 1;

        this.#border = {
            start: {
                x: positionX,
                y: positionY,
            },
            end: {
                x: positionX + sizeX,
                y: positionY + sizeY
            },
            size: {
                x: sizeX,
                y: sizeY,
            }
        };

        this.#contentPanel = {
            start: {
                x: positionX + 1,
                y: positionY + 1,
            },
            end: {
                x: this.#border.end.x - 1,
                y: this.#border.end.y - 1,
            },
            size: {
                x: sizeX - 1,
                y: sizeY - 1,
            }
        };
    };

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

        this.#stdout.cursorTo(x, y);
    };

    #drawBorders = () => {
        // - TOP LEFT
        this.#cursor(this.#border, true, 0, true, 0);
        this.#write("┌");

        // - TOP RIGHT
        this.#cursor(this.#border, false, 0, true, 0);
        this.#write("┐");

        // - BOTTOM LEFT
        this.#cursor(this.#border, true, 0, false, 0);
        this.#write("└");

        // - BOTTOM RIGHT
        this.#cursor(this.#border, false, 0, false, 0);
        this.#write("┘");

        // - HORIZONTAL BAR TOP
        const horizontalBarTop = "─".repeat(this.#contentPanel.size.x);
        this.#cursor(this.#border, true, 1, true, 0);
        this.#write(horizontalBarTop);

        // - HORIZONTAL BAR BOTTOM
        const horizontalBarBottom = horizontalBarTop;
        this.#cursor(this.#border, true, 1, false, 0);
        this.#write(horizontalBarBottom);

        // - VERTICAL BAR
        for (let cnt = this.#contentPanel.size.y; cnt--;) {
            // LEFT
            this.#cursor(this.#border, true, 0, true, cnt+1);
            this.#write(`│`);
            // RIGHT
            this.#cursor(this.#border, false, 0, true, cnt+1);
            this.#write(`│`);
        }

        // - TITLE
        if (this.#title) {
            this.#cursor(this.#border, true, 1, true, 0);
            const title = this.#title.substring(0, this.#border.size.x - 3);
            if (title.length)
                this.#write(`[${title}]`);
        }

        // - HIDE CURSOR
        this.#write("\x1b[25H");
    }

    constructor(positionX: number, positionY: number, sizeX: number | null, sizeY: number | null, title: string = "") {
        this.#title = title;
        this.#updateSizes(positionX, positionY, sizeX, sizeY);
        this.#drawBorders();
    }
}