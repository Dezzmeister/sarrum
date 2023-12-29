import {arrCmp} from "../util";
import {basicSearch, englSearch, levSearch} from "./search";
import {getDictText, getSections, setSections} from "../cache";

type StrMap = {
	[key: string]: string;
};

export type GrammarKind = keyof typeof GrammarKinds;
export type WordAttr = keyof typeof WordAttrs;
export type WordRelationKind = keyof typeof WordRelationKinds;
export type UserWordRelationKind = keyof typeof UserWordRelationKinds;

export const GrammarKinds = {
	Noun: "n",
	Pronoun: "pr",
	AnaphoricPronoun: "apr",
	Adjective: "adj",
	Article: "art",
	Conjunction: "conj",
	Preposition: "prep",
	Verb: "v",
	Adverb: "adv",
} as const;

export const WordAttrs = {
	Masculine: "m",
	Feminine: "f",
	Singular: "s",
	Dual: "dual",
	Plural: "pl",
	Nominative: "nom",
	Infinitive: "inf",
	GStem: "G",
	Idiom: "id",
	IWeak: "1w",
	IIWeak: "2w",
	IIIWeak: "3w",
} as const;

/**
 * Word relations that can be set in the dictionary. Their inverses will be set when the dictionary
 * is parsed.
 */
export const UserWordRelationKinds = {
	PreteriteOf: "pret",
	VerbalAdjOf: "va",
	SubstOf: "subst",
	BoundFormOf: "bf",
	GenitiveOf: "gen",
	AccusativeOf: "acc",
	DativeOf: "dat",
	Base: "base",
} as const;

export const WordRelationKinds = {
	...UserWordRelationKinds,
	HasPreterite: undefined,
	HasSubst: undefined,
	HasVerbalAdj: undefined,
	HasBoundForm: undefined,
	HasGenitive: undefined,
	HasAccusative: undefined,
	HasDative: undefined,
} as const;

export const RELATION_NAMES: {
	[kind in WordRelationKind]: string;
} = {
	PreteriteOf: "Preterite of",
	VerbalAdjOf: "Verbal Adj. of",
	SubstOf: "Substantivized N. of",
	BoundFormOf: "Bound Form of",
	GenitiveOf: "Gen. of",
	AccusativeOf: "Acc. of",
	DativeOf: "Dative of",
	Base: "Base",
	HasPreterite: "Preterite",
	HasSubst: "Substantivized",
	HasVerbalAdj: "Verbal Adj.",
	HasBoundForm: "Bound Form",
	HasGenitive: "Gen.",
	HasAccusative: "Acc.",
	HasDative: "Dative",
};

// If a line in the dictionary does not start with one of these chars, it will
// be ignored. This allows me to add new features to the dictionary file format without breaking
// parsing for old versions of the app.
const WHITELISTED_ROW_LEADERS = [
    "a", "b", "d", "e", "g", "i", "k", "l",
    "m", "n", "p", "q", "r", "s", "t", "u", "w",
    "y", "z", "š", "ṣ", "ṭ", "ẖ", "ā", "â", "ē",
    "ê", "ī", "î", "ū", "û", "§"
];

export class WordRelation {
	readonly kind: WordRelationKind;
	readonly word: string;

	constructor(kind: WordRelationKind, word: string) {
		this.kind = kind;
		this.word = word;
	}

	static cmp(rel1: WordRelation, rel2: WordRelation): number {
		return rel1.kind.localeCompare(rel2.kind);
	}

	static equ(rel1: WordRelation, rel2: WordRelation): boolean {
		return rel1.kind === rel2.kind && rel1.word === rel2.word;
	}
}

export class DictEntry {
	readonly wordAttrs: WordAttr[];
	readonly defns: string[];
	readonly grammarKind: GrammarKind;
    readonly sectionNum: number;
	relations: WordRelation[];

