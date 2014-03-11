function log(arg) {
  console.log(arg);
}

function assertEqual(expected, actual) {
  if (typeof expected === "object") {
    assertEqual(JSON.stringify(expected), JSON.stringify(actual));
  }
  else if (expected === actual) {
    log(expected + " === " + actual);
  } else {
    throw new Error("Expected " + expected + ", but got " + actual + ".");
  }
}

function identity(x) {
  return x;
}

function identityf(arg) {
  return function () {
    return arg;
  };
}

function add(x, y) {
  return x + y;
}

function addf(x) {
  return function (y) {
    return x + y;
  };
}

function sub(x, y) {
  return x - y;
}

function mul(x, y) {
  return x * y;
}

function applyf(binary) {
  return function (first) {
    return function (second) {
      return binary(first, second);
    };
  };
}

function curry(binary, first) {
  return applyf(binary)(first);
}

// In ES6, when it comes out, you will be able to take arrays of arguments really easily:
//
// function curry(func, ...first) {
//   return function (...second) {
//     return func(...first, ...second);
//   };
// }

function twice(binary) {
  return function (arg) {
    return binary(arg, arg);
  };
}

function switcheroo(func) {
  return function (first, second) {
    return func(second, first);
  };
}

function composeu(inner, outer) {
  return function (arg) {
    return outer(inner(arg));
  };
}

function composeb(inner, outer) {
  return function (x, y, z) {
    return outer(inner(x, y), z);
  };
}

function once(func) {
  return function (x, y) {
    var value =  func(x, y);
    func = function (x, y) { return undefined; };
    return value;
  }
}
// alternative implementations:
// - set `func` to `void` - Doug
// - `return;` instead of `return undefined;` - Bill

function fromTo(start, end) {
  var previous = start - 1;
  return function () {
    previous += 1;
    if (previous >= end) {
      return undefined;
    }

    return previous;
  };
}

function element(array, func) {
  func = func || fromTo(0, array.length);

  return function () {
    return array[func()];
  };
}

function collect(gen, array) {
  return function () {
    var value = gen();
    if (value !== undefined) {
      array.push(value);
    }
    return value;
  };
}

function filter(gen, predicate) {
  var value;

  return function () {
    do {
      value = gen();
    } while (value !== undefined && !predicate(value));
    return value;
  };
}

// The recursive method will fail for long skips in ES5, but it will work in ES6 since the standard has changed to
// use jumps:
//
// function filter(gen, predicate) {
//   return function recur() {
//     var value;
//     value = gen();
//     if (value === undefined || predicate(value)) {
//       return value;
//     }
//     return recur();
//   };
// }

function concat(f, g) {
  var value;
  return function () {
    value = f();
    if (value === undefined) {
      return g();
    } else {
      return value;
    }
  };
}

function counterf(start) {
  var counter = start;
  return {
    next: function () {
      counter += 1;
      return counter;
    },
    prev: function () {
      counter -= 1;
      return counter;
    }
  };
}

function revocable(func) {
  return {
    invoke: function () {
      return func && func.apply(null, arguments);
    },
    revoke: function () {
      func = undefined;
    }
  };
}

function gensymf(prefix) {
  var counter = 0;
  return function () {
    counter += 1;
    return prefix + '' + counter;
  };
}

function gensymff(func, seed) {
  return function (prefix) {
    var counter = seed;
    return function () {
      counter = func(counter);
      return prefix + '' + counter;
    };
  };
}

if (!Array.prototype.first) {
  Array.prototype.first = function () {
    return this[0];
  };
}

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    return this[this.length - 1];
  };
}

function fibonaccif(a, b) {
  var seq = [ a, b ];
  return function () {
    seq.push(seq.first() + seq.last());
    return seq.shift();
  };
}

function m(value, source) {
  return {
    value: value,
    source: source || String(value)
  };
}

function addm(first, second) {
  return m(first.value + second.value, '(' + first.source + '+' + second.source + ')');
}

function applym(func, op) {
  return function (first, second) {
    if (typeof first === "number") {
      first = m(first);
    }
    if (typeof second === "number") {
      second = m(second);
    }
    return m(func(first.value, second.value), '(' + first.source + op + second.source + ')');
  };
}

function exp(args) {
  if (Array.isArray(args)) {
    var func = args.shift();
    args = args.map(exp);
    return func.apply(null, args)
  } else {
    return args;
  }
}

// First attempt:
// function addg(val) {
//   if (val === undefined) {
//     return;
//   }
//
//   return function (val2) {
//     if (val2 === undefined) {
//       return val;
//     } else {
//       return addg(val + val2);
//     }
//   };
// }

// Second attempt:
// function addg(total) {
//   if (total === undefined) { return; }
//   return function adder(val) {
//     if (val === undefined) {
//       return total;
//     } else {
//       total += val;
//       return adder;
//     }
//   };
// }

// Third attempt:
function addg(total) {
  if (total === undefined) { return; }
  return function adder(val) {
    total += val || 0;
    return val === undefined ? total : adder;
  };
}

