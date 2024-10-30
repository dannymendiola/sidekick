import Dexie, { type EntityTable } from 'dexie';

interface IMoment {
	id: number;
	name: string;
	attr: string;
	order: number;
	locations: number[];
	characters: number[];
	themes: number[];
}

interface ILocation {
	id: number;
	name: string;
	attr: string;
}

interface ICharacter {
	id: number;
	name: string;
	attr: string;
}

interface IChararacterRelationship {
	id: number;
	charAId: number;
	charBId: number;
	attr: string;
}

interface ITheme {
	id: number;
	name: string;
	attr: string;
}

const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<IMoment, 'id'>;
	locations: EntityTable<ILocation, 'id'>;
	characters: EntityTable<ICharacter, 'id'>;
	character_relationships: EntityTable<IChararacterRelationship, 'id'>;
	themes: EntityTable<ITheme, 'id'>;
};

db.version(1).stores({
	moments: '++momentId, name, order, *locations, *characters, *themes',
	locations: '++locationId, name',
	characters: '++characterId, name',
	character_relationships: '++id, &[aId+bId], aId, bId',
	themes: '++themeId, name'
});

class Moment {
	momentId!: number;
	name!: string;
	attr?: string;
	order!: number;
	locations?: number[];
	characters?: number[];
	themes?: number[];

	// TODO
}

db.moments.mapToClass(Moment);

export { db };
