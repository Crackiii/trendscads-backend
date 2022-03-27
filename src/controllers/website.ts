import { Response, Request } from "express";
import { getPrismaClient } from "../../prisma/client";



export const getWebsiteDataBySearch = async (req: Request, res: Response) => {
  const prismaClient = await getPrismaClient();

  const searchQuery = req.query.searchQuery as string;
  const offset = Number(req.query.offset);
  const limit = Number(req.query.limit);

  const mixedStories = await prismaClient.website_data.findMany({
    where: {
      titles: {
        search: searchQuery.split(" ").join(" | "),
      },
      descriptions: {
        search: searchQuery.split(" ").join(" | ")
      },
      keywords: {
        search: searchQuery.split(" ").join(" | "),
      },
      social: {
        search: searchQuery.split(" ").join(" | ")
      }
    },
    skip: offset,
    take: limit
  });

  res.send({results: mixedStories.map((story) => {
    delete story.html;
    delete story.updated_at;
    delete story.related_query_id;
    delete story.social;

    return {
      all_images: JSON.parse(story.all_images),
      date: story.created_at,
      descriptions: JSON.parse(story.descriptions),
      id: story.id,
      images: JSON.parse(story.images),
      keywords: story.keywords,
      titles: JSON.parse(story.titles),
      url: story.url
    };
  })});
};

export const getWebsiteDataById = async (id: number) => {
  const prismaClient = await getPrismaClient();

  const websiteData = await prismaClient.website_data.findUnique({where: {id}});
  const queryData = await prismaClient.query_data.findUnique({where: {id: Number(websiteData.related_query_id)}});
  const storyData = await prismaClient.story_data.findUnique({where: {id: Number(queryData.related_story)}});
  const storyIds = await prismaClient.story_ids.findMany({where: {id: Number(storyData.related_story_id)}});
  const storyLink = await prismaClient.scrapping_links.findUnique({where: {id: 2305}});

  const mixedStories = await prismaClient.website_data.findMany({
    where: {
      titles: {
        search: queryData.query.split(" ").join(" | "),
      },
      descriptions: {
        search: queryData.query.split(" ").join(" | ")
      },
      keywords: {
        search: queryData.query.split(" ").join(" | "),
      },
      social: {
        search: queryData.query.split(" ").join(" | ")
      }
    },
    skip: 0,
    take: 80
  });

  delete websiteData.updated_at;

  const result = {
    websiteData: {
      descriptions: JSON.parse(websiteData?.descriptions),
      favicon: websiteData?.favicon,
      html: websiteData.html,
      images: JSON.parse(websiteData.images),
      keywords: websiteData.keywords.split(","),
      social: JSON.parse(websiteData.social),
      titles: JSON.parse(websiteData.titles),
      all_images: JSON.parse(websiteData.all_images),
      time: websiteData.created_at,
      url: websiteData.url,
    },
    queryData: {
      id: queryData?.id,
      query: queryData?.query,
      links: JSON.parse(queryData?.links)
    },
    storyData: {
      id: storyData?.id,
      related_articles: JSON.parse(storyData?.related_articles),
      related_queries: JSON.parse(storyData?.related_queries)
    },
    storyIds: {
      id: storyIds[storyIds?.length - 1]?.id || null,
      storiesIds: storyIds?.map(s => s.story_id)
    },
    storyLink: {
      id: storyLink?.id,
      country: storyLink?.country,
      country_short: storyLink?.country_short,
      category: storyLink?.category,
      category_short: storyLink?.category_short,
    },
    allStories: mixedStories.map((story) => {
      delete story.html;
      delete story.updated_at;
      delete story.related_query_id;
      delete story.social;
  
      return {
        all_images: JSON.parse(story.all_images),
        date: story.created_at,
        descriptions: JSON.parse(story.descriptions),
        id: story.id,
        images: JSON.parse(story.images),
        keywords: story.keywords,
        titles: JSON.parse(story.titles),
        url: story.url
      };
    })
  };

  return result;
};


export const getWebsiteDataByExactQuery = async (query: string) => {
  return {query};
};



export const getWebsiteData = async (req: Request, res: Response) => {

  const id = Number(req.params.id);
  const exactMatch = req.query.exact;
  const query = req.query.searchQuery;

  if(exactMatch && Boolean(exactMatch)) {
    const results = await getWebsiteDataByExactQuery(query as string);
    res.send(results);

    return;
  }

  const results = await getWebsiteDataById(id);

  res.send(results);
}; 





export const getStories = async (req: Request, res: Response) => {
  const prismaClient = await getPrismaClient();
  const offset = Number(req.query.offset) || 0;
  const topStoriesLinks = await prismaClient.scrapping_links.findMany({
    distinct: "id"
  });

  const collectedStoriesIds = [];

  for(const link of topStoriesLinks.slice(offset, (offset + 42))) {
    const data = await prismaClient.story_ids.findFirst({
      where: {
        country: link.country_short,
        category: link.category_short
      }
    });
    if(!data?.id) continue;
    collectedStoriesIds.push(data?.id);
  }

  const collectedStoriesData = [];

  for(const id of collectedStoriesIds) {
    const data = await prismaClient.story_data.findFirst({
      where: {
        related_story_id: String(id)
      }
    });

    collectedStoriesData.push(data);
  }


  res.send({LENGTH: collectedStoriesData});
};


export const getFullStories = async (req: Request, res: Response) => {
  const prismaClient = await getPrismaClient();
  const offset = Number(req.query.offset) || 0;
  const limit = Number(req.query.limit) || 42;

  const websiteData = await prismaClient.website_data.findMany({
    distinct: "id",
    skip: offset,
    take: limit,
    select: {
      id:true,
      titles: true, 
      descriptions: true, 
      keywords: true, 
      favicon: true, 
      social: true, 
      images: true,
      all_images: true,
      url: true,
      created_at: true,
      related_query_id: true
    }
  });



  const filteredProperties = [];
  for(const story of websiteData) {
    const queryData = await prismaClient.query_data.findUnique({where: {id: Number(story.related_query_id)}});
    const storyData = await prismaClient.story_data.findUnique({where: {id: Number(queryData.related_story)}});
    const storyIds = await prismaClient.story_ids.findUnique({where: {id: Number(storyData.related_story_id)}});
    const storyLink = await prismaClient.scrapping_links.findUnique({where: {id: storyIds.id}});

    filteredProperties.push({
      id: story.id,
      titles: JSON.parse(story.titles),
      descriptions: JSON.parse(story.descriptions),
      keywords: story.keywords,
      favicon: story.favicon,
      social: JSON.parse(story.social),
      images: JSON.parse(story.images),
      allImages: JSON.parse(story.all_images),
      source: story.url,
      time: story.created_at,
      query: queryData.query,
      queries: JSON.parse(storyData.related_queries),
      country: storyLink?.country,
      category: storyLink?.category_short,
    });
  }

  res.send({results: filteredProperties});
};