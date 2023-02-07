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
const { send_path, check_interval } = process.env;

/** * fileSystemに関連する自作関数をまとめたモジュール */
const fs = require('../function/file');

// 時間を取得する関数
const { getTime } = require('../function/date');

/**
 * - 一日一回のみ送るためのフラグをチェックし、真偽値で返す
 *      - 真ならばまだ送っていない、偽ならば既に送っていることを示す
 */
function setFirstFlag() {
	/**
	 * - 指定時間を超えたかどうかチェックし、真偽値を返す
	 */
	function hasTimePassed() {
		const schedule = check_interval
			.replaceAll(' *', '')
			.split(' ')
			.reverse();

		return schedule.join(':') >= getTime(true);
	}

	/**
	 * - 前回送った日にちから1日経過したかどうかチェックし、真偽値を返す
	 */
	function hasDayPassed() {
		// 現在の日にちを取得
		const today = new Date().getDate();

		// ファイルから前に送信した日課メッセージを受け取る
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
