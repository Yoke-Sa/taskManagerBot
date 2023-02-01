# taskManager bot

> Install some node-packages

-   discord.js -> v14(14.7.1)
-   dotenv -> get any data from config
-   node-cron -> need to run regularly

```
npm i discord.js dotenv node-cron
```

-   導入するために行う作業
    -   まずは、上記のパッケージをインストールしてください。
    -   次に、.envファイルを作成し、その中に環境変数を作成してください。
        (.envファイルに関してはDiscord上で渡します)
    -   最後に、botを開発者ポータルで作成し、トークンを発行して鯖に召喚すれば準備完了です。
    -   まあ.envファイルに色々と書き加える必要があるので抜けのないように。

> - task_format.jsonには絶対に変更を加えないでください。
> - random_text.jsonはお遊び要素なので付け加えてもらっても構いません。(だるかったら消しても構いません...)
> - task_jsonは一度消してから登録しなおしてもいいと思います。
> - member.jsonは動かしたら定期的に更新されるので放置でいいかと。(最初は消しておくといいかも)
