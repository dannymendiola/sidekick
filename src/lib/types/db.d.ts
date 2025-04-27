export interface SectionAttr {
	conflict?: string;
	significance?: string;
	start_point?: string;
	driving_force?: string;
	outcome?: string;
	outcome_reason?: string;
}

export interface LocationAttr {
	history?: string;
	significance?: string;
	atmosphere?: string;
	start_condition?: string;
	end_condition?: string;
	end_condition_reason?: string;
	ownership?: string;
}

export interface CharacterAttr {
	// (i) appearance/identity
	birthday?: string;
	languages?: string;
	age?: string;
	gender?: string;
	sexuality?: string;
	hair_color?: string;
	height?: string;
	body_type?: string;
	complexion?: string;
	fashion_style?: string;
	disabilities?: string;
	eye_color?: string;

	// (i) arc
	role?: string;
	goals?: string;
	moral_code?: string;
	motivation?: string;
	backstory?: string;
	arc_start?: string;
	arc_driver?: string;
	arc_end?: string;

	// (i) personality/psyche
	strengths?: string;
	weaknesses?: string;
	flaws?: string;
	secrets?: string;
	fears?: string;
	passions?: string;
	communication_style?: string;
	emotional_availability?: string;
	conflict_resolution?: string;
	self_esteem?: string;
	insecurities?: string;
	emotional_intelligence?: string;
	social_skills?: string;
	coping_mechanisms?: string;
	emotional_stability?: string;
	habits?: string;
	quirks?: string;
	hobbies?: string;
	philosophy?: string;
	religion?: string;
	introvert_extrovert?: string;
	optimist_pessimist?: string;
	archetype?: string;
}

export interface DynamicAttr {
	// (i) type
	type?: string;

	// (i) dynamic
	chemistry?: string;
	chemistry_reasons?: string;
	incompatibility?: string;
	incompatibility_reasons?: string;
	health?: string;
	health_reasons?: string;
	misunderstandings?: string;
	conflict_sources?: string;
	rivalry_sources?: string;
	cooperation_causes?: string;
	shared_goals?: string;
	conflicting_goals?: string;
	shared_interests?: string;
	expectations?: string;
	power_dynamics?: string;
	outside_perception?: string;

	// (i) love and hate
	affection?: string;
	intensity?: string;
	attraction?: string;

	// (i) dynamic/relationship fundamentals
	respect?: string;
	trust?: string;
	faith?: string;
	vulnerability?: string;
	loyalty?: string;
	loyalty_reasons?: string;
}
