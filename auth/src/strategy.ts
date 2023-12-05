import * as saml from "@node-saml/passport-saml";
import { Request, Response } from "express";

export let raven = {
  entryPoint: "https://shib.raven.cam.ac.uk/idp/profile/SAML2/Redirect/SSO",
  publicCert: `-----BEGIN CERTIFICATE-----
MIICujCCAaICCQDN9BMM2g2oWzANBgkqhkiG9w0BAQUFADAfMR0wGwYDVQQDExRz
aGliLnJhdmVuLmNhbS5hYy51azAeFw0xNTExMjAxNDUwNTFaFw0yNTExMTcxNDUw
NTFaMB8xHTAbBgNVBAMTFHNoaWIucmF2ZW4uY2FtLmFjLnVrMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxBNt1CZhNwQfCTD7sT0VctwAsdHAqhOmADg+
Jkpw27QKxVIPlUANAY3e7mbKuWGNYjLv9+KUrkwGhSXnOwUUCC01w+8JpII2j1W6
8iAvKGszfolVfmfj8vqscQ/UqlSKaGjruWk394v3b7eddYh7HCAOtgOJDIKX9F0e
bMkIdqQgw2e5uenwt1S9TgwOvYi+IfuZ5yhQv9Yuwo76QS8UkxOyvZdRZl7MIchx
O0THaTYbrca0GsSc+r9SIb++rM5fQ0yxQzh36PqbGiA1noS/dhkRZb3ywLPNoFzu
qwWOvcN6ubhO5YOKmTPn1N0uVg94LVMCxMWlO+DjZ8aFmMr96wIDAQABMA0GCSqG
SIb3DQEBBQUAA4IBAQBimCfClavq2Wk1Zsq9AQ3TWeVFrm1kaCUi4J5j3uWNlMVK
PsIGE0BHAALMixG+XWt5+QW70CXq6RnHXMS0TLfM5q6K8jIVURK599bTF2/d4fNq
3QJNaVusuqCqym3Z7rt71QfGtPi0rVKVlQL+lL87a0TDLIyWLsbEe786NpYe0mEe
BXPQwpPwSaJ1PnPNlsl5i/cUZou5zZQGHtqEY/PR7wAxS/28A6qWLVpMQEUYtb9M
ZBb6lO15RJ5qwk6paQG87nhMPAFwSbK+OpCkt3hYd7l8LjXNG74eOZdPM5V6DmZz
nMRF0t4QBDKsuZ64N/+u7R3Nj6uzsQsb7PJXGNTf
-----END CERTIFICATE-----`,
};

// The public attributes available to all Service Providers.
export type MandatoryUserAttributes = {
  eduPersonPrincipalName: string;
  eduPersonScopedAffiliation: string;
  eduPersonEntitlement: string;
  eduPersonTargetedID: { NameID: Object };
  email: string;
};

// The following attributes are optional, and may be missing.
// The user can chooses at the point of authentication whether to share them.
export type OptionalUserAttributes = {
  surname?: string;
  forename?: string;
  name?: string; // Registered name
  displayName?: string;
  title?: string; // multi-valued
  organisation?: string;
  institutionID?: string;
  primaryInstitutionID?: string;
  businessPhone?: string;
  alternativeEmail?: string;
  MISStatus?: "student" | "staff" | string;
  lookupGroupID?: string;
  lookupGroupMapping?: string;
  crsID?: string;
};

export type UserAttributes = MandatoryUserAttributes & OptionalUserAttributes;

