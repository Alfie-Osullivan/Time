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
