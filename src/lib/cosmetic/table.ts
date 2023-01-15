'use strict'

interface ObjectOfArrays {
    [index: string]: (string | number | boolean)[]
}

export class CosmeticConstructor {

    /**
     * A table generator tool.
     * Creates a summary table based on Object of Arrays.
     * @example const table = new Table.summaryTable({ firstColumn: ['User1', 'User2'], secondColumn: ['Lissa Squeens'] }, 'longest');
     * 
     * @param {Object} table object of your table, where every element should be string[] | number[] | boolean[]
     * @param {Number|'longest'} length how wide each column has to be
     */
    public summaryTableY (
        settings: {
            table: ObjectOfArrays, 
            tableName?: string | undefined,
            length?: number | 'longest' | undefined
        }
    ): string 
    {
        var lengths: number = 0;
        var minlength: number = 0;
        for (const [key, value] of Object.entries(settings.table)) {
            if (String(key).length > minlength) minlength = String(key).length;
            value.forEach(
                (element: string | number | boolean) => {
                    if (String(element).length > minlength) minlength = String(element).length;
                }
            )
        }

        if (settings.length == 'longest' || !settings.length) {
            lengths = minlength
        }
        else {
            if(minlength < settings.length) {
                const lengthError = '\u001b[1;31mLength must be greater or equal to minimum length\u001b[0m\n'+ `\t\u001b[0;30mmin: \u001b[0m\u001b[0;33m${minlength}\u001b[0m \u001b[1;31m<\u001b[0m \u001b[1;36m${length}\u001b[0m` + '\u001b[0m'
                throw new Error(lengthError)
            } else lengths = settings.length
        }

        if (lengths < 1) {
            const lengthError = '\u001b[1;31mLength must be greater than 0' + '\u001b[0m'
            throw new Error(lengthError)
        }

        var visualTable: string = ''
        
        if (settings.tableName != undefined) visualTable += '| '+settings.tableName + '\n'
        visualTable += '|' + (' ' + '-'.repeat(lengths) + ' |').repeat(Object.keys(settings.table).length) + '\n|'
        for (const [key] of Object.entries(settings.table)) {
            visualTable += ' ' + key + ' '.repeat(lengths - key.length) + ' |'
        }
        visualTable += '\n|' + (' ' + '-'.repeat(lengths) + ' |').repeat(Object.keys(settings.table).length) + '\n|'
        var maxlines: number = 0;
        for (const [key] of Object.entries(settings.table)) {
            if (settings.table[key].length > maxlines) maxlines = settings.table[key].length;
        }
        for (let line = 0; line < maxlines; line++) {
            let i = -1;
            for (const [key] of Object.entries(settings.table)) {
                i++;
                if (settings.table[key].length > maxlines) maxlines = settings.table[key].length;
                let arr: any[] = [];
                settings.table[key].forEach(
                    (dir: any) => {
                        arr.push(dir)
                    }
                )
                visualTable += (' ' + String(arr[line] != undefined ? arr[line] : ' ') + ' '.repeat(lengths - String(arr[line] != undefined ? arr[line] : ' ').length) + ' |')
            }
            visualTable += '\n|'
        }
        visualTable += (' ' + '-'.repeat(lengths) + ' |').repeat(Object.keys(settings.table).length) + '\n'
        return visualTable as string
    }
}

// lissa squeens