
export class MiniQuery {

    public elem: HTMLElement; 

    constructor(input: string) {
        this.elem = document.createElement(input);
    }

    appendTo(target: MiniQuery) {
        target.elem.appendChild(this.elem);
        return this;
    }

    append(child: MiniQuery) {
        this.elem.appendChild(child.elem);
        return this;
    }

    on(eventName: string, handler: (evt: Event) => void) {
        this.elem.addEventListener(eventName, handler);
        return this;
    }

    text(input: string) {
        this.elem.textContent = input;
        return this;
    }

    addClass(...input: string[]) {
        input.forEach(c => this.elem.classList.add(c));
        return this;
    }

    removeClass(input: string) {
        this.elem.classList.remove(input);
        return this;
    }

    hasClass(input: string): boolean {
        return this.elem.classList.contains(input);
    }

    clear() {
        this.elem.innerHTML = "";
    }
}

export const $ = (input: string) => new MiniQuery(input);