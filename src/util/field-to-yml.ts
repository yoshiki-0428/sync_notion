import {BLOG_DEFAULT_YML, BLOG_DEFAULT_IMAGE} from "./env";

const parseType = (key: string, field: any): any => {
  switch (field.type) {
    case 'title':
      if (field.title.length !== 0) {
        return `${key}: ${field.title[0].plain_text}`
      } else {
        return `${key}: ''`
      }
    case 'multi_select':
      if (field.multi_select.length !== 0) {
        const contents = [`${key}:`];
        for (let tag of field.multi_select) {
          contents.push(`  - ${tag.name}`)
        }
        return contents.join('\n');
      }
      break;
    case 'date':
      return `${key}: ${new Date(field.date && field.date.start).toISOString()}`
    case 'files':
      if (field.files.length !== 0) {
        return parseType(key, field.files[0]);
      } else {
        return `${key}: ${BLOG_DEFAULT_IMAGE}`;
      }
    case 'external':
      return `${key}: ${field.external.url}`;
    case 'file':
      return `${key}: ${field.file.url}`;
    case 'rich_text':
      if (field.rich_text.length !== 0) {
        return `${key}: ${field.rich_text[0].plain_text}`;
      } else {
        return `${key}: ''`;
      }
    case 'formula':
      if (field.formula.type === 'string') {
        return `${key}: ${field.formula.string}`;
      } else if (field.formula.type === 'number') {
        return `${key}: ${field.formula.number}`;
      } else if (field.formula.type === 'boolean') {
        return `${key}: ${field.formula.boolean}`;
      } else if (field.formula.type === 'date') {
        return `${key}: ${field.formula.date}`;
      }
  }

  return '';
}

export const parseProperty = (properties: any) => {
  const contents = [BLOG_DEFAULT_YML]
  for (let key in properties) {
    const field = properties[key]

    contents.push(parseType(key, field))
  }

  return contents.filter(c => c !== '').join('\n')
}

