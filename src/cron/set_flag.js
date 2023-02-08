/**
 * @file 通告の送信頻度を一日一回のみに制限するためのフラグを生成する
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// 隠しファイルから環境変数としてデータを受け取る
require('dotenv').config();
const { send_path, check_interval } = process.env;

/** * fileSystemに関連する自作関数をまとめたモジュール */
const fs = require('../function/file');

// 時間を取得する関数
const { getTime } = require('../function/date');

/**
 * - 一日一回のみ送るためのフラグをチェックし、真偽値で返す
 *      - 真ならば未送信、偽ならば送信済みであることを示す
 */
function setFirstFlag() {
	/**
	 * - 指定時刻を超えたかどうかチェックし、真偽値を返す
	 */
	function hasTimePassed() {
		// 指定したスケジュールを[時、分、秒]の形式で配列に格納
		const schedule = check_interval
			.replaceAll(' *', '')
			.split(' ')
			.reverse();

		// 現在の時刻を[時、分、秒]の形式で配列に格納
		const now = getTime(true).split(':');

		// 要素毎に大小を比較
		for (let i = 0; i < 3; i++) {
			// 同じであればスキップして次の要素を比較
			if (schedule[i] === now[i]) continue;
			else if (schedule[i] < now[i])
				return true; // 指定時刻を超えていたらtrueを返す
			else return false; // 超えていなければfalse
		}

		// 全ての要素をスキップした時 -> 指定時刻と同時刻であるためtrueを返す
		return true;
	}

	/**
	 * - 前回送った日にちから1日経過したかどうかチェックし、真偽値を返す
	 */
	function hasDayPassed() {
		// 現在の日にちを数値で取得 -> 1/24ならば24が返る
		const today = new Date().getDate();

		// ファイルから最後に送信した通告メッセージを受け取る
		const prev = JSON.parse(fs.readFileSync(send_path));

		// 日にちの差があるならば真、なければ偽
		return today !== new Date(prev.createdTimestamp).getDate();
	}

	// そもそも送ったメッセージのデータが無い場合は真とみなす
	if (!fs.existsSync(send_path)) return true;

	// 指定時間を超えていて尚且つ日付が違う場合は真とみなす
	if (hasTimePassed() && hasDayPassed()) return true;

	// それ以外は偽とみなす
	return false;
}

module.exports = setFirstFlag;
