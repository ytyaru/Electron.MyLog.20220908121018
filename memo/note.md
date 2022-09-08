# やったこと

* コメントアウト削除
    * ネットワーク通信系
        * `https`, `axios`パッケージ関係
* 不要ファイル削除
    * SQLite3ファイル関係
        * `mylog-uploader.js`
        * `mylog-downloader.js`
* index.html
    * `<h3><code>db/setting.json</code>ファイル</h3>`の`</h3>`閉じタグスラッシュ忘れ
    * `環境`にバージョン表を追加した
* versions-to-html.js新規追加
    * Electronの`process.versions`をHTML化する
* `つぶやく`, `削除`ボタン
    * setting.jsonデータ存在チェック
        * 真偽から`throw new Error()`に変更
        * 呼出元`try catch`化
    * setting.jsonデータが存在しなければ例外発生
        * `git`コマンドを回避する
        * [createRepo][]を回避する
    * `つぶやく`ボタン押下後のテキストエリア削除バグ修正（`#post`→`#content`）
* Toastify
    * 改行コード表示
        * `css/toastify.css`の`.toastify`に`white-space: break-spaces;`を追記した
    * コンソール出力を修正した
        * `util/toaster.js`の`console.debug`を`console.log`/`console.error`にした

[createRepo]:https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user
