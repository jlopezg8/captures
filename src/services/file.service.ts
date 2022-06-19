// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, inject, injectable} from '@loopback/core';
import {HttpErrors, Request, Response, RestBindings} from '@loopback/rest';
import multer from 'multer';
import path from 'path';
import {STORAGE_DIRECTORY} from '../keys';

export interface UploadOptions {
  fieldName: string;
  filePath: string;
}

@injectable({scope: BindingScope.TRANSIENT})
export class FileService {
  constructor(
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(STORAGE_DIRECTORY) private storageDirectory: string,
  ) {
    this.storageDirectory = path.normalize(storageDirectory);
  }

  async upload(request: Request, uploadOptions: UploadOptions) {
    return new Promise<Express.Multer.File>((resolve, reject) =>
      this.getMulterSingleFileRequestHandler(uploadOptions)(
        request, this.response, (err?: any) => {
          if (err) {
            reject(err);
          } else if (!request.file) {
            reject(new HttpErrors.BadRequest('no file sent'));
          } else {
            resolve(request.file);
          }
        }
      )
    );
  }

  private getMulterSingleFileRequestHandler(
    {fieldName, filePath}: UploadOptions
  ) {
    const absPath = this.getAbsPath(filePath);
    return multer({
      storage: multer.diskStorage({
        destination: path.dirname(absPath),
        filename: (_req, _file, cb) => cb(null, path.basename(absPath)),
      }),
    }).single(fieldName);
  }

  private getAbsPath(filePath: string) {
    const absPath = path.resolve(this.storageDirectory, filePath);
    if (!absPath.startsWith(this.storageDirectory)) {
      throw new Error('the resolved file is outside the designated directory');
    }
    return absPath;
  }

  download(filePath: string) {
    const absPath = this.getAbsPath(filePath);
    this.response.download(absPath);
    // Return the response as-is to instruct LoopBack to skip the response
    // serialization step as response.download manipulates the response stream
    // directly.
    return this.response;
  }
}
