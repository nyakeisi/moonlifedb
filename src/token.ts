'use strict'

export class Token {
    /**
     * A random token generator tool.
     * @example const id = Token.generate(16, { alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', nonallowed: ['number']});
     * @returns {String} String
     * @param {Number} length Length of the token you want to create
     * @param {String} alphabet An alphabet of allowed symbols in generated token
     * @param {String} alphabet "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" by default
     * @param {Array} nonallowed Remove some type(-s) of characters
     * @param {Array} nonallowed ["upperCaseString", "lowerCaseString", "number", "other?"]
     * @param {Array} nonallowed "other" is used only if argument alphabet exists
     * @param {Array} nonallowed empty array by default
     */

    public generate (
        length: number, 
        alphabet?: string | undefined, 
        nonallowed?: string[] | undefined
    ): string 
    {
        switch (true) {
            case (length < 2): {
                var lengthError = '\u001b[1;31mparameter "length" must be greater than 1.' + '\u001b[0m';
                throw new Error(lengthError)
            }
            case (length > 100): {
                var lengthError = '\u001b[1;31mparameter "length" must be less than 101.' + '\u001b[0m';
                throw new Error(lengthError)
            }
        }
        var result = '';
        var alphabetDefault = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var characters: string | undefined = '';
        var charactersLength: number | undefined = 0;
        switch (!alphabet && !nonallowed) {
            case true: {
                characters = alphabetDefault;
                charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result as string;
            }
            case false: {
                if (alphabet) {
                    switch (true) {
                        case (alphabet.length < 2): {
                            var lengthError = '\u001b[1;31m"alphabet"\'s length must be greater than 1 symbol.' + '\u001b[0m';
                            throw new Error(lengthError)
                        }
                    }
                    characters = alphabet;
                }
                if (nonallowed) {
                    characters = alphabet ? alphabet : alphabetDefault;

                    var upperCase = "";
                    var lowerCase = "";
                    var numbers = "";
                    var others = "";
                    for (let i = 0; i < characters.length; i++) {
                        if (characters[i].match(/[0-9]/)) {
                            numbers += characters[i];
                        }
                        if (characters[i].match(/[a-z]/)) {
                            lowerCase += characters[i];
                        }
                        if (characters[i].match(/[A-Z]/)) {
                            upperCase += characters[i];
                        }
                        if (!characters[i].match(/[0-9]/) && !characters[i].match(/[A-Z]/) && !characters[i].match(/[a-z]/) && alphabet) {
                            others += characters[i];
                        }
                    }

                    if (nonallowed.every(elem => ['lowerCaseString', 'upperCaseString', 'number', alphabet ? 'other' : undefined].includes(elem))) {
                        if ((nonallowed).indexOf("lowerCaseString") >= 0) {
                            characters = characters.replace(lowerCase, '');
                        }
                        if ((nonallowed).indexOf("upperCaseString") >= 0) {
                            characters = characters.replace(upperCase, '');
                        }
                        if ((nonallowed).indexOf("number") >= 0) {
                            characters = characters.replace(numbers, '');
                        }
                        if ((nonallowed).indexOf("other") >= 0 && alphabet) {
                            characters = characters.replace(others, '');
                        }
                    } else {
                        const arrayError = alphabet
                            ? '\u001b[1;31m"notallowed" can only read these params: ["lowerCaseString", "upperCaseString", "number", "other"]' + '\u001b[0m'
                            : '\u001b[1;31m"notallowed" can only read these params: ["lowerCaseString", "upperCaseString", "number"]' + '\u001b[0m'
                        throw new Error(arrayError)
                    }
                }
                charactersLength = characters.length;
                for (var i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result as string;
            }
        }
    }
}
