// Fill abstract from arXiv if empty
// @author crd2333
// @usage Shortcut

if (!item) {
    return;
}

// 从 arXiv URL 提取 arXiv ID
function extractArxivId(url) {
    const match = url.match(/arxiv\.org\/abs\/([^\/\?]+)/i);
    return match ? match[1] : null;
}

// 从 HTML 解析摘要
function parseAbstract(html) {
    const match = html.match(/<blockquote class="abstract[^"]*">(.*?)<\/blockquote>/is);
    if (match) {
        // 移除 HTML 标签并清理
        let abstract = match[1].replace(/<[^>]*>/g, '').trim();
        // 删除前导的 "Abstract:"
        abstract = abstract.replace(/^Abstract:\s*/i, '');
        return abstract;
    }
    return null;
}

// 从 arXiv 获取摘要
async function getArxivAbstract(arxivId) {
    try {
        const url = `https://arxiv.org/abs/${arxivId}`;
        const response = await Zotero.HTTP.request("GET", url);

        if (!response || response.status !== 200) {
            return null;
        }

        const html = response.responseText;
        return parseAbstract(html);

    } catch (error) {
        console.error("Error fetching arXiv abstract:", error);
        return null;
    }
}

// 检查摘要是否为空
function isAbstractEmpty(item) {
    const abstract = item.getField("abstractNote");
    return !abstract || abstract.trim() === "";
}

// 获取 arXiv URL
function getArxivUrl(item) {
    const url = item.getField("url");
    if (url && url.match(/arxiv\.org/i)) {
        return url;
    }
    return null;
}

// 主逻辑
async function fillAbstract() {
    if (!isAbstractEmpty(item)) {
        return;
    }

    const arxivUrl = getArxivUrl(item);
    if (!arxivUrl) {
        return "No arXiv URL found";
    }

    const arxivId = extractArxivId(arxivUrl);
    if (!arxivId) {
        return "Could not extract arXiv ID from URL";
    }

    const abstract = await getArxivAbstract(arxivId);
    if (!abstract) {
        return "Could not fetch abstract from arXiv";
    }

    item.setField("abstractNote", abstract);
    return "Abstract filled from arXiv";
}

return await fillAbstract();
