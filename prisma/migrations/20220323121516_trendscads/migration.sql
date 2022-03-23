-- CreateTable
CREATE TABLE "ScrappingLinks" (
    "id" SERIAL NOT NULL,
    "country" VARCHAR(50) NOT NULL,
    "countryShort" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "categoryShort" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrappingLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryIds" (
    "id" SERIAL NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "storyId" VARCHAR(200) NOT NULL,
    "relatedLink" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryIds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryData" (
    "id" SERIAL NOT NULL,
    "relatedQueries" TEXT NOT NULL,
    "relatedArticles" TEXT NOT NULL,
    "relatedStoryId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueryData" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "links" TEXT NOT NULL,
    "relatedStory" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteDate" (
    "id" SERIAL NOT NULL,
    "titles" TEXT NOT NULL,
    "descriptions" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "favicon" TEXT NOT NULL,
    "social" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "relatedQueryId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteDate_pkey" PRIMARY KEY ("id")
);
