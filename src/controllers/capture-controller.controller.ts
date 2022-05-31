// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/core';
import {
  get,
  HttpErrors,
  oas,
  param,
  post,
  Request,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {FILE_UPLOAD_SERVICE, STORAGE_DIRECTORY} from '../keys';
import {FileUploadService} from '../types';

const readdir = promisify(fs.readdir);

export class CaptureController {
  constructor(
    @inject(FILE_UPLOAD_SERVICE) private fileUploadService: FileUploadService,
    @inject(STORAGE_DIRECTORY) private storageDirectory: string,
  ) { }

  @post('/captures', {
    responses: {'204': {description: 'Capture upload success'}}
  })
  async upload(
    @requestBody.file() request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<void> {
    return new Promise((resolve, reject) =>
      this.fileUploadService(request, response, (error: unknown) =>
        error ? reject(error) : resolve()
      )
    );
  }

  @get('/captures', {
    responses: {
      200: {
        description: 'All uploaded captures filenames',
        content: {
          'application/json': {
            schema: {type: 'array', items: {type: 'string'}},
          },
        },
      },
    },
  })
  async listCaptures() {
    const filenames = await readdir(this.storageDirectory);
    return filenames;
  }

  @get('/captures/{filename}')
  @oas.response.file()
  downloadCapture(
    @param.path.string('filename') filename: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    const filepath = path.resolve(this.storageDirectory, filename);
    if (!filepath.startsWith(this.storageDirectory)) {
      // The resolved file is outside the designated directory
      throw new HttpErrors.BadRequest(`Invalid file name: ${filename}`);
    }
    response.download(filepath, filename);
    return response;
  }
}
