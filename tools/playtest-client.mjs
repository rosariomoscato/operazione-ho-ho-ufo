const [type = 'snapshot', ...args] = process.argv.slice(2);
const command = { type };
if (type === 'button') command.name = args.join(' ');
if (type === 'key') { command.key = args[0]; if (args[1]) command.duration = Number(args[1]); }
if (type === 'click') { command.x = Number(args[0]); command.y = Number(args[1]); command.button = args[2] ?? 'left'; }
if (type === 'drag') { command.dx = Number(args[0]); command.dy = Number(args[1] ?? 0); }
if (type === 'wait') command.duration = Number(args[0]);
const response = await fetch('http://127.0.0.1:5190/action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(command) });
const result = await response.json(); console.log(JSON.stringify(result, null, 2));
if (!response.ok) process.exitCode = 1;