	constructor(wordAttrs: WordAttr[], defns: string[], grammarKind: GrammarKind, sectionNum: number, relations: WordRelation[] = []) {
		this.wordAttrs = wordAttrs;
		this.defns = defns;
		this.grammarKind = grammarKind;
        this.sectionNum = sectionNum;
		this.relations = relations;

		this.wordAttrs.sort();
		this.relations.sort(WordRelation.cmp);
	}

    copy(): DictEntry {
        return new DictEntry(this.wordAttrs, this.defns, this.grammarKind, this.sectionNum, [...this.relations]);
    }

	addRelation(rel: WordRelation): void {
		for (const relation of this.relations) {
			if (relation.kind === rel.kind && relation.word === rel.word) {
				return;
			}
		}

		this.relations.push(rel);
	}

	hasWordAttrs(attrs: WordAttr[]): boolean {
		return sortedAllIn(this.wordAttrs, attrs);
	}

	hasRelKinds(kinds: WordRelationKind[]): boolean {
		return sortedAllIn(
			this.relations.map(r => r.kind),
			kinds,
		);
	}

	hasDefn(defn: string): boolean {
		return this.defns.includes(defn);
	}

	canMerge(other: DictEntry): boolean {
		this.relations.sort(WordRelation.cmp);
		other.relations.sort(WordRelation.cmp);

		return (
			this.grammarKind === other.grammarKind &&
			arrCmp(this.wordAttrs, other.wordAttrs) &&
			relationArrCmp(this.relations, other.relations)
		);
	}

	merge(other: DictEntry): DictEntry {
		const defns = dedup([...this.defns, ...other.defns], (t, v) => t.localeCompare(v));
		const rels = dedup([...this.relations, ...other.relations], WordRelation.cmp, WordRelation.equ);

		return new DictEntry(this.wordAttrs, defns, this.grammarKind, this.sectionNum, rels);
	}
}

type DictEntries = {
	[key: string]: DictEntry[];
};

// Section metadata
export type Section = {
    num: number;
    name: string;
    size: number;
};

export class Dictionary {
	readonly englToAkk: DictEntries;
	readonly akkToEngl: DictEntries;
	readonly englKeys: string[];
	readonly akkKeys: string[];
	readonly totalLines: number;
    readonly sections: Section[];

	private constructor(
		englToAkk: DictEntries,
		akkToEngl: DictEntries,
		englKeys: string[],
		akkKeys: string[],
		totalLines: number,
        sections: Section[],
	) {
		this.englToAkk = englToAkk;
		this.akkToEngl = akkToEngl;
		this.englKeys = englKeys;
		this.akkKeys = akkKeys;
		this.totalLines = totalLines;
        this.sections = sections;
	}

	getDefn(word: string, engl: boolean): DictEntry[] {
		if (engl) {
			return this.englToAkk[word];
		}

		return this.akkToEngl[word];
	}

	search(query: string, limit: number, cutoff: number, engl: boolean): string[] {
		if (engl) {
			return englSearch(this, query, limit);
		}

		if (query.length <= cutoff) {
			return basicSearch(this, query, limit);
		}

		return levSearch(this, query, limit, cutoff);
	}

	randomEntry(engl: boolean): [string, DictEntry] {
		const keys = engl ? this.englKeys : this.akkKeys;
		const dict = engl ? this.englToAkk : this.akkToEngl;

		const word = keys[Math.floor(Math.random() * keys.length)];
		const entries = dict[word];
		const entry = entries[Math.floor(Math.random() * entries.length)];

		return [word, entry];
	}

