var tty = require('tty');
var ttys = require('ttys');
// const readline = require('readline');

// var stdin = ttys.stdin;
var stdout = ttys.stdout;

// var write = function write(s) {
//   stdout.write(s);
// };

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// async function askQuestion(question) {
//   return new Promise(resolve => {
//     rl.question(question, answer => {
//       resolve(answer);
//     });
//   });
// }

// void (async function() {
//   write(await askQuestion('your project name?'));
// })();

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

function getChart() {
  return new Promise(resolve => {
    stdin.on('data', function(key) {
      resolve(key);
    });
  });
}

function up(n = 1) {
  stdout.write('\033[' + n + 'A');
}

function down(n = 1) {
  stdout.write('\033[' + n + 'B');
}

function right(n = 1) {
  stdout.write('\033[' + n + 'C');
}

function left(n = 1) {
  stdout.write('\033[' + n + 'D');
}

async function select(choices) {
  let selected = 0;

  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    if (i === selected) {
      stdout.write('[x] ' + choice + '\n');
    } else {
      stdout.write('[ ] ' + choice + '\n');
    }
  }

  up(choices.length);
  right();

  while (true) {
    let chart = await getChart();
    if (chart === '\u0003') {
      process.exit();
      break;
    } else {
      if (chart === 'w' && selected > 0) {
        stdout.write(' ');
        left();
        selected--;
        up();
        stdout.write('x');
        left();
      }

      if (chart === 's' && selected < choices.length - 1) {
        stdout.write(' ');
        left();
        selected++;
        down();
        stdout.write('x');
        left();
      }

      if (chart === '\r') {
        down(choices.length - selected);
        return choices[selected];
      }
    }
  }
}

void (async function() {
  stdout.write('Which framework do you want to use?\n');
  let answer = await select(['vue', 'react', 'angular']);
  stdout.write('You selected ' + answer + '\n');
  process.exit();
})();
