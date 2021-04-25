import { Box, LinkedBox } from "./Box";

const colors = {
    foreground: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
    },

    background: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
    }
}

export class Cursor {
    #box: Box | LinkedBox;
    #position: coord;

    constructor(square: Box | LinkedBox) {
        this.#box = square;
        this.#position = square.start;
    }

    left(pos: number) {
        this.#position.x = this.#box.start.x + pos;
        process.stdout.cursorTo(this.#position.x, this.#position.y);
    }

    right(pos: number) {
        this.#position.x = this.#box.end.x - pos;
        process.stdout.cursorTo(this.#position.x, this.#position.y);
    }

    top(pos: number) {
        this.#position.y = this.#box.start.y + pos;
        process.stdout.cursorTo(this.#position.x, this.#position.y);
    }

    bottom(pos: number) {
        this.#position.y = this.#box.end.y - pos;
        process.stdout.cursorTo(this.#position.x, this.#position.y);
    }

    reset() {
        this.write("\x1b[0m");
    }

    alterColor() {
        this.color("cyan", null);
    }


    alterColorSelectedLine() {
        this.color("white", "cyan");
    }

    color(foreground: keyof typeof colors.foreground | null, background: keyof typeof colors.background | null) {
        if (foreground)
            this.write(colors.foreground[foreground]);

        if (background)
            this.write(colors.background[background]);
    }

    write(text: string) {
        process.stdout.write(text);
    }
}