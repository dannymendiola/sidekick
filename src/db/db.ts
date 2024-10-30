import Dexie, { type EntityTable, type PromiseExtended } from 'dexie';

// interface IMoment {
// 	id: number;
// 	name: string;
// 	attr: string;
// 	order: number;
// 	locations: number[];
// 	characters: number[];
// 	themes: number[];
// }

// interface ILocation {
// 	id: number;
// 	name: string;
// 	attr: string;
// }

// interface ICharacter {
// 	id: number;
// 	name: string;
// 	attr: string;
// }

// interface ICharacterRelationship {
// 	id: number;
// 	aCharId: number;
// 	bCharId: number;
// 	attr: string;
// }

// interface ITheme {
// 	id: number;
// 	name: string;
// 	attr: string;
// }

const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<Moment, 'id'>;
	locations: EntityTable<Location, 'id'>;
	characters: EntityTable<Character, 'id'>;
	character_relationships: EntityTable<CharacterRelationship, 'id'>;
	themes: EntityTable<Theme, 'id'>;
};

db.version(1).stores({
	moments: '++id, name, order, *locations, *characters, *themes',
	locations: '++id, name',
	characters: '++id, name',
	character_relationships: '++id, &[aCharId+bCharId], aCharId, bCharId',
	themes: '++id, name'
});

class Moment {
	id!: number;
	name?: string;
	attr?: string;
	order?: number;
	locations?: number[];
	characters?: number[];
	themes?: number[];
}

db.moments.mapToClass(Moment);

class Location {
	id!: number;
	name?: string;
	attr?: string;

	test() {
		console.log('hello hello');
	}
}

db.locations.mapToClass(Location);

class Character {
	id!: number;
	name?: string;
	attr?: string;

	relationships(): PromiseExtended<CharacterRelationship[]> {
		return db.character_relationships.where('[aCharId+bCharId]').anyOf([this.id]).toArray();
	}

	async relatedCharacters(): Promise<Character[]> {
		const relationships = await this.relationships();
		const otherIds = relationships.map((r) => (r.aCharId === this.id ? r.bCharId : r.aCharId));
		return db.characters.where('id').anyOf(otherIds).toArray();
	}
}

db.characters.mapToClass(Character);

class CharacterRelationship {
	id!: number;
	aCharId!: number;
	bCharId!: number;
	attr?: string;

	getCharacters(): Promise<[Character | undefined, Character | undefined]> {
		return Promise.all([db.characters.get(this.aCharId), db.characters.get(this.bCharId)]);
	}
}

db.character_relationships.mapToClass(CharacterRelationship);

class Theme {
	id!: number;
	name?: string;
	attr?: string;
}

db.themes.mapToClass(Theme);

const a = async () => {
	const l = await db.locations.get(3);
	if (!l) return;
	console.log(l);
	l.test();
	console.log(l.id);
	console.log(JSON.parse(l.attr || '{}'));
};
a();

export { db };
