type coord = { x: number, y: number };

type square = { start: coord, end: coord, size: coord }

let currentWindow: TerminalWindow;
let windowList: TerminalWindow[] = [];

export class TerminalWindow {

    static walkWindow(step: number) {
        const currIdx = windowList.indexOf(currentWindow);
        const nextIdx = currIdx + step;

        if (nextIdx < 0)
            return currentWindow = windowList[windowList.length - 1];

        if (nextIdx > windowList.length - 1)
            return currentWindow = windowList[0];

        return currentWindow = windowList[nextIdx];
    }

    static nextWindow() {
        return TerminalWindow.walkWindow(1);
    }

    static prevWindow() {
        return TerminalWindow.walkWindow(-1);
    }

    // -------------------------------------------------------------------------

    #title: string;
    #border!: square;
    #content: { data: string[], size: coord };
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

    #hideCursor = () => {
        this.#write("\x1b[25H");
    }

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
        this.#write(currentWindow == this ? "\x1b[36m" : "\x1b[37m"); // selected color

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
            this.#cursor(this.#border, true, 0, true, cnt + 1);
            this.#write(`│`);
            // RIGHT
            this.#cursor(this.#border, false, 0, true, cnt + 1);
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
        this.#hideCursor();
    }

    #drawContent = () => {
        const clearLine = " ".repeat(this.#contentPanel.size.x);
        const initialLine = 0;
        const initialColumn = 0;
        for (let cnt = this.#contentPanel.size.y; cnt--;) {
            const line = this.#content.data[cnt + initialLine]?.substr(initialColumn, this.#contentPanel.size.x) ?? clearLine;
            this.#cursor(this.#contentPanel, true, 0, true, cnt);
            this.#write(line);
        }
        this.#hideCursor();
    }

    constructor(positionX: number, positionY: number, sizeX: number | null, sizeY: number | null, title: string = "") {
        if (!currentWindow)
            currentWindow = this;
        windowList.push(this);
        this.#title = title;
        this.#content = { data: [], size: { x: 0, y: 0 } };
        this.#updateSizes(positionX, positionY, sizeX, sizeY);
        this.#drawBorders();
    }

    addLine(content: string) {
        const contentLines = content.split(/\n/gm);
        contentLines.forEach(content => {
            if (content.length > this.#content.size.x)
                this.#content.size.x = content.length;
        });
        this.#content.data.push(...contentLines);
        this.#content.size.y = this.#content.data.length;
        this.#drawContent();
    }
}