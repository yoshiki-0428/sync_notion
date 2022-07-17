# sync_notionの概要

notion-to-mdを利用したMarkdown変換ツールです。

notion用にイチからブログを構築する人が辛い人向けに開発しました。

MarkdownファイルをコミットしたいRepositoryのGitHub Actionsにこんな感じのフローを書くとnotionの更新があると自動的にMarkdownファイルが更新されます。

```
#on: [push]
on:
  schedule:
    # @see https://crontab.guru/#0_0_*/7_*_*
    - cron:  '0 0 */7 * *'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        id: setup_node_id
        with:
          node-version: 16
          cache: npm
      - uses: actions/checkout@v3
        with:
          repository: 'yoshiki-0428/sync_notion'
          path: 'sync'
      - name: Create dot env file
        run: |
          touch .env
          echo "NOTION_SECRET_API={your variable}" >> .env
          echo "NOTION_DATABASE_ID={your variable}" >> .env
          echo "UPLOADCARE_PUBLIC_KEY={your variable}" >> .env
          echo "BLOG_PATH={your variable}" >> .env
          echo "BLOG_DEFAULT_IMAGE={your variable}" >> .env
        working-directory: ./sync
      - name: yarn
        run: yarn
        working-directory: ./sync
      - name: run
        run: node build/index.js
        working-directory: ./sync
      - name: Git commit and push
        run: |
          git config --global user.email "bot@a.b"
          git config --global user.name "bot"
          git add content/posts/.
          git add content/sync_notion/package-lock.json
          git status
          git commit --allow-empty -m 'edit by notion data' && git push ${REPO} ${{github.event.pull_request.head.ref}}
```

## 機能

- 画像のfetch処理
  - notionの画像は有効期限付きのS3ファイルなので自分のクラウドに移行する必要があります。
- embed形式の最低限の変更
