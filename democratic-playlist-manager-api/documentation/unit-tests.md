# Unit Testing Guidelines

## Framework & Tooling
- **Jest** (`^26`) with `testEnvironment: node`
- **Supertest** for HTTP/server-level tests
- Run tests: `npm test` (includes coverage) or `npm run testWatch` for watch mode

## File Structure
- Tests live in `__tests__/`, mirroring `src/` structure (e.g. `src/services/foo.js` → `__tests__/services/foo.test.js`)
- Fixtures live in `__fixtures__/` — factory functions, not raw data files
- Add `/* eslint-env jest */` at the top of every test file

## Fixtures
- Use factory functions (e.g. `generatePlaylistItems([{ trackId, added_at, added_byId }])`) rather than static JSON
- Place fixture factories in `__fixtures__/<domain>.fixture.js`
- Utility helpers (e.g. `sleep`) go in `__fixtures__/utils/`

## Mocking
- Mock module dependencies with `jest.mock('../../src/...')` at the top of the file, then require the mock
- Override specific implementations with `jest.spyOn(mock, 'method').mockImplementation(...)`
- Use `jest.fn().mockResolvedValue(...)` for async mocks and `jest.fn().mockReturnValue(...)` for sync
- Reset state between tests with `beforeEach`/`afterEach` using `jest.clearAllMocks()` and `jest.clearAllTimers()`
- Use `jest.useFakeTimers()` when testing timer-dependent logic

## Test Structure
- Group related tests under `describe` blocks with a sentence describing the behaviour being verified
- Use `it('...')` with descriptive names that read as a specification (e.g. `"A playlist [A1*, B1] should become [A1*, B1] after reordering"`)
- Follow **Arrange / Act / Assert** with inline comments for non-trivial tests
- Use `it.todo('...')` to document known missing scenarios without leaving empty tests

## Assertions
- Prefer `toStrictEqual` over `toEqual` for deep equality
- Use `toBeFalsy` / `toBeTruthy` when the exact value doesn't matter
- Use `expect.anything()` as a placeholder when a value must exist but its shape is irrelevant
- Assert thrown errors with both `.toThrow(ErrorClass)` and `.toThrow('message')` when testing custom errors

## Coverage
- Coverage is collected on every `npm test` run
- `coveragePathIgnorePatterns` excludes `node_modules`, `*.fixture.js`, and `*.mock.js` — keep fixtures out of coverage
