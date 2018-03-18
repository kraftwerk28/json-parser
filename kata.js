const parse = str => {
  str = str.replace(/\n/g, '');

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
    if (content.match(/^,|,$/))
      throw new Error('invalid content');
    const arr = [];

    let curly = 0; // {}
    let square = 0 // []
    let quotas = false // ""
    let lastI = 0;

    for (let i = 0; i <= content.length; i++) {
      if (!quotas) {
        switch (content[i]) {
          case '{':
            curly++;
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
      }
      if (content[i] === '"')
        quotas = !quotas;

      // switch (content[i]) {
      //   case '{':
      //     if (!quotas)
      //       curly++
      //       break;
      //   case '}':
      //     if (!quotas)
      //       curly--;
      //     break;
      //   case '[':
      //     if (!quotas)
      //       square++;
      //     break;
      //   case ']':
      //     if (!quotas)
      //       square--;
      //     break;
      //   case '"':
      //     quotas = !quotas;
      //     break;
      // }

      if (curly === 0 && square === 0 && !quotas && (content[i] === ',' || i >= content.length)) {
        let cont = content.slice(lastI, i);
        cont = clearSpaces(cont);
        if (cont.length > 0)
          arr.push(cont);
        lastI = i + 1;
      }
    }

    return arr;
  };

  const parseVal = val => {

    val = clearSpaces(val);

    if (val.match(/](.*),$|,[ \t]+,|^\[(.*),([ \t]|),(.*)\]$/))
      throw new Error(`Invalid expression: "${val}"`);

    if (!isNaN(parseFloat(val))) { // number parse
      //if (val.match(/(^(0[0-9]|\.|,|\+)|[a-z]|\.\.|,(,| )|\.(.*)\.| )/i)) {
      if (val.match(/,|\.$|^(0[0-9]|\+|,|\.)|[^(0-9|\.|,|\-)]|,(.*),|\.(.*)\./i)) {
        throw new Error(`Invalid number: "${val}"`);
        console.log(val);
      }
      return parseFloat(val);
    } else if (val[0] === '{' && val[val.length - 1] === '}') { // object parse
      let obj = {};
      const content = clearSpaces(val.slice(1, val.length - 1));
      const fields = split(content);

      if (fields.length < 1) return {};
      fields.forEach(val => {
        const start = val.indexOf('"');
        const end = val.slice(start + 1, val.length).indexOf('"') + start + 1;
        const div = val.slice(end + 1, val.length).indexOf(':') + start + end + 1;

        if (start > -1 && end > -1 && div > -1) {
          let key = clearSpaces(val.slice(0, div));
          key = key.slice(1, key.length - 1);
          const value = val.slice(div + 1, val.length);

          obj[key] = parseVal(value);
        } else {
          throw new Error('Object used like array');
        }

      });

      return obj;
    } else if (val[0] === '[' && val[val.length - 1] === ']') { // array parse
      const array = [];
      const content = val.slice(1, val.length - 1);

      const values = split(content);

      if (values.length < 1) return [];
      values.forEach(el => {
        array.push(parseVal(el));
      });

      return array;

    } else if (val[0] === '"' && val[val.length - 1] === '"') { // strnig parse
      const res = val.slice(1, val.length - 1);
      if (res.match(/"/) && !res.match(/(\\'|\\")/))
        throw new Error(`Invalid string: "${res}"`);
      return res;
    } else if (val === 'true') return true;
    else if (val === 'false') return false;
    else if (val === 'null') return null;
    else throw new Error(`Invalid expression: "${val}"`);
  };

  const full = () => {
    return str;
  };

  return parseVal(str);
};

// console.log(parse(require('fs').readFileSync('./tes.json', 'utf8')));
// console.log(JSON.parse(require('fs').readFileSync('./tes.json', 'utf8')));
// console.log(parse('2,23343'));
// console.log(JSON.parse('2,232'));
// console.log(parse('[{},{},[1,2,3]]'));