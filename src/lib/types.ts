export interface Departure {
	line: Line;
	date: Date;
	stop: Stop;
}

export interface Line {
	id: string; // Tisseo line id (ex: line:58)
	label: string; // Tisseo line label (ex: 81)
	direction: string; // Tisseo line direction (ex: "Université Paul Sabatier")
	color: string; // Tisseo line color (ex: "#FF0000")
	stops?: Stop[]; // Tisseo stops for this line
}

export interface Stop {
	id: string;  // Tisseo stop id (ex: 14861)
	label: string;  // Tisseo stop label (ex: "Pastourelles")
	lines?: Line[]; // Tisseo lines that stop at this stop
}
