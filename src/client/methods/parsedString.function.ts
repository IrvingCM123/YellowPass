// Function to decompose the object with ticket data, transforming an object into a string,
// allowing its storage in the generic_object with QR format

export function parse_String(Data: any) {
    let parsedString = '';
    for (let key in Data) {
        parsedString += `${key}:${Data[key]}, `;
    }
    parsedString = parsedString.slice(0, -2);
    return parsedString;
}
