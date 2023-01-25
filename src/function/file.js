/**
 * @file ファイルシステム関連の自作関数をまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0 
 * @version v14.7.1
 */
'use strict';

// ここでfsを読み込むことで外部ファイルで読み込まずに使える
const fs = require('fs');

// ファイルが存在するかチェックし、真偽値で返す
exports.existsSync = (path) => {
	return fs.existsSync(path);
};

// ファイル内のデータを読み込む
exports.readFileSync = (path) => {
	return fs.readFileSync(path);
};

// ファイルにデータを上書きする
exports.writeFileSync = (path, data) => {
	return fs.writeFileSync(path, data);
};

// ファイルを削除する
// exports.deleteFileSync = (path) => {
// 	return fs.unlinkSync(path);
// };
