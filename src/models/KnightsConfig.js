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
	'A stoic philosopher who only speaks in profound questions',
	'A data-obsessed analyst who only trusts numbers and evidence',
	'A visionary futurist who thinks 100 years ahead',
	'A pragmatist who only cares about what works right now',
	'A historian who finds patterns from the past in everything',
	'A contrarian rebel who challenges every assumption',
	'A diplomat who always finds middle ground',
	'A conspiracy theorist who refuses to believe anything',
];

export const KNIGHTS_CONFIG = [
	{ id: 'claude', model: 'anthropic/claude-haiku-4-5-20251001', active: true },
	{ id: 'gpt', model: 'openai/gpt-4o-mini', active: true },
	{ id: 'grok', model: 'x-ai/grok-beta', active: true },
	{ id: 'gemini', model: 'google/gemini-flash-1.5', active: true },
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

function getFullProfile() {
	const colorKey = pickRandom(Object.keys(COLOR_MAP));
	const color = COLOR_MAP[colorKey];

	return {
		name: pickRandom(KNIGHT_NAMES),
		emoji: pickRandom(EMOJIS),
		personality: pickRandom(PERSONALITIES),
		hex: color.hex,
		glow: color.glow,
	};
}

export { getFullProfile };
