import { create } from 'xmlbuilder2';

type Tile = {
    shape: [number, number][],
    type: string,
    typeData?: string,
};

const tilesRegExp = /tile.*?\/tile/smg;
const typeRegExp = /type\n(.?)\n/;
const typeDataRegExp = /typeData\n(.?)\n/;
const shapeRegExp = /shape\n.*?\/shape/smg;
const vertRegExp = /vert\n(.*)\n(.*)\n\/vert/mg;

const aToJson = (input: string): Tile[] => {
    const tiles: Tile[] = [];
    const tileMatches = input.replace(/\r\n/g, '\n').matchAll(tilesRegExp);
    for (const tileMatch of tileMatches) {
        const shapeMatches = tileMatch[0].matchAll(shapeRegExp);
        for (const shapeMatch of shapeMatches) {
            const vertMatches = shapeMatch[0].matchAll(vertRegExp);
            const typeMatch = tileMatch[0].match(typeRegExp);
            if (!typeMatch) {
                throw Error('No type');
            }
            const tile: Tile = {
                type: typeMatch[1],
                shape: [],
            };
            const typeDataMatch = tileMatch[0].match(typeDataRegExp);
            if (typeDataMatch) {
                tile.typeData = typeDataMatch[1];
            }
            for (const vertMatch of vertMatches) {
                const vert: [number, number] = [Number.parseFloat(vertMatch[1]), Number.parseFloat(vertMatch[2])];
                tile.shape.push(vert);
            }
            tiles.push(tile);
        }
    }
    tiles.sort((a, b) => a.type.localeCompare(b.type));
    return tiles;
}

const getColor = (type: string, typeData?: string): string => {
    if (type === '0') {
        return '#011';
    }
    if (type === '1') {
        if (typeData === '1') {
            return '#00f';
        }
        return '#0ff';
    }
    if (type === '2') {
        return '#f90';
    }
    if (type === '3') {
        return '#f00';
    }
    // Otherwise, use a debug color to easily spot unsupported types.
    return 'pink';
}

export const convertImmoRallyTrackSlideToSvg = (track: string): string => {
    // Create the svg document
    const root = create({ version: '1.0' })
        .ele('svg', { width: 1800, height: 1170, version: '1.0', 'xmlns': 'http://www.w3.org/2000/svg' });
    const elements = root;

    const trackRoot = aToJson(track);

    elements.ele('rect', {
        x: 0,
        y: 0,
        width: 1800,
        height: 1170,
        fill: 'black',
    });
            
    for (const tile of trackRoot) {
        const color = getColor(tile.type, tile.typeData);
        const points = tile.shape.map(vert => `${vert[0]}, ${vert[1]}`).join(' ') + ` ${tile.shape[0][0]}, ${tile.shape[0][1]}`;
        elements.ele('polyline', {
            points,
            fill: 'none',
            stroke: color ?? 'pink',
            'stroke-width': 2,
        });
    }
    return root.end({ prettyPrint: false });
};
