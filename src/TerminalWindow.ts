import { Cursor } from "./Cursor";
import { Painel } from "./Painel";
import { Square } from "./Square";

let currentWindow: TerminalWindow;

export const windowList: TerminalWindow[] = [];

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
    #scrollbar: { position: coord };
    #stdout = process.stdout;

    #cursor: Cursor;
    #square: Square;
    #painel!: Painel;

    constructor(positionX: number, positionY: number, sizeX: number | null, sizeY: number | null, title: string = "") {
        if (!currentWindow)
            currentWindow = this;
        //
        windowList.push(this);
        //
        this.#title = title;
        //
        this.#square = new Square(positionX, positionY);
        this.#square.setSize(sizeX, sizeY);
        //
        this.#cursor = new Cursor(this.#square);
        //
        this.#scrollbar = { position: { x: 0, y: 0 } };
        //
        this.#drawBorders();
    }

    get panel() {
        this.#painel = new Painel(this.#square.clone(1, 1, -1, -1), this.#drawScrollBars.bind(this));
        Object.defineProperty(this, "panel", { get: this.#alreadyCreatedPanel.bind(this) });
        return this.#painel;
    }

    #alreadyCreatedPanel = () => {
        return this.#painel;
    }

    #drawBorders = () => {
        //
        const size = this.#square.size;
        const cr = this.#cursor;
        // COLOR
        currentWindow == this
            ? cr.color("magenta", null)
            : cr.reset();
        // TOP LEFT CORNER
        cr.left(0);
        cr.top(0);
        cr.write("┌");
        // RIGHT TOP CORNER
        cr.right(0);
        cr.top(0);
        cr.write("┐");
        // LET BOTTOM CORNER
        cr.left(0);
        cr.bottom(0);
        cr.write("└");
        // RIGHT TTOM CORNER
        cr.right(0);
        cr.bottom(0);
        cr.write("┘");
        // HORIZONTAL BAR
        const horizontalBar = "─".repeat(size.x - 1);
        // TOP
        cr.left(1);
        cr.top(0);
        cr.write(horizontalBar);
        // BOTTOM
        cr.left(1);
        cr.bottom(0);
        cr.write(horizontalBar);
        // VERTICAL BAR
        for (let row = 1; row < size.y; row++) {
            cr.top(row);
            // LEFT
            cr.left(0);
            cr.write(`│`);
            // RIGHT
            cr.right(0);
            cr.write(`│`);
        }
        // TITLE
        if (this.#title) {
            const title = this.#title.substring(0, size.x - 3);
            if (!title.length) return;
            cr.left(1);
            cr.top(0);
            cr.write(`[${title}]`)
        }
    }

    #drawScrollBars = () => {
        console.log("x");
    }

    _calcBarPosition = (direction: "x" | "y") => {
        // const pos = this.#content.position[direction];
        // const lmt = this.#contentPanel.size[direction] - 1;
        // const tot = this.#content.size[direction] - this.#contentPanel.size[direction];
        // return Math.round((pos * lmt) / tot);
    }

    _drawScrollBar = () => {
        // this._isSelectedColor();

        // if (this.#content.size.y > this.#contentPanel.size.y) {
        //     this._cursor(this.#square, false, 0, true, this.#scrollbar.position.y + 1);
        //     this._write(`│`)
        //     this.#scrollbar.position.y = this._calcBarPosition("y");
        //     this._cursor(this.#square, false, 0, true, this.#scrollbar.position.y + 1);
        //     this._write(`║`)
        // }

        // if (this.#content.size.x > this.#contentPanel.size.x) {
        //     this._cursor(this.#square, true, this.#scrollbar.position.x + 1, false, 0);
        //     this._write(`─`)
        //     this.#scrollbar.position.x = this._calcBarPosition("x");
        //     this._cursor(this.#square, true, this.#scrollbar.position.x + 1, false, 0);
        //     this._write(`═`)
        // }
    }
}