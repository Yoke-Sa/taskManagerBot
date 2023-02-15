/**
 * @file 納期が一週間以内に迫ったタスクの受託者に対してメンションを飛ばす処理を関数にしてまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { schedule_id, task_path } = process.env;

// 報告用に埋め込みを使う
const { EmbedBuilder } = require('@discordjs/builders');

/** * fileSystemに関連する自作関数をまとめたモジュール */
const fs = require('../function/file');

/** * Dateに関連する自作関数をまとめたモジュール */
const date = require('../function/date');

/**
 * - 対象のタスク受託者に対して スケジュールチャンネル でメンションを飛ばす
 * @param { Client<boolean> } client タスク管理botのインスタンス
 */
async function mentionEntrustee(client) {
	/**
	 * - 納期が一週間以内のタスクがあれば配列にして返す
	 * @returns { JSON[] } 納期が一週間以内に迫ったタスクのリスト
	 */
	const getWithinWeekTask = () => {
		// ファイルからデータを読み込む
		const accept_list = fs
			.readFile(task_path)
			.filter((task) => task.isAssigned) // 受注済タスクのみ抽出
			.map((task) => task);

		// 月ごとに日付の最大値を作成し、配列に格納
		const max_days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

		// 本日の日付を取得
		let today = date.getDate();

		// 月と日のキーで分けて配列に格納
		let deadline_list = [];
		for (const task of accept_list)
			deadline_list.push({
				month: task.deadline.substring(0, task.deadline.indexOf('/')),
				day: task.deadline.substring(
					task.deadline.indexOf('/') + 1,
					task.deadline.length
				),
			});

		/**
		 * - 年月日を各キーで分け、JSONオブジェクトに変換する
		 * @param { string } date 自作関数で取得した今日の日付
		 * @returns { JSON } 年、月、日の3つ
		 */
		const dateToJSON = (date) => {
			// アロー関数にしたからreturnいらないと思うけど明示しておく
			return {
				year: date.substring(0, date.indexOf('/')),
				month: date.substring(
					date.indexOf('/') + 1,
					date.lastIndexOf('/')
				),
				day: date.substring(date.lastIndexOf('/') + 1),
			};
		};

		// 今日の日付をJSONに変換
		today = dateToJSON(today);

		// うるう年なら2月を29日までにする
		if (date.isLeapYear(Number(today.year))) max_days[1] = 29;

		/**
		 * - 納期が一週間以内に迫ったタスクがあれば配列に入れて納期を返す
		 * @returns { JSON[] } 一週間以内に迫ったタスクの納期
		 */
		const findLoomingTask = () => {
			// 納期が一週間以内かどうかチェック
			const date_list = [];

			for (const date of deadline_list) {
				// 納期が同じ月かどうかで処理分岐
				if (date.month === today.month) {
					// 日にちの減算結果が7以下でなければスキップ、そうであれば納期を配列に入れる
					if (
						!(
							0 <= date.day - today.day &&
							date.day - today.day <= 7
						)
					)
						continue;

					date_list.push({
						deadline: date,
						remain: date.day - today.day,
					});
				} else {
					// 納期が来月だった場合
					if (
						date.month - today.month === 1 ||
						date.month - today.month === 11
					) {
						// 今月の日付最大値と今日の日付の減算結果に納期の日付を加えたものが7以下でなければスキップ、そうであれば納期を配列に入れる
						if (
							!(
								0 <=
									max_days[today.month - 1] -
										today.day +
										Number(date.day) &&
								max_days[today.month - 1] -
									today.day +
									Number(date.day) <=
									7
							)
						)
							continue;

						date_list.push({
							deadline: date,
							remain:
								max_days[today.month - 1] -
								today.day +
								Number(date.day),
						});
					}
				}
			}

			// 一週間以内に迫ったタスクの納期と残り日数を配列に入れる
			const looming_deadline = [];
			for (const date of date_list)
				looming_deadline.push({
					date: `${date.deadline.month}/${date.deadline.day}`,
					remain: date.remain,
				});

			// タスクデータに残り日数を加える
			const results = accept_list.filter((task) =>
				looming_deadline.some((value) => task.deadline === value.date)
			);
			for (let i = 0, len = looming_deadline.length; i < len; i++)
				results[i].remain = looming_deadline[i].remain;

			// タスクの配列を返す
			return results;
		};

		// 見つけたタスクデータを配列で返す
		return findLoomingTask();
	};

	// タスクデータがある場合のみ処理
	if (!(await fs.fileExists(task_path))) return;

	// 納期が一週間以内に迫ったタスクのリストを取得
	const looming_task = getWithinWeekTask();

	// メッセージを送信
	for (const value of looming_task) {
		// タイトルを作成
		let title = `残り${value.remain}日です`;

		// スケジュールチャンネルへメンションを飛ばす
		await client.channels.cache.get(schedule_id).send({
			content: `<@${value.entrustee.id}>`,
			embeds: [
				new EmbedBuilder()
					.setTitle(title)
					.setDescription(`${value.name}`),
			],
		});
	}

	return;
}

// 外部ファイルから参照可能にする
module.exports = mentionEntrustee;
