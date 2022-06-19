import {Entity, model, property} from '@loopback/repository';

@model()
export class Capture extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  filePath: string;

  @property({
    type: 'string',
    required: true,
  })
  createdBy: string;

  @property({
    type: 'date',
    required: true,
  })
  timestamp: string;


  constructor(data?: Partial<Capture>) {
    super(data);
  }
}

export interface CaptureRelations {
  // describe navigational properties here
}

export type CaptureWithRelations = Capture & CaptureRelations;
