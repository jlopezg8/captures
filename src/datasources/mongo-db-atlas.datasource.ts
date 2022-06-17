import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

require('dotenv').config();

const config = {
  name: 'MongoDbAtlas',
  connector: 'mongodb',
  url: process.env.MONGO_DB_ATLAS_URL,
  host: '',
  port: 0,
  user: '',
  password: '',
  database: '',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoDbAtlasDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'MongoDbAtlas';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.MongoDbAtlas', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
