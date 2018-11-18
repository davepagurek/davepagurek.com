const ns = 'http://www.w3.org/2000/svg';

const LINE = 'line';
const CIRCLE = 'circle';
const PUSH = 'push';
const POP = 'pop';
const RULE = 'rule';
const TRANSFORM = 'transform';
const SHOWFRAME = 'showframe';

const makeTree = () => {
  const instructions = [];

  const scaledBranch = () => {
    instructions.push({type: PUSH});
    instructions.push({type: TRANSFORM, transform: `scale(${Math.random() * 0.4 + 0.4})`});
    instructions.push({type: TRANSFORM, transform: `rotate(${Math.random() * 80 - 40})`});
    branch();
    instructions.push({type: POP});
  };

  const subBranches = () => {
    scaledBranch();
    if (Math.random() > 0.7) {
      subBranches();
    }
  };

  const branch = () => {
    instructions.push(
      {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
      {type: TRANSFORM, transform: 'translate(0, -50)'},
      {type: CIRCLE, x: 0, y: 0, r: 20}
    );

    if (Math.random() > 0.3) {
      subBranches();
    }
  };

  const tree = () => {
    instructions.push({type: TRANSFORM, transform: 'translate(0, 50)'});
    instructions.push({type: TRANSFORM, transform: `scale(0.8)`});
    branch();
  };

  tree();

  return instructions;
};

const getStyle = (color) => `stroke: ${color}; stroke-width: 1; fill: none; vector-effect: non-scaling-stroke`;

const evaluate = (instructions) => {
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', 100);
  svg.setAttribute('height', 100);
  svg.setAttribute('style', 'background-color: #FFF');

  let currentGroup = document.createElementNS(ns, 'g');
  currentGroup.setAttribute('transform', 'translate(50 50)');
  svg.appendChild(currentGroup);

  const stack = [];

  const handleInstruction = (instruction) => {
    if (instruction.type === LINE) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('style', getStyle('#000'));
      line.setAttribute('x1', instruction.from.x);
      line.setAttribute('y1', instruction.from.y);
      line.setAttribute('x2', instruction.to.x);
      line.setAttribute('y2', instruction.to.y);

      currentGroup.appendChild(line);

    } else if (instruction.type === CIRCLE) {
      const circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('style', getStyle('#000'));
      circle.setAttribute('cx', instruction.x);
      circle.setAttribute('cy', instruction.y);
      circle.setAttribute('r', instruction.r);

      currentGroup.appendChild(circle);

    } else if (instruction.type === TRANSFORM) {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('transform', instruction.transform);
      currentGroup.appendChild(g);
      currentGroup = g;

    } else if (instruction.type === SHOWFRAME) {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('style', getStyle('#F00'));
      path.setAttribute('d', 'M-50,-50L-50,50L50,50L50,-50Z M-5,0L5,0 M0,-5L0,5');

      currentGroup.appendChild(path);

    } else if (instruction.type === POP) {
      currentGroup = stack.pop();

    } else if (instruction.type === PUSH) {
      stack.push(currentGroup);

    } else if (instruction.type === RULE) {
      instruction.commands.forEach(handleInstruction);
    }
  }

  instructions.forEach(handleInstruction);

  return svg;
};

const display = (instruction) => {
  if (instruction.type === LINE) {
    return `lineTo(` +
      `${instruction.to.x}, ${instruction.to.y})`;
  } else if (instruction.type === CIRCLE) {
    return `circle(${instruction.r})`;
  } else if (instruction.type === TRANSFORM) {
    return instruction.transform;
  } else if (instruction.type === PUSH) {
    return '[';
  } else if (instruction.type === POP) {
    return ']';
  } else if (instruction.type === RULE) {
    return instruction.name;
  }
  return '';
}

const row = (examples) => {
  const table = document.createElement('table');

  let images = document.createElement('tr');
  table.appendChild(images);

  examples.forEach((example) => {
    const td = document.createElement('td');
    td.appendChild(example);
    images.appendChild(td);
  });

  document.body.appendChild(table);
};

const showSteps = (lineLength, instructions) => {
  const table = document.createElement('table');

  let images = document.createElement('tr');
  table.appendChild(images);

  let captions = document.createElement('tr');
  table.appendChild(captions);

  let offset = 0;

  const newRow = () => {
    images = document.createElement('tr');
    table.appendChild(images);

    captions = document.createElement('tr');
    table.appendChild(captions);

    for (let i = 0; i < offset; i++) {
      images.appendChild(document.createElement('td'));
      captions.appendChild(document.createElement('td'));
    }
  };

  instructions.forEach((instruction, i) => {
    if (images.childElementCount === lineLength || instruction.type === PUSH) {
      newRow();
    }

    const td = document.createElement('td');
    td.appendChild(evaluate([
      ...instructions.slice(0, i+1),
      {type: SHOWFRAME}
    ]));
    images.appendChild(td);

    const th = document.createElement('th');
    th.innerText = display(instruction);
    captions.appendChild(th);

    if (instruction.type === PUSH || instruction.type === POP) {
      if (instruction.type === PUSH) {
        offset++;
      } else {
        offset--;
      }
    }
  });

  document.body.appendChild(table);
};

