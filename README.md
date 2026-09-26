# Neon Relay

A dark neon URL-relay demo with an Express backend.

## Important
This project intentionally uses an allowlist. Set `ALLOWED_HOSTS` to domains you own or have permission to access through the relay. It is not designed to bypass school, workplace, ISP, or other network controls.

## Run locally

1. Install Node.js 20+.
2. Run:
   `npm install`
3. Set the environment variable:
   `ALLOWED_HOSTS=example.com`
4. Start:
   `npm start`
5. Open:
   `http://localhost:3000`

## Deploy on Render

1. Put this folder in a GitHub repository.
2. Create a new Web Service on Render and connect the repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable:
   `ALLOWED_HOSTS=example.com`
6. Deploy. Render gives you a public `onrender.com` URL.

## Security notes

The backend:
- only accepts HTTP/HTTPS;
- blocks URL credentials;
- requires an allowlisted hostname;
- resolves the hostname and blocks private/internal IP ranges;
- uses an 8-second timeout;
- limits request-body size;
- only relays text-based responses in this demo.

For production, add authentication, rate limiting, logging, stricter egress controls, and an allowlist limited to domains you operate.