// Declaration merging for Passport serializing and deserializing users
declare global {
  namespace Express {
    interface User extends UserAttributes {}
  }
}
type UrnOid = `urn:oid:${string}`;
let userAttributeChart: Record<keyof UserAttributes, UrnOid> = {
  eduPersonPrincipalName: "urn:oid:1.3.6.1.4.1.5923.1.1.1.6",
  eduPersonScopedAffiliation: "urn:oid:1.3.6.1.4.1.5923.1.1.1.9",
  eduPersonEntitlement: "urn:oid:1.3.6.1.4.1.5923.1.1.1.7",
  eduPersonTargetedID: "urn:oid:1.3.6.1.4.1.5923.1.1.1.10",
  email: "urn:oid:0.9.2342.19200300.100.1.3",
  surname: "urn:oid:2.5.4.4",
  forename: "urn:oid:2.5.4.42",
  name: "urn:oid:2.5.4.3",
  displayName: "urn:oid:2.16.840.1.113730.3.1.241",
  title: "urn:oid:2.5.4.12",
  organisation: "urn:oid:2.5.4.11",
  institutionID: "urn:oid:1.3.6.1.4.1.6822.1.1.5",
  primaryInstitutionID: "urn:oid:1.3.6.1.4.1.6822.1.1.30",
  businessPhone: "urn:oid:2.5.4.20",
  alternativeEmail: "urn:oid:1.3.6.1.4.1.6822.1.1.11",
  MISStatus: "urn:oid:1.3.6.1.4.1.6822.1.1.38",
  lookupGroupID: "urn:oid:1.3.6.1.4.1.6822.1.1.22",
  lookupGroupMapping: "urn:oid:1.3.6.1.4.1.6822.1.1.57",
  crsID: "urn:oid:0.9.2342.19200300.100.1.1",
};

export function userFromProfile(profile: saml.Profile): UserAttributes {
  return Object.fromEntries(
    Object.entries(userAttributeChart).map(([k, v]) => {
      return [k, profile[v]];
    })
  ) as UserAttributes;
}

export function setDefaultConfig(config: saml.SamlConfig): saml.SamlConfig {
  let _config = { ...config };
  _config.name = "camsaml";
  _config.passReqToCallback = !!config.passReqToCallback;
  _config.entryPoint ||= raven.entryPoint;
  _config.cert ||= raven.publicCert;
  _config.identifierFormat ||=
    "urn:oasis:names:tc:SAML:2.0:nameid-format:transient";
  _config.idpIssuer ||= "https://shib.raven.cam.ac.uk/shibboleth";
  _config.acceptedClockSkewMs ||= 0;
  _config.authnRequestBinding ||= "HTTP-Redirect"; // Node-saml has unclear docs
  _config.wantAssertionsSigned = true;
  _config.signatureAlgorithm ||= "sha256";
  _config.xmlSignatureTransforms ||= [
    "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
    "http://www.w3.org/2001/10/xml-exc-c14n#",
  ];
  _config.privateKey ||= _config.decryptionPvk;
  _config.decryptionPvk ||= _config.privateKey;
  _config.wantAuthnResponseSigned = true;
  _config.signMetadata = true;
  return _config;
}

export class Strategy extends saml.Strategy {
  name: string = "camsaml";
  _config: saml.SamlConfig;
  constructor(
    config: saml.SamlConfig,
    signonVerify: saml.VerifyWithRequest,
    logoutVerify: saml.VerifyWithRequest
  );
  constructor(
    config: saml.SamlConfig,
    signonVerify: saml.VerifyWithoutRequest,
    logoutVerify: saml.VerifyWithoutRequest
  );
  constructor(config: saml.SamlConfig, signonVerify: any, logoutVerify: any) {
    let conf = setDefaultConfig(config);
    super(conf, signonVerify, logoutVerify);
    this._config = conf;
    let n = (signonVerify as saml.VerifyWithRequest | saml.VerifyWithoutRequest)
      .length;
    let m = (logoutVerify as saml.VerifyWithRequest | saml.VerifyWithoutRequest)
      .length;
    console.assert(
      n === m,
      "Inconsistent verify callback signatures in CamSAML config."
    );
    console.assert(
      config.passReqToCallback ? n === 3 : n === 2,
      "Inconsistent config of passReqToCallback in CamSAML."
    );
  }
}

export function sendServiceProviderMetadata(
  strategy: Strategy,
  publicCert: string
) {
  return function (req: Request, res: Response) {
    res
      .type("application/xml")
      .status(200)
      .send(strategy.generateServiceProviderMetadata(publicCert, publicCert));
  };
}
