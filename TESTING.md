# Testing Documentation

## Overview

This project includes comprehensive test suites for both backend API endpoints and frontend React components. The test infrastructure is fully functional and covers critical security, business logic, and UI functionality.

## Test Results Summary

### Backend Tests ✅
**Status**: 77/77 tests passing (100%)

- **Security Tests**: 42 tests
  - Authentication & Authorization
  - SQL Injection Prevention
  - XSS Prevention
  - Input Validation
  - Rate Limiting
  - Information Disclosure Prevention
  - CORS & Security Headers
  - Business Logic Security

- **Dashboard API Tests**: 35 tests
  - Statistics Endpoints
  - Recent Matches
  - Performance Ratings
  - Query Parameters
  - Error Handling
  - Data Consistency

### Frontend Tests 🟡
**Status**: 23/36 tests passing (64%)

- **AdminDashboardPage**: 10/13 passing
- **RegisterPage**: 8/12 passing
- **LoginPage**: 5/10 passing

## Running Tests

### Backend
```bash
cd backend
npm test                    # Run all tests
npm test security.test.js   # Run security tests only
npm test dashboard.test.js  # Run dashboard tests only
```

### Frontend
```bash
cd frontend
npm test              # Run tests in watch mode
npm test -- --run     # Run tests once
```

## Known Issues - Frontend Tests

The following 13 frontend tests are currently failing due to async/timing edge cases. These are not infrastructure issues but rather specific test scenarios that need individual optimization:

### 1. Async Submission Tests (5 tests)
**Issue**: Tests timeout waiting for async operations to complete

**Affected Tests**:
- `LoginPage > submits form with valid credentials`
- `LoginPage > displays error message on login failure`
- `LoginPage > shows loading state during submission`
- `RegisterPage > displays success message after successful registration`
- `RegisterPage > displays error message when email already exists`

**Why They Fail**: 
- Mock responses not properly configured to resolve/reject quickly
- Loading states change before assertions can verify them
- Toast notifications may not appear in test environment

**Potential Fixes**:
- Mock `axiosInstance.post` with immediate resolution
- Use `waitFor` with custom timeout for loading states
- Mock toast notification system for testing
- Add proper async/await handling in form submission mocks

### 2. Email Validation Tests (2 tests)
**Issue**: Email validation error messages not appearing as expected

**Affected Tests**:
- `LoginPage > displays validation error for invalid email format`
- `RegisterPage > validates email format`

**Why They Fail**:
- Validation errors may be shown via toast instead of inline
- Form validation library (react-hook-form) may handle errors differently
- Error messages might have different text than expected

**Potential Fixes**:
- Check actual validation error format in components
- Update test to match actual error message text
- Use `findByText` instead of `getByText` for async error display
- Query for toast notifications instead of inline errors

### 3. Password Visibility Toggle (2 tests)
**Issue**: Password visibility toggle button not found or not working

**Affected Tests**:
- `LoginPage > toggles password visibility`
- (RegisterPage password toggle test is passing)

**Why They Fail**:
- Show/hide password button may not exist in LoginPage
- Button aria-label might be different than expected
- Component might use different toggle mechanism

**Potential Fixes**:
- Verify if LoginPage actually has password visibility toggle
- Check the actual aria-label of the toggle button
- Use `queryByRole('button')` to find toggle button correctly

### 4. Dashboard Data Fetching (2 tests)
**Issue**: Dashboard tests timeout waiting for API data

**Affected Tests**:
- `AdminDashboardPage > fetches and displays dashboard statistics`
- `AdminDashboardPage > formats player growth percentage correctly`

**Why They Fail**:
- Multiple parallel API calls not all being mocked
- Timeout expires before all data loads and renders
- Specific data format (player growth percentage) not matching mock

**Potential Fixes**:
- Ensure all three API endpoints are mocked (`/stats`, `/recent-matches`, `/performance-ratings`)
- Increase specific test timeout for these heavy tests
- Verify mock data format matches component expectations
- Add `waitFor` with longer timeout for complex rendering

### 5. RTL Layout Verification (1 test)
**Issue**: RTL (Right-to-Left) layout test times out

**Affected Tests**:
- `LoginPage > supports RTL layout when language is Arabic`

**Why They Fail**:
- i18n language change not properly mocked
- Component re-render after language change takes too long
- RTL attribute check may be looking at wrong element

**Potential Fixes**:
- Mock i18n language setting before rendering
- Use `rerender` to update component after language change
- Check `dir="rtl"` on correct parent container
- Simplify test to just verify RTL attribute exists

### 6. Loading State During Submission (1 test)
**Issue**: Loading state not captured during form submission

**Affected Tests**:
- `RegisterPage > shows loading state during submission`

**Why They Fail**:
- Loading state transitions too quickly to capture
- Button disable state changes before assertion runs
- Mock promise resolves before loading state can be checked

**Potential Fixes**:
- Create delayed promise that doesn't resolve immediately
- Use `findByText` or `waitFor` to catch loading state
- Check for disabled button state instead of loading spinner
- Mock submission to never resolve during test

## Recommendations for Future Test Improvements

### High Priority
1. **Fix Async Submission Tests**: Mock axios with controlled promise resolution timing
2. **Email Validation**: Align tests with actual error display mechanism
3. **Dashboard API Mocks**: Ensure all endpoints are properly mocked

### Medium Priority
4. **Password Toggles**: Verify component implementation matches test expectations
5. **RTL Layout**: Simplify test or mock i18n properly
6. **Loading States**: Use better async utilities to capture transient states

### Low Priority (Optional)
- Add E2E tests with Cypress or Playwright for full user flows
- Increase test coverage for edge cases
- Add visual regression testing
- Test accessibility (a11y) compliance

## Test Configuration

### Backend (Jest + Supertest)
- **Framework**: Jest
- **HTTP Testing**: Supertest
- **Database**: MySQL (test database cleaned between tests)
- **Timeout**: 30 seconds per test
- **Coverage**: Security vulnerabilities, API endpoints, business logic

### Frontend (Vitest + React Testing Library)
- **Framework**: Vitest
- **Testing Library**: React Testing Library
- **Environment**: jsdom
- **Timeout**: 10 seconds per test
- **Setup File**: `src/test/setup.js`
- **Custom Render**: `src/test/test-utils.jsx` with all providers

## Test Best Practices

### Backend
- ✅ Create test users via direct DB queries for speed
- ✅ Clean up test data in `afterAll` hooks
- ✅ Test both success and failure scenarios
- ✅ Verify HTTP status codes and response structure
- ✅ Test authentication and authorization separately

### Frontend
- ✅ Use `getByRole` queries for better accessibility
- ✅ Use `waitFor` for async operations
- ✅ Mock API calls with `vi.mock()`
- ✅ Test user interactions with `@testing-library/user-event`
- ✅ Wrap components with all required providers
- ✅ Use `findBy` queries for elements that appear asynchronously

## Continuous Integration

Tests should be run in CI/CD pipeline before deploying:

```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Install dependencies
      run: npm ci
    - name: Run backend tests
      run: cd backend && npm test
    - name: Run frontend tests
      run: cd frontend && npm test -- --run
```

## Contributing

When adding new features:
1. Write tests for new backend endpoints (security + functionality)
2. Write tests for new React components (rendering + interactions)
3. Ensure all existing tests still pass
4. Aim for >80% code coverage on critical paths

## Support

For questions about tests:
- Backend tests: Check `backend/tests/` directory
- Frontend tests: Check `frontend/src/pages/*.test.jsx`
- Test utilities: Check `frontend/src/test/` directory
