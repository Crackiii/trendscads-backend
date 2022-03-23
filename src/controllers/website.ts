import { Response, Request } from "express";
import { getPrismaClient } from "../../prisma/client";




export const getWebsiteData = async (req: Request, res: Response) => {

  const prismaClient = await getPrismaClient();

}; 