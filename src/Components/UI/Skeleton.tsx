// src/Components/UI/Skeleton.tsx
import { FC } from 'react';

export const SkeletonCard: FC = () => (
  <div className="animate-pulse bg-white rounded-lg shadow mb-4 p-4">
    <div className="flex mb-4">
      <div className="h-12 w-12 rounded-full bg-gray-200 mr-3"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/5"></div>
      </div>
    </div>
    <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
    <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
    <div className="h-48 bg-gray-200 rounded mb-4"></div>
    <div className="flex justify-between">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

export const SkeletonUser: FC = () => (
  <div className="flex items-center justify-between py-3 animate-pulse">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-16"></div>
  </div>
);

export const SkeletonButton: FC = () => (
  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
);

export const ActivitySkeleton: FC = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div 
        key={index} 
        className="animate-pulse bg-white rounded-lg shadow p-4 flex items-start space-x-3"
      >
        {/* User Avatar Skeleton */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        </div>

        {/* Activity Content Skeleton */}
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export const PostFormSkeleton: FC = () => (
  <div className="animate-pulse space-y-4">
    {/* Title */}
    <div>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
    
    {/* Content */}
    <div>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-40 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-16 mt-1 ml-auto"></div>
    </div>
    
    {/* Buttons */}
    <div className="flex justify-end space-x-4">
      <div className="h-10 bg-gray-200 rounded w-20"></div>
      <div className="h-10 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);