import { TerminalWindow } from "./TerminalWindow";

export class TerminalWindowGroup extends TerminalWindow {
    #groupData: {
        title: string,
        content: { data: string[] };
    }[] = [];


}