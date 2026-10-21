# AIで作る！100円note販売スタートガイド（特典ページ）

> 設計の共通原則は `~/.claude/CLAUDE.md` に従う。要件は `docs/requirements.md`。

## プロジェクト設定

技術スタック: HTML5 / CSS3 / Vanilla JavaScript（ビルドなし）、GitHub Pages。backend・database・環境変数なし（`.env` 系は作らない）。

## 運用ルール

- 楽天アフィ特典（アイボリー×ブラウン×ベージュ＋くすみピンク）の複製。複製元と既存特典は未変更
- 文章・プロンプト・リンクの単一の源は `js/content.js`。色・フォント・余白の単一の源は `css/style.css` の `:root`。この特典の追加部品は style.css 末尾にまとめる
- noteの価格・手数料・設定は公式ヘルプで確認した範囲のみ記載（`docs/requirements.md` §4・§5）。確認できない設定は載せない
- 売上・実績・体験談を創作しない。リールの「162,350円」は仮置きなので載せない
- CTA: ファーストビュー直下（教科書5大特典の画像）と最後の2か所。OGP画像は指定がなければ設定しない

## 命名・品質

- ファイル kebab-case / 変数 camelCase / 関数100行・ファイル700行・複雑度10・行長120以下
- ローカル確認: `python3 -m http.server <port>` を1つだけ起動

## ドキュメント管理

許可: `docs/requirements.md` / `docs/SCOPE_PROGRESS.md` / `README.md` / `LICENSE.md`。他は要許諾。

## 品質ゲート

- 第一防壁: ローカル git hook（pre-commit: 秘密情報拒否＋JS構文）
- 最終防壁: GitHub Actions `verify`（JS構文・必須ファイル・index.htmlのリンク切れ）。main保護
- ブランチ: `main`＝公開 / `develop`＝編集
