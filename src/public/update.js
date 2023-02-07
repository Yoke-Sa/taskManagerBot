/**
 * @file nodeで実行し、タスク管理botにコマンドを登録してから起動するファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { guild_id } = process.env;

// 外部ファイルで定義した関数を読み込む
const registerCommand = require('../command/register');

new Promise((resolve) => {
	registerCommand(guild_id);
	resolve();
})
	.then(() => {
		console.log(`\nコマンドを追加しました。`);
		require('./boot');
	})
	.catch((err) => {
		console.error(err);
	});
