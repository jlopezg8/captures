import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDbAtlasDataSource} from '../datasources';
import {Capture, CaptureRelations} from '../models';

export class CaptureRepository extends DefaultCrudRepository<
  Capture,
  typeof Capture.prototype.id,
  CaptureRelations
> {
  constructor(
    @inject('datasources.MongoDbAtlas') dataSource: MongoDbAtlasDataSource,
  ) {
    super(Capture, dataSource);
  }
}
