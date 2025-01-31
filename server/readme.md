# Server

The server is a backend application built with [Deno](https://deno.land/) and TypeScript. It provides APIs for managing definitions and formats, handling authentication, and serving data to the client application.

## Overview

- **API Routes**: Exposes endpoints for definitions, formats, and authentication.
- **Authentication**: Implements secure authentication mechanisms to protect resources.
- **Data Management**: Handles data storage and retrieval for definitions and formats.
- **Middleware**: Utilizes middleware for request handling and authorization.

## Features

- **RESTful API**: Provides a set of RESTful endpoints for client interaction.
- **Secure**: Protects resources using authentication and authorization middleware.
- **Modular Structure**: Organized controllers, routes, and middleware for maintainability.
- **Deno Advantages**: Leverages Deno's security and modern JavaScript features.

## Setup and Installation

1. **Navigate to the Server Directory**:

   ```sh
   cd server
   ```

2. **Install Dependencies**:

   Deno uses modules imported directly from URLs or local files, so you need to cache them:

   ```sh
   deno cache deps.ts
   ```

## Running the Server

Start the server using Deno with the necessary permissions:

```sh
deno run --allow-net --allow-read server.ts
```

- `--allow-net`: Grants network access.
- `--allow-read`: Allows reading files from the file system.

## Project Structure

```plaintext
server/
├── controllers/
│   ├── authController.ts
│   ├── definitionController.ts
│   └── formatController.ts
├── data/
│   ├── definitions.json
│   ├── formats.json
│   └── staticFormats.ts
├── middlewares/
│   └── authMiddleware.ts
├── routes/
│   └── routes.ts
├── deps.ts
├── server.ts
└── ...
```

- **controllers**: Contains the logic for handling requests.
- **data**: Stores data files and seed data.
- **middlewares**: Includes middleware functions for request processing.
- **routes**: Defines the API routes.
- **deps.ts**: Manages external dependencies.
- **server.ts**: Entry point of the server application.

## API Endpoints

- **Authentication**:
  - `POST /auth/login`: Authenticate a user and receive a token.
  - `POST /auth/register`: Register a new user.

- **Definitions**:
  - `GET /definitions`: Retrieve all definitions.
  - `POST /definitions`: Create a new definition.
  - `PUT /definitions/:id`: Update a definition.
  - `DELETE /definitions/:id`: Delete a definition.

- **Formats**:
  - `GET /formats`: Retrieve all formats.
  - `POST /formats`: Create a new format.
  - `PUT /formats/:id`: Update a format.
  - `DELETE /formats/:id`: Delete a format.

## Environment Variables

Create a `.env` file in the server directory to set environment variables:

```
PORT=8000
JWT_SECRET=your_secret_key
```

- **PORT**: The port number on which the server will listen.
- **JWT_SECRET**: Secret key for JWT authentication.

## Notes

- Ensure that you have Deno installed. You can download it from the [official website](https://deno.land/#installation).
- The server uses modern JavaScript and TypeScript features available in Deno.
- All data is currently stored in JSON files for simplicity.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to contribute to the project.

## License

This project is licensed under the MIT License.