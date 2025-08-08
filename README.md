# Car Race Game

HTML5 Canvas で動くシンプルなレース（避けゲー）です。左右に移動して障害物を避け、スコアを伸ばしましょう。

## 操作

- PC: ← → または A / D で移動
- Space でスタート／リスタート
- P で一時停止／再開
- モバイル: 画面左／右タップ（下部の左右ボタンでも可）

## 開発

- 必要ファイル:
  - `index.html`
  - `styles.css`
  - `main.js`
  - （GitHub Pages 用）`.nojekyll`

ローカルで開く場合は、`index.html` をブラウザで開くだけで動作します。CORS を避けるために簡易サーバを使う場合は、以下のようなコマンドを利用してください。

```
npx serve .
# または
python3 -m http.server 8080
```

## GitHub Pages で公開

2通りの方法があります。どちらか一方で構いません。

### A. 設定画面からブランチ配信

1. リポジトリ Settings → Pages
2. Build and deployment: Source = “Deploy from a branch”
3. Branch = “main”, Folder = “/ (root)”
4. Save

数十秒〜数分後、`https://yuki-miwa.github.io/carRaceGame/` で公開されます。

### B. GitHub Actions でデプロイ（このリポジトリ向け）

この README と一緒に `.github/workflows/pages.yml` を追加すると、`main` にプッシュ時に自動で Pages に公開されます。初回実行後、環境 `github-pages` が作成され、URL が Actions 実行ログに表示されます。

> 注意: Organization ポリシーや権限により、Pages の有効化をリポジトリ設定で許可する必要がある場合があります。

## ライセンス

MIT
