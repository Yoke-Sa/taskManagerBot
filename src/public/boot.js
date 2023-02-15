/**
 * @file nodeで実行し、タスク管理botを起動するファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { token, check_interval, task_interval, interval } = process.env;

// 定期的に処理を実行するためにcronを読み込む
const cron = require('node-cron');

// bot君のインスタンス生成 v14テンプレ(よけ版)
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const intents = GatewayIntentBits;
const client = new Client({
	intents: [
		intents.Guilds,
		intents.GuildMembers,
		intents.GuildMessages,
		intents.GuildPresences,
		intents.MessageContent,
	],
});

// 外部ファイルで定義した関数を読み込む
const taskCommand = require('../command/response/task');
const mentionEntrustee = require('../cron/mention_entrustee');
const checkMembers = require('../cron/check_members');
const moveRoles = require('../cron/move_roles');

// 起動後に一度だけ呼ばれる
client.once('ready', () => {
	// Discord上でのbotステータス
	client.user.setPresence({
		activities: [{ name: 'お仕事の管理', type: ActivityType.Competing }],
		status: 'online',
	});

	// 起動確認
	console.log(`\n${client.user.tag} : 正常に起動しました。`);

	// メンバーの更新
	checkMembers(client);

	// ロール申請所
	moveRoles(client);

	// コマンドが実行されたら処理が実行される
	taskCommand(client);

	// 朝7時になったタイミングでメンバーチェック(何かしら報告する)
	cron.schedule(check_interval, () => {
		checkMembers(client);
	});

	// 日付が変わるタイミングで対象者にメンションを飛ばす
	cron.schedule(task_interval, () => {
		mentionEntrustee(client);
	});
});

// Discordへ接続する
client.login(token);

// ネットワーク接続エラーでプログラムがクラッシュしないようにする
process.on('multipleResolves', (type, promise, reason) => {
	if (
		(reason?.toLocaleString() || '') ===
		'Error: Cannot perform IP discovery - socket closed'
	)
		return;
});
