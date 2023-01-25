/**
 * @file Dateオブジェクト関連の自作関数をまとめたファイル
 * @author よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>
 * @copyright 委託者(うるむ <userId: 713919309843398756>) 及び 受託者(よけっちゃん＠プログラマーリーダー <userId: 450611707363196928>) 各人に帰属する。
 * @since v14.0.0
 * @version v14.7.1
 */
'use strict';

/**
 * - 現在の日付を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area='Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getDateTime = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	});
};

/**
 * - 現在の日付を取得する関数。引数で年数を含めるか否かを決めたり、タイムゾーンを変えたりすることができる。
 * @param { boolean } [ formal = true ] - 年数を含めるか含めないか判定するためのブール値。オプショナル引数で、デフォルトでは含めるように指定している。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getDate = (formal = true, area = 'Asia/Tokyo') => {
	if (formal)
		return new Date().toLocaleString('ja-JP', {
			timeZone: area,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		month: 'numeric',
		day: 'numeric',
	});
};

/**
 * - 現在の年数(西暦)を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getYear = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		year: 'numeric',
	});
};

/**
 * - 現在の月数を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getMonth = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		month: 'numeric',
	});
};

/**
 * - 現在の日数を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getDay = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		day: 'numeric',
		weekday: 'short',
	});
};

/**
 * - 現在の曜日を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getWeekDay = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		weekday: 'long',
	});
};

/**
 * - 現在時刻を取得する関数。引数で秒数を含めるか否かを決めたり、タイムゾーンを変えたりすることができる。
 * @param { boolean } [ formal = true ] - 秒数を含めるか含めないか判定するためのブール値。オプショナル引数で、デフォルトでは含めるように指定している。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getTime = (formal = true, area = 'Asia/Tokyo') => {
	if (formal)
		return new Date().toLocaleString('ja-JP', {
			timeZone: area,
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		});
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		hour: 'numeric',
		minute: 'numeric',
	});
};

/**
 * - 現在の時数を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getHour = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		hour: 'numeric',
	});
};

/**
 * - 現在の分数を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getMinute = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		minute: 'numeric',
	});
};

/**
 * - 現在の秒数を取得する関数。 引数でタイムゾーンを指定できる。
 * @param { string } [ area = 'Asia/Tokyo' ] - タイムゾーンを指定するための文字列。オプショナル引数で、デフォルトでは東京を指定している。
 */
exports.getSecond = (area = 'Asia/Tokyo') => {
	return new Date().toLocaleString('ja-JP', {
		timeZone: area,
		second: 'numeric',
	});
};

/**
 * - うるう年であるかどうかを判定する関数
 *
 * - グレゴリオ暦により100で割り切れる年は平年とする
 *
 * @param { number } year 年数
 * @returns { boolean } うるう年かどうかの真偽値
 */
exports.isLeapYear = (year) => {
	return !(year % 4) && (year % 100 || !(year % 400)); // 4で割り切れるかつ、100で割り切れないまたは400で割り切れる
};