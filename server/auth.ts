// auth.ts - Updated authentication middleware with Auth0 support
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import bcrypt from "bcryptjs";
import { storage } from "./storage"; // Updated to match your import structure

// Helper functions to match your existing storage interface
async function getUserByEmail(email: string) {
  return await storage.getUserByEmail(email);
}

async function createUser(userData: { email: string; passwordHash?: string | null; auth0Id?: string }) {
  return await storage.createUser(userData);
}

// JWKS client for Auth0 token verification
const client = jwksRsa({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  requestHeaders: {},
  timeout: 30000,
});

export function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error getting signing key:", err);
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Enhanced JWT middleware that handles both local and Auth0 tokens
export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  
  // Try to decode without verification first to check issuer
  const decoded = jwt.decode(token, { complete: true }) as any;
  
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  // Check if it's an Auth0 token (has iss field with Auth0 domain)
  const isAuth0Token = decoded.payload.iss && decoded.payload.iss.includes(process.env.AUTH0_DOMAIN);

  if (isAuth0Token) {
    // Verify Auth0 JWT
    jwt.verify(token, getKey, {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid Auth0 token" });
      }
      (req as any).user = decoded;
      (req as any).authType = 'auth0';
      next();
    });
  } else {
    // Verify local JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me");
      (req as any).user = decoded;
      (req as any).authType = 'local';
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid local token" });
    }
  }
}

// Username/password registration (unchanged)
export async function register(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, passwordHash: hash });
  res.status(201).json({ message: "User registered", user: { email: user.email } });
}

// Username/password login (unchanged)
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  if (!user.passwordHash) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "1h" }
  );
  res.json({ message: "Login successful", token, user: { email: user.email } });
}

// Auth0 login redirect
export function auth0Login(req: Request, res: Response) {
  const authUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.AUTH0_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/api/auth/callback')}&` +
    `scope=openid profile email&` +
    `audience=${process.env.AUTH0_AUDIENCE}`;
  
  res.redirect(authUrl);
}

// Auth0 callback handler
export async function auth0Callback(req: Request, res: Response) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: "Authorization code required" });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/api/auth/callback'
      })
    });

    const tokens = await tokenResponse.json();
    console.log('Auth0 tokens:', tokens);
    
    if (!tokenResponse.ok) {
      console.error('Auth0 token exchange failed:', tokens);
      throw new Error(tokens.error_description || 'Token exchange failed');
    }

    // Decode the ID token to get user info
    const decoded = jwt.decode(tokens.id_token) as any;
    
    // Store user in database if not exists (for Auth0 users)
    let user = await getUserByEmail(decoded.email);
    if (!user) {
      user = await createUser({ 
        email: decoded.email, 
        auth0Id: decoded.sub,
        passwordHash: null // Auth0 users don't have local passwords
      });
    }

    // Instead of redirecting with token in URL, send HTML to store token in localStorage
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.send(`
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body>
          <script>
            localStorage.setItem('token', '${tokens.access_token}');
            window.location.href = '${frontendUrl}/dashboard';
          </script>
          <p>Authenticating... you will be redirected shortly.</p>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Auth0 callback error:', error);
    res.status(500).json({ error: 'Authentication failed', details: JSON.stringify(error) });
  }
}

// Logout endpoint
export function logout(req: Request, res: Response) {
  const authType = (req as any).authType;
  
  if (authType === 'auth0') {
    // For Auth0, redirect to logout URL
    const logoutUrl = `https://${process.env.AUTH0_DOMAIN}/v2/logout?` +
      `client_id=${process.env.AUTH0_CLIENT_ID}&` +
      `returnTo=${encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:3000')}`;
    
    res.json({ message: "Logged out", logoutUrl });
  } else {
    // For local JWT, just acknowledge (stateless)
    res.json({ message: "Logged out" });
  }
}