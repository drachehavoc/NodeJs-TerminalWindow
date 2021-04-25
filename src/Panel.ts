import { Cursor } from "./Cursor";
import { Box } from "./Box";

type TCallback = () => any;

export class Panel {
    #box: Box;
    #position: coord = { x: 0, y: 0 };
    #size: coord = { x: 0, y: 0 };
    #cursor: Cursor;
    #data: string[] = [];
    #callbackOnDraw: TCallback | null;

    constructor(square: Box, callback?: TCallback) {
        this.#box = square;
        this.#callbackOnDraw = callback ?? null;
        this.#cursor = new Cursor(this.#box);
    }

    get cursor() {
        return this.#cursor;
    }

    get contentPosition() {
        return { ...this.#position };
    }

    get contentSize() {
        return { ...this.#size };
    }

    get size() {
        return { ...this.#box.size };
    }

    get box() {
        return this.#box;
    }

    get callbackOnDraw() {
        return this.#callbackOnDraw;
    }

    addContent(content: string, addAndDraw: boolean = true) {
        const contentLines = content.split(/\n/gm);
        contentLines.forEach(content => {
            if (content.length > this.#size.x)
                this.#size.x = content.length;
        });
        this.#data.push(...contentLines);
        this.#size.y = this.#data.length;
        if (addAndDraw)
            this.drawContent();
    }

    scrollUp() {
        this.#position.y--;
        if (this.#position.y < 0) {
            this.#position.y = 0;
            return
        }
        this.drawContent();
    }

    scrollDown() {
        this.#position.y++;
        const panelSizeY = this.#box.size.y;
        if (this.#position.y > this.#size.y - panelSizeY) {
            this.#position.y = this.#size.y - panelSizeY;
            return;
        }
        this.drawContent();
    }

    scrollLeft() {
        this.#position.x--;
        if (this.#position.x < 0) {
            this.#position.x = 0;
            return
        }
        this.drawContent();
    }

    scrollRight() {
        this.#position.x++;
        const panelSizeX = this.#box.size.x;
        if (this.#position.x > this.#size.x - panelSizeX) {
            this.#position.x = this.#size.x - panelSizeX;
            return;
        }
        this.drawContent();
    }

    drawContent() {
        //
        const initRow = this.#position.y;
        const lineSize = this.#box.size.x;
        //
        for (let lineNumber = this.#box.size.y; lineNumber--;) {
            const lineIndex = lineNumber + initRow;
            let lineContent = this.#data[lineIndex] ?? null;
            //
            this.#cursor.reset();
            this.#cursor.left(0);
            this.#cursor.top(lineNumber);
            //
            const info: TDrawContentHookData = {
                line: {
                    index: lineIndex,
                    position: lineNumber,
                    size: lineSize,
                }
            }
            //
            this._hook_drawLineContent(lineContent, info);
        }
        //
        if (this.#callbackOnDraw)
            this.#callbackOnDraw();
    }

    _hook_drawLineContent(content: string, info: TDrawContentHookData) {
        if (!content) {
            this.cursor.write((' '.repeat(info.line.size)));
            return;
        }
        //
        content = content.substr(this.contentPosition.x, info.line.size);
        content = content.padEnd(info.line.size)
        this.cursor.write(content);
    }
}