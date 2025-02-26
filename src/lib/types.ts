export interface TisseoNextDepartureResponse {
	departures: {
		departure: {
			dateTime: string;
			destination: {
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
			realTime: 'yes' | 'no';
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

export type TisseoNetworkMessagesResponse = TisseoNetworkMessage[];

export interface TisseoNetworkMessage {
	lines?: TisseoNextDepartureResponse['departures']['departure'][0]['line'][];
	message: {
		content: string;
		id: string;
		importanceLevel: 'normal' | 'important';
		scope: 'line' | 'event' | 'global';
		title: string;
		type: string;
		url: string;
	};
}

export interface Departures {
	departures: Departure[];
	expirationDate: Date;
}

export interface Departure {
	dateTime: Date;
	destination: string;
	line: Line;
	stop: Stop;
	walkTime?: number;
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

// User configutration
export interface LineConfig {
	stopId: Stop['id'];
	lineId?: Line['id'];
	walkTime?: number;
	numberOfResults?: number;
}
export interface ConfigFile {
	$schema: string;
	pollInterval: number;
	toTrack: LineConfig[];
}
export type Config = Required<ConfigFile>;
