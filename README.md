# Illustrator 埋め込み画像→PSDリンク変換スクリプト

Adobe Illustratorで埋め込み画像・貼り付け画像をPSDリンク画像に変換するスクリプトです。

## 機能

- 選択した埋め込み画像・ラスタライズ画像をPSDファイルとして書き出し
- 元の画像を削除し、PSDをリンク画像として配置
- 画像の位置、サイズ、回転、不透明度を保持
- クリッピングマスクを維持
- PSD解像度とカラーモード（RGB/CMYK）を選択可能
- 処理結果を詳細レポート

## 使い方

1. Illustratorでドキュメントを開く
2. 変換したい画像を選択（複数選択可）
3. `ファイル` → `スクリプト` → `その他のスクリプト...`
4. このスクリプト（`.jsx`ファイル）を選択
5. 解像度とカラーモードを設定
6. PSD保存先フォルダを選択
7. 完了！

## インストール

### 方法1: 直接実行
1. スクリプトファイル（`.jsx`）をダウンロード
2. Illustratorで実行

### 方法2: スクリプトフォルダに配置
1. スクリプトファイルを以下のフォルダにコピー:
   - Windows: `C:\Program Files\Adobe\Adobe Illustrator [version]\Presets\ja_JP\スクリプト`
   - Mac: `/Applications/Adobe Illustrator [version]/Presets/ja_JP/スクリプト`
2. Illustratorを再起動
3. `ファイル` → `スクリプト`メニューから直接実行可能

## 注意事項

- 埋め込み画像の元のファイル名は、Illustratorの仕様上取得できない場合があります
- クリッピングマスクが複雑な場合、一部維持されないことがあります
- 処理前にドキュメントを保存することをお勧めします

## 動作環境

- Adobe Illustrator CC 2015以降

## ライセンス

MIT License

## 貢献

バグや機能改善はご自身でご対応ください。
```

## 4. ライセンスファイルを追加（オプション）

1. リポジトリページで「Add file」→「Create new file」
2. ファイル名: `LICENSE`
3. 内容（MIT Licenseの場合）:
```
MIT License

Copyright (c) 2025 chikuwa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
