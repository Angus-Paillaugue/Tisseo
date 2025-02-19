export interface TisseoNextDepartureResponse {
	departures: {
		departure: {
			dateTime: string;
			destination:
				{
					cityName: string;
					id: string;
					name: string;
				}[];
			line: {
				bgXmlColor: string;
				color: string;
				fgXmlColor: string;
				id: string;
				name: string;
				network: string;
				shortName: string;
			};
			realTime: string;
		}[];
		stop: {
			id: string;
			name: string;
			operatorCode: string;
		};
		stopArea: {
			cityId: string;
			cityName: string;
			id: string;
			name: string;
		};
	};
	expirationDate: string;
}

export interface Departures {
	departures: Departure[];
	expirationDate: Date;
}

export interface Departure {
	id: string;
	dateTime: Date;
	destination: string;
	line: Line;
	stop: Stop;
	walkTime?: number;
	tracked?: boolean;
}

export interface Line {
	bgXmlColor: string;
	fgXmlColor: string;
	id: string;
	shortName: string;
}

export interface Stop {
	id: string;
	name: string;
}

export interface LineConfig {
	stopId: Stop['id'];
	lineId: Line['id'];
	walkTime?: number;
}
