import {AuthenticationStrategy} from '@loopback/authentication';
import {HttpErrors, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
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
      const userProfile = await response.json() as UserProfile;
      userProfile[securityId] = userProfile.id;
      return userProfile;
    } else {
      throw HttpErrors(response.status, response.statusText, response);
    }
  }
}
