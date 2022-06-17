// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AuthenticationComponent,
  registerAuthenticationStrategy
} from '@loopback/authentication';
import {SecuritySpecEnhancer} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {STORAGE_DIRECTORY} from './keys';
import {MySequence} from './sequence';
import {MyJWTAuthenticationStrategy} from './strategies';

export {ApplicationConfig};

export class MlCloudDDoSApiCapturesApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.mountAuthSystem();
    // Upload files to `/.sandbox/` by default
    this.bind(STORAGE_DIRECTORY).to(
      options.fileStorageDirectory ?? path.join(__dirname, '../.sandbox'),
    );

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  private mountAuthSystem() {
    this.component(AuthenticationComponent);
    this.add(createBindingFromClass(SecuritySpecEnhancer));
    registerAuthenticationStrategy(this, MyJWTAuthenticationStrategy);
  }
}
