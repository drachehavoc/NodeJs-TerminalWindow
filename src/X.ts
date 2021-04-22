import { TerminalWindow } from "./TerminalWindow";

export class X extends TerminalWindow {
    #selected = 0;

    _filterDrawContentLine(line: string, cnt: number, lineLength: number) {
        
        return cnt == this.#selected
            ? `\x1b[45m\x1b[37m${line}\x1b[40m\x1b[37m`
            : `\x1b[40m\x1b[37m${line}`
    }

    menuDown() {
        this.#selected++;
        this._drawContent();
    }

    menuUp() {
        this.#selected--;
        if (this.#selected < 0)
            this.#selected = 0;
        this._drawContent();
    }
}