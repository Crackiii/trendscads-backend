/* eslint-disable @typescript-eslint/ban-ts-comment */
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
      title: {
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
      //@ts-ignore
      all_images: story.all_images["allImages"],
      date: story.created_at,
      //@ts-ignore
      descriptions: story.descriptions["descriptions"],
      id: story.id,
      //@ts-ignore
      images: story.images["images"],
      keywords: story.keywords,
      title: story.title,
      url: story.url,
      category: story.related_category
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
      title: {
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
      // @ts-ignore
      descriptions:websiteData?.descriptions["descriptions"],
      favicon: websiteData?.favicon,
      html: websiteData.html,
      // @ts-ignore
      images: websiteData.images["images"],
      keywords: websiteData.keywords.split(","),
      // @ts-ignore
      social: websiteData.social["social"],
      title: websiteData.title,
      // @ts-ignore
      all_images: websiteData.all_images["allImages"],
      time: websiteData.created_at,
      url: websiteData.url,
      query: websiteData?.related_query,
      // @ts-ignore
      links: websiteData?.related_links["related_links"]["links"],
      // @ts-ignore
      related_articles: websiteData?.related_articles["related_articles"]["articles"],
      // @ts-ignore
      related_queries: websiteData?.related_queries["related_queries"]["queries"],
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
          // @ts-ignore
          all_images:story.all_images["allImages"],
          time: story.created_at,
          // @ts-ignore
          descriptions:story.descriptions["descriptions"],
          id: story.id,
          // @ts-ignore
          images:story.images["images"],
          keywords: story.keywords.split(","),
          title: story.title,
          url: story.url,
          category: story.related_category.split("-")[0].trim(),
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

  if(results?.websiteData) {
    res.send(results);
  } else {
    // respond with 404 if no results found
    res.status(404).send({error: "No story data found"});
  }

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
      title: true, 
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
      title: story.title,
      //@ts-ignore
      descriptions: story.descriptions["descriptions"],
      short_description: story.short_description,
      keywords: story.keywords,
      favicon: story.favicon,
      //@ts-ignore
      social: story.social["social"],
      //@ts-ignore
      images: story.images["images"],
      //@ts-ignore
      allImages: story.all_images["all_images"],
      source: story.url,
      time: story.created_at,
      query: story.related_query,
      //@ts-ignore
      queries: story.related_queries["related_queries"]["queries"],
      country: story?.related_country.split("-")[0].trim(),
      category: story?.related_category.split("-")[0].trim(),
    });
  }

  res.send({results: filteredProperties});
} catch(error) {
      console.log("getFullStories() - ", error.message);
}

};