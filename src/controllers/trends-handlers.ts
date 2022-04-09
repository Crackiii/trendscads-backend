import { realtime_categories } from "./configs";
import { getDailyTrends, getRealTimeStoryIdsByLink, getStoryDetailById, getYoutubeVideos } from "./services";

export const getGoogleRealTimeTrends = async (country: string) => {
  try {
    const categoriesPromises = [];

    for(const category of realtime_categories) {
      const CATGEORY = category.split(" - ")[0].trim();
      categoriesPromises.push(getRealTimeStoryIdsByLink({CATGEORY, LOCATION: country}));
    }
    const storiesIds = await Promise.all(categoriesPromises);
    const filteredStoriesIds = storiesIds.map(stories => stories.slice(0, 10)).flatMap(s => s);
    const promises = [];

    for(const storyId of filteredStoriesIds) {
      promises.push(getStoryDetailById(storyId));
    }

    const data = await Promise.all(promises);
    
    return data;

  } catch(error) {}
  
};


export const getGoogleDailyTrends = async (country: string) => {
  const data = await getDailyTrends({LOCATION: country});

  return data;
};


export const getYoutubeTrends = async () => {
  const data = await getYoutubeVideos();

  return data;
};

export const getDuckDuckGoData = () => "";

export const getTwitterTrends = () => "";

export const getStackExchangeTrends = () => "";

export const coinMarketCap = () => "";
