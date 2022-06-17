// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/example-file-transfer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  ContextTags,
  inject,
  injectable
} from '@loopback/core';
import {HttpErrors, Request, Response, RestBindings} from '@loopback/rest';
import multer from 'multer';
import path from 'path';
import {FILE_SERVICE, STORAGE_DIRECTORY} from '../keys';

@injectable({
  scope: BindingScope.TRANSIENT,
  tags: {[ContextTags.KEY]: FILE_SERVICE},
})
export class FileService {
  constructor(
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(STORAGE_DIRECTORY) private storageDirectory: string,
  ) { }

  private getMulterOptions() {
    /*
    The following are the options that can be passed to Multer.
    Key	Description
    dest or storage	Where to store the files
    fileFilter	Function to control which files are accepted
    limits	Limits of the uploaded data
    preservePath	Keep the full path of files instead of just the base name

    If you want more control over your uploads, you'll want to use the storage
    option instead of dest. Multer ships with storage engines DiskStorage and
    MemoryStorage; More engines are available from third parties.

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, '/tmp/my-uploads')
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
      }
    })

    Note: Multer will not append any file extension for you, your function should
    return a filename complete with an file extension.
        */
    const multerOptions: multer.Options = {
      storage: multer.diskStorage({
        destination: this.storageDirectory,
        // Use the original file name as is
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    };
    return multerOptions;
  }

  async upload(request: Request, fieldName: string) {
    return new Promise<Express.Multer.File>((resolve, reject) =>
      multer(this.getMulterOptions()).single(fieldName)(request, this.response, (err?: any) => {
        if (err) {
          reject(err);
        } else {
          const file = request.file;
          if (!file) {
            reject(new Error('file is undefined'))
          } else {
            resolve(file)
          }
          //resolve((request.files as Express.Multer.File[])[0]);
        }
      })
    );
  }

  download(filename: string) {
    const filepath = path.resolve(this.storageDirectory, filename);
    if (!filepath.startsWith(this.storageDirectory)) {
      // The resolved file is outside the designated directory
      throw new HttpErrors.BadRequest(`Invalid file name: ${filename}`);
    }
    // http://expressjs.com/en/api.html#res.download
    // When the root option is provided, Express will validate that the relative path provided as path will resolve within the given root option.
    this.response.download(filepath, filename);
    // The downloadFile returns response as-is to instruct LoopBack to skip the response serialization step as response.download manipulates the response stream directly.
    return this.response;
  }
}
