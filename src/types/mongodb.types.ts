/* eslint-disable prettier/prettier */
export interface jsonSchema {
  bsonType: string;
  properties: { [key: string]: { bsonType: string } };
  required?: string[];
}
