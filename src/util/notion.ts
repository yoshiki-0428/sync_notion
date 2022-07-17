import {Client} from "@notionhq/client";
import {NOTION_DATABASE_ID, NOTION_SECRET_API} from "./env";

export const notionClient = new Client({
  auth: NOTION_SECRET_API,
});

export const getNotionQuery = async (page_size = 0) => {
  const { results, has_more } = await notionClient.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: { "and": [
        {
          "property": "Published",
          "checkbox": {
            "equals": true
          }}]},
    page_size });

  const _record: any[] = []
  _record.push(...results);

  if (has_more) {
    const record = await getNotionQuery(page_size + 1);
    _record.push(...record);
  }
  return _record;
}
