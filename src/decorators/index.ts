import {
  Transform,
  TransformFnParams,
  TransformOptions,
} from 'class-transformer';
import { Types } from 'mongoose';

/**
 * @decorator To Date Format
 * @description transform string to Date instance
 * @returns new Date()
 */
export const ToDateFormat = (options?: TransformOptions & { format: string }) =>
  Transform((params: TransformFnParams) => {
    const value = new Date(params.value);
    return value;
  }, options);

/**
 * @decorator To number Format
 * @description transform string to number
 * @returns  number
 */
export const ToNumberFormat = (
  options?: TransformOptions & { format: string },
) =>
  Transform((params: TransformFnParams) => {
    const value = Number(params.value);
    return value;
  }, options);

export const ToArrayFormat = (
  options?: TransformOptions & { format: string },
) =>
  Transform((params: TransformFnParams) => {
    const value = params.value.split(',');
    return value;
  }, options);

export const ToMongoObjectId = (
  options?: TransformOptions & { format: string },
) =>
  Transform((params: TransformFnParams) => {
    const value = new Types.ObjectId(params.value);
    return value;
  }, options);
