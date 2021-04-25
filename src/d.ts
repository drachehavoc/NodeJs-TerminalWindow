type coord = { x: number, y: number };

type square = { start: coord, end: coord, size: coord };

type TDrawContentHookData = {
    line: {
        index: number,
        position: number,
        size: number,
    }
}