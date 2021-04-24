import { TerminalWindow } from "./TerminalWindow";

export class TerminalWindowMenu extends TerminalWindow {
    #selected = 0;

    _filterDrawContentLine(line: string, cnt: number, lineIdx: number, lineLength: number) {
        return lineIdx == this.#selected
            ? `\x1b[45m\x1b[37m${line}\x1b[0m`
            : `\x1b[0m${line}`
    }

    onlyScrollDown() {
        super.scrollDown();
    }
    
    onlyScrollUp() {
        super.scrollUp()
    }

    scrollDown() {
        this.#selected++;
        const contentSizeY = this.contentSize.y - 1;
        
        if (this.#selected > contentSizeY) {
            this.#selected = contentSizeY;
            return;
        }

        const painelSizeY = this.painelSize.y;
        const positionY = this.contentPosition.y;

        if (this.#selected >= painelSizeY + positionY) {
            super.scrollDown();
            return;
        }

        this._drawContent();
    }

    scrollUp() {
        this.#selected--;

        if (this.#selected < 0) {
            this.#selected = 0;
            return;
        }

        const painelSizeY = this.painelSize.y;
        const positionY = this.contentPosition.y;

        if (this.#selected - positionY < 0) {
            super.scrollUp();
            return;
        }

        this._drawContent();
    }
}