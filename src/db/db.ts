import Dexie, { type EntityTable } from 'dexie';

interface IMoment {
	momentId: number;
	name: string;
	attr: string;
	order: number;
	locations: number[];
	characters: number[];
	themes: number[];
}

interface ILocation {
	locationId: number;
	name: string;
	attr: string;
}

interface ICharacter {
	characterId: number;
	name: string;
	attr: string;
}

interface ITheme {
	themeId: number;
	name: string;
	attr: string;
}

const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<IMoment, 'momentId'>;
	locations: EntityTable<ILocation, 'locationId'>;
	characters: EntityTable<ICharacter, 'characterId'>;
	themes: EntityTable<ITheme, 'themeId'>;
};

db.version(1).stores({
	moments: '++momentId, name, order, *locations, *characters, *themes',
	locations: '++locationId, name',
	characters: '++characterId, name',
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
