// Extract arXiv submission date and version info
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

// 解析完整的提交历史
function parseSubmissionHistory(html) {
    const versions = [];

    // 查找 submission-history div
    const historyMatch = html.match(/<div class="submission-history">(.*?)<\/div>/is);
    if (!historyMatch) {
        return null;
    }

    const historySection = historyMatch[1];

    // 解析每个版本的信息
    const versionPattern = /<strong>(?:<a[^>]*>)?\[v(\d+)\](?:<\/a>)?<\/strong>\s*([^<]+)/g;
    let match;

    while ((match = versionPattern.exec(historySection)) !== null) {
        const versionNum = match[1];
        const dateTimeStr = match[2].trim();

        // 提取日期部分
        const dateMatch = dateTimeStr.match(/\w+,\s+(\d+\s+\w+\s+\d{4})/);
        if (dateMatch) {
            const dateStr = dateMatch[1];
            try {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    const isoDate = date.toISOString().split('T')[0];
                    versions.push(`v${versionNum} on ${isoDate}`);
                }
            } catch (e) {
                console.warn(`Could not parse date: ${dateStr}`);
            }
        }
    }

    return versions.length > 0 ? `Versions: ${versions.join('; ')}` : null;
}

// 解析现有版本信息并获取最高版本号
function getExistingVersionCount(extra) {
    if (!extra || !extra.includes("Versions:")) {
        return 0;
    }

    const versionsMatch = extra.match(/Versions:\s*(.+)/);
    if (!versionsMatch) {
        return 0;
    }

    const versionNumbers = [];
    const versionPattern = /v(\d+) on/g;
    let match;

    while ((match = versionPattern.exec(versionsMatch[1])) !== null) {
        versionNumbers.push(parseInt(match[1]));
    }

    return versionNumbers.length > 0 ? Math.max(...versionNumbers) : 0;
}

// 获取新版本信息的版本数量
function getNewVersionCount(versionInfo) {
    if (!versionInfo) {
        return 0;
    }

    const versionNumbers = [];
    const versionPattern = /v(\d+) on/g;
    let match;

    while ((match = versionPattern.exec(versionInfo)) !== null) {
        versionNumbers.push(parseInt(match[1]));
    }

    return versionNumbers.length > 0 ? Math.max(...versionNumbers) : 0;
}

// 更新 extra 字段中的版本信息
function updateVersionInfo(currentExtra, newVersionInfo) {
    if (!currentExtra) {
        return newVersionInfo;
    }

    // 如果已有版本信息，替换它
    if (currentExtra.includes("Versions:")) {
        return currentExtra.replace(/Versions:.*$/m, newVersionInfo);
    } else {
        // 如果没有版本信息，添加它
        return `${currentExtra}\n${newVersionInfo}`;
    }
}

// 从 arXiv 页面获取提交信息
async function getArxivSubmissionInfo(arxivId) {
    try {
        const url = `https://arxiv.org/abs/${arxivId}`;
        const response = await Zotero.HTTP.request("GET", url);

        if (!response || response.status !== 200) {
            return null;
        }

        const html = response.responseText;

        // 解析完整的提交历史
        const versionInfo = parseSubmissionHistory(html);

        if (!versionInfo) {
            return null;
        }

        // 从版本信息中提取最早的提交日期
        const firstVersionMatch = versionInfo.match(/v1 on (\d{4}-\d{2}-\d{2})/);
        if (!firstVersionMatch) {
            return null;
        }

        const firstSubmissionDate = firstVersionMatch[1];

        return {
            submittedDate: firstSubmissionDate,
            isoDate: firstSubmissionDate,
            versionInfo: versionInfo
        };

    } catch (error) {
        console.error("Error fetching arXiv info:", error);
        return null;
    }
}

// 检查是否有 arXiv URL
function getArxivUrl(item) {
    const url = item.getField("url");
    if (url && url.match(/arxiv\.org/i)) {
        return url;
    }
    return null;
}

// 主逻辑
async function updateArxivDate() {
    const arxivUrl = getArxivUrl(item);

    if (!arxivUrl) {
        return "No arXiv URL found";
    }

    const arxivId = extractArxivId(arxivUrl);
    if (!arxivId) {
        return "Could not extract arXiv ID from URL";
    }

    const submissionInfo = await getArxivSubmissionInfo(arxivId);
    if (!submissionInfo) {
        return "Could not fetch submission info from arXiv";
    }

    // 更新日期字段
    const currentDate = item.getField("date");
    item.setField("date", submissionInfo.isoDate);

    // 检查是否需要更新 extra 字段
    const currentExtra = item.getField("extra") || "";
    const existingVersionCount = getExistingVersionCount(currentExtra);
    const newVersionCount = getNewVersionCount(submissionInfo.versionInfo);

    let updatedExtra = false;
    let versionUpdateType = "";

    if (existingVersionCount === 0) {
        // 没有现有版本信息，添加新的
        const newExtra = updateVersionInfo(currentExtra, submissionInfo.versionInfo);
        item.setField("extra", newExtra);
        updatedExtra = true;
        versionUpdateType = "added";
    } else if (newVersionCount > existingVersionCount) {
        // 新版本信息包含更多版本，更新
        const newExtra = updateVersionInfo(currentExtra, submissionInfo.versionInfo);
        item.setField("extra", newExtra);
        updatedExtra = true;
        versionUpdateType = `updated (v${existingVersionCount} → v${newVersionCount})`;
    } else {
        versionUpdateType = `no update needed (current: v${existingVersionCount})`;
    }

    const messages = [`Updated date to ${submissionInfo.submittedDate}`];
    if (currentDate && currentDate !== submissionInfo.isoDate) {
        messages.push(`was: ${currentDate}`);
    }

    if (updatedExtra) {
        messages.push(`${versionUpdateType} version history`);
    } else {
        messages.push(versionUpdateType);
    }

    return messages.join(", ");
}

return await updateArxivDate();