    /**
     * Creates a dictionary with only the specified sections. If `sections` is undefined, all
     * sections are included.
     */
    withSections(sections?: number[]): Dictionary {
        if (!sections || arrEq(sections, this.sections.map(s => s.num))) {
            return this;
        }

        const newEnglKeys: string[] = [];
        const newAkkKeys: string[] = [];
        const newEnglToAkk: DictEntries = {};
        const newAkkToEngl: DictEntries = {};

        for (const akkWord of this.akkKeys) {
            const defns = this.akkToEngl[akkWord];
            const newDefns: DictEntry[] = [];

            for (const defn of defns) {
                if (sections.includes(defn.sectionNum)) {
                    newDefns.push(defn.copy());
                }
            }

            if (newDefns.length) {
                newAkkKeys.push(akkWord);
                newAkkToEngl[akkWord] = newDefns;
            }
        }

        for (const englWord of this.englKeys) {
            const defns = this.englToAkk[englWord];
            const newDefns: DictEntry[] = [];

            for (const defn of defns) {
                if (sections.includes(defn.sectionNum)) {
                    newDefns.push(defn.copy());
                }
            }

            if (newDefns.length) {
                newEnglKeys.push(englWord);
                newEnglToAkk[englWord] = newDefns;
            }
        }

        const newSections = this.sections.filter(s => sections.includes(s.num));

        return new Dictionary(newEnglToAkk, newAkkToEngl, newEnglKeys, newAkkKeys, this.totalLines, newSections);
    }

	/**
	 * Creates a dictionary from the dictionary URL or the cache.
	 */
	static async create(): Promise<Dictionary | undefined> {
		const rawDictText = await getDictText();

		if (rawDictText === undefined) {
			return undefined;
		}

		console.log(`Dictionary v${rawDictText.version} obtained by '${rawDictText.method}' method`);

		const rawText = rawDictText.text;

		const rows = rawText.replace("\r", "").trim().split("\n");
		const unresolvedRels: [string, GrammarKind, WordRelation[]][] = [];

		const englToAkk: DictEntries = {};
		const akkToEngl: DictEntries = {};
		const englKeys: string[] = [];
		const akkKeys: string[] = [];
        const sections: Section[] = [];

		let lineNum = 1;
        // Default section. Any definitions that are not in a named section will be in
        // the default section.
        let currentSectionNum = 0;

		const totalLines = rows.length;

		for (let row of rows) {
            row = row.trim();

            if (!row.length) {
                lineNum++;
                continue;
            }

            if (!WHITELISTED_ROW_LEADERS.includes(row[0])) {
                console.log(`Unprocessable line (${lineNum}): ${row}`);
                lineNum++;
                continue;
            }

            if (row.startsWith("§")) {
                const parts = row.match(/^§(\d+)\s+(.+)$/);

                if (!parts || !parts[1] || !parts[2]) {
                    console.log(`Invalid section header: line ${lineNum}`);
                    return undefined;
                }

                const sectionNum = Number(parts[1]);
                const sectionName = parts[2];

                if (!sectionName || Number.isNaN(sectionNum)) {
                    console.log(`Invalid section header: line ${lineNum}`);
                    return undefined;
                }

                currentSectionNum = sectionNum;
                sections.push({
                    num: sectionNum,
                    name: sectionName,
                    size: 0,
                });

                lineNum++;
                continue;
            }

			const fields = row.split(",");

			if (fields.length < 3 || fields.length > 4) {
				console.log(`Less than 3 or more than 4 fields: line ${lineNum}`);
				return undefined;
			}

			const [akkWord, fullEnglDefn, grammarKindVal, rawAttrs] = fields;

			if (!isValOf(GrammarKinds, grammarKindVal)) {
				console.log(`Invalid grammar kind: ${grammarKindVal}`);
				return undefined;
			}

			const defns = fullEnglDefn.split(";");
			const grammarKind = keyFromVal(GrammarKinds, grammarKindVal) as GrammarKind;
			let attrs: [WordAttr[], WordRelation[]] | undefined = [[], []];

			if (fields.length > 3) {
				attrs = parseWordAttrs(rawAttrs);

				if (!attrs) {
					console.log(`Invalid attrs: ${rawAttrs}`);
					return undefined;
				}

				attrs[0].sort();
				unresolvedRels.push([akkWord, grammarKind, attrs[1]]);
			}

			const akkEntry = new DictEntry(attrs[0], defns, grammarKind, currentSectionNum, attrs[1]);
			Dictionary.insertDefn(akkToEngl, akkKeys, akkWord, akkEntry);

            if (sections.length) {
                sections[sections.length - 1].size++;
            }

			for (const engl of defns) {
				const englEntry = new DictEntry(attrs[0], [akkWord], grammarKind, currentSectionNum, attrs[1]);
				Dictionary.insertDefn(englToAkk, englKeys, engl, englEntry);
			}

			lineNum++;
		}

		for (const [word, grammarKind, rels] of unresolvedRels) {
			Dictionary.resolveRelations(akkToEngl, word, grammarKind, rels);
		}

		akkKeys.sort();
		englKeys.sort();

		console.log(
			`Read ${lineNum - 1} lines, ${sections.length} sections, ${akkKeys.length} Akkadian entries, and ${englKeys.length} English entries`,
		);
 
        if (!sections.length) {
            sections.push({
                num: 0,
                name: "Akkadian-English Dictionary",
                size: lineNum - 1,
            });
        }

		return new Dictionary(englToAkk, akkToEngl, englKeys, akkKeys, lineNum - 1, sections);
	}

