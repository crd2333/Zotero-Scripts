// Extract conference/journal abbreviations and add as tags
// @author GitHub Copilot
// @usage Shortcut

if (!item) {
    return;
}

// 会议名称映射规则
const conferencePatterns = [
    // NeurIPS
    { pattern: /Neural Information Processing Systems|NeurIPS|NIPS/i, abbrev: "NeurIPS" },
    // CVPR
    { pattern: /Computer Vision and Pattern Recognition|CVPR/i, abbrev: "CVPR" },
    // ICCV
    { pattern: /International Conference on Computer Vision|ICCV/i, abbrev: "ICCV" },
    // ECCV
    { pattern: /European Conference on Computer Vision|ECCV/i, abbrev: "ECCV" },
    // ICML
    { pattern: /International Conference on Machine Learning|ICML/i, abbrev: "ICML" },
    // ICLR
    { pattern: /International Conference on Learning Representations|ICLR/i, abbrev: "ICLR" },
    // AAAI
    { pattern: /AAAI Conference on Artificial Intelligence|AAAI/i, abbrev: "AAAI" },
    // IJCAI
    { pattern: /International Joint Conference on Artificial Intelligence|IJCAI/i, abbrev: "IJCAI" },
    // SIGGRAPH
    { pattern: /ACM SIGGRAPH|SIGGRAPH/i, abbrev: "SIGGRAPH" },
    // ACL
    { pattern: /Association for Computational Linguistics|ACL(?!\s+Trans)/i, abbrev: "ACL" },
    // EMNLP
    { pattern: /Empirical Methods in Natural Language Processing|EMNLP/i, abbrev: "EMNLP" },
    // NAACL
    { pattern: /North American Chapter of the Association for Computational Linguistics|NAACL/i, abbrev: "NAACL" }
];

// 期刊名称映射规则
const journalPatterns = [
    // CACM
    { pattern: /Communications of the ACM|CACM/i, abbrev: "CACM" },
    // ACM TOG
    { pattern: /ACM Transactions on Graphics|ACM TOG|ACM Trans. Graph./i, abbrev: "ACM TOG" },
    // IEEE TPAMI
    { pattern: /IEEE Transactions on Pattern Analysis and Machine Intelligence|IEEE TPAMI|TPAMI/i, abbrev: "TPAMI" },
    // Nature
    { pattern: /^Nature$/i, abbrev: "Nature" },
    // Science
    { pattern: /^Science$/i, abbrev: "Science" },
    // Nature Neuroscience
    { pattern: /Nature Neuroscience/i, abbrev: "Nature Neuroscience" },
    // Nature Machine Intelligence
    { pattern: /Nature Machine Intelligence|Nat Mach Intell/i, abbrev: "Nature MI" },
    // JMLR
    { pattern: /Journal of Machine Learning Research|JMLR/i, abbrev: "JMLR" },
    // IEEE TIP
    { pattern: /IEEE Transactions on Image Processing|TIP/i, abbrev: "TIP" },
    // IEEE TMM
    { pattern: /IEEE Transactions on Multimedia|TMM/i, abbrev: "TMM" },
    // ACL Transactions
    { pattern: /Transactions of the Association for Computational Linguistics|TACL/i, abbrev: "TACL" },
    // Computer Graphics Forum
    { pattern: /Computer Graphics Forum|CGF/i, abbrev: "CGF" },
    // Applied Intelligence
    { pattern: /Applied Intelligence/i, abbrev: "Appl Intell" }
];

// 检查是否为 arXiv
function isArxiv(item) {
    const doi = item.getField("DOI");
    const url = item.getField("url");
    const publicationTitle = item.getField("publicationTitle");

    return (doi && doi.match(/arxiv/i)) ||
           (url && url.match(/arxiv\.org/i)) ||
           (publicationTitle && publicationTitle.match(/arxiv/i));
}

// 检查是否已有会议或期刊标签
function hasVenueTag(item) {
    const allAbbrevs = [
        ...conferencePatterns.map(p => p.abbrev),
        ...journalPatterns.map(p => p.abbrev)
    ];

    const existingTags = item.getTags().map(t => t.tag);

    for (const tag of existingTags) {
        // 检查是否匹配任何已知的会议或期刊缩写（忽略年份）
        const tagWithoutHash = tag.replace(/^#/, '');
        for (const abbrev of allAbbrevs) {
            if (tagWithoutHash.startsWith(abbrev)) {
                return true;
            }
        }
    }
    return false;
}

// 提取年份的函数
function extractYear(text) {
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : null;
}

// 从会议/期刊名称中提取缩写和年份
function extractAbbreviation(text, patterns) {
    for (const { pattern, abbrev } of patterns) {
        if (pattern.test(text)) {
            const year = extractYear(text);
            return year ? `${abbrev} ${year}` : abbrev;
        }
    }
    return null;
}

let addedTag = null;
let removedArxiv = false;
const itemType = item.itemType;

// 检查是否已经有会议或期刊标签
const hasExistingVenueTag = hasVenueTag(item);

// 如果已有会议/期刊标签，删除 arxiv 标签
if (hasExistingVenueTag) {
    const existingTags = item.getTags().map(t => t.tag);
    for (const tag of existingTags) {
        if (tag === "#arxiv") {
            item.removeTag(tag);
            removedArxiv = true;
            break;
        }
    }
    return removedArxiv ? "Removed #arxiv tag (venue already classified)" : "Already classified";
}

// 如果没有现有的会议/期刊标签，尝试提取
if (itemType === "conferencePaper") {
    // 对于会议论文，优先使用 conferenceName，为空则使用 proceedingsTitle
    const conferenceName = item.getField("conferenceName");
    const proceedingsTitle = item.getField("proceedingsTitle");

    const sourceText = conferenceName || proceedingsTitle;

    if (sourceText) {
        const abbreviation = extractAbbreviation(sourceText, conferencePatterns);
        if (abbreviation) {
            const tagName = `#${abbreviation}`;
            item.addTag(tagName);
            addedTag = tagName;

            if (!conferenceName)
                item.setField("conferenceName", abbreviation); // 更新 conferenceName 字段

            // 添加会议标签后，删除可能存在的 arxiv 标签
            const existingTags = item.getTags().map(t => t.tag);
            if (existingTags.includes("#arxiv")) {
                item.removeTag("#arxiv");
                removedArxiv = true;
            }
        }
    }
} else if (itemType === "journalArticle") {
    // 对于期刊论文，使用 publicationTitle
    const publicationTitle = item.getField("publicationTitle");

    if (publicationTitle) {
        const abbreviation = extractAbbreviation(publicationTitle, journalPatterns);
        if (abbreviation) {
            const tagName = `#${abbreviation}`;
            item.addTag(tagName);
            addedTag = tagName;

            // 添加期刊标签后，删除可能存在的 arxiv 标签
            const existingTags = item.getTags().map(t => t.tag);
            if (existingTags.includes("#arxiv")) {
                item.removeTag("#arxiv");
                removedArxiv = true;
            }
        }
    }
}

// 如果还没有添加标签且是 arXiv，则添加 arxiv 标签
if (!addedTag && isArxiv(item)) {
    const tagName = "#arxiv";
    item.addTag(tagName);
    addedTag = tagName;
}

if (addedTag) {
    const message = removedArxiv ? `Added tag: ${addedTag}, removed #arxiv` : `Added tag: ${addedTag}`;
    return message;
} else {
    return "failed to classify";
}