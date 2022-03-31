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
      // descriptions: {
      //   equals: searchQuery.split(" ").join(" | ")
      // },
      keywords: {
        search: searchQuery.split(" ").join(" | "),
      },
      // social: {
      //   equals: searchQuery.split(" ").join(" | ")
      // }
    },
    skip: offset,
    take: limit
  });

  res.send({results: mixedStories.map((story) => {
    delete story.html;
    delete story.updated_at;
    delete story.social;
    delete story.related_articles;
    delete story.related_queries;
    delete story.related_links;

    return {
      all_images: story.all_images,
      date: story.created_at,
      descriptions: story.descriptions,
      id: story.id,
      images: story.images,
      keywords: story.keywords,
      titles: story.titles,
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

  if(!websiteData) {
    throw new Error("Website data not found").name = "NotFound";
  }

  const mixedStories = await prismaClient.website_data.findMany({
    where: {
      titles: {
        search: websiteData.related_query.split(" ").join(" | "),
      },
      // related_queries: {
      //   equals: websiteData.related_query.split(" ").join(" | ")
      // },
      // descriptions: {
      //   equals: websiteData.related_query.split(" ").join(" | ")
      // },
      keywords: {
        search: websiteData.related_query.split(" ").join(" | "),
      },
      // social: {
      //   equals: websiteData.related_query.split(" ").join(" | ")
      // }
    },
    skip: 0,
    take: 80
  });

  delete websiteData.updated_at;

  const result = {
    websiteData: {
      descriptions:websiteData?.descriptions,
      favicon: websiteData?.favicon,
      html: websiteData.html,
      images: websiteData.images,
      keywords: websiteData.keywords.split(","),
      social: websiteData.social,
      titles: websiteData.titles,
      all_images: websiteData.all_images,
      time: websiteData.created_at,
      url: websiteData.url,
      query: websiteData?.related_query,
      links: (websiteData?.related_links),
      related_articles: websiteData?.related_articles,
      related_queries: websiteData?.related_queries,
      storiesIds: [] as string[],
      country: websiteData?.related_country.split("-")[0].trim(),
      country_short: websiteData?.related_country.split("-")[1].trim(),
      category: websiteData?.related_category.split("-")[0].trim(),
      category_short: websiteData?.related_category.split("-")[1].trim(),
      
      allStories: mixedStories.map((story) => {
        delete story.html;
        delete story.updated_at;
        delete story.social;
        delete story.related_articles;
        delete story.related_queries;
        delete story.related_links;
    
        return {
          all_images:story.all_images,
          date: story.created_at,
          descriptions:story.descriptions,
          id: story.id,
          images:story.images,
          keywords: story.keywords,
          titles:story.titles,
          url: story.url
        };
      })
    }
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
      related_country: true,
      related_category: true,
      short_description: true
    }
  });
  const filteredProperties = [];
  for(const story of websiteData) {

    filteredProperties.push({
      id: story.id,
      titles: story.titles,
      descriptions: story.descriptions,
      short_description: story.short_description,
      keywords: story.keywords,
      favicon: story.favicon,
      social: story.social,
      images: story.images,
      allImages: story.all_images,
      source: story.url,
      time: story.created_at,
      query: story.related_query,
      queries: story.related_queries,
      country: story?.related_country.split("-")[0].trim(),
      category: story?.related_category.split("-")[0].trim(),
    });
  }

  res.send({results: filteredProperties});
} catch(error) {
      console.log("getFullStories() - ", error.message);
}

};