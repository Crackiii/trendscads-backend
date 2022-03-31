import { Response, Request } from "express";
import { getPrismaClient } from "../../prisma/client";



export const getWebsiteDataBySearch = async (req: Request, res: Response) => {
  try {
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
} catch(error) {
  console.log("getWebsiteDataBySearch() - ", error.message);
}
};

export const getWebsiteDataById = async (id: number) => {
  try {
  const prismaClient = await getPrismaClient();

  const websiteData = await prismaClient.website_data.findUnique({where: {id}});


  console.log({websiteData});
  

  const mixedStories = await prismaClient.website_data.findMany({
    where: {
      titles: {
        search: websiteData.related_query.split(" ").join(" | "),
      },
      descriptions: {
        search: websiteData.related_query.split(" ").join(" | ")
      },
      keywords: {
        search: websiteData.related_query.split(" ").join(" | "),
      },
      social: {
        search: websiteData.related_query.split(" ").join(" | ")
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
      query: websiteData?.related_query,
      links: JSON.parse(websiteData?.related_links)
    },
    storyData: {
      related_articles: JSON.parse(websiteData?.related_articles),
      related_queries: JSON.parse(websiteData?.related_queries)
    },
    storyIds: {
      storiesIds: [] as string[],
    },
    storyLink: {
      country: websiteData?.related_country.split("-")[0].trim(),
      country_short: websiteData?.related_country.split("-")[1].trim(),
      category: websiteData?.related_category.split("-")[0].trim(),
      category_short: websiteData?.related_category.split("-")[1].trim(),
    },
    allStories: mixedStories.map((story) => {
      delete story.html;
      delete story.updated_at;
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
} catch(error) {
    console.log("getWebsiteDataById() - ", error.message);
}
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
  try {
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
} catch(error) {
    console.log("getStories() - ", error.message);
}
};


export const getFullStories = async (req: Request, res: Response) => {
  try {
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
      related_query: true,
      related_queries: true,
      related_country: true
    }
  });

  console.log({websiteData});



  const filteredProperties = [];
  for(const story of websiteData) {

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
      query: story.related_query,
      queries: JSON.parse(story.related_queries),
      country: story?.related_country.split("-")[0].trim(),
      category: story?.related_country.split("-")[1].trim(),
    });
  }

  console.log({filteredProperties});

  res.send({results: filteredProperties});
} catch(error) {
      console.log("getFullStories() - ", error.message);
}

};