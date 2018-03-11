const parse = str => {
  str.replace('\n', '');

  const clearSpaces = s => {
    while (s.charAt(0) === ' ')
      s = s.substring(1, s.length);
    while (s.charAt(s.length - 1) === ' ')
      s = s.substring(0, s.length - 1);
    if (s === ' ')
      return '';
    return s;
  };

  const split = content => {
    const arr = [];

    let curly = 0; // {}
    let square = 0 // []
    let lastI = 0;

    for (let i = 0; i <= content.length; i++) {
      switch (content[i]) {
        case '{':
          curly++
          break;
        case '}':
          curly--;
          break;
        case '[':
          square++;
          break;
        case ']':
          square--;
          break;
      }

      if (curly === 0 && square === 0 && (content[i] === ',' || i >= content.length)) {
        let cont = content.slice(lastI, i++);
        cont = clearSpaces(cont);
        if (cont.length > 0)
          arr.push(cont);
        lastI = i;
      }
    }

    return arr;
  };

  const parseVal = val => {

    val = clearSpaces(val);

    if (!isNaN(parseFloat(val))) { // number parse
      if (val.match(/(^(0[0-9]|\.|,|\+)|[a-z]|\.\.|,(,| )|\.(.*)\.| )/i)) {
        throw new Error(`Invalid number: "${val}"`);
        console.log(val);
      }
      return parseFloat(val);
    }
    else if (val[0] === '{' && val[val.length - 1] === '}') { // object parse
      let obj = {};
      const content = clearSpaces(val.slice(1, val.length - 1));
      const fields = split(content);

      if (fields.length < 1) return {};
      fields.forEach(val => {
        const div = val.indexOf(':');
        if (div > -1) {

          let key = clearSpaces(val.slice(0, div));
          const start = key.indexOf('"');
          const end = key.lastIndexOf('"');
          if (start !== end && start > -1 && end > -1)
            key = clearSpaces(key.slice(start + 1, end));
          else throw new Error(`Invalid key: "${key}"`);

          const value = val.slice(div + 1, val.length);

          obj[key] = parseVal(value);
        }
        // Object.defineProperty(obj, pair[0], { value: parseVal(pair[1]) });
      });

      return obj;
    }
    else if (val[0] === '[' && val[val.length - 1] === ']') { // array parse
      const array = [];
      const content = val.slice(1, val.length - 1);

      const values = split(content);

      if (values.length < 1) return [];
      values.forEach(el => {
        array.push(parseVal(el));
      });

      return array;
    }
    else if ((val[0] === '"' || val[0] === '\'') && (val[val.length - 1] === '"' || val[val.length - 1] === '\'')) {
      const res = val.slice(1, val.length - 1);
      if (res.match(/(\'|\")/))
        throw new Error(`Invalid string: "${res}"`);
      return res;
    }
    // else if (val === '') return val;
    else if (val === 'true') return true;
    else if (val === 'false') return false;
    else if (val === 'null') return null;
    else throw new Error(`Invalid expression: "${val}"`);
  };

  return parseVal(str);
};


// test part
// console.log(JSON.parse('[]'));

console.log(parse('[null, true, false, [], 1, {"a":12}]'));
// console.log(parse('[1, \'a\', []]'));
// console.log(parse('[{ "a": { "b": 3 }, "c": 2 }, { "a": { "b": 99 }, "c": 4 }]'));
// console.log(parse('0'));
// console.log(parse('{ "a": " kek", "b": [1, 2, {"suk": "yes"}], "c": 123 }'));
// console.log(JSON.parse('{"a": "hi"}'));
