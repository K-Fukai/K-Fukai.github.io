document.addEventListener('DOMContentLoaded', function () {
    fetch('data/publications.bib')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch BibTeX data: ${response.status}`);
            }
            return response.text();
        })
        .then(bibtex => renderPublications(parseBibTeX(bibtex)))
        .catch(error => console.error('Error fetching publication data:', error));
});

function renderPublications(publications) {
    const publishedContainer = document.getElementById('published-container');
    const featuredContainer = document.getElementById('featured-container');
    const preprintsContainer = document.getElementById('preprints-container');

    publishedContainer.innerHTML = '';
    featuredContainer.innerHTML = '';
    preprintsContainer.innerHTML = '';

    const publishedPublications = publications
        .filter(publication => publication.pubtype === 'published')
        .sort(comparePublicationDatesDesc);
    const preprintPublications = publications
        .filter(publication => publication.pubtype === 'preprint');

    publishedPublications.forEach(publication => {
        const li = createPublicationItem(publication);

        publishedContainer.appendChild(li);

        if (publication.featured === true) {
            featuredContainer.appendChild(li.cloneNode(true));
        }
    });

    preprintPublications.forEach(publication => {
        preprintsContainer.appendChild(createPublicationItem(publication));
    });
}

function comparePublicationDatesDesc(first, second) {
    return getPublicationSortTime(second) - getPublicationSortTime(first);
}

function getPublicationSortTime(publication) {
    const year = Number.parseInt(publication.year, 10);

    if (!Number.isFinite(year)) return 0;

    return Date.UTC(year, getPublicationMonthNumber(publication.month) - 1, 1);
}

function getPublicationMonthNumber(month) {
    const monthNames = {
        jan: 1,
        january: 1,
        feb: 2,
        february: 2,
        mar: 3,
        march: 3,
        apr: 4,
        april: 4,
        may: 5,
        jun: 6,
        june: 6,
        jul: 7,
        july: 7,
        aug: 8,
        august: 8,
        sep: 9,
        sept: 9,
        september: 9,
        oct: 10,
        october: 10,
        nov: 11,
        november: 11,
        dec: 12,
        december: 12
    };
    const normalizedMonth = String(month || '').trim().toLowerCase().replace(/\.$/, '');
    const numericMonth = Number.parseInt(normalizedMonth, 10);

    if (Number.isInteger(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
        return numericMonth;
    }

    return monthNames[normalizedMonth] || 1;
}

function createPublicationItem(publication) {
    const li = document.createElement('li');

    const titleLink = document.createElement('a');
    titleLink.href = publication.link;
    titleLink.textContent = publication.title;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';

    const title = document.createElement('h2');
    title.className = 'publication-title';
    title.appendChild(titleLink);
    li.appendChild(title);

    const authors = document.createElement('p');
    authors.className = 'publication-authors';
    authors.textContent = publication.authors;
    li.appendChild(authors);

    const citation = document.createElement('p');
    citation.className = 'publication-citation';

    if (publication.pubtype === 'published') {
        appendPublishedCitation(citation, publication);
    } else {
        citation.textContent = `${publication.journal} (${publication.year}).`;
    }

    li.appendChild(citation);

    return li;
}

function appendPublishedCitation(citation, publication) {
    citation.append(document.createTextNode(`${publication.journal} `));

    if (publication.volume) {
        const volume = document.createElement('span');
        volume.className = 'bold';
        volume.textContent = publication.volume;
        citation.appendChild(volume);
    }

    if (publication.pages) {
        citation.append(document.createTextNode(`, ${publication.pages}`));
    }

    citation.append(document.createTextNode(` (${publication.year}).`));
}

function parseBibTeX(bibtex) {
    const entries = [];
    let position = 0;

    while (position < bibtex.length) {
        const atIndex = bibtex.indexOf('@', position);
        if (atIndex === -1) break;

        const typeStart = atIndex + 1;
        const openIndex = findNextEntryOpen(bibtex, typeStart);
        if (openIndex === -1) break;

        const entryType = bibtex.slice(typeStart, openIndex).trim().toLowerCase();
        const closeIndex = findMatchingClose(bibtex, openIndex);
        if (closeIndex === -1) break;

        if (entryType !== 'comment' && entryType !== 'preamble' && entryType !== 'string') {
            const body = bibtex.slice(openIndex + 1, closeIndex);
            const entry = parseBibTeXEntry(entryType, body);
            if (entry) entries.push(entry);
        }

        position = closeIndex + 1;
    }

    return entries.map(normalizePublication);
}

function findNextEntryOpen(text, start) {
    const braceIndex = text.indexOf('{', start);
    const parenIndex = text.indexOf('(', start);

    if (braceIndex === -1) return parenIndex;
    if (parenIndex === -1) return braceIndex;

    return Math.min(braceIndex, parenIndex);
}

function findMatchingClose(text, openIndex) {
    const open = text[openIndex];
    const close = open === '(' ? ')' : '}';
    let depth = 1;
    let inQuote = false;
    let escaped = false;

    for (let index = openIndex + 1; index < text.length; index += 1) {
        const character = text[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (character === '\\') {
            escaped = true;
            continue;
        }

        if (character === '"') {
            inQuote = !inQuote;
            continue;
        }

        if (inQuote) continue;

        if (character === open) {
            depth += 1;
        } else if (character === close) {
            depth -= 1;
            if (depth === 0) return index;
        }
    }

    return -1;
}

function parseBibTeXEntry(entryType, body) {
    const keyEnd = findTopLevelComma(body, 0);
    if (keyEnd === -1) return null;

    const fields = {};
    let position = keyEnd + 1;

    while (position < body.length) {
        position = skipWhitespaceAndCommas(body, position);
        if (position >= body.length) break;

        const equalsIndex = body.indexOf('=', position);
        if (equalsIndex === -1) break;

        const name = body.slice(position, equalsIndex).trim().toLowerCase();
        position = skipWhitespace(body, equalsIndex + 1);

        const parsedValue = parseBibTeXValue(body, position);
        fields[name] = cleanBibTeXValue(parsedValue.value);
        position = parsedValue.end;
    }

    return {
        key: body.slice(0, keyEnd).trim(),
        entryType,
        fields
    };
}

function findTopLevelComma(text, start) {
    let braceDepth = 0;
    let inQuote = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
        const character = text[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (character === '\\') {
            escaped = true;
            continue;
        }

        if (character === '"') {
            inQuote = !inQuote;
            continue;
        }

        if (inQuote) continue;

        if (character === '{') {
            braceDepth += 1;
        } else if (character === '}') {
            braceDepth -= 1;
        } else if (character === ',' && braceDepth === 0) {
            return index;
        }
    }

    return -1;
}

function parseBibTeXValue(text, start) {
    if (text[start] === '{') {
        return parseDelimitedValue(text, start, '{', '}');
    }

    if (text[start] === '"') {
        return parseDelimitedValue(text, start, '"', '"');
    }

    const commaIndex = findTopLevelComma(text, start);
    const end = commaIndex === -1 ? text.length : commaIndex;

    return {
        value: text.slice(start, end),
        end: end + 1
    };
}

function parseDelimitedValue(text, start, open, close) {
    let depth = 1;
    let escaped = false;
    const valueStart = start + 1;

    for (let index = valueStart; index < text.length; index += 1) {
        const character = text[index];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (character === '\\') {
            escaped = true;
            continue;
        }

        if (open !== close && character === open) {
            depth += 1;
        } else if (character === close) {
            depth -= 1;
            if (depth === 0) {
                return {
                    value: text.slice(valueStart, index),
                    end: index + 1
                };
            }
        }
    }

    return {
        value: text.slice(valueStart),
        end: text.length
    };
}

function skipWhitespaceAndCommas(text, start) {
    let position = start;
    while (position < text.length && /[\s,]/.test(text[position])) {
        position += 1;
    }
    return position;
}

function skipWhitespace(text, start) {
    let position = start;
    while (position < text.length && /\s/.test(text[position])) {
        position += 1;
    }
    return position;
}

function cleanBibTeXValue(value) {
    return value
        .replace(/[{}]/g, '')
        .replace(/\\&/g, '&')
        .replace(/---/g, '-')
        .replace(/--/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizePublication(entry) {
    const fields = entry.fields;
    const archivePrefix = fields.archiveprefix || fields.archivePrefix || 'arXiv';
    const pubtype = (fields.pubtype || inferPublicationType(entry)).toLowerCase();

    return {
        key: entry.key,
        title: fields.title || '',
        authors: formatAuthors(fields.author || ''),
        journal: fields.journal || formatPreprintJournal(archivePrefix, fields.eprint),
        year: fields.year || '',
        month: fields.month || '',
        volume: fields.volume || '',
        pages: fields.pages || fields.page || '',
        link: fields.url || fields.link || formatPublicationLink(fields, archivePrefix),
        pubtype,
        featured: fields.featured === 'true'
    };
}

function inferPublicationType(entry) {
    if (entry.fields.eprint || entry.entryType === 'misc') {
        return 'preprint';
    }

    return 'published';
}

function formatPreprintJournal(archivePrefix, eprint) {
    if (!eprint) return 'Preprint';

    return `${archivePrefix}:${eprint}`;
}

function formatPublicationLink(fields, archivePrefix) {
    if (fields.doi) return `https://doi.org/${fields.doi}`;
    if (fields.eprint && archivePrefix.toLowerCase() === 'arxiv') {
        return `https://arxiv.org/abs/${fields.eprint}`;
    }

    return '#';
}

function formatAuthors(authorField) {
    const authors = authorField
        .split(/\s+and\s+/i)
        .map(author => author.trim())
        .filter(Boolean);

    if (authors.length <= 2) {
        return authors.join(' and ');
    }

    return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
}
