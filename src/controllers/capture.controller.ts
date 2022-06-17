// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

//import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
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
import {FILE_SERVICE} from '../keys';
import {Capture} from '../models';
import {CaptureRepository} from '../repositories';
import {FileService} from '../services';

//@authenticate('jwt')
export class CaptureController {
  constructor(
    @repository(CaptureRepository) private captureRepository: CaptureRepository,
    @inject(FILE_SERVICE) private fileService: FileService,
    @inject(SecurityBindings.USER, {optional: true}) private userProfile: UserProfile,
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
    const uploadedFile = await this.fileService.upload(request, 'file');
    await this.captureRepository.create({
      filepath: uploadedFile.path,
      created_by: this.userProfile[securityId],
      datetime: new Date().toISOString(),
    });
  }

  @get('/captures', {
    responses: {
      200: {
        description: 'All uploaded captures filenames',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Capture}},
          },
        },
      },
    },
  })
  async listCaptures() {
    return this.captureRepository.find({
      where: {created_by: this.userProfile[securityId]},
    });
  }

  @get('/captures/{filename}')
  @oas.response.file()
  async downloadCapture(
    @param.path.string('filename'/*, {required: true}*/) filename: string,
  ) {
    const capture = await this.captureRepository.findOne({
      where: {
        and: [{created_by: this.userProfile[securityId]}, {filepath: filename}],
      },
    });
    if (capture == null) {
      throw new HttpErrors.NotFound('Capture not found');
    }
    return this.fileService.download(filename);
  }
}
