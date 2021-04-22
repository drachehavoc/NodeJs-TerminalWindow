type coord = { x: number, y: number };

type square = { start: coord, end: coord, size: coord }

let currentWindow: TerminalWindow;
let windowList: TerminalWindow[] = [];

export class TerminalWindow {
    static walkWindow(step: number) {
        let currIdx = windowList.indexOf(currentWindow);
        let nextIdx = currIdx + step;
        let prevWindow = currentWindow;

        if (nextIdx < 0)
            nextIdx = windowList.length - 1;

        if (nextIdx > windowList.length - 1)
            nextIdx = 0;

        currentWindow = windowList[nextIdx];

        prevWindow.#drawBorders();
        currentWindow.#drawBorders();

        return currentWindow;
    }

    static nextWindow() {
        return TerminalWindow.walkWindow(1);
    }

    static prevWindow() {
        return TerminalWindow.walkWindow(-1);
    }

    static get currentWindow() {
        return currentWindow;
    }

    // -------------------------------------------------------------------------

    #title: string;
    #border!: square;
    #content: { data: string[], position: coord, size: coord };
    #scrollbar: { position: coord };
    #contentPanel!: square;
    #stdout = process.stdout;

    #updateSizes = (positionX: number, positionY: number, sizeX: number | null, sizeY: number | null) => {
        if (positionX < 0)
            positionX = this.#stdout.columns + positionX;

        if (positionY < 0)
            positionY = this.#stdout.rows + positionY;
        
        
        if (sizeX == null)
            sizeX = this.#stdout.columns - positionX - 1;

        if (sizeY == null)
            sizeY = this.#stdout.rows - positionY - 1;

        if (sizeX < 0)
            sizeX = this.#stdout.columns - positionX + sizeX;

        if (sizeY < 0)
            sizeY = this.#stdout.rows - positionY + sizeY;

        this.#border = {
            start: {
                x: positionX,
                y: positionY,
            },

            end: {
                x: positionX + sizeX,
                y: positionY + sizeY,
            },

            size: {
                x: sizeX,
                y: sizeY,
            },
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
            },
        };
    };

    #write = (buffer: Uint8Array | string) => {
        return this.#stdout.write(buffer);
    };

    #hideCursor = () => {
        this.#write("\x1b[?25l");
    }

    #showCursor = () => {
        this.#write("\x1b[?25h");
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

    #defaultColor = () => {
        this.#write("\x1b[37m");
    }

    #selectedColor = () => {
        this.#write("\x1b[36m");
    }

    #isSelectedColor = () => {
        currentWindow == this
            ? this.#selectedColor()
            : this.#defaultColor()
    }

    #drawBorders = () => {
        this.#isSelectedColor();

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
            if (title.length) {
                this.#write(`[${title}]`);
            }
        }

        //
        this.#drawScrollBar();
    }

    #drawContent = () => {
        const initialLine = this.#content.position.y;
        const initialColumn = this.#content.position.x;
        const clearLine = ` `.repeat(this.#contentPanel.size.x);
        let cnt = this.#contentPanel.size.y;
        this.#write("\x1b[37m"); // selected color
        for (; cnt--;) {
            const line = this.#content.data[cnt + initialLine]
                ?.substr(initialColumn, clearLine.length)
                ?.padEnd(clearLine.length);
            this.#cursor(this.#contentPanel, true, 0, true, cnt);
            this.#write(line ?? clearLine);
        }
    }

    #calcBarPosition = (direction: "x" | "y") => {
        const pos = this.#content.position[direction];
        const lmt = this.#contentPanel.size[direction] - 1;
        const tot = this.#content.size[direction] - this.#contentPanel.size[direction];
        return Math.round((pos * lmt) / tot);
    }

    #drawScrollBar = () => {
        this.#isSelectedColor();

        if (this.#content.size.y > this.#contentPanel.size.y) {
            this.#cursor(this.#border, false, 0, true, this.#scrollbar.position.y + 1);
            this.#write(`│`)
            this.#scrollbar.position.y = this.#calcBarPosition("y");
            this.#cursor(this.#border, false, 0, true, this.#scrollbar.position.y + 1);
            this.#write(`║`)
        }

        if (this.#content.size.x > this.#contentPanel.size.x) {
            this.#cursor(this.#border, true, this.#scrollbar.position.x + 1, false, 0);
            this.#write(`─`)
            this.#scrollbar.position.x = this.#calcBarPosition("x");
            this.#cursor(this.#border, true, this.#scrollbar.position.x + 1, false, 0);
            this.#write(`═`)
        }

    }

    constructor(positionX: number, positionY: number, sizeX: number | null, sizeY: number | null, title: string = "") {
        if (!currentWindow)
            currentWindow = this;
        windowList.push(this);
        this.#title = title;
        this.#content = { data: [], position: { x: 0, y: 0 }, size: { x: 0, y: 0 } };
        this.#scrollbar = { position: { x: 0, y: 0 } };
        this.#updateSizes(positionX, positionY, sizeX, sizeY);
        this.#drawBorders();
        this.#stdout.on('resize', () => {
            this.#updateSizes(positionX, positionY, sizeX, sizeY);
            this.#drawBorders();
            this.#drawContent();
        });
    }

    addLine(content: string) {
        const contentLines = content.split(/\n/gm);
        contentLines.forEach(content => {
            if (content.length > this.#content.size.x) {
                this.#content.size.x = content.length;
            }
        });
        this.#content.data.push(...contentLines);
        this.#content.size.y = this.#content.data.length;
        this.#drawContent();
        this.#drawScrollBar();
    }

    scrollUp() {
        if (this.#content.size.y < this.#contentPanel.size.y)
            return;
        this.#content.position.y--;
        if (this.#content.position.y < 0) {
            this.#content.position.y = 0;
            return;
        }
        this.#drawContent();
        this.#drawScrollBar();
    }

    scrollDown() {
        if (this.#content.size.y < this.#contentPanel.size.y)
            return;
        this.#content.position.y++;
        if (this.#content.position.y > this.#content.size.y - this.#contentPanel.size.y) {
            this.#content.position.y = this.#content.size.y - this.#contentPanel.size.y;
            return;
        }
        this.#drawContent();
        this.#drawScrollBar();
    }

    scrollLeft() {
        if (this.#content.size.x < this.#contentPanel.size.x)
            return
        this.#content.position.x--;
        if (this.#content.position.x < 0) {
            this.#content.position.x = 0;
            return;
        }
        this.#drawContent();
        this.#drawScrollBar();
    }

    scrollRight() {
        if (this.#content.size.x < this.#contentPanel.size.x)
            return;

        this.#content.position.x++;

        if (this.#content.position.x > this.#content.size.x - this.#contentPanel.size.x) {
            this.#content.position.x = this.#content.size.x - this.#contentPanel.size.x;
            return;
        }
        
        this.#drawContent();
        this.#drawScrollBar();
    }
}