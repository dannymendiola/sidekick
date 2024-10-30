import Dexie, { type EntityTable } from 'dexie';

interface IMoment {
	momentId: number;
	title: string;
	body: string;
	attr: string;
}

const db = new Dexie('sidekick') as Dexie & {
	moments: EntityTable<IMoment, 'momentId'>;
};

// db.version(1).stores
db.version(1).stores({
	// only indexed columns are specified here
	moments: '++momentId, title'
});

class Moment {}

export { db };
