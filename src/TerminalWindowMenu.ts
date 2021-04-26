import { Panel } from "./Panel";
import { TerminalWindow } from "./TerminalWindow";

type TOnselectCallback = (index: number) => any;

export class PanelMenu extends Panel {
    #higlightedLineIndex = 0;
    #selectedLineIndex = 0;
    #onSlectCallbacks: TOnselectCallback[] = [];

    _hook_drawLineContent(content: string, info: TDrawContentHookData) {
        if (!content) {
            this.cursor.write((' '.repeat(info.line.size)));
            return;
        }

        const size = info.line.size - 3;
        const selectedChar = this.#selectedLineIndex == info.line.index ? '☒ ' : '☐ '
        content = content.substr(this.contentPosition.x, size);
        content = content.padEnd(size);
        content = `${content} ${selectedChar}`

        if (this.#higlightedLineIndex == info.line.index) {
            this.cursor.alterColorSelectedLine();
            this.cursor.write(content);
            this.cursor.reset();
            return;
        }

        this.cursor.write(content);
    }

    addContent(...n: any[]) {
        throw new Error("Method addContent can't be used in TerminalWidowMenu/PanelMenu.");
    }

    addOption(content: string, onSelect?: TOnselectCallback) {
        if (content.includes(`\n`))
            throw new Error('Options não podem conter \\n.');

        if (onSelect)
            this.#onSlectCallbacks[this.contentSize.y] = onSelect;

        if (this.contentSize.y <= 0)
            this.selectCurretOption()

        super.addContent(content);
    }

    scrollDown() {
        this.#higlightedLineIndex++;
        const contentSizeY = this.contentSize.y - 1;

        if (this.#higlightedLineIndex > contentSizeY) {
            this.#higlightedLineIndex = contentSizeY;
            return;
        }

        const painelSizeY = this.size.y;
        const positionY = this.contentPosition.y;

        if (this.#higlightedLineIndex >= painelSizeY + positionY) {
            super.scrollDown();
            return;
        }

        this.drawContent();
    }

    scrollUp() {
        this.#higlightedLineIndex--;

        if (this.#higlightedLineIndex < 0) {
            this.#higlightedLineIndex = 0;
            return;
        }

        const positionY = this.contentPosition.y;

        if (this.#higlightedLineIndex - positionY < 0) {
            super.scrollUp();
            return;
        }

        this.drawContent();
    }

    onlyScrollUp() {
        return super.scrollUp();
    }

    onlyScrollDown() {
        return super.scrollDown();
    }

    selectCurretOption() {
        const idx = this.#selectedLineIndex = this.#higlightedLineIndex;
        this.drawContent();
        if (this.#onSlectCallbacks[idx])
            this.#onSlectCallbacks[idx](idx);
    }
}

export class TerminalWindowMenu extends TerminalWindow {
    get PanelClass() {
        return PanelMenu;
    }

    get panel() {
        return super.panel as PanelMenu;
    }
}