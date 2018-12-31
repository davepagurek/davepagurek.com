const ns = 'http://www.w3.org/2000/svg';
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

const Generator = (grammar) => {
  const root = document.createElementNS(ns, 'g');

  const generator = {
    root: root,
    context: root,
    currentDepth: 0,
    size: 0,
    active: [{ type: 'START', at: root, depth: 0 }],
    added: [],

    withContext: (callback) => {
      const oldDepth = generator.depth;
      const oldContext = generator.context;
      callback();
      generator.context = oldContext;
      generator.depth = oldDepth;
    },

    add: (params) => {
      const path = document.createElementNS(ns, 'path');
      Object.keys(params).forEach(key => path.setAttribute(key, params[key]));
      generator.context.appendChild(path);
      generator.added.push(path);
      generator.size++;
    },

    transform: (transformation) => {
      const newContext = document.createElementNS(ns, 'g');
      newContext.setAttribute('transform', transformation);

      generator.context.appendChild(newContext);
      generator.context = newContext;
    },

    spawn: (type) => generator.active.push({ type: type, at: generator.context, depth: generator.depth + 1 }),

    done: () => generator.active.length === 0,

    next: () => {
      generator.added = [];

      const spawnPoint = generator.active.splice(Math.floor(Math.random() * generator.active.length), 1)[0];
      generator.withContext(() => {
        generator.context = spawnPoint.at;
        generator.depth = spawnPoint.depth;
        grammar[spawnPoint.type](generator);
      });

      return generator.added;
    },

    runAll: () => {
      while (!generator.done()) generator.next();
      return generator;
    }
  };

  return generator;
};

const Tree = {
  START: (generator) => {
    generator.spawn('branch');
  },

  branch: (generator) => {
    if (generator.depth > 1) {
      const scale = Math.random() * 0.25 + 0.65;
      const rotation = Math.random() * 60 - 30;
      generator.transform(`scale(${scale}) rotate(${rotation})`);
    } else {
      const scale = Math.random() * 0.2 + 0.7;
      const rotation = Math.random() * 40 - 20;
      generator.transform(`scale(${scale}) rotate(${rotation})`);
    }

    generator.withContext(() => {
      generator.transform(`translate(0 -50)`);
      generator.spawn('branchOrLeaf');
    });

    generator.add({
      d: 'M 0,0 L 0,-50',
      stroke: '#70655D',
      fill: 'none',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      style: 'vector-effect: non-scaling-stroke'
    });
  },

  branchOrLeaf: (generator) => {
    const MAX_SIZE = isFirefox ? 10 : 20;
    const leaf = Math.random() < 0.4 && generator.depth > 4 || generator.size > MAX_SIZE;
    if (leaf || generator.depth > 10) {
      generator.spawn('leaf');
    } else {
      generator.spawn('branch');
      generator.spawn('maybeBranch');
      generator.spawn('maybeBranch');
    }
  },

  maybeBranch: (generator) => {
    if (Math.random() < 0.6) {
      generator.spawn('branch');
    }
  },

  leaf: (generator) => {
    const x = 0;
    const y = 0;
    const r = 50;
    const hue = Math.round(Math.random() * 90 + 280);
    generator.add({
      d: `M${x - r},${y} ` +
        `a${r},${r} 0 1,0 ${r * 2},0 ` +
        `a${r},${r} 0 1,0 ${-r * 2},0`,
      fill: `hsl(${hue}, 50%, 70%)`,
      'fill-opacity': 0.8,
      stroke: 'none'
    });
  }
};

const svg = document.getElementById('treeGrid');
svg.setAttribute('width', 2000);
svg.setAttribute('height', 800);
svg.setAttribute('viewBox', '0 0 2000 800');

const generators = [];
for (let i = 0; i < 40; i++) {
  const currentGenerator = Generator(Tree);
  const model = currentGenerator.root;
  model.setAttribute('transform', `translate(${(i % 10) * 200 + 100} ${Math.floor(i / 10 + 1) * 200})`);
  svg.appendChild(model);

  generators.push(currentGenerator);
}

const WIDTH = 10;
const HEIGHT = 4;
const generatorQueue = [];
for (let x = -3; x < WIDTH; x++) {
  for (let i = 0; i < HEIGHT; i++) {
    if (x + i >= 0 && x + i < WIDTH) {
      generatorQueue.push(generators[(HEIGHT - i - 1) * WIDTH + x + i]);
    }
  }
}

let active = [generatorQueue.shift()];
let step = 0;

const runAll = () => {
  window.requestAnimationFrame(() => {
    active.forEach(generator => {
      if (step % 3 !== 0) return;

      let added = [];
      do {
        added.push(...generator.next());
      } while (!generator.done() && added.length < 1);

      added.forEach((path) => {
        if (!isFirefox) {
          path.classList.add('path-bounce');
        } else {
          path.classList.add('path-appearing');
        }
      });
    });

    active = active.filter(generator => !generator.done());

    step++;

    if (generatorQueue.length > 0 && step % 5 === 0) {
      active.push(generatorQueue.shift());
    }

    if (active.length > 0 || generatorQueue.length > 0) {
      runAll();
    }
  });
};

runAll();
