import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module';

class TisseoCard extends LitElement {
	static styles = css`
		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: row;
			padding: 0 16px 8px 16px;
		}
    .header > p {
      margin: 0;
    }
		.departure {
			display: flex;
			align-items: center;
			padding: 8px 16px;
      gap: 8px;
			border-top: 1px solid var(--divider-color);
		}
		.line {
			padding: 4px 8px;
			border-radius: 4px;
			font-weight: bold;
			font-size: 1.2rem;
			font-family: monospace;
		}
		.refresh-button {
			background-color: var(--primary-color);
			color: var(--mdc-theme-on-secondary, #fff);
			border-radius: 999px;
			padding: 8px 16px;
			border: none;
			font-size: 0.875rem;
			font-weight: 500;
			cursor: pointer;
		}
		.delta-duration {
			font-size: 20px;
			font-weight: bold;
			font-family: monospace;
      margin-left: auto;
		}
	`;

	static get properties() {
		return {
			_departures: { type: Array },
			_apiUrl: { type: String },
			_timeElapsed: { type: Number },
			_isRefreshing: { type: Boolean },
      _itemsToShow: { type: Number },
      _title: { type: String },
		};
	}

	constructor() {
		super();
		this._departures = [];
		this._timeElapsed = 0; // Time in seconds
	}

	connectedCallback() {
		super.connectedCallback();
		this._interval = setInterval(() => {
			this._timeElapsed++;
			this.requestUpdate(); // Trigger update every second
		}, 1000);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if (this._interval) {
			clearInterval(this._interval); // Clean up the interval when the component is removed
		}
	}

	get timeSinceLastUpdate() {
		if (this._timeElapsed > 60 && !this._isRefreshing) {
			this.fetchDepartures();
		}
    // Fetch data if bus is due now
    const nextDeparture = this._departures.find((dep) => this.getDepartureInNbMinutes(dep) <= 0);
    if (nextDeparture) {
      this.fetchDepartures();
    }
		return this._timeElapsed; // Display seconds since last update
	}

	setConfig(config) {
		if (config.api_url) {
			this._apiUrl = config.api_url;
		}
    if (config.items_to_show) {
      this._itemsToShow = config.items_to_show;
    }
    this._title = config.title ?? 'Next departures';
		this.fetchDepartures();
	}

	async fetchDepartures() {
		if (this._isRefreshing) {
			return;
		}
		this._isRefreshing = true;
		try {
			const response = await fetch(this._apiUrl);
			const data = await response.json();
			this._departures = data.departures.slice(0, this._itemsToShow);
			this._timeElapsed = 0; // Reset elapsed time
			this.requestUpdate(); // Force UI update
		} catch (error) {
			console.error('Error fetching departures:', error);
			this._departures = [];
		}
		this._isRefreshing = false;
	}

	formatDelta = (delta) => {
		// Less than 1 minute
		if (delta < 1) {
			return '<1 min';
		}
		return Math.round(delta) + ' min';
	};

	getDepartureInNbMinutes = (departure) => {
		const now = new Date();
		const departureDate = new Date(departure.dateTime);
		return Math.round((departureDate - now) / 1000 / 60);
	};

	getDelta = (departure) => {
		const now = new Date();
		const departureDate = new Date(departure.dateTime);
		return Math.round((departureDate - now) / 1000 / 60);
	}

	render() {
		return html`
			<ha-card header="${this._title}">
				<div class="card">
					<div class="header">
						<p>
							${this._isRefreshing ? 'Loading...' : html`Updated: <b>${this.timeSinceLastUpdate}</b>s ago`}
						</p>
						<button @click="${this.fetchDepartures}" class="refresh-button">Refresh</button>
					</div>
					${this._departures.length === 0 && !this._isRefreshing
						? html`<p style="padding: 8px 16px;">Aucune donnée disponible</p>`
						: this._departures.map(
								(dep) => html`
									<div class="departure">
										<span
											class="line"
											style="background: ${dep.line.bgXmlColor}; color: ${dep.line.fgXmlColor};"
										>
											${dep.line.shortName}
										</span>
										<span>${dep.destination}</span>
										<span class="delta-duration">${this.formatDelta(this.getDelta(dep))}</span>
									</div>
								`
							)}
				</div>
			</ha-card>
		`;
	}
}

// Register the element only once
if (!customElements.get('tisseo-card')) {
	customElements.define('tisseo-card', TisseoCard);
}
