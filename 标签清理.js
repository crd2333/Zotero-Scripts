// Clean and replace tags based on prefixes and a key-value mapping.
// @author windingwind
// updated GitHub Copilot
// @usage Shortcut

if (!item) {
    return "[Clean & Replace Tags] item is empty";
}

// --- 在这里修改您的规则 ---

// 1. 清理规则：定义一个数组，包含所有需要被删除的标签。
const tagToRemove = [
	"Computer Science - Computer Vision and Pattern Recognition",
	"Computer Science - Artificial Intelligence",
	"Computer Science - Machine Learning",
];

// 2. 清理规则：定义一个数组，包含所有需要被修改的标签前缀。
const prefixesToClean = [
    "Computer Science - ",
];

// 3. 替换规则：定义一个对象，指定 "旧标签": "新标签" 的替换关系。
const tagReplacements = {
    "Graphics": "CG",
	"Electrical Engineering and Systems Science - Image and Video Processing": "Image and Video Processing"
};

// --- 脚本逻辑开始 ---

let changes = [];
// 获取条目上所有标签的快照，因为我们会在循环中修改它们
const originalTags = item.getTags().map(t => t.tag);

originalTags.forEach(originalTag => {
    let currentTag = originalTag;
    let tagChanged = false;

	// 步骤 1: 删除标签
	if (tagToRemove.includes(currentTag)) {
		item.removeTag(currentTag);
		changes.push(`"${originalTag}" → ""`);
		return; // 跳过后续逻辑
	}

    // 步骤 2: 清理前缀
    for (const prefix of prefixesToClean) {
        if (currentTag.startsWith(prefix)) {
            currentTag = currentTag.substring(prefix.length);
            tagChanged = true;
            break; 
        }
    }

    // 步骤 3: 替换标签，检查清理后的标签是否在替换列表中
    if (tagReplacements.hasOwnProperty(currentTag)) {
        currentTag = tagReplacements[currentTag];
        tagChanged = true;
    }

    // 步骤 4: 应用更改，如果标签经过了清理或替换，则更新条目
    if (tagChanged) {
        item.removeTag(originalTag);
        item.addTag(currentTag);
        changes.push(`"${originalTag}" → "${currentTag}"`);
    }
});

if (changes.length > 0) {
    return changes.join(", ");
}
