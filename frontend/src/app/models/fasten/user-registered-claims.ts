export class UserRegisteredClaims {
  iss: string //Issuer
  sub: string //Subject
  aud?: string //Audience
  exp: number //ExpiresAt (unix timestamp)
  nbf?: number //NotBefore (unix timestamp)
  iat?: number //IssuedAt (unix timestamp)
  id?: string //ID

  full_name: string //FullName
  picture: string //Picture
  email: string //Email
}
