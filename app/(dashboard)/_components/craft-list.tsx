"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { CraftCard } from "./craft-card";
import { EmptySearch } from "./empty-search";
import { EmptyCrafts } from "./empty-crafts";
import { EmptyFavorites } from "./empty-favorites";
import { NewCraftButton } from "./new-craft-button";

interface CraftListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
};

export const CraftList = ({
  orgId,
  query,
}: CraftListProps) => {
  const data = useQuery(api.crafts.get, { 
    orgId,
    ...query,
  });

  if (data === undefined) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favorites ? "Favorite crafts" : "Team crafts"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
          <NewCraftButton orgId={orgId} disabled />
          <CraftCard.Skeleton />
          <CraftCard.Skeleton />
          <CraftCard.Skeleton />
          <CraftCard.Skeleton />
        </div>
      </div>
    )
  }

  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  if (!data?.length && query.favorites) {
    return <EmptyFavorites />
  }

  if (!data?.length) {
    return <EmptyCrafts />
  }

  return (
    <div>
      <h2 className="text-3xl">
        {query.favorites ? "Favorite crafts" : "Team crafts"}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
        <NewCraftButton orgId={orgId} />
        {data?.map((craft) => (
          <CraftCard
            key={craft._id}
            id={craft._id}
            title={craft.title}
            imageUrl={craft.imageUrl}
            authorId={craft.authorId}
            authorName={craft.authorName}
            createdAt={craft._creationTime}
            orgId={craft.orgId}
            isFavorite={craft.isFavorite}
          />
        ))}
      </div>
    </div>
  );
};