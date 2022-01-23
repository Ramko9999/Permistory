const HEX = 16;

class ColorHash{

    static getRGBColor(word: string){
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = word.charCodeAt(i) + ((hash << 5) - hash);
        };
        hash *= 100;
        const color = (hash & 0x00ffffff).toString(HEX).toUpperCase();
        return "#" + "00000".substring(0, 6 - color.length) + color;
    }
}

export default ColorHash;