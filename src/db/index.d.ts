interface CalorieSettings {
	caloricGoal: number;
	weightStasisGoal: number;
}

interface FoodDefinition {
	name: string;
	calories: string;
}

interface ConsumedFood {
	calories: string;
}

interface Day {
	date: string;
	consumed: ConsumedFood[];
}

interface DBSection {
	setup(): Promise<void>;
}
