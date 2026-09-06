const WORDS_PER_MINUTE = 220;

function plainText(content: string): string {
  return content
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/&(?:[a-z]+|#\d+|#x[a-f\d]+);/gi, ' ')
    .replace(/[`*_>#\[\](){|}~=-]/g, ' ');
}

export function estimateReadingMinutes(content: string): number {
  const words = plainText(content).match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) ?? [];
  return Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));
}