	static insertDefn(dict: DictEntries, keys: string[], word: string, entry: DictEntry): void {
		if (!dict[word]) {
			dict[word] = [entry];
			keys.push(word);
			return;
		}

		const existingDefns = dict[word];

		for (let i = 0; i < existingDefns.length; i++) {
			if (entry.canMerge(existingDefns[i])) {
				const merged = existingDefns[i].merge(entry);
				existingDefns[i] = merged;
				return;
			}
		}

		existingDefns.push(entry);
	}

	static resolveRelations(dict: DictEntries, word: string, grammarKind: GrammarKind, rels: WordRelation[]): void {
		for (let i = 0; i < rels.length; i++) {
			const rel = rels[i];

			switch (rel.kind) {
				case "PreteriteOf": {
					const entry = Dictionary.getAkkFilters(dict, rel.word, ["Verb"], ["Infinitive"]);

					if (entry) {
						entry.addRelation(new WordRelation("HasPreterite", word));
					} else {
						console.log(`Unknown infinitive mapped by preterite: ${rel.word}`);
					}

					break;
				}
				case "VerbalAdjOf": {
					const entry = Dictionary.getAkkFilters(dict, rel.word, ["Verb"], ["Infinitive"]);

					if (entry) {
						entry.addRelation(new WordRelation("HasVerbalAdj", word));
					} else {
						console.log(`Unknown infinitive mapped by verbal adj: ${rel.word}`);
					}

					break;
				}
				case "SubstOf": {
					const entry = Dictionary.getAkkFilters(dict, rel.word, ["Adjective"], []);

					if (entry) {
						entry.addRelation(new WordRelation("HasSubst", word));
					} else {
						console.log(`Unknown adjective mapped by substantivized noun: ${rel.word}`);
					}

					break;
				}
				case "BoundFormOf": {
					const nounEntry = Dictionary.getAkkFilters(dict, rel.word, [grammarKind], []);
					const verbEntry = Dictionary.getAkkFilters(dict, rel.word, ["Verb"], ["Infinitive"]);

					if (nounEntry) {
						nounEntry.addRelation(new WordRelation("HasBoundForm", word));
					} else if (verbEntry) {
						verbEntry.addRelation(new WordRelation("HasBoundForm", word));
					} else {
						console.log(`Unknown n/adj/v mapped by bound form: ${rel.word}`);
					}

					break;
				}
				case "GenitiveOf": {
					const entry = Dictionary.getAkkFilters(dict, rel.word, [grammarKind], ["Nominative"]);

					if (entry) {
						entry.addRelation(new WordRelation("HasGenitive", word));
					} else {
						console.log(`Unknown n/adj/pr mapped by genitive case: ${rel.word}`);
					}

					break;
				}
				case "AccusativeOf": {
					const entry = Dictionary.getAkkFilters(dict, rel.word, [grammarKind], ["Nominative"]);

					if (entry) {
						entry.addRelation(new WordRelation("HasAccusative", word));
					} else {
						console.log(`Unknown n/adj/pr mapped by accusative case: ${rel.word}`);
					}

					break;
				}
				case "DativeOf": {
					const entry = Dictionary.getAkkFilters(dict, rel.word, [grammarKind], ["Nominative"]);

					if (entry) {
						entry.addRelation(new WordRelation("HasDative", word));
					} else {
						console.log(`Unknown n/adj/pr mapped by dative case: ${rel.word}`);
					}

					break;
				}
			}
		}
	}

