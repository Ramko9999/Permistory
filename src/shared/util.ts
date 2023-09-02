
function randomString(length: number = 5){
    let builder = [];
    for(let i = 0; i < length; i++){
        const letter = String.fromCharCode(Math.floor(Math.random() * 26) + 'A'.charCodeAt(0));
        builder.push(letter)
    }
    return builder.join("");
}

export function generateId(){
    return `${Date.now()}_${randomString()}`;
}

const MILLIS_IN_DAY = 1000 * 60 * 60 * 24;

export function truncTime(timestamp: number) {
    return timestamp - (timestamp % MILLIS_IN_DAY);
}

export function addDays(timestamp: number, days: number) {
    return timestamp + days * MILLIS_IN_DAY;
}

export function removeDays(timestamp: number, days: number) {
    return timestamp - days * MILLIS_IN_DAY;
}