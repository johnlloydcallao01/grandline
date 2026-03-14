In apps/web-admin:

The authentication implementation for apps/web-admin uses the following:

- Token Storage Name : grandline_auth_token (stored in the browser's localStorage )
- Authentication Type : JWT (JSON Web Token)
- Authorization Header Format : Authorization: users JWT <token>
This is defined in auth.ts and used in the AuthContext.tsx .

In apps/web:

The authentication implementation for apps/web uses the following:

- Token Storage Name : grandline_auth_token (stored in the browser's localStorage )
- Authentication Type : JWT (JSON Web Token)
- Authorization Header Format : Authorization: users JWT <token>
This is defined in auth.ts