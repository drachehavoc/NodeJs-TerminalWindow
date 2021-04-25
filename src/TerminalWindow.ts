import { Cursor } from "./Cursor";
import { Panel } from "./Panel";
import { Box } from "./Box";

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
    #box: Box;
    #panel!: Panel;

    constructor(positionX: number, positionY: number, sizeX: number | null, sizeY: number | null, title: string = "") {
        if (!currentWindow)
            currentWindow = this;
        //
        windowList.push(this);
        //
        this.#title = title;
        //
        this.#box = new Box(positionX, positionY);
        this.#box.setSize(sizeX, sizeY);
        //
        this.#cursor = new Cursor(this.#box);
        //
        this.#scrollbar = { position: { x: 0, y: 0 } };
        //
        this.#drawFrame();
    }

    get PanelClass() {
        return Panel;
    }

    get title() {
        return this.#title;
    }

    get panel() {
        if (!this.#panel)
            this.#panel = new this.PanelClass(this.#box.clone(1, 1, -1, -1), this.#drawScrollBars.bind(this));
        return this.#panel;
    }

    update() {
        this.#drawFrame();
        this.panel.drawContent();
    }

    #drawFrame = () => {
        //
        const size = this.#box.size;
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
        if (this.title) {
            const title = this.title.substring(0, size.x - 3);
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
        const panelSize = this.panel.size;
        const cr = this.#cursor;
        const pos = this.#scrollbar.position;
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