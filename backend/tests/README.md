# Postman Collection – Code the Court

This folder contains Postman files to test the backend API routes of the project **Code the Court**.

## Files

- `Code-the-Court.postman_collection.json`: Collection of HTTP requests for testing key API endpoints.

## How to Use

1. Open Postman.
2. Go to the **Collections** tab and click **Import**.
3. Select the file `Code-the-Court.postman_collection.json`.
4. Run the following requests manually:
   - `GET http://localhost:3000/api/decisions`
   - `POST http://localhost:3000/api/archives` *(requires a valid token in the Authorization header)*
   - `GET http://localhost:3000/api/archives` to verify archive creation

## Notes

- Ensure your backend server is running at `http://localhost:3000`.
- For authenticated routes (e.g., archives), add a valid JWT token in the request headers:
