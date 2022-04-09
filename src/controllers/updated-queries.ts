/* eslint-disable @typescript-eslint/ban-ts-comment */
import { story_data } from "@prisma/client";
import { Response, Request } from "express";
import { getPrismaClient } from "../../prisma/client";

interface RandomStoriesParams {
  stories: story_data[]
  n: number
  exclude_ids?: number[]
}
// shuffle the stories and return n random stories
export const getRandomStories = ({stories, n, exclude_ids}: RandomStoriesParams) => {
  return stories.sort(() => 0.5 - Math.random()).filter(s => exclude_ids ? !exclude_ids.includes(s.id) : s).slice(0, n);
};

export const getHomePageData = async (req: Request, res: Response) => {
  const prismaClient = await getPrismaClient();
  const stories = await prismaClient.story_ids.findMany({
    where: {
      country: "AR"
    },
  });

  const storiesData = [];
  
  for(const story of stories) {
    const result = await prismaClient.story_data.findFirst({
      where: {
        related_story_id: String(story.id)
      }
    });

    storiesData.push({...story, ...result});
  }

  //shuffle the array
  

  //select 5 random stories
  const randomStories = storiesData.slice(0, 5);



  //@ts-ignore
  const totalArticles = storiesData.map(story => story.related_articles).filter(a => a).map(a => a["articles"]).flatMap(a => a).slice(50);
  //@ts-ignore
  const uniqueArticles = storiesData.map(story => story.related_articles).filter(a => a).map(a => a["articles"][0]);
  const size = new TextEncoder().encode(JSON.stringify(totalArticles)).length;
  const kiloBytes = size / 1024;
  const megaBytes = kiloBytes / 1024;

  console.log("storiesIds", uniqueArticles.slice(0, 100).length);
};