# taskManager bot v1.13

> Install some node-packages

-   discord.js -> v14(14.7.1)
-   dotenv -> get any data from config
-   node-cron -> need to run regularly

```
npm i discord.js dotenv node-cron
```

> 導入するために行う作業
> 1. まずは、上記のパッケージをインストールしてください。
> 2. 次に、.envファイルを作成し、その中に環境変数を作成してください。
> 3. 最後に、botを開発者ポータルで作成し、トークンを発行して鯖に召喚すれば準備完了です。
> 4. まあ.envファイルに色々と書き加える必要があるので抜けのないように。
>
>> - task_format.jsonには絶対に変更を加えないでください。
>> - random_text.jsonはお遊び要素なので付け加えてもらっても構いません。(だるかったら消しても構いません...)
>> - task_jsonは一度消してから登録しなおしてもいいと思います。
>> - member.jsonは動かしたら定期的に更新されるので放置でいいかと。(最初は消しておくといいかも)
___
## v1.13アップデートでの変更点
- botが送信した直近のメッセージに関するいくつかのバグを修正
