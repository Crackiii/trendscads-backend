import axios from "axios";
import { Cluster } from "puppeteer-cluster";
import { youtube_trends } from "./configs";

const cookieValue = "";
export const DEFAULT_LANGUAGE = "en-US";
export const DEFAULT_TIMEZONE = "-60";
export const DEFAULT_TIMERANGE_TEXT = "today 1-m";
export const DEFAULT_LOCATION = "US";
export const DEFAULT_CATEGORY = "all";
export const EXPLORE_ENDPOINT = "/explore";
export const PICKERS_ENDPOINT = "/pickers";
export const COUNTRIES_ENDPOINT = "/geo";
export const CATEGORIES_ENDPOINT = "/category";
export const RELATED_SEARCHES_ENDPOINT = "/widgetdata/relatedsearches";
export const RELATED_QUERIES_ENDPOINT = "/widgetdata/relatedqueries";
export const DAILY_TRENDS_ENDPOINT = "/dailytrends";
export const REALTIME_TRENDS_ENDPOINT = "/realtimetrends";
export const INDIVIDUAL_STORY_ENDPOINT = "/stories";

export interface Configs {
  LANGUAGE?: string
  TIMEZONE?: string
  LOCATION?: string
  CATGEORY?: string
  PROPERTY?: string
  TIME_RANGE_TEXT?: "today 1-m" | "today 3-m" | "today 12-m"
}

export const getAxiosClient = () => {
  const baseURL = "https://trends.google.com/trends/api";
  const headers = {} as never;

  if (cookieValue) headers["cookie"] = cookieValue;

  const client = axios.create({
    baseURL,
    headers,

  });

  return client;
};
export const getRealTimeStoryIdsByLink = async (configs?: Configs) => {
  const client = getAxiosClient();

  const URL = [
    REALTIME_TRENDS_ENDPOINT,
    `?hl=${configs?.LANGUAGE || DEFAULT_LANGUAGE}`,
    `&tz=${configs?.TIMEZONE || DEFAULT_TIMEZONE}`,
    `&cat=${configs?.CATGEORY || DEFAULT_CATEGORY}`,
    "&fi=0",
    "&fs=0",
    `&geo=${configs?.LOCATION || DEFAULT_LOCATION}`,
    "&ri=300",
    "&rs=20",
  ].join("");

  const realtimeTrends = await client.get(URL);

  //Get trending story IDS
  const trendingStoriesIDs = JSON.parse(realtimeTrends.data.slice(5)).trendingStoryIds;

  return trendingStoriesIDs;
};

export const getStoryDetailById = async (storyId: string, configs?: Configs) => {
  const client = getAxiosClient();

  try {
    const URL = [[INDIVIDUAL_STORY_ENDPOINT, `${storyId}`].join("/"),
  `?hl=${configs?.LANGUAGE ?? DEFAULT_LANGUAGE}`,
  `&tz=${configs?.TIMEZONE ?? DEFAULT_TIMEZONE}`,
  `&id=${storyId}`
  ].join("");

  const storiesSummary = await client.get(URL);

  const [news, , , queries] = JSON.parse(storiesSummary.data.slice(4)).widgets;

  const relatedQueries = await getRelatedQueries(queries.token, queries.request);

  return { articles: news.articles, relatedQueries };
  } catch(error) {}

};

export const getRelatedQueries = async (token: string, request: object, configs?: Configs) => {
  const client = getAxiosClient();

  const relatedQueries = await client.post([
    RELATED_QUERIES_ENDPOINT,
    `?hl=${configs?.LANGUAGE || DEFAULT_LANGUAGE}`,
    `&tz=${configs?.TIMEZONE || DEFAULT_TIMEZONE}`,
    "&lq=true",
    `&token=${token}`,
  ].join(""), request);

  return relatedQueries.data.slice(5);
};

export const getDailyTrends = async (configs?: Configs) => {
  const client = getAxiosClient();
  try{
  const dailyTrends = await client.get([
    DAILY_TRENDS_ENDPOINT,
    `?hl=${configs?.LANGUAGE ?? DEFAULT_LANGUAGE}`,
    `&tz=${configs?.TIMEZONE ?? DEFAULT_TIMEZONE}`,
    `&geo=${configs?.LOCATION ?? DEFAULT_LOCATION}`
  ].join(""));

  return JSON.parse(dailyTrends.data.slice(5)).default.trendingSearchesDays[0].trendingSearches;
} catch(error) {
  console.log(error.message);
}
};

export const getYoutubeVideos = async () => {
  const perparedLinks = youtube_trends.map(link => `https://www.youtube.com${link.channel}?gl=DE`);
  const videos = await searchLinks(perparedLinks);
  return videos;
};


const searchLinks = async (links: string[]) => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
    monitor: false,
  });
  const allVideos: Record<string, string>[] = [];
  await cluster.task(async ({ page, data: url }) => {
    const res = await page.goto(url);
    res.fromCache();
    await page.waitForSelector("#contents");
    const videos = await page.evaluate(() => {
      const r = document.querySelectorAll("#dismissible");
      const videos = [...r].map(video => {
        const t = video.querySelector("#thumbnail img"); 
        const txt = video.querySelector("h3");
        return {
          thumbnail: t?.getAttribute("src"),
          title: txt?.textContent?.trim(),
          link: video?.querySelector("a")?.getAttribute("href")
        };
      }).filter(v => v.title);

      return videos;
    });
    console.log({videos: videos.length});
    allVideos.push(...videos.slice(0, 10)); 
  });

  for(const link of links) {
    cluster.queue(link);
  }

  await cluster.idle();
  await cluster.close();

  return allVideos;
};





