// export const prerender = false;

import { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => [
	{ elem_index_name: 'moments' },
	{ elem_index_name: 'themes' },
	{ elem_index_name: 'characters' },
	{ elem_index_name: 'character-dynamics' },
	{ elem_index_name: 'locations' }
];
