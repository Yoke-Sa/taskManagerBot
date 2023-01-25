/**
 * @file 毎日ユーザー情報をチェックして、メンバーの加入、脱退および表示名の変更を検知したら通告する処理(検知しなくても毎日何かしら通告する)
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { guild_id, chitchat_id, task_path, members_path, random_path } = process.env;

// 報告用に埋め込みを使う
const { EmbedBuilder } = require('@discordjs/builders');

/** * fileSystemに関連する自作関数をまとめたモジュール */
const fs = require('../function/file');

// 毎日報告用
const { getMonth, getDay } = require('../function/date');
const { rand } = require('../function/mt');

/**
 * - サーバーにいるメンバーの情報を定期的に取得し、ファイルに保存されたメンバーリストと一致しなければ逐次更新及び通告する
 * - ユーザーの表示名が変更されている場合はファイルに保存している表示名を更新する
 * - メンバー情報が一致していた場合は、設定した文章を通告する
 *
 * @param { Client<boolean> } client タスク管理botのインスタンス
 */
async function checkMembers(client) {
	/**
	 * - 雑談チャンネルに通告を飛ばす
	 *
	 * @param { string } title - 送信する埋め込みのタイトル
	 * @param { string } subtext - 送信する埋め込みのテキスト
	 * @param { string } [ content='' ] - 送信する埋め込み外テキスト
	 */
	async function sendNotification(title, text, content = '') {
		// 雑談チャンネルに送信
		await guild.channels.cache.get(chitchat_id).send({
			content: content,
			embeds: [new EmbedBuilder().setTitle(title).setDescription(text)],
		});
	}

	// 通信先のdiscordサーバーを取得
	const guild = client.guilds.cache.get(guild_id);

	// サーバーからメンバーリストを取得
	const members_list = guild.members.cache
		.filter((member) => !member.user.bot) // botは除外
		.map((member) => ({
			id: member.user.id,
			name: member.displayName,
		}));

	// ファイルからデータを読み込む
	const prev_list = fs.existsSync(members_path) ? JSON.parse(fs.readFileSync(members_path)) : [];

	// メンバーリストのデータが存在してれば処理を行う
	if (prev_list.length) {
		// 新規メンバーリストを作成
		const new_members = members_list.filter(
			(member) => !prev_list.some((prev) => prev.id === member.id)
		);

		// 脱退メンバーリストを作成
		const left_members = prev_list.filter(
			(prev) => !members_list.some((member) => member.id === prev.id)
		);

		// 新規メンバーがいた場合は通告を飛ばす
		if (new_members.length) {
			// テキストの作成
			let text = '';
			for (const member of new_members) {
				text += `<@${member.id}>君\n`;
			}
			sendNotification(
				'新たにメンバーが増えたよ',
				text + 'これからよろしくね！'
			);
		}

		// 抜けたメンバーがいた場合は通告を飛ばす
		if (left_members.length) {
			// テキストの作成
			let text = '';
			for (const member of left_members) {
				text += `<@${member.id}>君\n`;
			}
			sendNotification(
				'メンバーが抜けちゃったよ',
				text + '今までありがとう！'
			);
		}

		// 通告用テキストの作成
		const id_list = [];
		const log_list = [];
		members_list.filter((member) => {
			// 前からサーバーにいるメンバーを取得
			const prev_member = prev_list.find((prev) => prev.id === member.id);

			// 表示名が変更されている場合
			if (prev_member && prev_member.name !== member.name) {
				id_list.push(member.id);
				log_list.push(`${prev_member.name} -> ${member.name}`);
			}
		});

		// 表示名を変更したメンバーがいた場合
		if (id_list.length) {
			// 名前変えた通告
			sendNotification(
				'私は見ているぞ',
				`名前が変わってるよねえ！？\n${log_list.join(
					'\n'
				)} \n名前も気持ちも一新して、これからも頑張ろうね！\n\n<@${id_list.join(
					'>君\n<@'
				)}>君`,
				`<@${id_list.join('>\n<@')}>`
			);
		}
		else if (!new_members.length && !left_members.length) {
			// 毎日報告用ランダムメッセージ
			const random_text = JSON.parse(fs.readFileSync(random_path));

			// 一日一回は通告
			sendNotification(
				'今日も平和',
				`今日は${getMonth()}${getDay()}です！\n${random_text[rand(0, random_text.length - 1)]}\n<@${members_list[rand(0, members_list.length - 1)].id}>君！`
			);
		}

		// ファイルのデータが現在のデータと異なる場合
		if (members_list !== prev_list)
			// メンバーリストを上書き
			fs.writeFileSync(members_path, JSON.stringify(members_list));
	}

	// ファイルからデータを読み込む
	const task_list = fs.existsSync(task_path) ? JSON.parse(fs.readFileSync(task_path)) : [];

	if (task_list.length) {
		/** タスクを持ち逃げした人がいたら格納する配列 */
		const missing_list = [];

		// タスク受託者の更新
		for (const task of task_list) {
			if (task.isAssigned) {
				// タスク受託者のidを取得
				const member = members_list.find(
					(member) => member.id === task.entrustee.id
				);
				// 現在もサーバーにいるかで処理分岐
				if (member) {
					// 表示名が変更されていたら更新
					if (task.entrustee.name !== member.name)
						task.entrustee.name = member.name;
				} else missing_list.push(task.entrustee.id);
			}
		}

		// タスクを持ち逃げしたメンバーがいた場合
		if (missing_list.length)
			sendNotification(
				'タスクを持ち逃げしていった輩がいるよ',
				`<@${missing_list.join('>君\n<@')}>君`
			);

		// タスクデータを上書き
		fs.writeFileSync(task_path, JSON.stringify(task_list));
	}
}

// 外部ファイルから参照可能にする
module.exports = checkMembers;
