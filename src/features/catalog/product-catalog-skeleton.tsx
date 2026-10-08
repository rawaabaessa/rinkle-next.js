import React from "react";

const ProductCatalogSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((number) => (
        <div
          key={number}
          className="rounded-2xl border border-line bg-surface p-4 motion-safe:animate-pulse"
        >
          <div className="aspect-square w-full rounded-xl bg-line" />
          <div className="mt-4 h-4 w-3/4 rounded bg-line" />
          <div className="mt-4 h-5 w-1/3 rounded bg-line" />
          <div className="mt-4 h-11 w-full rounded-xl bg-line" />
        </div>
      ))}
    </div>
  );
};

export default ProductCatalogSkeleton;
