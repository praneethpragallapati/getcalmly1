-- CreateTable: one row per member per upvoted target (post OR comment), so votes
-- toggle and never double-count. The post/comment "upvotes" Int stays as a
-- denormalised counter kept in sync within the same transaction as the vote row.
CREATE TABLE "CommunityUpvote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityUpvote_userId_postId_key" ON "CommunityUpvote"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityUpvote_userId_commentId_key" ON "CommunityUpvote"("userId", "commentId");

-- CreateIndex
CREATE INDEX "CommunityUpvote_postId_idx" ON "CommunityUpvote"("postId");

-- CreateIndex
CREATE INDEX "CommunityUpvote_commentId_idx" ON "CommunityUpvote"("commentId");

-- AddForeignKey
ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityUpvote" ADD CONSTRAINT "CommunityUpvote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "CommunityComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
