# Postman Collection – Code the Court

This folder contains Postman files to test the backend API of the **Code the Court** project.

## Files

- `Code-the-Court.postman_collection.json`: Postman collection including login, protected routes, and test data creation.

## How to Use

1. Open Postman.
2. Go to the **Collections** tab and click **Import**.
3. Select the file `Code-the-Court.postman_collection.json`.
4. Expand the collection and run the following requests in order:

   ### 🔐 Auth
   - `POST /api/login`: Logs in with test user `admin@example.com` / `Admin1234!` and stores the JWT token in a `{{token}}` collection variable.

   ### 📁 Archives
   - `POST /api/archives`: Adds a new archive using the stored token.
   - `GET /api/archives`: Verifies the archive is stored.

   ### 📁 Decisions
   - `GET /api/decisions`: Tests open route with optional filters.

## Notes

- The backend must be running locally at: `http://localhost:3000`
- All authenticated routes use the token set by the login request:  
- No external environment is required – the `{{token}}` variable is managed internally by the collection.

## Use Case

This collection is useful for:

- Testing key API endpoints of the MVP
- Demoing a full user interaction flow (login → add → fetch)
- Validating token-based route protection
