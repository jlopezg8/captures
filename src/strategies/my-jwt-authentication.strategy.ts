import {AuthenticationStrategy} from '@loopback/authentication';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import fetch from 'node-fetch';

require('dotenv').config();

export class MyJWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'jwt';

  async authenticate(request: Request) {
    const authHeaderValue = request.headers.authorization;
    const response = await fetch(
      new URL('/whoAmI', process.env.AUTH_API_ROOT_URL),
      {headers: authHeaderValue ? {Authorization: authHeaderValue} : undefined}
    );
    if (response.ok) {
      return await response.json() as UserProfile;
    } else {
      throw HttpErrors(response.status, response.statusText, response);
    }
  }
}
