import { Box } from "./Box";
import { Panel } from "./Panel";
import { TerminalWindow } from "./TerminalWindow";

class ItemGroupPanel extends Panel {
    #window;

    constructor(window: TerminalWindowGroup) {
        super(window.originalPanel.box, window.originalPanel.callbackOnDraw ?? undefined);
        this.#window = window;
    }

    addContent(content: string) {
        return super.addContent(content, this.#window.panel === this);
    }
}

const protectedData: Map<TerminalWindowGroup, { panel: Panel, title: string }> = new Map();

export class TerminalWindowGroup extends TerminalWindow {
    #originalPanel;
    #panels: Map<ItemGroupPanel | Panel, string> = new Map();

    constructor(...n: ConstructorParameters<typeof TerminalWindow>) {
        super(...n);
        this.#originalPanel = super.panel;
        this.#panels.set(this.panel, this.title);
        protectedData.set(this, { panel: this.panel, title: this.title });
    }

    get originalPanel() {
        return this.#originalPanel
    }

    get panel() {
        return protectedData.get(this)?.panel ?? super.panel;
    }

    get title() {
        return protectedData.get(this)?.title ?? super.title;
    }

    selectOriginalPanel() {
        return this.selectPanel(this.#originalPanel);
    }

    selectPanel(panel: ItemGroupPanel | Panel) {
        const title = this.#panels.get(panel);
        if (!title)
            throw new Error("Painel informado não faz parte dos painies associados ao TerminalWindowGroup");
        const current = protectedData.get(this);
        if (current) {
            current.panel = panel;
            current.title = title;
            this.update();
        }
    }

    addPanel(title: string) {
        const panel = new ItemGroupPanel(this);
        this.#panels.set(panel, title);
        return panel;
    }
}