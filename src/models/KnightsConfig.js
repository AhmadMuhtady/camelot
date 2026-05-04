const EMOJIS = ['🧠', '⚡', '🔥', '✨', '🌊', '🎯', '🔮', '⚔️', '🛡️', '🌌'];
const COLOR_MAP = {
	red: { hex: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
	blue: { hex: '#3b82f6', glow: 'rgba(59,130,246,0.4)' },
	green: { hex: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
	yellow: { hex: '#eab308', glow: 'rgba(234,179,8,0.4)' },
	purple: { hex: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
	pink: { hex: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
	cyan: { hex: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
};

const PERSONALITIES = [
	"A ruthless devil's advocate who argues the opposite of everything",
	'A brutal critic who dismantles every argument with sharp precision',
	'A cynical pessimist who believes most ideas are doomed to fail',
	'An arrogant genius who assumes everyone else is wrong',
	'A contrarian rebel who challenges every assumption',

	'A data-obsessed analyst who only trusts numbers and evidence',
	'A hyper-logical AI that rejects emotions entirely',
	'A systems thinker who breaks everything into cause and effect',
	'A scientist who demands proof before accepting anything',
	'A strategist who thinks 10 steps ahead in every argument',

	'A stoic philosopher who only speaks in profound questions',
	'An existential thinker who questions the meaning behind everything',
	'A moral philosopher focused on ethics and consequences',
	'A wise monk who values balance and inner truth',
	'A nihilist who believes nothing truly matters',

	'A historian who finds patterns from the past in everything',
	'A visionary futurist who thinks 100 years ahead',
	'A realist who focuses only on current facts and limitations',
	'A global thinker who considers worldwide impact',
	'A cultural critic who analyzes societal behavior',

	'A diplomat who always finds middle ground',
	'An empathetic listener who prioritizes human impact',
	'A mediator who resolves conflicts between all sides',
	'A teacher who explains ideas in the simplest way possible',
	'A psychologist who analyzes motivations and behavior',

	'A conspiracy theorist who refuses to believe anything',
	'A chaotic troll who intentionally provokes others',
	'A comedian who turns every argument into satire',
	'A storyteller who explains everything through analogies',
	'A street-smart hustler who thinks in real-world survival terms',

	'A pragmatist who only cares about what works right now',
	'A risk-taker who always pushes for bold moves',
	'A cautious planner who avoids all unnecessary risks',
	'A leader who focuses on decisive action',
	'A judge who evaluates arguments and declares winners',
];

export const KNIGHTS_CONFIG = [
	// Default active council (4)
	{ id: 'gemini', model: 'google/gemini-flash-1.5:free', active: true },
	{ id: 'deepseek', model: 'deepseek/deepseek-v3:free', active: true },
	{ id: 'llama', model: 'meta-llama/llama-3.3-70b:free', active: true },
	{ id: 'mistral', model: 'mistralai/mistral-7b:free', active: true },

	// Available to add via FAB panel
	{ id: 'qwen', model: 'qwen/qwen-72b:free', active: false },
	{
		id: 'nemotron',
		model: 'nvidia/llama-3.1-nemotron-70b:free',
		active: false,
	},
	{ id: 'phi', model: 'microsoft/phi-4:free', active: false },
];

const KNIGHT_NAMES = [
	'Sir Lancelot',
	'Sir Gawain',
	'Sir Percival',
	'Sir Galahad',
	'Sir Tristan',
	'Sir Bedivere',
	'Sir Bors',
	'Sir Lamorak',
	'Sir Kay',
	'Sir Gareth',
	'Sir Geraint',
	'Sir Palamedes',
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const usedNames = new Set();

function getFullProfile() {
	const colorKey = pickRandom(Object.keys(COLOR_MAP));
	const color = COLOR_MAP[colorKey];

	// Pick unique name
	const available = KNIGHT_NAMES.filter((n) => !usedNames.has(n));
	const name = pickRandom(available.length ? available : KNIGHT_NAMES);
	usedNames.add(name);

	return {
		name,
		emoji: pickRandom(EMOJIS),
		personality: pickRandom(PERSONALITIES),
		hex: color.hex,
		glow: color.glow,
	};
}

export { getFullProfile };
