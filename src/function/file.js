/**
 * @file ファイルシステム関連の自作関数をまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

// ここでfsを読み込むことで外部ファイルで読み込まずに使える
const { lstat, readFile, writeFile } = require('fs/promises');

/**
 * - ファイルが存在するかチェックし、真偽値で返す
 */
exports.fileExists = async (path) => {
	try {
		return await lstat(path);
	} catch (err) {
		return false;
	}
};

/**
 * - ファイル内のデータを読み込み、データを返す
 */
exports.readFile = async (path) => {
	let result = null;
	try {
		result = JSON.parse(await readFile(path));
	} catch (err) {
		console.error(err);
	}
	return result;
};

/**
 * - ファイルにデータを上書きする
 */
exports.writeFile = async (path, data) => {
	try {
		await writeFile(path, data);
	} catch (err) {
		console.error(err);
	}
};
