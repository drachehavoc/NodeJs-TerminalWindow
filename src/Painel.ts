import { Cursor } from "./Cursor";
import { Square } from "./Square";

export class Painel {
    #square: Square;
    #position: coord = { x: 0, y: 0 };
    #size: coord = { x: 0, y: 0 };
    #cursor: Cursor;
    #data: string[] = [];
    #callbackOnDraw: Function | null

    constructor(square: Square, callback?: Function) {
        this.#square = square;
        this.#callbackOnDraw = callback ?? null;
        this.#cursor = new Cursor(this.#square);
    }

    draw = () => {
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
        this.draw();
    }

    scrollDown() {
        this.#position.y++;
        this.draw();
    }

    scrollLeft() {
        this.#position.x--;
        this.draw();
    }

    scrollRight() {
        this.#position.x++;
        this.draw();
    }
}