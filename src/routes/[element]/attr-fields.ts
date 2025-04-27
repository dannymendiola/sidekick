import { CharacterAttr, LocationAttr, SectionAttr, DynamicAttr } from '$lib/types/db';

interface PickerOpts {
	allowCustom: boolean;
	choices: string[];
	type: 'single' | 'multiple';
}

// jon arbuckle screams:
interface CharField {
	key: keyof CharacterAttr;
	group: 'identity' | 'personality' | 'arc';
	label: string;
	pickerOpts?: PickerOpts;
}

// prettier-ignore
export const CHARACTER_FIELDS: CharField[] = [
	// (i) identity
	{ key: 'age',           label: 'Age',               group: 'identity' },
	{ key: 'birthday',      label: 'Birthday',          group: 'identity' },
	{ key: 'gender',        label: 'Gender',            group: 'identity' },
	{ key: 'hair_color',    label: 'Hair color',        group: 'identity' },
	{ key: 'eye_color',     label: 'Eye color',         group: 'identity' },
	{ key: 'sexuality',     label: 'Sexuality',         group: 'identity' },
	{ key: 'height',        label: 'Height',            group: 'identity' },
	{ key: 'body_type',     label: 'Body type',         group: 'identity' },
	{ key: 'complexion',    label: 'Complexion',        group: 'identity' },
	{ key: 'disabilities',  label: 'Disabilities',      group: 'identity' },
	{ key: 'languages',     label: 'Spoken languages',  group: 'identity' },
	{ key: 'fashion_style', label: 'Fashion/Style',     group: 'identity' },
    
    // (i) arc
	{ key: 'arc_start',     label: 'Starting point',    group: 'arc' },
	{ key: 'arc_end',       label: 'Ending point',      group: 'arc' },
	{ key: 'arc_driver',    label: 'Driving force of development',
                                                        group: 'arc' },
	{ key: 'role',          label: 'Role',              group: 'arc',
      pickerOpts: {
        allowCustom: true,
        choices: [
            'Protagonist', 'Antagonist', 'Companion', 'Love interest',
            'Rival', 'Comic relief', 'Foil', 'Mentor', 'Sidekick'
        ],
        type: 'multiple',
      }
    },
	{ key: 'goals',         label: 'Goals',             group: 'arc' },
	{ key: 'motivation',    label: 'Motivation',        group: 'arc' },
	{ key: 'moral_code',    label: 'Morals',            group: 'arc' },
	{ key: 'backstory',     label: 'Backstory',         group: 'arc' },

    // (i) personality
	{ key: 'strengths',     label: 'Strengths',         group: 'personality' },
	{ key: 'weaknesses',    label: 'Weaknesses',        group: 'personality' },
	{ key: 'flaws',         label: 'Flaws',             group: 'personality' },
	{ key: 'fears',         label: 'Fears',             group: 'personality' },
	{ key: 'passions',      label: 'Passions',          group: 'personality' },
	{ key: 'secrets',       label: 'Secrets',           group: 'personality' },
	{ key: 'communication_style', label: 'Communication style',
                                                        group: 'personality' },
	{ key: 'emotional_availability', label: 'Emotional availability',
                                                        group: 'personality' },
	{ key: 'conflict_resolution', label: 'Conflict resolution',
                                                        group: 'personality' },
	{ key: 'self_esteem',   label: 'Self Esteem',       group: 'personality' },
	{ key: 'insecurities',  label: 'Insecurities',      group: 'personality' },
	{ key: 'emotional_intelligence', label: 'Emotional intelligence',
                                                        group: 'personality' },
	{ key: 'social_skills', label: 'Social skills',     group: 'personality' },
	{ key: 'coping_mechanisms', label: 'Coping mechanisms',
                                                        group: 'personality' },
	{ key: 'emotional_stability', label: 'Emotional stability',
                                                        group: 'personality' },
	{ key: 'habits',        label: 'Habits',            group: 'personality' },
	{ key: 'quirks',        label: 'Quirks',            group: 'personality' },
	{ key: 'hobbies',       label: 'Hobbies',           group: 'personality' },
	{ key: 'philosophy',    label: 'Philosophy',        group: 'personality' },
	{ key: 'religion',      label: 'Religion',          group: 'personality' },
	{ key: 'introvert_extrovert', label: 'Introvert or extrovert',
                                                        group: 'personality',
      pickerOpts: {
        allowCustom: false,
        type: 'single',
        choices: ['Introvert', 'Extrovert', 'Ambivert'],
      }
    },
	{ key: 'optimist_pessimist', label: 'Optimist or pessimist',
                                                        group: 'personality',
      pickerOpts: {
        allowCustom: false,
        type: 'single',
        choices: ['Optimist', 'Pessimist'],
      }
    },
    { key: 'archetype',     label: 'Archetype',         group: 'personality',
      pickerOpts: {
        allowCustom: false,
        type: 'single',
        choices: [
            'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
            'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
            'INFJ', 'INFP', 'INTJ', 'INTP',
            'ISFJ', 'ISFP', 'ISTJ', 'ISTP',
        ],
      }
    }
];

