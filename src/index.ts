import {NotionToMarkdown} from "notion-to-md";
import {getNotionQuery, notionClient} from "./util/notion";
import {promises as fs} from "fs";
import {BLOG_PATH} from "./util/env";
import {extract} from "oembed-parser";
import {parseProperty} from "./util/field-to-yml";
import {ListBlockChildrenResponseResult} from "notion-to-md/build/types";

const n2m = new NotionToMarkdown({ notionClient });

const main = async () => {
  const results = await getNotionQuery();
  const list = await fs.readdir(BLOG_PATH)
  const pages = list.filter(l => l.indexOf('page') !== -1).map(l => {
    const pageId = l.split('--')[1]
    const versionDate = l.split('--')[2]
    return { filename: l, pageId, versionDate }
  })
  // 非公開になった場合は削除する
  const notionPageIds = results.map(r => r.id)
  for (const p of pages) {
    if (!notionPageIds.includes(p.pageId))
      await fs.rm(`${BLOG_PATH}/${p.filename}`)
  }

  for await (const result of results) {
    // 同じpageIdが存在
    const p = pages.find(p => p.pageId === result.id);
    if (p) {
      // 更新がかかっていれば削除して変更する
      if (p.versionDate < result.last_edited_time) {
        await fs.rm(`${BLOG_PATH}/${p.filename}`);
      } else {
        continue;
      }
    }

    console.log('convert start::pageId:', result.id, '::title:', result.properties['slug'].formula.string)

    const frontmatter = '---\n' + parseProperty(result.properties) + '\n---\n'

    n2m.setCustomTransformer('image', async (block: ListBlockChildrenResponseResult): Promise<string> => {
      console.log('image fetch ::')
      console.log(block)
      // const image_caption_plain = block.caption
      //   .map((item) => item.plain_text)
      //   .join("");
      // if (block.type === "external") {
      //   const fileUrl = await uploadToUploadCare(block.external.url)
      //   return `![](${fileUrl})`
      // } else if (block.type === "file") {
      //   const fileUrl = await uploadToUploadCare(block.file.url)
      //   return `![](${fileUrl})`
      // }
      return ''
    })

    n2m.setCustomTransformer('embed', async (block): Promise<string> => {
      // @ts-ignore
      const {embed} = block;
      if (!embed?.url) return '';

      console.log('convert embed::start::url', embed.url)
      if (embed.url.indexOf("https://maps.app.goo.gl") !== -1) {
        return `[Google Mapで開く](${embed.url})`
      }

      extract(embed.url).then((oembed) => {
        // @ts-ignore
        return oembed.html
      }).catch((err) => {
        console.warn('convert embed::failed::alternative::convert', `[${embed.url}](${embed.url})`)
        return `[${embed.url}](${embed.url})`
      })
      return ''
    });

    const mdblocks = await n2m.pageToMarkdown(result.id);
    const mdString = n2m.toMarkdownString(mdblocks);
    const markdownFile = frontmatter + mdString

    // writing to file
    await fs.writeFile(`${BLOG_PATH}/page--${result.id}--${result.last_edited_time}.md`, markdownFile);
  }


  console.log('hello!')
}

main()
