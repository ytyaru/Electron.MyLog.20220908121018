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
* setting.jsonファイル／画面UI間の齟齬を吸収するようにした

[createRepo]:https://docs.github.com/ja/rest/repos/repos#create-a-repository-for-the-authenticated-user

# 気になること

* setting.jsのファイルと画面間の整合性

## setting.jsのファイルと画面間の整合性

　<kbd>保存</kbd>ボタンを押すまでは画面／ファイル間で異なる値となる。

* 保存せず実行できてしまう（`git init`, `git push`）
* 保存せず終了できてしまう

### 保存せず実行できてしまう（`git init`, `git push`）

　画面で表示している値でなく、setting.jsonファイルに保存された値で実行してしまう。

### 保存せず終了できてしまう

　前回終了時はちゃんと動作するsetting.jsonの値だったのに、今回起動したら前回最後に<kbd>保存</kbd>ボタンを押したときの古い値であり動作しない。なんてことが起こりうる。

### 解決案

1. アプリ起動する
1. setting.jsonを読み込む
1. setting.jsonを画面UIにセットする
1. 画面UIに任意の値を入力する
1. `つぶやく`または`削除`する
    1. 画面UI値を渡す
    1. `git init`, `git push`する
    1. 成功し、かつ前回のファイル値と異なるなら上書き保存する（成功かつ変更されているときだけ保存する）

　成功かつ変更されているときだけ保存するのがポイント。

* 成功判断：例外発生せず完了したとき
* 変更判断：
    * ファイル値と画面値の２つもつ
    * ファイル値と画面値を比較する
    * ２つのjsonに差異があれば変更ありとみなす

　変更判断するためにはObjectを比較する必要がある。

```javascript
Object.is(setting, uiSetting) // いつも上書きされてしまう
```
```javascript
const a = JSON.stringify(Object.entries(setting).sort())
const b = JSON.stringify(Object.entries(uiSetting).sort())
return a === b;
```

* [Object.is][]
* [JavaScriptでのObject比較方法][]

[JavaScriptでのObject比較方法]:https://www.deep-rain.com/programming/javascript/755
[Object.is]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/is

　なぜか`Object.is`だと常に偽だった。もしかするとユーザが実装していないプロパティ（`hasOwnProperty`）も比較しているのか？

　よくわからないので一致するコードを書いた。

