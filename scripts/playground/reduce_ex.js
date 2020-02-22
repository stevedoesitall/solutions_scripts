//Simple Example
const numbers = [1,1,2,3,4,4];

function unique(array) {
  return array.reduce((prev, num) => {
    if (!prev.includes(num)) {
      prev.push(num);
    }
    return prev;
  }, []);
}

unique(numbers);

//Advanced Example
const str = "()()";
const o = "(";
const c = ")";

const balancedParams = (str) => {
  return !str.split("").reduce((previous, char) => {
    if (previous < 0) {
      return previous
    }
    if (char == o) {
      return ++previous;
    }
    else if (char == c) {
      return --previous;
    }
    return previous;
  }, 0);;
};

balancedParams(str);