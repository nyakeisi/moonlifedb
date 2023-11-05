'use strict'

export class DeepKeyFinder {
    public getDeepKeys (obj: object): any[] 
    {
        var keys: any[] = [];
        for(var key in obj) {
            keys.push(key);
            if(typeof obj[key] === "object") {
                var subkeys = this.getDeepKeys(obj[key]);
                keys = keys.concat(
                    subkeys.map((subkey: any) => {
                            return key + "." + subkey;
                        }
                    )
                );
            }
        }
        return keys;
    }
    
    public deepFind(obj: object, path: string): any {
        var paths = path.split('.'), 
            current = obj;
        for (let i = 0; i < paths.length; i++) {
            if (current[paths[i]] == undefined) return undefined;
            else current = current[paths[i]];
        }
        return current;
    }

    public queryFind(
        obj: object, 
        key: string, 
        value: any
    ): object | undefined {
        let found: object | undefined;
        JSON.stringify(obj, 
            (_, _nv) => {
                if (_nv && _nv[key] === value) found = _nv;
                return _nv;
            }
        );
        return found;
    }
}

// lissa squeens