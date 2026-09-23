# Cloudflare Pages デプロイ手順

公開先: **https://mochi.nit-games.com**  
リポジトリ: **https://github.com/nit-kl/mochi-brawl**

このゲームは Vite で生成する静的サイトです。Cloudflare Pages の GitHub 連携を使い、`main` へ push された内容を自動でビルド・公開します。追加の GitHub Actions や Cloudflare API トークンは不要です。ゲーム内の画面遷移は Phaser が処理するため、SPA 用のリダイレクト設定も不要です。

## 初回設定

1. このリポジトリの公開したい変更を `main` に反映し、GitHub に push する。
2. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) の **Workers & Pages → Create application → Pages → Import an existing Git repository** から GitHub を接続し、`nit-kl/mochi-brawl` を選ぶ。Cloudflare の GitHub アプリには、このリポジトリへのアクセスを許可する。
3. 次の値で Pages プロジェクトを作成する。

   | 項目 | 値 |
   | --- | --- |
   | Project name | `mochi-brawl`（既に使われている場合は別名でも可） |
   | Production branch | `main` |
   | Root directory | リポジトリのルート（空欄） |
   | Framework preset | `Vite` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

   `.node-version` で Node.js 22.16.0 を指定している。環境変数やシークレットは不要。**Save and Deploy** で最初のビルドを実行する。
4. Pages の **Deployments** で成功を確認し、表示された `https://<project>.pages.dev/` を開く。プロジェクト名が重複した場合、実際の `pages.dev` ホスト名はダッシュボードに表示されたものを使う。
5. Pages プロジェクトの **Custom domains → Set up a domain** で `mochi.nit-games.com` を追加する。`nit-games.com` が同じ Cloudflare アカウントの DNS ゾーンにあれば、通常は CNAME が自動作成される。別アカウントや別の DNS 管理先なら、その管理画面で `mochi` の CNAME を **実際の** `<project>.pages.dev` へ向ける。既存の同名 A/AAAA/CNAME があれば競合しないように確認する。DNS レコードだけを先に作らず、Pages 側にも必ずカスタムドメインを登録する。
6. Custom domains の状態が **Active** になったら、`https://mochi.nit-games.com/` を開く。証明書の発行と DNS 反映には時間がかかる場合がある。

## 動作確認

- `https://mochi.nit-games.com/` でタイトルと画像が表示される。
- キャラ選択から CPU 対戦を開始できる。PC では `local_vs` も開始できる。
- スマホ横画面で仮想スティックと4つのボタンが見える。
- ブラウザ開発者ツールの Network で JS、CSS、キャラ画像、ステージ画像の 404 がない。
- `Resolve-DnsName mochi.nit-games.com -Type CNAME`（Windows）または `dig mochi.nit-games.com CNAME` で、設定した Pages ホスト名を確認できる。

## 更新と復旧

通常の更新は `main` へ push するだけ。Cloudflare Pages がビルドとデプロイを行う。作業ブランチ・PR はプレビュー URL で確認できる。公開に失敗した場合は Pages の **Deployments** でビルドログを確認し、前回の正常なデプロイへ **Rollback** する。DNS レコードを変更する必要はない。

ローカルで公開前に確認する場合は `npm ci`、`npm run build`、`npm run preview` を実行する。`dist/` は生成物であり Git に含めない。

## 参考資料

- [Cloudflare Pages: Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Cloudflare Pages: Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages: Build image](https://developers.cloudflare.com/pages/configuration/build-image/)
