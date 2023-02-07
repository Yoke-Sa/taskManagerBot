/**
 * @file ロール申請所の処理を関数にしてまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { guild_id, role_id } = process.env;

// 使用するものだけ読み込む
const { Events } = require('discord.js');
const {
	StringSelectMenuBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	codeBlock,
	ModalBuilder,
	TextInputBuilder,
} = require('@discordjs/builders');

/**
 * - ロール申請所にてロールの管理を行う
 * @param { Client<boolean> } client タスク管理botのインスタンス
 */
async function moveRoles(client) {
	// 通信先サーバーの取得
	const guild = client.guilds.cache.get(guild_id);

	/**
	 * - ロール選択メニューの作成
	 */
	const makeRolesMenu = async () => {
		// メンション可能なロール
		const mentionable_roles = guild.roles.cache
			.filter((role) => role.mentionable && role.name !== 'リーダー')
			.map((role) => role);

		// ロール申請所にセットする選択メニュー
		return new StringSelectMenuBuilder()
			.setCustomId('move_roles')
			.setMinValues(1)
			.setMaxValues(mentionable_roles.length)
			.setOptions(
				mentionable_roles.map((role) => ({
					label: role.name,
					value: `${role.id},${role.name}`,
				}))
			)
			.setPlaceholder('ロールを選択');
	};

	// ロール選択メニュー
	const roles_menu = await makeRolesMenu();

	// ロール申請所のチャンネルを取得
	const role_channel = guild.channels.cache.get(role_id);

	// ロール申請所にメッセージが1つも送られていない時のみ送信
	if (!role_channel.lastMessageId) {
		await role_channel.send({
			embeds: [new EmbedBuilder().setTitle('選択したロールを付与します')],
			components: [new ActionRowBuilder().setComponents(roles_menu)],
		});
	}

	// 選択したロールを格納する配列
	let add_roles = [],
		remove_roles = [];
	let adds = '',
		removes = '';

	// 選択メニューへの応答
	client.on(Events.InteractionCreate, async (select) => {
		// 選択メニュー以外には反応しない
		if (!select.isStringSelectMenu()) return;

		// カスタムIDの取得
		const { customId } = select;

		// ロール申請所のメニュー以外には反応しない
		if (customId !== 'move_roles') return;

		/**
		 * - 現在メンバーに付与されているロールの配列を取得
		 */
		const getMemberRoles = () => {
			return select.member.roles.cache.map((role) => role.id);
		};

		/**
		 * - 選択メニューで選ばれたロールを取得
		 */
		const getSelectedRoles = () => {
			// メンバーのロール
			const member_roles_id = getMemberRoles();

			// 付け外し処理 + 送信用文字列の作成
			for (const role of select.values) {
				if (member_roles_id.includes(role.split(',')[0])) {
					remove_roles.push(role.split(',')[0]);
					removes += ` ・${role.split(',')[1]}\n`;
				} else {
					add_roles.push(role.split(',')[0]);
					adds += ` ・${role.split(',')[1]}\n`;
				}
			}

			// 区切り文字を追加して返す
			return adds + '/' + removes;
		};

		/**
		 * - 確認画面を作成
		 */
		const makeModal = async () => {
			// 選択されたロールを取得
			const str = getSelectedRoles();

			// 確認画面のデータ表示欄
			const input_fields = [];

			// 追加するロールがあれば配列に表示欄を追加
			if (add_roles.length)
				input_fields.push(
					new TextInputBuilder()
						.setCustomId('add_roles')
						.setLabel('追加するロール')
						.setValue(str.split('/')[0])
						.setStyle(2)
						.setRequired(false) // 入力を必要としない
				);

			// 削除するロールがあれば配列に表示欄を追加
			if (remove_roles.length)
				input_fields.push(
					new TextInputBuilder()
						.setCustomId('remove_roles')
						.setLabel('削除するロール')
						.setValue(str.split('/')[1])
						.setStyle(2)
						.setRequired(false) // 入力を必要としない
				);

			// 確認画面の作成
			const modal = new ModalBuilder()
				.setCustomId('move_roles')
				.setTitle('この内容でお間違いありませんか？');

			// 確認画面に表示欄を追加
			for (const field of input_fields) modal.addComponents(new ActionRowBuilder().addComponents(field));

			// 作成した画面を返す
			return modal;
		};

		// 確認画面の表示
		await select.showModal(await makeModal());

		return;
	});

	// 確認画面の送信ボタンへの応答
	client.on(Events.InteractionCreate, async (action) => {
		// 送信ボタン以外には反応しない
		if (!action.isModalSubmit()) return;

		// カスタムIDの取得
		const { customId } = action;

		// ロール申請の確認画面以外には反応しない
		if (customId !== 'move_roles') return;

		/**
		 * - 現在メンバーに付与されているロールの配列を取得
		 */
		const getMemberRoles = () => {
			return action.member.roles.cache.map((role) => role.name);
		};

		/**
		 * - 現在メンバーに付与されているロールのリストを送信用に作成
		 */
		const makeRolesList = async () => {
			// @everyoneのロールのみ除外
			const member_roles = getMemberRoles().slice(0, -1);

			// 確認用の文字列を作成
			let results = '+ 現在の設定 +';
			for (const role of member_roles) results += `\n ・${role}`;

			// 作成した文字列を返す
			return results;
		};

		/**
		 * - 選択したロールの付け外し + 送信用テキストの作成
		 */
		const moveMemberRoles = async () => {
			// ロールを付与
			for (const role of add_roles) await action.member.roles.add(role);

			// ロールを除去
			for (const role of remove_roles) await action.member.roles.remove(role);

			// 送信用テキストの作成
			let result = await makeRolesList(),
				add_str = '',
				remove_str = '';

			// ロールがあればテキストを追加
			if (adds) add_str = '\n+ 追加 + \n' + adds;
			if (removes) remove_str = '- 削除 - \n' + removes;

			return add_str + remove_str + '\n' + result;
		};

		// 選択後に現在のロールをリスト表示
		await action.reply({
			// content: codeBlock('diff', makeRolesList()),
			ephemeral: true,
			embeds: [
				new EmbedBuilder()
					.setTitle('ロールを更新しました')
					.setDescription(codeBlock('diff', await moveMemberRoles())),
			],
		});

		// 選択メニューのリセット
		await role_channel.messages.cache.get(role_channel.lastMessageId).edit({
			embeds: [new EmbedBuilder().setTitle('選択したロールを付与します')],
			components: [new ActionRowBuilder().setComponents(roles_menu)],
		});

		// 変数の初期化
		(add_roles = []), (remove_roles = []), (adds = ''), (removes = '');

		return;
	});
}

module.exports = moveRoles;