// First attempt:
// function applyg(func) {
//   return function (total) {
//     if (total === undefined) { return; }
//     return function applier(val) {
//       if (val === undefined) { return total; }
//       total = func(total, val);
//       return applier;
//     };
//   };
// }

// Second attempt:
function applyg(func) {
  var total;
  return function applier(val) {
    if (val === undefined) { return total; }
    if (total === undefined) {
      total = val;
    } else {
      total = func(total, val);
    }
    return applier;
  };
}

function arrayg(first) {
  var array = [];
  function pusher(val) {
    if (val === undefined) { return array; }
    array.push(val);
    return pusher;
  };
  return pusher(first);
}

// Reusing applyg:
// function arrayg(first) {
//   if (first === undefined) { return []; }
//   return applyg(
//     function (array, value) {
//       array.push(value);
//       return array;
//     }
//   )([first]);
// }

function unaryc(unary) {
  return function(callback, arg) {
    callback(unary(arg));
  };
}

function naryc(func) {
  return function() {
    var callback = Array.prototype.shift.call(arguments);
    callback(func.apply(null, arguments));
  };
}


// Exercise 1: Write an identity function that takes an argument and returns
//             that argument.
log("\nExercise 1:");
assertEqual(3, identity(3));

// Exercise 2: Write three binary functions, add, sub, and mul, that take two
//             numbers and return their sum, difference and product.
log("\nExercise 2:");
assertEqual(7, add(3, 4));
assertEqual(-1, sub(3, 4));
assertEqual(12, mul(3, 4));

// Exercise 3: Write a function identityf that takes an argument and returns a
//             function that returns that argument.
log("\nExercise 3:");
var idf3 = identityf(3);
assertEqual(3, idf3());

// Exercise 4: Write a function addf that adds from two invocations.
log("\nExercise 4:");
assertEqual(7, addf(3)(4));

// Exercise 5: Write a function applyf that takes a binary function, and makes it
//             callable with two invocations.
log("\nExercise 5:");
assertEqual(7, applyf(add)(3)(4));
assertEqual(30, applyf(mul)(5)(6));

// Exercise 6: Write a function that takes a function and an argument, and
//             returns a function that can take a second argument.
log("\nExercise 6:");
var add3 = curry(add, 3);
assertEqual(7, add3(4));
assertEqual(30, curry(mul, 5)(6));

// Exercise 7: Without writing any new functions, show three ways to create the
//             inc function.
log("\nExercise 7:");
var inc = curry(add, 1);
assertEqual(6, inc(5));
inc = applyf(add)(1);
assertEqual(7, inc(inc(5)));
inc = addf(1);
assertEqual(8, inc(7));

// Exercise 8: Write a function twice that takes a binary function and returns a
//             unary function that passes its argument to the binary function twice.
log("\nExercise 8:");
var doubl = twice(add);
assertEqual(22, doubl(11));
var square = twice(mul);
assertEqual(121, square(11));

// Exercise 9: Write switcheroo, a function that reverses the arguments of a
//             binary function.
log("\nExercise 9:");
var bus = switcheroo(sub);
assertEqual(-1, bus(3, 2));

// Exercise 10: Write a function composeu that takes two unary functions and
//              returns a unary function that calls them both.
log("\nExercise 10:");
assertEqual(36, composeu(doubl, square)(3));

// Exercise 11: Write a function composeb that takes two binary functions and
//              returns a function that calls them both.
log("\nExercise 11:");
assertEqual(25, composeb(add, mul)(2, 3, 5));

// Exercise 12: Write a function that allows a binary function to be called only
//              once.
log("\nExercise 12:");
var add_once = once(add);
assertEqual(7, add_once(3, 4));
assertEqual(undefined, add_once(3, 4));

// Exercise 13: Write a fromTo function that produces a function that will
//              produce values in a range.
log("\nExercise 13:");
var index = fromTo(0, 3);
assertEqual(0, index());
assertEqual(1, index());
assertEqual(2, index());
assertEqual(undefined, index());
assertEqual(undefined, index());

// Exercise 14: Write an element function that takes an array and an optional
//              function (like the result of fromTo) and produces a function
//              that will produce the elements of the array.
log("\nExercise 14:");
var val = element([ 'a', 'b', 'c', 'd' ], fromTo(1, 3));
assertEqual('b', val());
assertEqual('c', val());
assertEqual(undefined, val());
var val2 = element([ 'a', 'b', 'c', 'd' ]);
assertEqual('a', val2());
assertEqual('b', val2());
assertEqual('c', val2());
assertEqual('d', val2());
assertEqual(undefined, val2());

// Exercise 15: Write a collect function that takes a function and an array and
//              produces a function that will collect the results in the array.
log("\nExercise 15:");
var array = [];
var col = collect(fromTo(1, 3), array);
assertEqual(1, col());
assertEqual(2, col());
assertEqual(undefined, col());
assertEqual([1, 2], array);

// Exercise 16: Write a filter function that takes a function and a predicate
//              and produces a function that produces only the values approved
//              by the predicate.
log("\nExercise 16:");
var fil = filter(fromTo(0, 5),
                 function thrid(value) {
                   return (value % 3) === 0;
                 });
