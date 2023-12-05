import express from "express";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session"; // NOTE: The default server-side session storage, MemoryStore, is purposely not designed for a production environment. It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.
import * as saml from "@node-saml/passport-saml";
import * as cam from "./strategy";
import type { AuthenticateOptions } from "@node-saml/passport-saml/lib/types";

// check for required environment variables
["SESSION_KEY", "LUCAS_PUBLIC_KEY", "LUCAS_PRIVATE_KEY"].forEach((secret) => {
  if (!process.env[secret]) {
    throw new Error(`Missing required ${secret} environment variable`);
  }
});

let app = express();
let port = process.env.PORT || 3000;

// middleware to parse HTTP POST's JSON, buffer, string,zipped or raw and URL encoded data and exposes it on req.body
app.use(bodyParser.json());
// use querystring library to parse x-www-form-urlencoded data for flat data structure (not nested data)
app.use(bodyParser.urlencoded({ extended: false }));
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: process.env.SESSION_KEY as string,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Trust the reverse proxy when setting secure cookies (via the "X-Forwarded-Proto" header).
    cookie: {
      secure: true,
      httpOnly: true,
      domain: "amsoc.co.uk",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { email: user.email, name: user.name });
  });
});
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user ? (user as Express.User) : undefined);
  });
});
let strategy = new cam.Strategy(
  {
    path: "/login",
    cert: cam.raven.publicCert,
    issuer: "https://auth.amsoc.co.uk/Shibboleth.sso/Metadata",
    callbackUrl: "https://auth.amsoc.co.uk/login/callback",
    privateKey: process.env.LUCAS_PRIVATE_KEY,
    passReqToCallback: false,
    authnRequestBinding: "HTTP-Redirect",
  },
  // sign-in
  function (profile: saml.Profile | null, done: saml.VerifiedCallback) {
    return !profile
      ? done(new Error("No profile found"), undefined)
      : done(null, cam.userFromProfile(profile));
  },
  // sign-out
  function (profile: saml.Profile | null, done: saml.VerifiedCallback) {
    throw new Error("Not implemented: log-out");
    // return !profile
    // ? done(new Error("No profile found"), undefined)
    // : done(null, cam.userFromProfile(profile));
  }
);
passport.use("camsaml", strategy);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/ping", (req, res) => {
  res.send("pong!");
});
app.get(
  "/Shibboleth.sso/Metadata",
  cam.sendServiceProviderMetadata(strategy, process.env.LUCAS_PUBLIC as string)
);
app.post(
  "/login/callback",
  (req, res, next) => {
    console.log("callback", req.body);
    next();
  },
  passport.authenticate(strategy, { session: true }),
  (req, res) => {
    req.session.loggedIn = req.isAuthenticated();
    req.session.save(() => {
      return res.redirect(
        req.session.loggedIn
          ? decodeURIComponent(req.body.RelayState)
          : "/login"
      );
    }); // https://stackoverflow.com/a/26532987
  }
);
declare module "express-session" {
  interface Session {
    loggedIn: boolean;
  }
}
app.use(
  (req, res, next) => {
    req.session.loggedIn ? res.sendStatus(200) : next();
  },
  (req, res, next) => {
    let forwarded = {
      for: req.headers["x-forwarded-for"],
      host: req.headers["x-forwarded-host"],
      port: req.headers["x-forwarded-port"],
      proto: req.headers["x-forwarded-proto"],
      server: req.headers["x-forwarded-server"],
      uri: req.headers["x-forwarded-uri"],
    };
    passport.authenticate(strategy, <AuthenticateOptions>{
      session: true,
      additionalParams: {
        RelayState: encodeURIComponent(
          forwarded.proto +
            "://" +
            forwarded.host +
            ":" +
            forwarded.port +
            forwarded.uri
        ),
      },
    })(req, res, next);
  }
);
app.get("/login", (req, res) => {
  res.send("Not logged in");
});
app.listen(port, () => {
  console.log(`Server listening to http://localhost:${port}/`);
});
