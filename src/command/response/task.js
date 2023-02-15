/**
 * @file タスク管理を行うコマンドへの応答をまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { schedule_id, task_id, format_path, task_path } = process.env;

// 使用するものだけ読み込む
const { Events, TextInputStyle } = require('discord.js');
const {
	ActionRowBuilder,
	codeBlock,
	EmbedBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
} = require('@discordjs/builders');

/** * fileSystemに関連する自作関数をまとめたモジュール  */
const fs = require('../../function/file');

/**
 * タスクを管理するため処理を行う関数
 *
 * - コマンドへの応答
 * - 選択メニューへの応答
 * - モーダル内の送信ボタンへの応答
 *
 * 上記の3つの処理を各クロージャーを用いてまとめたもの。
 *
 * @param { Client<boolean> } client タスク管理botのインスタンス
 */
function taskManager(client) {
	// register用
	let task_items = [],
		id_list = [];
	// remove用
	let prev_task = [],
		del_task = {};
	// accept用
	let accept_index = 0;

	// スラッシュコマンドが実行された場合の処理
	client.on('interactionCreate', async (cmd) => {
		// コマンド以外には反応しない
		if (!cmd.isCommand()) return;

		// 実行されたコマンドの名前を取得
		const { commandName } = cmd;

		// コマンド名で処理分岐
		switch (commandName) {
			case 'task_accept': {
				// ファイルが存在していればデータを読み込む
				const task_list = (await fs.fileExists(task_path))
					? await fs.readFile(task_path)
					: [];

				// データの有無で処理分岐
				if (!task_list.length) {
					// コマンドに返信する
					await cmd.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder().setTitle(
								'受注出来る仕事がありません'
							),
						],
					});

					return;
				} else {
					// 未受注かつコマンド実行者のロールを含むタスクのみ抽出
					const unassigned_tasks = task_list.filter(
						(task) =>
							!task.hasOwnProperty('entrustee') &&
							task.roles.some((role) =>
								cmd.member.roles.cache
									.map((roles) => roles.id)
									.includes(role.id)
							)
					);

					// タスクの有無で処理分岐
					if (!unassigned_tasks.length) {
						// コマンドに返信する
						await cmd.reply({
							ephemeral: true,
							embeds: [
								new EmbedBuilder().setTitle(
									'受注出来る仕事がありません'
								),
							],
						});

						return;
					} else {
						// コマンドに返信する
						await cmd.reply({
							embeds: [
								new EmbedBuilder().setTitle(
									'タスクを受注します'
								),
							],
							components: [
								new ActionRowBuilder().setComponents(
									new StringSelectMenuBuilder()
										.setCustomId('accept')
										.setMinValues(1)
										.setMaxValues(1)
										.setOptions(
											unassigned_tasks.map((task) => ({
												label: task.name,
												value: String(task.index),
											}))
										)
										.setPlaceholder(
											'受注するタスクの識別番号を選択'
										)
								),
							],
						});
					}

					return;
				}
			}
			case 'task_register': {
				// ファイルが存在していればデータを読み込む
				const unassigned_tasks = (await fs.fileExists(task_path))
					? (await fs.readFile(task_path)).filter(
							(task) => !task.isAssigned // 未受注タスクのみ抽出
					  )
					: [];

				// 未受注タスクが25個(SelectMenuの最大値)を越えているかで処理分岐
				if (unassigned_tasks.length >= 25) {
					// コマンドに返信する
					await cmd.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder()
								.setTitle('発注可能上限に達しています')
								.setDescription(
									codeBlock(
										'fix',
										'タスクを受注してもらうか、削除してください。'
									)
								),
						],
					});

					return;
				} else {
					// メンション可能なロールを所得
					const mentionable_roles = cmd.guild.roles.cache
						.filter((role) => role.mentionable)
						.map((role) => role);

					// ロールの選択メニューを作成
					const roles_menu = new StringSelectMenuBuilder()
						.setCustomId('register')
						.setMinValues(1) // 最低でも1つはロールを選択させる
						.setMaxValues(mentionable_roles.length)
						.setOptions(
							mentionable_roles.map((role) => ({
								label: role.name,
								value: `${role.id},${role.name}`,
							}))
						)
						.setPlaceholder('仕事を割り振るロールを選択');

					// コマンドに返信する
					await cmd.reply({
						embeds: [
							new EmbedBuilder().setTitle(
								'タスクの登録を開始します'
							),
						],
						components: [
							new ActionRowBuilder().setComponents(roles_menu),
						],
					});

					return;
				}
			}
			case 'task_remove': {
				// コマンドの引数で入力された数値を取得
				const target = cmd.options.getNumber('index');

				// ファイルが存在していればデータを貰う
				const task_list = (await fs.fileExists(task_path))
					? await fs.readFile(task_path)
					: [];

				// データの有無で処理分岐
				if (!task_list.length) {
					// コマンドに返信する
					await cmd.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder().setTitle(
								'削除できる仕事がありません'
							),
						],
					});

					return;
				} else {
					// 削除前のタスクデータを取得
					prev_task = task_list;

					// タスクの識別番号として存在する数値かどうかで処理分岐
					if (target > prev_task.length) {
						// コマンドに返信する
						await cmd.reply({
							ephemeral: true,
							embeds: [
								new EmbedBuilder()
									.setTitle('不正な値は受け付けません')
									.setDescription(
										codeBlock(
											'fix',
											`　${target}個も仕事がありません。\n今あるのは${prev_task.length}個のみです。`
										)
									),
							],
						});

						return;
					} else {
						// 識別番号が引数と一致するタスクを取得
						del_task = prev_task.find(
							(prev) => prev.index === target
						);

						// 確認画面用のモーダルを作成
						const modal = new ModalBuilder()
							.setCustomId('remove')
							.setTitle('本当に削除してよろしいですか？');

						// 確認画面にデータ表示欄を追加
						modal.addComponents(
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId('index')
									.setLabel('タスク識別番号')
									.setValue(`${String(del_task.index)}`)
									.setStyle(TextInputStyle.Short) // 一行だけ
									.setRequired(false) // 入力を必要としない
							),
							new ActionRowBuilder().addComponents(
								new TextInputBuilder()
									.setCustomId('name')
									.setLabel('タスク名')
									.setValue(`${del_task.name}`)
									.setStyle(TextInputStyle.Short) // 一行だけ
									.setRequired(false) // 入力を必要としない
							)
						);

						// 確認画面を表示
						await cmd.showModal(modal);
					}

					return;
				}
			}
		}

		return;
	});

	// 選択メニューで何かしら選択された場合の処理
	client.on(Events.InteractionCreate, async (select) => {
		// 選択メニュー以外には反応しない
		if (!select.isStringSelectMenu()) return;

		// カスタムIDを取得
		const { customId } = select;

		if (customId === 'accept') {
			// 選択したタスクの識別番号を取得
			accept_index = Number(select.values[0]);

			// 納期設定画面用のモーダルを作成
			const modal = new ModalBuilder()
				.setCustomId('accept')
				.setTitle('タスクの納期を設定');

			// 設定画面に入力欄を追加
			modal.addComponents(
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('deadline')
						.setLabel('タスクの納期を設定してください')
						.setMinLength(3)
						.setMaxLength(5)
						.setPlaceholder('3/9')
						.setRequired(true) // 入力必須
						.setStyle(TextInputStyle.Short)
				)
			);

			// 設定画面を表示
			await select.showModal(modal);

			// 使用した選択メニューは削除
			await select.channel.messages.delete(select.message);
		}

		if (customId === 'register') {
			// 初期化
			task_items = [];

			// 選択したロールを配列に格納
			task_items.push(select.values);

			/**
			 * タスクの設定項目について5つの入力欄を作成し、配列で返す
			 * @returns { TextInputBuilder[] }  TextInputBuilderで作成した入力欄の配列
			 */
			const makeTextInputArray = async () => {
				// 戻り値として渡すTextInputBuilderの配列
				const results = [];

				// 初期化
				id_list = [];

				/**
				 * ファイルから読み込んだタスクの設定項目に関するJSONオブジェクト
				 * @type { JSON[] }
				 */
				const task_options = await fs.readFile(format_path);

				// 設定項目用の入力欄を配列に格納
				for (const option of task_options) {
					// 入力欄を生成し配列に格納
					results.push(
						new TextInputBuilder()
							.setCustomId(option.id)
							.setLabel(option.label)
							.setMinLength(1)
							.setPlaceholder(option.placeholder)
							.setRequired(true)
							.setStyle(option.style || TextInputStyle.Short)
					);

					// カスタムIDを配列に格納
					id_list.push(option.id);
				}

				// 入力欄の配列を渡す
				return results;
			};

			// タスク設定画面用のモーダルを作成
			const modal = new ModalBuilder()
				.setCustomId('register')
				.setTitle('タスクの設定');

			// 設定画面に入力欄を追加
			const fields_array = await makeTextInputArray();
			for (const field of fields_array)
				modal.addComponents(
					new ActionRowBuilder().addComponents(field)
				);

			// 設定画面を表示
			await select.showModal(modal);

			// 使用した選択メニューは削除
			await select.channel.messages.delete(select.message);
		}

		return;
	});

	// モーダルの送信ボタンが押された場合の処理
	client.on(Events.InteractionCreate, async (action) => {
		// モーダルからの送信以外は反応しない
		if (!action.isModalSubmit()) return;

		// カスタムIDを取得
		const { customId } = action;

		// カスタムIDで処理分岐
		switch (customId) {
			case 'accept': {
				// 設定画面で入力した納期を取得
				const deadline = action.fields.getTextInputValue('deadline');

				/**
				 * 入力された納期が日付として有効かチェックする
				 * @returns { boolean } 日付として有効かどうかのフラグ
				 */
				const isValidDate = () => {
					// 入力された納期が日付として有効でなければfalseを返す
					if (
						!deadline.match(
							'^([1-9]|1[0-2])/([1-9]|[12][0-9]|3[01])$'
						)
					)
						return false;

					// 月と日で分けて取得
					const month = Number(
						deadline.substring(0, deadline.indexOf('/'))
					);
					const day = Number(
						deadline.substring(
							deadline.indexOf('/') + 1,
							deadline.length
						)
					);

					// 日にちが無い月に応じてfalseを返す
					if (month < 7 && !(month % 2)) {
						if (month === 2) if (day > 29) return false; // 2月は29日以降ならfalseを返す
						if (day > 30) return false; // 4月, 6月は30日以降ならfalseを返す
					} else if (month > 8 && month % 2) {
						if (day > 30) return false; // 9月, 11月は30日以降ならfalseを返す
					}

					// 有効な日付であればtrueを返す
					return true;
				};

				// 有効な日付かどうかで処理分岐
				if (!isValidDate()) {
					// コマンドを実行したチャンネルに通告
					await action.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder()
								.setTitle(`${deadline}は無効な日付です`)
								.setDescription(
									codeBlock(
										'fix',
										'　納期は「半角数字/半角数字」の形で入力してください。\nありもしない日付は入力しないでください。'
									)
								),
						],
					});

					return;
				} else {
					// ファイルからデータを読み込む
					const task_list = await fs.readFile(task_path);

					// 受注タスクの名前、メッセージID、同時受注による被り防止フラグ
					let accept_name = '',
						accept_id = '',
						isFirst = false;

					// 受注したタスクを受注済に変更
					for (const task of task_list) {
						// メニューで選択したタスクの識別番号と一致した場合
						if (!(task.index === accept_index && !task.isAssigned))
							continue;

						// 受注済フラグ、受託者のidと名前、納期をセット
						task.isAssigned = true;
						task.entrustee = {
							id: action.user.id,
							name: action.member.displayName, // discordでの「表示名」(ニックネームあるならニックネームをとる)
						};
						task.deadline = deadline;

						// 通告用にタスク名、メッセージIDを取得
						accept_name = task.name;
						accept_id = task.message_id;

						// 受注受付フラグを立てる
						isFirst = true;
					}

					if (!isFirst) {
						// 先にとられた通告
						await action.reply({
							ephemeral: true,
							embeds: [
								new EmbedBuilder()
									.setTitle('すでに受託者が存在します')
									.setDescription(
										codeBlock(
											'fix',
											`　先を越されてしまいました...`
										)
									),
							],
						});

						return;
					} else {
						// 早めにフラグを折る
						isFirst = false;

						// タスクデータを上書き
						await fs.writeFile(
							task_path,
							JSON.stringify(task_list)
						);

						// お仕事チャンネルへタスクを送信し、メッセージIDを取得
						await action.guild.channels.cache
							.get(task_id)
							.messages.fetch(accept_id)
							.then(async (msg) =>
								msg.edit({
									content: msg.content,
									embeds: [
										new EmbedBuilder()
											.setTitle(msg.embeds[0].title)
											.setDescription(
												`${msg.embeds[0].description}\n 受注済み: ${action.user}`
											),
									],
								})
							);

						// スケジュールチャンネルへタスクを送信
						await action.guild.channels.cache
							.get(schedule_id)
							.send({
								// content: `<@${action.user.id}>`,　// メンションする場合はコメントアウトを外す
								embeds: [
									new EmbedBuilder()
										.setTitle('タスクが受注されました')
										.setDescription(
											`タスク: ${accept_name}\n受託者: <@${action.user.id}>\n納期　: ${deadline}`
										),
								],
							});

						// 送信したことをコマンドを実行したチャンネルに通告
						await action.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('受注が完了しました')
									.setDescription(
										`<#${schedule_id}>をチェック`
									),
							],
						});
					}

					return;
				}
			}
			case 'register': {
				// 選択したロールのIDと名前を取得し、配列に格納
				const roles = [];
				for (const role of task_items[0])
					roles.push({
						id: role.split(',')[0],
						name: role.split(',')[1],
					});

				// 設定画面で入力したデータを取得し、配列に格納
				for (const id of id_list)
					task_items.push(action.fields.getTextInputValue(id));

				// 追加するタスクのフォーマットを作成
				const new_task = {
					index: 1,
					name: task_items[1],
					roles: roles,
				};

				// ファイルに上書きするデータ
				let task_list = [];

				// ファイルが存在する場合
				if (await fs.fileExists(task_path)) {
					// ファイルからデータを読み込む
					task_list = await fs.readFile(task_path);

					// 追加するタスクの識別番号にデータ数を足す
					new_task.index += task_list.length;
				}

				// 追加するタスクの名前が有効か判断するフラグ
				let isValid = true;

				// 名前被りがあったらフラグを折る
				for (const task of task_list) {
					if (!task.name.match('^' + new_task.name + '$')) continue;
					isValid = false;
				}

				// 同名タスクの有無で処理分岐
				if (!isValid) {
					// コマンドを実行したチャンネルに通告
					await action.reply({
						ephemeral: true,
						embeds: [
							new EmbedBuilder().setTitle('名前が被っています'),
						],
					});

					return;
				} else {
					// 2000文字を超えたかで処理分岐
					if (task_items[5].length > 2000) {
						// コマンドを実行したチャンネルに通告
						await action.reply({
							ephemeral: true,
							embeds: [
								new EmbedBuilder().setTitle(
									'2000文字オーバーしています'
								),
							],
						});

						return;
					} else {
						// お仕事チャンネルへタスクを送信し、メッセージIDを取得
						const task_message = await action.guild.channels.cache
							.get(task_id)
							.send({
								content: `<@&${task_items[0]
									.map((role) => role.split(',')[0])
									.join('>\n<@&')}>`,
								embeds: [
									new EmbedBuilder()
										.setTitle(task_items[1])
										.setDescription(
											codeBlock(
												'diff',
												`-【条件】-\n　(${task_items[2]})[${task_items[3]}]{${task_items[4]}}\n\n+【概要】+\n　${task_items[5]}`
											)
										),
								],
							});

						// 送信したことをコマンドを実行したチャンネルに通告
						await action.reply({
							embeds: [
								new EmbedBuilder()
									.setTitle('タスクを追加しました')
									.setDescription(`<#${task_id}>をチェック`),
							],
						});

						// メッセージIDをタスクデータに追加
						new_task.message_id = task_message.id;

						// 追加するタスクをデータに加える
						task_list.push(new_task);

						// タスクデータを上書き
						await fs.writeFile(
							task_path,
							JSON.stringify(task_list)
						);

						// タスクのメッセージIDリストを作成
						const id_list = [];
						for (const task of task_list)
							id_list.push(task.message_id);

						// お仕事一覧に貼られたタスクのメッセージリストを取得
						const messages = await action.guild.channels.cache
							.get(task_id)
							.messages.fetch();

						// タスク以外のメッセージのみ抽出
						const del_msg = [...messages.values()].filter(
							(msg) => !id_list.includes(msg.id)
						);

						// もしタスク以外のメッセージが存在したら
						if (del_msg.length)
							// 全て削除
							for (const msg of del_msg) await msg.delete();
					}

					return;
				}
			}
			case 'remove': {
				// 指定したタスクを削除
				const task_list = prev_task.filter(
					(prev) => prev.index !== del_task.index
				);

				// 削除したタスクより後の識別番号を1つ減らしてズレを修正
				for (const data of task_list) {
					if (data.index <= del_task.index) continue;
					data.index -= 1;
				}

				// タスクデータを上書き
				await fs.writeFile(task_path, JSON.stringify(task_list));

				// お仕事一覧に貼られたメッセージからIDで指定して削除対象タスクのメッセージを取得し、削除
				await action.guild.channels.cache
					.get(task_id)
					.messages.fetch(del_task.message_id)
					.then(async (msg) => {
						await msg.delete();
					});

				// コマンドを実行したチャンネルに通告
				await action.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle('タスクを削除しました')
							.setDescription(
								codeBlock(
									'fix',
									`削除したタスク　->　${del_task.name}`
								)
							),
					],
				});

				return;
			}
		}

		return;
	});
}

// 外部ファイルから参照可能にする
module.exports = taskManager;
