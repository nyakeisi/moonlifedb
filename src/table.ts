'use strict'

interface ObjectOfArrays {
    [index: string]: (string | number | boolean)[]
}

export class Table {

    /**
     * A table generator tool.
     * Creates a summary table based on Object of Arrays.
     * @example const table = new Table.summaryTable({ firstColumn: ['User1', 'User2'], secondColumn: ['Lissa Squeens'] }, 'longest');
     * @param {Object} table object of your table, where every element should be string[] | number[] | boolean[]
     * @param {Number|'longest'} length how wide each column has to be
     */
    public summaryTable (
        table: ObjectOfArrays, 
        length: number | 'longest'
    ): string 
    {
        var lengths: number = 0;
        var minlength: number = 0;
        for (const [key, value] of Object.entries(table)) {
            if (String(key).length > minlength) minlength = String(key).length;
            value.forEach(
                (element: string | number | boolean) => {
                    if (String(element).length > minlength) minlength = String(element).length;
                }
            )
        }

        if (length == 'longest') {
            lengths = minlength
        }
        else {
            if(minlength < length) {
                const lengthError = '\u001b[1;31mLength must be greater or equal to minimum length\u001b[0m\n'+ `\t\u001b[0;30mmin: \u001b[0m\u001b[0;33m${minlength}\u001b[0m \u001b[1;31m<\u001b[0m \u001b[1;36m${length}\u001b[0m` + '\u001b[0m'
                throw new Error(lengthError)
            } else lengths = length
        }

        if (lengths < 1) {
            const lengthError = '\u001b[1;31mLength must be greater than 0' + '\u001b[0m'
            throw new Error(lengthError)
        }

        var visualTable: string = ''
        visualTable += '|' + (' ' + '-'.repeat(lengths) + ' |').repeat(Object.keys(table).length) + '\n|'
        for (const [key] of Object.entries(table)) {
            visualTable += ' ' + key + ' '.repeat(lengths - key.length) + ' |'
        }
        visualTable += '\n|' + (' ' + '-'.repeat(lengths) + ' |').repeat(Object.keys(table).length) + '\n|'
        var maxlines: number = 0;
        for (const [key] of Object.entries(table)) {
            if (table[key].length > maxlines) maxlines = table[key].length;
        }
        for (let line = 0; line < maxlines; line++) {
            let i = -1;
            for (const [key] of Object.entries(table)) {
                i++;
                if (table[key].length > maxlines) maxlines = table[key].length;
                let arr: any[] = [];
                table[key].forEach(
                    (dir: any) => {
                        arr.push(dir)
                    }
                )
                visualTable += (' ' + String(arr[line] != undefined ? arr[line] : ' ') + ' '.repeat(lengths - String(arr[line] != undefined ? arr[line] : ' ').length) + ' |')
            }
            visualTable += '\n|'
        }
        visualTable += (' ' + '-'.repeat(lengths) + ' |').repeat(Object.keys(table).length) + '\n'
        return visualTable as string
    }
}
