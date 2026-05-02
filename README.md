# Super TS Mario (Phaser 3 Game)

TypeScript と Phaser 3 を使用して制作した、ブラウザで遊べるマリオ風アクションゲームです。
<img width="880" height="614" alt="スクリーンショット 2026-05-02 141609" src="https://github.com/user-attachments/assets/c25313ba-7d65-4f50-b67a-863b77245148" />


## 🎮 ゲーム概要
シンプルな横スクロールアクションゲームです。
雑魚敵を 3 体倒すと強力なボスが登場し、ボスを撃破するとゴールが出現します。

### 遊び方
- **左右矢印キー**: 移動
- **上矢印キー**: ジャンプ
- **踏みつけ**: 敵の頭の上に乗ることでダメージを与えられます

## 🚀 技術スタック
- **Engine**: Phaser 3 (Arcade Physics)
- **Language**: TypeScript
- **Bundler**: Vite

## 🛠️ 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone [https://github.com/hirof35/mario-style-game.git](https://github.com/hirof35/mario-style-game.git)
依存関係のインストール

Bash
npm install
ローカルサーバーの起動

Bash
npm run dev
✨ こだわりポイント（実装済み機能）
物理演算の最適化: 敵を踏んだ際の反動や、ボス戦での無敵時間（点滅演出）による判定の安定化を実現。

シーン管理: タイトル画面、メインゲーム、クリア、ゲームオーバーの各シーンを TypeScript のクラスで管理。

動的テクスチャ: 外部画像ファイルを使用せず、コード内で Graphics を用いてテクスチャを生成する軽量設計。

📝 今後のアップデート予定
コインの追加とスコアシステムの実装

ステージの拡張（カメラ追従機能の追加）

効果音・BGMの実装


---

### GitHub での表示をきれいにするコツ
1. **ファイルの拡張子**: 必ず `.md`（マークダウン）にしてください。`.txt` や拡張子なしだと、GitHub がおしゃれに整形してくれません。
2. **プレビュー**: VS Code を使っている場合、`Ctrl + Shift + V` を押すと、GitHub でどう見えるかプレビューできます。

### README を作成した後のコマンド
もしローカルで作った場合は、もう一度以下のコマンドで GitHub に送ってください。

```bash
git add README.md
git commit -m "docs: Add README.md"
git push origin main
