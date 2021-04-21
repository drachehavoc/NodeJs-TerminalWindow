const TtyEscapes = {
    action: {
        clear: "\x1b[3J\x1b[2J\x1b[1J",
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",
    },

    cursor: {
        unhide: "\x1b[25H",
        hide: "\x1b[25H",
        position: "\x1b[_x_;_y_H", //  \x1b[x;yf"
        positionSave: "\x1b[s",
        positionRestore: "\x1b[s",
        up: "\x1b[_times_A",
        down: "\x1b[_times_D",
        right: "\x1b[_times_C",
        left: "\x1b[_times_B",
    },

    color: {
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
    },
};

const write = process.stdout.write.bind(process.stdout);

export class TtyController {
    #setColor = (color: keyof typeof TtyEscapes.color.foreground) => {
        write(TtyEscapes.color.foreground[color]);
    };

    #setBackground = (color: keyof typeof TtyEscapes.color.background) => {
        write(TtyEscapes.color.background[color]);
    };

    color = Object.freeze({
        foreground: this.#setColor.bind(this),
        
        background: this.#setBackground.bind(this),
    });

    cursor = Object.freeze({
        unhide: () => write(TtyEscapes.cursor.unhide),

        hide: () => write(TtyEscapes.cursor.hide),

        positionSave: () => write(TtyEscapes.cursor.positionSave),
        
        positionRestore: () => write(TtyEscapes.cursor.positionRestore),

        position: (x: number, y: number) => {
            const vals: any = { _x_: x, _y_: y }
            write(TtyEscapes.cursor.position.replace(/_x_|_y_/g, v => vals[v]));
        },
        
        up: (times: number = 1) => {
            write(TtyEscapes.cursor.up.replace('__times__', times.toString()));
        },

        down: (times: number = 1) => {
            write(TtyEscapes.cursor.down.replace('__times__', times.toString()));
        },

        right: (times: number = 1) => {
            write(TtyEscapes.cursor.right.replace('__times__', times.toString()));
        },

        left: (times: number = 1) => {
            write(TtyEscapes.cursor.left.replace('__times__', times.toString()));
        },
    });
}