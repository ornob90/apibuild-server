/* eslint-disable prettier/prettier */
export const validActions = ['find', 'insert', 'update', 'delete']
export const validParams = ['findOne', 'findAll', 'aggregate']
export const validAggregtes = ['count', 'sum', 'avg'];
export const validSortOrders = ['asc', 'desc']
export type paramType = 'findOne' | 'findAll' | 'aggregate'