	static getAkkFilters(
		dict: DictEntries,
		word: string,
		kinds: GrammarKind[],
		attrs: WordAttr[],
	): DictEntry | undefined {
		if (!dict[word]) {
			return undefined;
		}

		const entries = dict[word];

		for (let i = 0; i < entries.length; i++) {
			if (kinds.includes(entries[i].grammarKind) && entries[i].hasWordAttrs(attrs)) {
				return entries[i];
			}
		}

		return undefined;
	}
}

function arrEq<T>(xs: T[], ys: T[]): boolean {
    if (xs.length !== ys.length) {
        return false;
    }

    const sortedXs = [...xs];
    const sortedYs = [...ys];
    sortedXs.sort();
    sortedYs.sort();

    for (let i = 0; i < xs.length; i++) {
        if (sortedXs[i] !== sortedYs[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if all items in 'test' are also in 'ts'. Both arrays must be sorted!
 */
export function sortedAllIn<T>(ts: T[], test: T[]): boolean {
	let testIndex = 0;

	if (test.length === 0) {
		return true;
	}

	for (const t of ts) {
		// TODO: Use greater-than check to exit early
		if (t === test[testIndex]) {
			testIndex++;

			if (testIndex === test.length) {
				return true;
			}
		}
	}

	return false;
}

export function keyFromVal<T extends StrMap>(map: T, val: string): keyof T | undefined {
	for (const key in map) {
		if (map[key] === val) {
			return key;
		}
	}

	return undefined;
}

function parseWordAttrs(str: string): [WordAttr[], WordRelation[]] | undefined {
	const tokens = str.split(";");
	const attrs: WordAttr[] = [];
	const rels: WordRelation[] = [];

	for (const token of tokens) {
		const lpos = token.indexOf("(");

		if (lpos === -1) {
			if (!isValOf(WordAttrs, token)) {
				console.log(`Not a word attr: ${token}`);
				return undefined;
			}

			const attr = keyFromVal(WordAttrs, token) as WordAttr;
			attrs.push(attr);
		} else {
			const rpos = token.indexOf(")");

			if (rpos === -1) {
				return undefined;
			}

			const relName = token.substring(0, lpos);
			const relTarget = token.substring(lpos + 1, rpos);

			if (!isValOf(UserWordRelationKinds, relName)) {
				return undefined;
			}

			const relKind = keyFromVal(UserWordRelationKinds, relName) as WordRelationKind;
			rels.push(new WordRelation(relKind, relTarget));
		}
	}

	return [attrs, rels];
}

function isValOf<T extends StrMap>(map: T, str: string): str is T[keyof T] {
	return keyFromVal(map, str) !== undefined;
}

/**
 * Checks if both relation arrays are compatible. For example, if both words
 * are a genitive of something, or if they are substantivized nouns, etc. The target
 * word of the corresponding relations does not have to match.
 */
function relationArrCmp(xs: WordRelation[], ys: WordRelation[]): boolean {
	if (xs.length !== ys.length) {
		return false;
	}

	for (let i = 0; i < xs.length; i++) {
		const x = xs[i];
		const y = ys[i];

		if (x.kind !== y.kind) {
			return false;
		}
	}

	return true;
}

function dedup<T>(ts: T[], cmpFunc: (t: T, v: T) => number, equFunc = (t: T, v: T) => cmpFunc(t, v) === 0): T[] {
	const sorted = [...ts];
	sorted.sort(cmpFunc);

	for (let i = sorted.length - 1; i > 0; i--) {
		const t = sorted[i];
		const v = sorted[i - 1];

		if (equFunc(t, v)) {
			sorted.splice(i, 1);
		}
	}

	return sorted;
}
