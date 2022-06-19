// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  HttpErrors,
  oas,
  param,
  post,
  Request,
  requestBody
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Capture} from '../models';
import {CaptureRepository} from '../repositories';
import {FileService} from '../services';

@authenticate('jwt')
export class CaptureController {
  constructor(
    @repository(CaptureRepository) private captureRepository: CaptureRepository,
    @service(FileService) private fileService: FileService,
    @inject(SecurityBindings.USER) private userProfile: UserProfile,
  ) { }

  @post('/captures', {
    responses: {'204': {description: 'Capture upload success'}}
  })
  async upload(
    // Marks a request body for multipart/form-data based file upload, supplied
    // through a field named "file". The field is flagged required by default,
    // however lb4 does not validate an empty value is sent.
    @requestBody.file(/*{required: true}*/) request: Request,
  ): Promise<void> {
    const userId = this.userProfile[securityId];
    const timestamp = new Date().toISOString();
    const filePath = `${userId}_${timestamp.replace(/[:.]/g, '-')}.json`;
    await this.fileService.upload(request, {
      fieldName: 'file',
      filePath,
    });
    await this.captureRepository.create({
      filePath,
      createdBy: userId,
      timestamp,
    });
  }

  @get('/captures', {
    responses: {
      200: {
        description: 'The metadata of the captures uploaded by the user',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Capture}},
          },
        },
      },
    },
  })
  async listMine() {
    return this.captureRepository.find({
      where: {createdBy: this.userProfile[securityId]},
    });
  }

  @get('/captures/{id}')
  @oas.response.file()
  async download(
    @param.path.string('id') id: string,
  ) {
    const capture = await this.captureRepository.findOne({
      where: {
        and: [{createdBy: this.userProfile[securityId]}, {id}],
      },
    });
    if (capture == null) {
      throw new HttpErrors.NotFound();
    }
    return this.fileService.download(capture.filePath);
  }
}