interface SectionField {
	key: keyof SectionAttr;
	label: string;
	pickerOpts?: PickerOpts;
}

// prettier-ignore
export const SECTION_FIELDS: SectionField[] = [
	{ key: 'start_point',       label: 'Starting point' },
	{ key: 'driving_force',     label: 'Driving force' },
    { key: 'conflict',          label: 'Conflict' },
	{ key: 'outcome',           label: 'Outcome' },
    { key: 'outcome_reason',    label: 'Reason for outcome' },
    { key: 'significance',      label: 'Significance' },
];

interface LocationField {
	key: keyof LocationAttr;
	label: string;
	pickerOpts?: PickerOpts;
}

// prettier-ignore
export const LOCATION_FIELDS: LocationField[] = [
    { key: 'history',           label: 'History' },
    { key: 'significance',      label: 'Significance' },
    { key: 'atmosphere',        label: 'Atmosphere' },
    { key: 'start_condition',   label: 'Starting condition' },
    { key: 'end_condition',     label: 'Ending condition' },
    { key: 'end_condition_reason', label: 'Reason for ending condition' },
    { key: 'ownership',         label: 'Ownership' },
]

interface DynamicField {
	key: keyof DynamicAttr;
	relatedCharFields?: keyof CharacterAttr[];
	group: 'type' | 'dynamic' | 'love' | 'basics';
	label: string;
	pickerOpts?: PickerOpts;
}

// prettier-ignore
export const DYNAMIC_FIELDS: DynamicField[] = [
    { key: 'type',              label: 'Type of Relationship', group: 'type',
      pickerOpts: {
        allowCustom: true,
        type: 'multiple',
        choices: [
            'Friends', 'Family', 'Acquaintances', 'Strangers', 'Lovers',
            'Dating', 'Married', 'Enemies', 'Foils', 'Colleagues', 'Opponents'
        ]
       }
     },

    // (i) dynamic
    { key: 'chemistry',         label: 'Chemistry',         group: 'dynamic' },
    { key: 'chemistry_reasons', label: 'Reasons for chemistry',
                                                            group: 'dynamic' },
    { key: 'incompatibility',   label: 'Incompatibility',   group: 'dynamic' },
    { key: 'incompatibility_reasons',   label: 'Reasons for incompatibility',
                                                            group: 'dynamic' },
    // { key: 'health',            label: 'Relationship health',
    //                                                         group: 'dynamic',
    //   pickerOpts: {
    //     allowCustom: true,
    //     type: 'single',
    //     choices: [
    //         'Excellent', 'Great', 'Friendly', 'Neutral', 'Unfriendly', 'Toxic', 'Poor',
    //     ]
    //   }
    // },
    // { key: 'health_reasons',    label: 'Reasons for relationship health',
    //                                                         group: 'dynamic' },
    { key: 'misunderstandings', label: 'Misunderstandings',
                                                            group: 'dynamic' },
    { key: 'conflict_sources',  label: 'Sources of conflict',
                                                            group: 'dynamic' },
    { key: 'rivalry_sources',   label: 'Sources of rivalry',group: 'dynamic' },
    { key: 'cooperation_causes',label: 'Causes of cooperation',
                                                            group: 'dynamic' },
    { key: 'shared_goals',      label: 'Shared goals',      group: 'dynamic' },
    { key: 'conflicting_goals', label: 'Conflicting goals', group: 'dynamic' },
    { key: 'shared_interests',  label: 'Shared interests',  group: 'dynamic' },
    { key: 'expectations',      label: 'Expectations for relationship',
                                                            group: 'dynamic' },
    { key: 'power_dynamics',    label: 'Power dynamics',    group: 'dynamic' },
    { key: 'outside_perception', label: 'How the relationship is viewed',
                                                            group: 'dynamic' },

    // (i) love and hate
    { key: 'affection',         label: 'Affection',         group: 'love',
      pickerOpts: {
        allowCustom: true,
        type: 'single',
        choices: [
            'Loving', 'Warm', 'Neutral', 'Cold', 'Hostile',
        ]
      }
     },
    { key: 'attraction',        label: 'Attraction',        group: 'love'},
    { key: 'intensity',         label: 'Intensity',         group: 'love'},

    // (i) basics
    { key: 'respect',           label: 'Respect',           group: 'basics' },
    { key: 'trust',             label: 'Trust',             group: 'basics' },
    { key: 'faith',             label: 'Faith',             group: 'basics' },
    { key: 'vulnerability',     label: 'Vulnerability',     group: 'basics' },
    { key: 'loyalty',           label: 'Loyalty',           group: 'basics' },
    { key: 'loyalty_reasons',   label: 'Reasons for loyalty',group: 'basics' },
]
