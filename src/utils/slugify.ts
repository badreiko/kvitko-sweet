export const slugify = (text: string): string => {
    const charMap: Record<string, string> = {
        'á': 'a', 'b': 'b', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e',
        'f': 'f', 'g': 'g', 'h': 'h', 'ch': 'ch', 'i': 'i', 'í': 'i',
        'j': 'j', 'k': 'k', 'l': 'l', 'm': 'm', 'n': 'n', 'ň': 'n',
        'o': 'o', 'ó': 'o', 'p': 'p', 'q': 'q', 'r': 'r', 'ř': 'r',
        's': 's', 'š': 's', 't': 't', 'ť': 't', 'u': 'u', 'ú': 'u',
        'ů': 'u', 'v': 'v', 'w': 'w', 'x': 'x', 'y': 'y', 'ý': 'y',
        'z': 'z', 'ž': 'z'
    };

    return text
        .toString()
        .toLowerCase()
        .split('')
        .map(char => charMap[char] || char)
        .join('')
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
};
