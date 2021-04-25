import { Cursor } from "./Cursor";
import { Panel } from "./Painel";
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
        prevWindow.#drawFrame();
        currentWindow.#drawFrame();
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
    #cursor: Cursor;
    #square: Square;
    #panel!: Panel;

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
        this.#drawFrame();
    }

    get panel() {
        this.#panel = new Panel(this.#square.clone(1, 1, -1, -1), this.#drawScrollBars.bind(this));
        Object.defineProperty(this, "panel", { get: this.#alreadyCreatedPanel.bind(this) });
        return this.#panel;
    }

    #alreadyCreatedPanel = () => {
        return this.#panel;
    }

    #drawFrame = () => {
        //
        const size = this.#square.size;
        const cr = this.#cursor;
        // COLOR
        currentWindow == this
            ? cr.alterColor()
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
            cr.write(`[${title}]`);
        }
        //
        this.#drawScrollBars();
    }

    #drawScrollBars = () => {
        //
        const cr = this.#cursor;
        const pos = this.#scrollbar.position;
        const panelSize = this.panel.size;
        const contentSize = this.panel.contentSize;

        // DRAW VERTICAL
        if (contentSize.y > panelSize.y) {
            // color
            currentWindow == this
                ? cr.alterColor()
                : cr.reset();
            // clean
            cr.right(0);
            cr.top(pos.y + 1);
            cr.write(`│`);
            // draw
            pos.y = this.#calcScrollBarPosition('y');
            cr.right(0);
            cr.top(pos.y + 1);
            cr.write(`┃`);
        }

        // DRAW HORIZONTAL
        if (contentSize.x > panelSize.x) {
            // color
            currentWindow == this
                ? cr.alterColor()
                : cr.reset();
            // clean
            cr.left(pos.x + 1);
            cr.bottom(0);
            cr.write("──");
            // draw
            pos.x = this.#calcScrollBarPosition('x');
            cr.left(pos.x + 1);
            cr.bottom(0);
            cr.write(`━━`);
        }
    }

    #calcScrollBarPosition = (direction: "x" | "y") => {
        const realPanelSize = this.panel.size[direction]
        const panelSize = realPanelSize - { x: 2, y: 1 }[direction];
        const contentPosition = this.panel.contentPosition[direction];
        const contentSize = this.panel.contentSize[direction] - realPanelSize;
        return Math.round((contentPosition * panelSize) / contentSize);
    }
}