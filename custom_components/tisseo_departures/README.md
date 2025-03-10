# Tisseo Card

This custom card displays next bus departures for Tisseo.

## Installation

### HACS

1. Go to HACS > Frontend.
2. Click the three dots in the top-right corner and select "Custom Repositories."
3. Install the card and reload Home Assistant.

### Manual

1. Download `tisseo-card.js` from the Releases section of this repository.
2. Copy the file to `/config/www/` on your Home Assistant instance.
3. Add the following to your `ui-lovelace.yaml` or Lovelace configuration:

```yaml
resources:
  - url: /local/tisseo-card.js
    type: module
