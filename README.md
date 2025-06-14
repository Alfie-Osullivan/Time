# Time Project

This project contains a simple timezone comparison widget. Basic tests are included using [Jest](https://jestjs.io/) to verify utility functions.

## Running Tests

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the test suite:
   ```bash
   npm test
   ```

The tests cover the `convertUTCOffsetToIANA` helper which converts offsets like `"UTC+2"` to IANA-style identifiers such as `"Etc/GMT-2"`.

## Editing What's New

The version history shown in the "See what's new" dialog is loaded from
`versions.json`. Each entry is an object with the following fields:

- `version` – the numeric version identifier
- `name` – the public name of the release
- `type` – release type (e.g. Feature, Patch)
- `title` – a short title
- `description` – a longer explanation

To update the history, edit `versions.json` and add a new object using the
same structure.