showSteps(4, [
  {type: TRANSFORM, transform: 'translate(0, 50)'},
  {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
  {type: TRANSFORM, transform: 'translate(0 -50)'},
  {type: CIRCLE, x: 0, y: 0, r: 20},
]);

showSteps(4, [
  {type: TRANSFORM, transform: 'translate(0, 50)'},
  {type: RULE, name: 'BRANCH', commands: [
    {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
    {type: TRANSFORM, transform: 'translate(0, -50)'},
    {type: CIRCLE, x: 0, y: 0, r: 20},
  ]},
  {type: TRANSFORM, transform: 'scale(0.5)'},

  {type: RULE, name: 'BRANCH', commands: [
    {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
    {type: TRANSFORM, transform: 'translate(0, -50)'},
    {type: CIRCLE, x: 0, y: 0, r: 20},
  ]},
  {type: TRANSFORM, transform: 'scale(0.5)'},

  {type: RULE, name: 'BRANCH', commands: [
    {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
    {type: TRANSFORM, transform: 'translate(0, -50)'},
    {type: CIRCLE, x: 0, y: 0, r: 20},
  ]},
  {type: TRANSFORM, transform: 'scale(0.5)'},

  {type: RULE, name: 'BRANCH', commands: [
    {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
    {type: TRANSFORM, transform: 'translate(0, -50)'},
    {type: CIRCLE, x: 0, y: 0, r: 20},
  ]},
]);

showSteps(Infinity, [
  {type: TRANSFORM, transform: 'translate(0, 50)'},
  {type: RULE, name: 'BRANCH', commands: [
    {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
    {type: TRANSFORM, transform: 'translate(0, -50)'},
    {type: CIRCLE, x: 0, y: 0, r: 20},
  ]},
  {type: TRANSFORM, transform: 'scale(0.5)'},

  {type: PUSH},
    {type: TRANSFORM, transform: 'rotate(-30)'},
    {type: RULE, name: 'BRANCH', commands: [
      {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
      {type: TRANSFORM, transform: 'translate(0, -50)'},
      {type: CIRCLE, x: 0, y: 0, r: 20},
    ]},
    {type: TRANSFORM, transform: 'scale(0.5)'},

    {type: PUSH},
      {type: TRANSFORM, transform: 'rotate(-30)'},
      {type: RULE, name: 'BRANCH', commands: [
        {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
        {type: TRANSFORM, transform: 'translate(0, -50)'},
        {type: CIRCLE, x: 0, y: 0, r: 20},
      ]},
    {type: POP},

    {type: PUSH},
      {type: TRANSFORM, transform: 'rotate(30)'},
      {type: RULE, name: 'BRANCH', commands: [
        {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
        {type: TRANSFORM, transform: 'translate(0, -50)'},
        {type: CIRCLE, x: 0, y: 0, r: 20},
      ]},
    {type: POP},
  {type: POP},

  {type: PUSH},
    {type: TRANSFORM, transform: 'rotate(30)'},
    {type: RULE, name: 'BRANCH', commands: [
      {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
      {type: TRANSFORM, transform: 'translate(0, -50)'},
      {type: CIRCLE, x: 0, y: 0, r: 20},
    ]},
    {type: TRANSFORM, transform: 'scale(0.5)'},

    {type: PUSH},
      {type: TRANSFORM, transform: 'rotate(-30)'},
      {type: RULE, name: 'BRANCH', commands: [
        {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
        {type: TRANSFORM, transform: 'translate(0, -50)'},
        {type: CIRCLE, x: 0, y: 0, r: 20},
      ]},
    {type: POP},

    {type: PUSH},
      {type: TRANSFORM, transform: 'rotate(30)'},
      {type: RULE, name: 'BRANCH', commands: [
        {type: LINE, from: {x: 0, y: 0}, to: {x: 0, y: -50}},
        {type: TRANSFORM, transform: 'translate(0, -50)'},
        {type: CIRCLE, x: 0, y: 0, r: 20},
      ]},
    {type: POP},
  {type: POP},
]);

row([
  evaluate(makeTree()),
  evaluate(makeTree()),
  evaluate(makeTree()),
  evaluate(makeTree()),
]);
