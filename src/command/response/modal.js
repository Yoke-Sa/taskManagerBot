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
	client.on('interactionCreate', async (cmd) => {
		if (!cmd.isCommand() || cmd.commandName !== 'modals') return;

		/**
		 * - 確認画面を作成
		 */
		const makeModal = async () => {
			// 確認画面のデータ表示欄
			const input_fields = [];

			for (let i = 0; i < 5; i++) {
				input_fields.push(
					new TextInputBuilder()
						.setCustomId(`${i}`)
						.setLabel(`${i}`)
						.setStyle(2)
						.setRequired(false) // 入力を必要としない
				);
			}
			// 確認画面の作成
			const modal = new ModalBuilder()
				.setCustomId('modals')
				.setTitle('もおおおおおおおお、だる。');

			// 確認画面に表示欄を追加
			for (const field of input_fields)
				modal.addComponents(
					new ActionRowBuilder().addComponents(field)
				);

			// 作成した画面を返す
			return modal;
		};

		await cmd.showModal(await makeModal());
	});

	client.on(Events.InteractionCreate, async (modal) => {
		if (!modal.isModalSubmit() || modal.customId !== 'modals') return;

		let str = '';
		for (let i = 0; i < 5; i++) {
			str += modal.fields.getTextInputValue(`${i}`) + '\n';
		}


		await modal.reply({
			embeds: [new EmbedBuilder().setDescription(str)]
		});
	})
}

module.exports = moveRoles;
