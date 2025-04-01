-- CreateTable
CREATE TABLE "Film" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numberReviews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filmId" INTEGER,
    "title" VARCHAR(255) NOT NULL,
    "rating" INTEGER NOT NULL,
    "content" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE SET NULL ON UPDATE CASCADE;
