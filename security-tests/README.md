# Markdown preview regression checks

Run `npm ci --ignore-scripts`, install the test browser with `npx playwright install chromium` if needed, then run `npm test` from this folder.

The tests load the repository’s HTML at an isolated browser origin and block external requests. They cover seven renderers across six pages: event-attribute injection, unsafe link/image protocols, valid HTTPS/relative/email links, ordinary formatting, and preservation of both courses’ module IDs. Each assertion waits for the newly supplied content, including renderers that debounce input. The fixtures contain only harmless local markers; they do not attack a deployed site or access real accounts.

The GitHub workflow uses Ubuntu 24.04, installs the locked test tools and browser, audits the test dependencies, and runs the same cases. These checks verify the named renderer properties; they do not establish whole-site security or accessibility conformance. The website and the one-file SecureVCC skill do not need this tooling at runtime.
