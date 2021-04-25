import { Cursor } from "./Cursor";
import { Square } from "./Square";

type TCallback = () => any;

export class Panel {
    #square: Square;
    #position: coord = { x: 0, y: 0 };
    #size: coord = { x: 0, y: 0 };
    #cursor: Cursor;
    #data: string[] = [];
    #callbackOnDraw: TCallback | null;

    constructor(square: Square, callback?: TCallback) {
        this.#square = square;
        this.#callbackOnDraw = callback ?? null;
        this.#cursor = new Cursor(this.#square);
    }

    get contentPosition() {
        return { ...this.#position };
    }

    get contentSize() {
        return { ...this.#size };
    }

    get size() {
        return { ...this.#square.size };
    }

    draw = () => {
        //
        const initRow = this.#position.y;
        const initCol = this.#position.x;
        const clearLine = ` `.repeat(this.#square.size.x);
        const lineSize = clearLine.length;
        //
        for (let cnt = this.#square.size.y; cnt--;) {
            const line = this.#data[cnt + initRow];
            //
            this.#cursor.reset();
            this.#cursor.left(0);
            this.#cursor.top(cnt);
            //
            if (!line) {
                this.#cursor.write(clearLine);
                continue;
            }
            //
            this.#cursor.write(line.substr(initCol, lineSize).padEnd(lineSize));
        }
        //
        if (this.#callbackOnDraw)
            this.#callbackOnDraw();
    }

    addLine(content: string) {
        const contentLines = content.split(/\n/gm);
        contentLines.forEach(content => {
            if (content.length > this.#size.x)
                this.#size.x = content.length;
        });
        this.#data.push(...contentLines);
        this.#size.y = this.#data.length;
        this.draw();
    }

    scrollUp() {
        this.#position.y--;
        if (this.#position.y < 0) {
            this.#position.y = 0;
            return
        }
        this.draw();
    }

    scrollDown() {
        this.#position.y++;
        const panelSizeY = this.#square.size.y;
        if (this.#position.y > this.#size.y - panelSizeY) {
            this.#position.y = this.#size.y - panelSizeY;
            return;
        }
        this.draw();
    }

    scrollLeft() {
        this.#position.x--;
        if (this.#position.x < 0) {
            this.#position.x = 0;
            return
        }
        this.draw();
    }

    scrollRight() {
        this.#position.x++;
        const panelSizeX = this.#square.size.x;
        if (this.#position.x > this.#size.x - panelSizeX) {
            this.#position.x = this.#size.x - panelSizeX;
            return;
        }
        this.draw();
    }
}