assertEqual(0, fil());
assertEqual(3, fil());
assertEqual(undefined, fil());

// Exercise 17: Write a concat function that takes two sequence generating
//              functions and produces a function that combines the sequences.
log("\nExercise 17:");
var con = concat(fromTo(1, 3), fromTo(0, 2));
assertEqual(1, con());
assertEqual(2, con());
assertEqual(0, con());
assertEqual(1, con());
assertEqual(undefined, con());

// Exercise 18: Write a counterf function that returns an object containing two
//              functions that implement an up/down counter, hiding the counter.
log("\nExercise 18:");
var counter = counterf(10);
var next = counter.next;
var prev = counter.prev;
assertEqual(11, next());
assertEqual(10, prev());
assertEqual(9, prev());
assertEqual(10, next());

// Exercise 19: Make a revocable function that takes a nice function, and
//              returns an object containing an invoke function that can invoke
//              the nice function, and a revoke function that disables the
//              invoke function.
log("\nExercise 19:");
var func = revocable(add);
var invoke = func.invoke;
assertEqual(7, invoke(3, 4));
func.revoke();
assertEqual(undefined, invoke(7, 8));

// Exercise 20: Make a function gensymf that makes a function that generates
//              unique symbols.
log("\nExercise 20:");
var gensymg = gensymf("G");
var gensymh = gensymf("H");
assertEqual('G1', gensymg());
assertEqual('H1', gensymh());
assertEqual('G2', gensymg());
assertEqual('H2', gensymh());

// Exercise 21: Write a function gensymff that takes a unary function and a seed
//              and returns a gensymf.
log("\nExercise 21:");
var gensymfb = gensymff(add3, 0);
var gensymgb = gensymfb("G");
var gensymhb = gensymfb("H");
assertEqual('G3', gensymgb());
assertEqual('H3', gensymhb());
assertEqual('G6', gensymgb());
assertEqual('H6', gensymhb());

// Exercise 22: Make a function fibonaccif that returns a function that will
//              return the next fibonacci number.
log("\nExercise 22:");
var fib = fibonaccif(0, 1);
assertEqual(0, fib());
assertEqual(1, fib());
assertEqual(1, fib());
assertEqual(2, fib());
assertEqual(3, fib());
assertEqual(5, fib());

// Exercise 23: Write a function addm that takes two m objects and returns an m
//              object.
log("\nExercise 23:");
assertEqual( {value: 7, source: "(3+4)"}, addm(m(3), m(4)) );
assertEqual( {value: 4.141592653589793, source: "(1+pi)"}, addm(m(1), m(Math.PI, "pi")) );

// Exercise 24: Write a function applym that takes a binary function and a
//              string and returns a function that acts on m objects.
log("\nExercise 24:");
var subm = applym(sub, '-');
assertEqual( {value: -1, source: "(3-4)"}, subm(m(3), m(4)) );
assertEqual( {value: 12, source: "(3*4)"}, applym(mul, "*")(m(3), m(4)) );

// Exercise 25: Modify function liftm so that the functions it produces can
//              accept arguments that are either numbers or m objects.
log("\nExercise 25:");
assertEqual( {value: -1, source: "(3-4)"}, subm(3, 4) );
assertEqual( {value: 12, source: "(3*4)"}, applym(mul, "*")(3, m(4)) );

// Exercise 26: Write a function exp that evaluates simple array expressions.
log("\nExercise 26:");
var sae = [mul, 3, 3];
assertEqual(9, exp(sae));
assertEqual(42, exp(42));

// Exercise 27: Modify exp to evaluate nested array expressions.
log("\nExercise 27:");
var nae = [
  Math.sqrt,
  [add, [square, 3], [square, 4]]
];
assertEqual(5, exp(nae));

// Exercise 28: Write a function addg that adds from many invocations, until it
//              sees an empty invocation.
log("\nExercise 28:");
assertEqual(undefined, addg());
assertEqual(2, addg(2)());
assertEqual(9, addg(2)(7)());
assertEqual(7, addg(3)(4)(0)());
assertEqual(15, addg(1)(2)(4)(8)());
assertEqual(2, addg(0)(-1)(3)());

// Exercise 29: Write a function applyg that will take a binary function and
//              apply it to many invocations.
log("\nExercise 29:");
assertEqual(undefined, applyg(mul)());
assertEqual(3, applyg(mul)(3)());
assertEqual(60, applyg(mul)(3)(4)(5)());
assertEqual(64, applyg(mul)(1)(2)(4)(8)());
assertEqual(1, applyg(add)(0)(1)());

// Exercise 30: Write a function arrayg that will build an array from many
//              invocations.
log("\nExercise 30:");
assertEqual([], arrayg());
assertEqual([3], arrayg(3)());
assertEqual([3, 4, 5], arrayg(3)(4)(5)());

// Exercise 31: Make a function that takes a unary function, and returns a
//              function that takes an argument and a callback.
log("\nExercise 31:");
var sqrtc = unaryc(Math.sqrt);
sqrtc(log, 81); // 9
var addc = naryc(add);
addc(log, 1, 2); // 3
