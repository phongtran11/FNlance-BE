import { PipelineStage, Types } from 'mongoose';
import { PostDto } from 'src/common';

export const findPostByIdPipeline = (
  postId: Types.ObjectId,
): PipelineStage[] => {
  return [
    {
      $match: {
        _id: postId,
      },
    },
  ];
};

export const findAllPostPipeline = (
  page: number,
  limit: number,
): PipelineStage[] => {
  return [
    {
      $match: {},
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];
};

export const countPostPipeline = (filter?: {
  key: keyof PostDto;
  value: any;
}): PipelineStage[] => {
  const matchOperator = filter
    ? {
        [filter.key]: filter.value,
      }
    : {};

  return [
    {
      $match: matchOperator,
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
      },
    },
    {
      $project: { _id: 0 },
    },
  ];
};
