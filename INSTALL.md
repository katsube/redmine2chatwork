# INSTALL

## 目次
1. [Chatwork](#chatwork)
    1. [APITokenを取得](#apitokenを取得)
    2. [ルームIDを取得](#ルームidを取得)
1. [Redmine](#redmine)
    1. [RESTの使用を許可](#restの使用を許可)
    2. [APIアクセスキーを取得](#apiアクセスキーを取得)
    3. [ProjectIDを取得](#projectidを取得)
1. [GoogleAppsScriptの設定](#googleappsscriptの設定)
    1. アプリを追加
    2. GASプロジェクトの作成
    3. スクリプトをセットし実行

## Chatwork
### APITokenを取得
Chatworkへボット用ユーザーでログインします。  
その後右上のメニューから「API設定」を押下。  
![CHATWORK1](document/image/setup_chatwork001.png "CHATWORK1")

ログイン時に使用したパスワードを入力し「表示」ボタンを押下。  
![CHATWORK2](document/image/setup_chatwork002.png "CHATWORK2")

API Tokenが表示されるのでメモしておきます。  
![CHATWORK3](document/image/setup_chatwork003.png "CHATWORK3")

### ルームIDを取得
botから投稿したい部屋を表示します。この時のURLの一部がルームIDになります。以下の場合は`92709970`が該当しますので、これをメモしておきます。  
![CHATWORK4](document/image/setup_chatwork004.png "CHATWORK4")


## Redmine
### RESTの使用を許可
Redmineに管理者ユーザーでログインします。  
左上のメニューにある`管理`から`設定`→`API`とたどり、「RESTによるWebサービスを有効にする」にチェック、「保存」ボタンを押下します。   
![REDMINE](document/image/setup_redmine001.png "Redmine1")

### APIアクセスキーを取得
botが使用するRedmine側のユーザーでログインします。  
APIアクセスキーが漏れた場合などを考慮し、専用のユーザーを作成し最低限の権限のみ付与しておくのがおすすめです。

ログインできたら画面右上の`個人設定`をクリックし設定画面を表示します。画面右側に「APIアクセスキー」とある部分の「表示」リンクを押下。  
![REDMINE](document/image/setup_redmine002.png "Redmine2")

APIアクセスキーが表示されるのでこれをメモしておきます。  
![REDMINE](document/image/setup_redmine003.png "Redmine3")

### ProjectIDを取得
新しくプロジェクトを作成する際に「識別子」を入力していると思いますが、これをメモしておきます。  
![REDMINE](document/image/setup_redmine004.png "Redmine4")

URLの一部にもなっています。以下の場合は`test`が該当します。  
![REDMINE](document/image/setup_redmine005.png "Redmine5")


## GoogleAppsScriptの設定
### アプリを追加
GoogleAppsScript(以降GAS)を導入していない場合にこの作業が必要になります。WebブラウザからGoogleDriveにログインをし、`新規`→`その他`→`アプリを追加`とたどります。  
![GAS](document/image/setup_gas001.png "GAS1")

Google Apps Scriptの項目を見つけ（もしくは検索し）、`+接続`ボタンを押下します。  
![GAS](document/image/setup_gas002.png "GAS2")

### GASプロジェクトの作成
`新規`→`その他`→`Google Apps Script`とたどります。  
![GAS](document/image/setup_gas003.png "GAS3")

画面の左上をクリックしプロジェクト名を適当に入力します。GoogleDrive上のファイル名にもなりますので管理しやすい物が良いでしょう。ちなみにDrive上でファイルの場所を移動してもトリガーの動作には影響しません。  
![GAS](document/image/setup_gas004.png "GAS4")

必要な「ライブラリ」を入れます。  
このスクリプトは`ChatWorkClient`を必要としますので、`リソース`メニューから`ライブラリ`を選択します。  
![GAS](document/image/setup_gas005.png "GAS5")

テキストボックスに`M6TcEyniCs1xb3sdXFF_FhI-MNonZQ_sT`を入力し`追加`ボタンを押下します。このライブラリはChatwork社の中の方が作成された非公式ライブラリです。[GitHubのリポジトリはこちら](https://github.com/cw-shibuya/chatwork-client-gas)。  
![GAS](document/image/setup_gas006.png "GAS6")

バージョンで`18`または最新の物を選択し最後に`保存`ボタンを押下します。`×`で閉じてしまうとライブラリが追加されませんので注意が必要です。  
![GAS](document/image/setup_gas007.png "GAS7")

### スクリプトをセットし実行
本リポジトリの[checkRedmine.js](https://github.com/katsube/redmine2chatwork/blob/master/GoogleAppsScript/checkRedmine.js)の中身をGASのエディタにコピペします。

変数`CONFIG`の中身を適宜編集し、**必ず保存**します。保存していないと次のステップが実行できません。  
![GAS](document/image/setup_gas008.png "GAS8")

`実行`→`関数を実行`→`executeMe`とたどります。  
![GAS](document/image/setup_gas009.png "GAS9")

このあと指定したChatworkの部屋に投稿されていれば成功です。
