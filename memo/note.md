# つぶやきを保存するElectron版8

　設定ファイルと画面UI間の齟齬を吸収した。

<!-- more -->

# ブツ

* [リポジトリ][]

[リポジトリ]:https://github.com/ytyaru/Electron.MyLog.20220908121018

## インストール＆実行

```sh
NAME='Electron.MyLog.20220908121018'
git clone https://github.com/ytyaru/$NAME
cd $NAME
npm install
npm start
```

### 準備

1. [GitHubアカウントを作成する](https://github.com/join)
1. `repo`スコープ権限をもった[アクセストークンを作成する](https://github.com/settings/tokens)
1. [インストール＆実行](#install_run)してアプリ終了する
	1. `db/setting.json`ファイルが自動作成される
1. `db/setting.json`に以下をセットしファイル保存する
	1. `username`:任意のGitHubユーザ名
	1. `email`:任意のGitHubメールアドレス
	1. `token`:`repo`スコープ権限を持ったトークン
	1. `repo`:任意リポジトリ名（`mytestrepo`等）
	1. `address`:任意モナコイン用アドレス（`MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu`等）
1. `dst/mytestrepo/.git`が存在しないことを確認する（あれば`dst`ごと削除する）
1. GitHub上に同名リモートリポジトリが存在しないことを確認する（あれば削除する）

### 実行

1. `npm start`で起動またはアプリで<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>キーを押す（リロードする）
1. `git init`コマンドが実行される
	* `repo/リポジトリ名`ディレクトリが作成され、その配下に`.git`ディレクトリが作成される
1. [createRepo][]実行後、リモートリポジトリが作成される

### GitHub Pages デプロイ

　アップロードされたファイルからサイトを作成する。

1. アップロードしたユーザのリポジトリページにアクセスする（`https://github.com/ユーザ名/リポジトリ名`）
1. 設定ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings`）
1. `Pages`ページにアクセスする（`https://github.com/ユーザ名/リポジトリ名/settings/pages`）
    1. `Source`のコンボボックスが`Deploy from a branch`になっていることを確認する
    1. `Branch`を`master`にし、ディレクトリを`/(root)`にし、<kbd>Save</kbd>ボタンを押す
    1. <kbd>F5</kbd>キーでリロードし、そのページに`https://ytyaru.github.io/リポジトリ名/`のリンクが表示されるまでくりかえす（***数分かかる***）
    1. `https://ytyaru.github.io/リポジトリ名/`のリンクを参照する（デプロイ完了してないと404エラー）

　すべて完了したリポジトリとそのサイトが以下。

* [作成DEMO][]
* [作成リポジトリ][]

[作成DEMO]:https://ytyaru.github.io/Electron.MyLog.20220908121018.Site/
[作成リポジトリ]:https://github.com/ytyaru/Electron.MyLog.20220908121018.Site

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

# 気になってたこと

* setting.jsのファイルと画面間の整合性

## setting.jsのファイルと画面間の整合性

　<kbd>保存</kbd>ボタンを押すまでは画面／ファイル間で異なる値になり、以下のようなことができてしまう。

* 保存せず実行できてしまう（`git init`, `git push`）
* 保存せず終了できてしまう

### 保存せず実行できてしまう（`git init`, `git push`）

　画面で表示している値でなく、setting.jsonファイルに保存された値で実行してしまう。UI的には正しい値なのにファイル値が不正なため実行時エラーになりうる。そうなればユーザは混乱するはず。

### 保存せず終了できてしまう

　前回終了時はちゃんと動作するsetting.jsonの値だったのに、今回起動したら前回最後に<kbd>保存</kbd>ボタンを押したときの古い値であり動作しない。なんてことが起こりうる。

### 解決案

　UI入力した値のうち、最後に成功した値を毎回自動保存するよう修正する。

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
// いつも上書きされてしまう……
Object.is(setting, uiSetting)
```
```javascript
// これならOK
const a = JSON.stringify(Object.entries(setting).sort())
const b = JSON.stringify(Object.entries(uiSetting).sort())
return a === b;
```

* [Object.is][]
* [JavaScriptでのObject比較方法][]

[JavaScriptでのObject比較方法]:https://www.deep-rain.com/programming/javascript/755
[Object.is]:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/is

　なぜか`Object.is`だと常に偽だった。もしかするとユーザが直接セットしていないプロパティ（`hasOwnProperty`）も比較しているのか？

　よくわからないので一致するコードを書いた。

　これでムダに<kbd>保存</kbd>ボタンを押さずに済むし、使えない値が自動で上書きされる心配もない。画面に表示されている値と違う値が使われて謎バグに悩まされることもない。

