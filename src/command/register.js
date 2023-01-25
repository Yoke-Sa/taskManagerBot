/**
 * @file スラッシュコマンドの登録についてまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { client_id, guild_id, token } = process.env;

// スラッシュコマンド
const { SlashCommandBuilder } = require('@discordjs/builders');

// discord API
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

// ユーザー権限
const { PermissionsBitField } = require('discord.js');

// 登録するコマンドリスト
const commands = [
	// タスク受注コマンド
	new SlashCommandBuilder()
		.setName('task_accept')
		.setDescription('タスクを受注する'),
	// タスク削除コマンド
	new SlashCommandBuilder()
		.setName('task_remove')
		.setDescription('タスクを削除する')
		// 管理者権限を有するメンバーのみ閲覧可能
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		// コマンドの引数
		.addNumberOption(
			(option) =>
				option
					.setName('index')
					.setDescription('削除するタスクの識別番号')
					.setMinValue(1) // 1未満の数値は入力拒否
					.setRequired(true) // この引数を必須オプションにする
		),
	// タスク登録コマンド
	new SlashCommandBuilder()
		.setName('task_register')
		.setDescription('タスクを登録する')
		// 管理者権限を有するメンバーのみ閲覧可能
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
].map((cmd) => cmd.toJSON()); // JSONオブジェクトに変換

/**
 * - スラッシュコマンドを登録する
 */
function resistCommand() {
	// APIのバージョン, botのトークンを指定してREST型のインスタンスを生成
	const rest = new REST({ version: '10' }).setToken(token);

	// 指定したサーバー及びbotにコマンドを登録
	rest.put(Routes.applicationGuildCommands(client_id, guild_id), {
		body: commands,
	})
		// 成功したらログに表示
		.then(() => {
			console.log('コマンドを追加しました。');
		})
		// 失敗したら理由を表示
		.catch((err) => {
			console.error(err);
		});
}

// 外部ファイルから参照可能にする
module.exports = resistCommand;
