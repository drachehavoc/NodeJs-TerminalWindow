import { TerminalWindow } from "./TerminalWindow";

export class TerminalWindowMenu extends TerminalWindow {
    #selectedIdx = 0;

    #drawContent = () => {
        // const initialLine = this.#content.position.y;
        // const initialColumn = this.#content.position.x;
        // const clearLine = ` `.repeat(this.#contentPanel.size.x);
        // let cnt = this.#contentPanel.size.y;
        // this.#write("\x1b[37m"); // selected color
        // for (; cnt--;) {
        //     const line = this.#content.data[cnt + initialLine]
        //         ?.substr(initialColumn, clearLine.length)
        //         ?.padEnd(clearLine.length);
        //     this.#cursor(this.#contentPanel, true, 0, true, cnt);
        //     this.#write(line ?? clearLine);
        // }
    }
}