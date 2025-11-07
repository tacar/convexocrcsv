export const cleanGeneratedText = (text: string): string => {
  // 不要な前後の空白を削除
  let cleaned = text.trim();

  // マークダウンの箇条書き記号を削除
  cleaned = cleaned.replace(/^\*\s+/gm, '');
  cleaned = cleaned.replace(/^-\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

  // 太字マークダウンを削除
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');

  // 「」と【】を削除
  cleaned = cleaned.replace(/[「」【】]/g, '');

  // 複数行の場合は最初の有効な行のみを取得
  const lines = cleaned.split('\n').filter(line => line.trim());

  // キャッチコピーの場合は最初の短い文を選択
  if (lines.length > 0) {
    for (const line of lines) {
      const cleanedLine = line.trim();
      if (cleanedLine.length > 5 && cleanedLine.length < 30 && !cleanedLine.includes('：')) {
        return cleanedLine;
      }
    }
    return lines[0].trim();
  }

  return cleaned;
};

export const extractBestCatchphrase = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    // 箇条書き記号と太字を削除
    let cleaned = line
      .replace(/^\*\s+/g, '')
      .replace(/^-\s+/g, '')
      .replace(/^\d+\.\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[「」【】]/g, '')
      .trim();

    // 説明文っぽいものやタイトルを除外
    if (cleaned.length > 5 &&
        cleaned.length < 30 &&
        !cleaned.includes('キャッチコピー') &&
        !cleaned.includes('説明文') &&
        !cleaned.includes('案') &&
        !cleaned.includes('：') &&
        !cleaned.includes('承知') &&
        !cleaned.includes('提案')) {
      return cleaned;
    }
  }

  // 適切なものが見つからない場合は最初の短い文を返す
  return lines[0]?.replace(/[「」【】\*]/g, '').trim() || text.trim();
};

export const extractBestDescription = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    let cleaned = line
      .replace(/^\*\s+/g, '')
      .replace(/^-\s+/g, '')
      .replace(/^\d+\.\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[「」【】]/g, '')
      .trim();

    // 説明文として適切な長さのものを選択
    if (cleaned.length > 20 &&
        cleaned.length < 150 &&
        !cleaned.includes('キャッチコピー') &&
        !cleaned.includes('説明文') &&
        !cleaned.includes('案') &&
        !cleaned.includes('承知') &&
        !cleaned.includes('提案') &&
        !cleaned.includes('理由')) {
      return cleaned;
    }
  }

  return text.replace(/[「」【】\*]/g, '').trim();
};

export const extractCTAText = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines) {
    let cleaned = line
      .replace(/^\*\s+/g, '')
      .replace(/^-\s+/g, '')
      .replace(/^\d+\.\s+/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/[「」【】]/g, '')
      .trim();

    // CTAボタンとして適切な短いテキストを選択
    if (cleaned.length > 2 &&
        cleaned.length <= 10 &&
        !cleaned.includes('：') &&
        !cleaned.includes('理由') &&
        !cleaned.includes('文字') &&
        (cleaned.includes('予約') ||
         cleaned.includes('問い合わせ') ||
         cleaned.includes('体験') ||
         cleaned.includes('購入') ||
         cleaned.includes('相談') ||
         cleaned.includes('申込') ||
         cleaned.includes('登録'))) {
      return cleaned;
    }
  }

  // デフォルトのCTAテキストを返す
  const firstValid = lines[0]?.replace(/[「」【】\*:：]/g, '').trim();
  if (firstValid && firstValid.length <= 10) {
    return firstValid;
  }

  return 'お問い合わせ';
};

export const extractJSONContent = (text: string): string => {
  // JSON形式の応答から純粋なJSONを抽出
  const lines = text.split('\n').filter(line => line.trim());

  // JSONらしき行を探す
  for (const line of lines) {
    const trimmed = line.trim();

    // JSONとして有効そうな行をチェック
    if ((trimmed.startsWith('[') && trimmed.includes('{')) ||
        (trimmed.startsWith('{') && trimmed.includes(':'))) {

      // マークダウンのコードブロック記号を除去
      let cleaned = trimmed
        .replace(/^```json/g, '')
        .replace(/^```/g, '')
        .replace(/```$/g, '')
        .trim();

      // JSONとして妥当性をチェック
      try {
        JSON.parse(cleaned);
        return cleaned;
      } catch {
        continue;
      }
    }
  }

  // JSON形式が見つからない場合、テキスト全体をクリーンアップして試行
  let fullText = text
    .replace(/^```json/gm, '')
    .replace(/^```/gm, '')
    .replace(/```$/gm, '')
    .replace(/^\s*JSON形式で出力：?\s*/gm, '')
    .replace(/^\s*JSON形式：?\s*/gm, '')
    .replace(/^\s*出力：?\s*/gm, '')
    .trim();

  // 最後の試行
  try {
    JSON.parse(fullText);
    return fullText;
  } catch {
    // JSON形式でない場合は空配列を返す
    return '[]';
  }
};